"""
DepthWizard 2026 — Member 2: GIS / Remote Sensing
Module: gis/raster_ops.py

Core geospatial and remote sensing operations:
- Raster inspection & metadata extraction (CRS, EPSG, resolution, bounds, affine transform, NoData)
- Coordinate transformations (pixel-to-world, world-to-pixel)
- CRS compatibility checking & reprojection
- Spatial resampling, clipping, and grid alignment
- Data validity masking and spatial alignment verification
"""

import os
from typing import Any, Dict, Optional, Tuple
import numpy as np
import rasterio
from rasterio.crs import CRS
from rasterio.enums import Resampling
from rasterio.warp import calculate_default_transform, reproject
from rasterio.windows import from_bounds
import affine


def inspect_raster(raster_path: str) -> Dict[str, Any]:
    """
    Inspect a GeoTIFF or raster file and extract detailed geospatial properties.

    Parameters:
    -----------
    raster_path : str
        Path to the raster dataset (.tif, .tiff, etc.)

    Returns:
    --------
    dict containing:
        driver, width, height, count, crs, epsg, bounds,
        transform, resolution, nodata, dtypes, is_georeferenced
    """
    if not os.path.isfile(raster_path):
        raise FileNotFoundError(f"Raster file does not exist: {raster_path}")

    with rasterio.open(raster_path) as src:
        crs_val = src.crs
        epsg_code = crs_val.to_epsg() if crs_val else None
        res_x, res_y = src.res

        metadata = {
            "file_path": raster_path,
            "driver": src.driver,
            "width": src.width,
            "height": src.height,
            "count": src.count,
            "crs": str(crs_val) if crs_val else None,
            "epsg": epsg_code,
            "bounds": {
                "left": float(src.bounds.left),
                "bottom": float(src.bounds.bottom),
                "right": float(src.bounds.right),
                "top": float(src.bounds.top),
            },
            "transform": tuple(src.transform),
            "resolution": (float(res_x), float(res_y)),
            "nodata": src.nodata,
            "dtypes": [str(d) for d in src.dtypes],
            "is_georeferenced": bool(crs_val is not None and not src.transform.is_identity),
        }
        return metadata


def get_raster_metadata(raster_path: str) -> Dict[str, Any]:
    """Alias / helper to get concise geospatial metadata for integration handoffs."""
    return inspect_raster(raster_path)


def pixel_to_world(
    raster: Any,
    row: float,
    col: float,
    offset: str = "center",
) -> Dict[str, Any]:
    """
    Map raster pixel location (row, column) to geospatial world coordinates (X, Y)
    using the GeoTIFF's actual affine transform and CRS.

    Parameters:
    -----------
    raster : str, Path, rasterio DatasetReader, or affine.Affine
        Path to the GeoTIFF raster dataset, open DatasetReader, or affine transform matrix.
    row : int or float
        Raster pixel row (Y index, 0-indexed from top).
    col : int or float
        Raster pixel column (X index, 0-indexed from left).
    offset : str
        Pixel offset convention. Defaults to 'center' (pixel center coordinate).
        Other options supported by rasterio: 'ul' (upper-left corner), 'ur', 'll', 'lr'.

    Returns:
    --------
    dict containing:
        row: int
        column: int
        x: float
        y: float
        crs: str
        offset: str

    Raises:
    -------
    IndexError:
        If requested row or column is out of raster bounds. Does NOT silently clamp!
    FileNotFoundError:
        If the raster file does not exist.
    """
    if isinstance(raster, affine.Affine):
        x, y = rasterio.transform.xy(raster, row, col, offset=offset)
        return {
            "row": int(row),
            "column": int(col),
            "x": float(x),
            "y": float(y),
            "crs": "unavailable",
            "offset": offset,
        }

    # Handle file path or open dataset
    if isinstance(raster, (str, os.PathLike)):
        if not os.path.exists(raster):
            raise FileNotFoundError(f"Raster file not found: {raster}")
        src = rasterio.open(raster)
        should_close = True
    else:
        src = raster
        should_close = False

    try:
        height = src.height
        width = src.width
        transform = src.transform
        crs_val = str(src.crs) if src.crs else "unavailable"

        # Explicit bounds validation: do NOT silently clamp!
        if row < 0 or row >= height:
            raise IndexError(
                f"[Validation Error] Requested row {row} is outside raster bounds "
                f"[valid range: 0 to {height - 1}, height: {height}]"
            )
        if col < 0 or col >= width:
            raise IndexError(
                f"[Validation Error] Requested column {col} is outside raster bounds "
                f"[valid range: 0 to {width - 1}, width: {width}]"
            )

        x, y = rasterio.transform.xy(transform, row, col, offset=offset)
        return {
            "row": int(row),
            "column": int(col),
            "x": float(x),
            "y": float(y),
            "crs": crs_val,
            "offset": offset,
        }
    finally:
        if should_close:
            src.close()


def world_to_pixel(
    raster: Any,
    x: float,
    y: float,
    validate_bounds: bool = False,
) -> Dict[str, Any]:
    """
    Map geospatial world coordinates (X, Y) to raster pixel column and row indices
    using the GeoTIFF's inverse affine transform.

    Parameters:
    -----------
    raster : str, Path, rasterio DatasetReader, or affine.Affine
        Path to the GeoTIFF raster dataset, open DatasetReader, or affine transform matrix.
    x : float
        World X coordinate (Easting / Longitude).
    y : float
        World Y coordinate (Northing / Latitude).
    validate_bounds : bool
        If True, raises ValueError if the coordinate falls outside the raster geographic extent.

    Returns:
    --------
    dict containing:
        x: float
        y: float
        row: int (integer index of nearest pixel)
        column: int (integer index of nearest pixel)
        fractional_row: float (exact continuous sub-pixel coordinate)
        fractional_col: float (exact continuous sub-pixel coordinate)
        is_inside: bool (whether the coordinate falls within raster dimensions)
        crs: str
    """
    if isinstance(raster, affine.Affine):
        inv_tf = ~raster
        frac_col, frac_row = inv_tf @ (x, y)
        row, col = rasterio.transform.rowcol(raster, x, y)
        return {
            "x": float(x),
            "y": float(y),
            "row": int(row),
            "column": int(col),
            "fractional_row": float(frac_row),
            "fractional_col": float(frac_col),
            "is_inside": True,
            "crs": "unavailable",
        }

    if isinstance(raster, (str, os.PathLike)):
        if not os.path.exists(raster):
            raise FileNotFoundError(f"Raster file not found: {raster}")
        src = rasterio.open(raster)
        should_close = True
    else:
        src = raster
        should_close = False

    try:
        height = src.height
        width = src.width
        transform = src.transform
        crs_val = str(src.crs) if src.crs else "unavailable"

        inv_tf = ~transform
        frac_col, frac_row = inv_tf @ (x, y)
        row, col = rasterio.transform.rowcol(transform, x, y)

        is_inside = (0 <= row < height) and (0 <= col < width)
        if validate_bounds and not is_inside:
            raise ValueError(
                f"[Validation Error] World coordinate ({x}, {y}) falls outside raster bounds: "
                f"bounds={src.bounds}"
            )

        return {
            "x": float(x),
            "y": float(y),
            "row": int(row),
            "column": int(col),
            "fractional_row": float(frac_row),
            "fractional_col": float(frac_col),
            "is_inside": bool(is_inside),
            "crs": crs_val,
        }
    finally:
        if should_close:
            src.close()


def check_crs(crs_source: Any, crs_target: Any) -> bool:
    """
    Verify whether two Coordinate Reference Systems (CRS) match.

    Parameters:
    -----------
    crs_source, crs_target: str, rasterio.crs.CRS, or int (EPSG)

    Returns:
    --------
    bool : True if compatible/equal, False otherwise.
    """
    if crs_source is None or crs_target is None:
        return False

    c1 = CRS.from_user_input(crs_source) if not isinstance(crs_source, CRS) else crs_source
    c2 = CRS.from_user_input(crs_target) if not isinstance(crs_target, CRS) else crs_target
    return c1 == c2


def reproject_raster(
    src_path: str,
    dst_path: str,
    target_crs: str = "EPSG:4326",
    resampling_method: Resampling = Resampling.bilinear,
) -> str:
    """
    Reproject a georeferenced raster to a target Coordinate Reference System.

    Parameters:
    -----------
    src_path : str
        Source raster path.
    dst_path : str
        Destination raster path.
    target_crs : str
        Target CRS string (e.g. 'EPSG:4326', 'EPSG:32643').
    resampling_method : rasterio.enums.Resampling
        Resampling algorithm (default: bilinear).

    Returns:
    --------
    dst_path : str
    """
    if not os.path.isfile(src_path):
        raise FileNotFoundError(f"Source raster not found: {src_path}")

    dst_crs = CRS.from_user_input(target_crs)

    with rasterio.open(src_path) as src:
        if not src.crs:
            raise ValueError(f"Cannot reproject raster {src_path}: Source CRS is missing.")

        transform, width, height = calculate_default_transform(
            src.crs, dst_crs, src.width, src.height, *src.bounds
        )
        kwargs = src.meta.copy()
        kwargs.update({
            "crs": dst_crs,
            "transform": transform,
            "width": width,
            "height": height,
        })

        os.makedirs(os.path.dirname(os.path.abspath(dst_path)), exist_ok=True)

        with rasterio.open(dst_path, "w", **kwargs) as dst:
            for i in range(1, src.count + 1):
                reproject(
                    source=rasterio.band(src, i),
                    destination=rasterio.band(dst, i),
                    src_transform=src.transform,
                    src_crs=src.crs,
                    dst_transform=transform,
                    dst_crs=dst_crs,
                    resampling=resampling_method,
                )

    return dst_path


def resample_raster(
    src_path: str,
    dst_path: str,
    target_shape: Tuple[int, int],
    resampling_method: Resampling = Resampling.bilinear,
) -> str:
    """
    Resample a raster to match target spatial dimensions (height, width)
    while adjusting the affine pixel resolution proportionally.

    Parameters:
    -----------
    src_path : str
        Path to source raster.
    dst_path : str
        Path to output resampled raster.
    target_shape : Tuple[int, int]
        (target_height, target_width)
    resampling_method : Resampling
        Interpolation method.

    Returns:
    --------
    dst_path : str
    """
    target_h, target_w = target_shape

    with rasterio.open(src_path) as src:
        data = src.read(
            out_shape=(src.count, target_h, target_w),
            resampling=resampling_method,
        )

        # Scale transform
        scale_x = src.width / target_w
        scale_y = src.height / target_h
        new_transform = src.transform @ src.transform.scale(scale_x, scale_y)

        profile = src.profile.copy()
        profile.update({
            "height": target_h,
            "width": target_w,
            "transform": new_transform,
        })

        os.makedirs(os.path.dirname(os.path.abspath(dst_path)), exist_ok=True)
        with rasterio.open(dst_path, "w", **profile) as dst:
            dst.write(data)

    return dst_path


def clip_raster(
    src_path: str,
    bounds: Tuple[float, float, float, float],
    dst_path: str,
) -> str:
    """
    Clip a georeferenced raster to a specified geographic bounding box (left, bottom, right, top).

    Parameters:
    -----------
    src_path : str
        Source raster dataset.
    bounds : Tuple[float, float, float, float]
        (left, bottom, right, top) in the source CRS.
    dst_path : str
        Output clipped raster path.

    Returns:
    --------
    dst_path : str
    """
    with rasterio.open(src_path) as src:
        window = from_bounds(*bounds, transform=src.transform)
        clipped_transform = rasterio.windows.transform(window, src.transform)

        data = src.read(window=window)
        profile = src.profile.copy()
        profile.update({
            "height": data.shape[1],
            "width": data.shape[2],
            "transform": clipped_transform,
        })

        os.makedirs(os.path.dirname(os.path.abspath(dst_path)), exist_ok=True)
        with rasterio.open(dst_path, "w", **profile) as dst:
            dst.write(data)

    return dst_path


def align_rasters(
    source_raster_path: str,
    reference_raster_path: str,
    output_aligned_path: str,
    resampling_method: Resampling = Resampling.bilinear,
) -> str:
    """
    Spatially align a source raster (e.g. SRTM/DEM elevation reference) to precisely
    match the reference raster's CRS, spatial bounds, resolution, and pixel dimensions.

    Parameters:
    -----------
    source_raster_path : str
        Raster to be aligned / resampled (e.g. coarse DEM reference).
    reference_raster_path : str
        Master reference raster defining the target grid footprint.
    output_aligned_path : str
        Destination path for the aligned raster.
    resampling_method : Resampling
        Resampling algorithm.

    Returns:
    --------
    output_aligned_path : str
    """
    with rasterio.open(reference_raster_path) as ref:
        dst_crs = ref.crs
        dst_transform = ref.transform
        dst_width = ref.width
        dst_height = ref.height
        dst_meta = ref.meta.copy()

    with rasterio.open(source_raster_path) as src:
        dst_meta.update({
            "count": src.count,
            "dtype": src.dtypes[0],
            "nodata": src.nodata,
        })

        os.makedirs(os.path.dirname(os.path.abspath(output_aligned_path)), exist_ok=True)

        destination_arr = np.zeros((src.count, dst_height, dst_width), dtype=src.dtypes[0])

        reproject(
            source=rasterio.band(src, list(range(1, src.count + 1))),
            destination=destination_arr,
            src_transform=src.transform,
            src_crs=src.crs,
            dst_transform=dst_transform,
            dst_crs=dst_crs,
            resampling=resampling_method,
            src_nodata=src.nodata,
            dst_nodata=src.nodata,
        )

        with rasterio.open(output_aligned_path, "w", **dst_meta) as dst:
            dst.write(destination_arr)

    return output_aligned_path


def validate_alignment(raster_a_path: str, raster_b_path: str) -> Dict[str, Any]:
    """
    Verify spatial alignment between two rasters across:
    - CRS compatibility
    - Raster dimensions (height, width)
    - Affine transform equivalence
    - Bounding box equivalence

    Returns:
    --------
    dict with boolean flags and detailed error messages if aligned is False.
    """
    info_a = inspect_raster(raster_a_path)
    info_b = inspect_raster(raster_b_path)

    crs_matches = info_a["crs"] == info_b["crs"]
    dims_match = (info_a["height"] == info_b["height"]) and (info_a["width"] == info_b["width"])
    
    # Affine transform tolerance check
    tf_a = np.array(info_a["transform"][:6])
    tf_b = np.array(info_b["transform"][:6])
    transform_matches = bool(np.allclose(tf_a, tf_b, atol=1e-5))

    aligned = crs_matches and dims_match and transform_matches

    return {
        "aligned": aligned,
        "crs_matches": crs_matches,
        "dimensions_match": dims_match,
        "transform_matches": transform_matches,
        "raster_a_shape": (info_a["height"], info_a["width"]),
        "raster_b_shape": (info_b["height"], info_b["width"]),
        "raster_a_crs": info_a["crs"],
        "raster_b_crs": info_b["crs"],
    }


def create_valid_mask(raster_data: np.ndarray, nodata_val: Optional[float] = None) -> np.ndarray:
    """
    Generate a boolean mask where True indicates valid data and False indicates NoData / NaN / Inf.

    Parameters:
    -----------
    raster_data : np.ndarray
        Raster numerical array.
    nodata_val : Optional[float]
        Explicit NoData value to mask out.

    Returns:
    --------
    valid_mask : np.ndarray of bool
    """
    valid = np.isfinite(raster_data)
    if nodata_val is not None:
        valid = valid & (raster_data != nodata_val)
    return valid
