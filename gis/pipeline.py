"""
DepthWizard 2026 — Member 2: GIS / Remote Sensing
Module: gis/pipeline.py

Main integration pipeline for Member 2:
- Consumes outputs/depth.npy from Member 1
- Evaluates spatial reference (GeoTIFF / SRTM / DEM) if available
- Performs spatial alignment / grid matching
- Converts relative depth into elevation / DSM representation
- Produces:
    outputs/dsm.npy (Mandatory)
    outputs/dsm.png (Mandatory)
    outputs/dsm.tif (Optional / Recommended)
- Validates the Dimension Rule (depth.shape == dsm.shape)
- Produces the exact Member 2 -> Member 3 contract handoff
"""

import os
import argparse
from typing import Dict, Any, Optional
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
import rasterio
from rasterio.transform import from_origin

from .validators import validate_depth_input, validate_dimension_rule, validate_dsm_output
from .raster_ops import (
    inspect_raster,
    align_rasters,
    check_crs,
    reproject_raster,
)


def run_member2_gis_pipeline(
    depth_input_path: str = "outputs/depth.npy",
    source_geotiff_path: Optional[str] = None,
    reference_dem_path: Optional[str] = None,
    output_dir: str = "outputs",
    min_elev: float = 0.0,
    max_elev: float = 100.0,
    invert_depth_to_height: bool = True,
) -> Dict[str, Any]:
    """
    Execute the GIS / Remote Sensing processing stage.

    Parameters:
    -----------
    depth_input_path : str
        Relative depth array produced by Member 1 (outputs/depth.npy).
    source_geotiff_path : Optional[str]
        Original georeferenced GeoTIFF if input was a spatial raster.
    reference_dem_path : Optional[str]
        External DEM / SRTM tile to spatially align and use for reference scaling.
    output_dir : str
        Target directory for contract artifacts (default: 'outputs').
    min_elev : float
        Baseline elevation for prototype linear scaling.
    max_elev : float
        Peak elevation for prototype linear scaling.
    invert_depth_to_height : bool
        Whether to invert depth (closer/higher vs farther/lower).

    Returns:
    --------
    dict containing paths to generated artifacts and handoff metadata.
    """
    os.makedirs(output_dir, exist_ok=True)

    # 1. Validate and load Member 1 depth input
    depth = validate_depth_input(depth_input_path)
    h, w = depth.shape

    # 2. Normalize relative depth to [0, 1] range
    d_min = float(depth.min())
    d_max = float(depth.max())
    d_range = d_max - d_min
    if d_range > 1e-8:
        norm_depth = (depth - d_min) / d_range
    else:
        norm_depth = np.zeros_like(depth)

    # Convert relative depth to relative height
    norm_height = (1.0 - norm_depth) if invert_depth_to_height else norm_depth

    # 3. Check for genuine GIS / Elevation Reference data
    is_georeferenced = False
    crs_str = "unavailable"
    resolution_str = "1 pixel"
    calib_method = "prototype linear mapping"
    units_str = "prototype-relative"
    target_transform = None
    target_crs = None

    if source_geotiff_path and os.path.exists(source_geotiff_path):
        geo_info = inspect_raster(source_geotiff_path)
        if geo_info["is_georeferenced"]:
            is_georeferenced = True
            crs_str = geo_info["crs"] or "unavailable"
            res_x, res_y = geo_info["resolution"]
            resolution_str = f"{res_x:.4f} x {res_y:.4f}"
            target_transform = rasterio.transform.Affine(*geo_info["transform"])
            target_crs = geo_info["crs"]

    # 4. Handle DEM / SRTM Reference if available
    if reference_dem_path and os.path.exists(reference_dem_path):
        if is_georeferenced and source_geotiff_path:
            # Spatially align DEM to source raster
            aligned_dem_path = os.path.join(output_dir, "aligned_reference_dem.tif")
            align_rasters(reference_dem_path, source_geotiff_path, aligned_dem_path)
            
            with rasterio.open(aligned_dem_path) as dem_src:
                dem_data = dem_src.read(1)
                valid_dem = dem_data[np.isfinite(dem_data)]
                if len(valid_dem) > 0:
                    ref_min = float(np.percentile(valid_dem, 2))
                    ref_max = float(np.percentile(valid_dem, 98))
                    dsm = (norm_height * (ref_max - ref_min) + ref_min).astype(np.float32)
                    calib_method = "SRTM/DEM spatial alignment & elevation scaling"
                    units_str = "meters (calibrated)"
                else:
                    dsm = (norm_height * (max_elev - min_elev) + min_elev).astype(np.float32)
        else:
            # DEM provided without georeferencing metadata
            with rasterio.open(reference_dem_path) as dem_src:
                dem_data = dem_src.read(1)
                ref_min = float(np.nanmin(dem_data))
                ref_max = float(np.nanmax(dem_data))
                dsm = (norm_height * (ref_max - ref_min) + ref_min).astype(np.float32)
                calib_method = "reference DEM min/max scaling"
                units_str = "meters (relative calibration)"
    else:
        # Standard prototype linear mapping per contract Section 6.4
        dsm = (norm_height * (max_elev - min_elev) + min_elev).astype(np.float32)

    # 5. Enforce Section 16 Dimension Rule
    validate_dimension_rule(depth.shape, dsm.shape)

    # 6. Save outputs/dsm.npy (Contract Section 6.1)
    dsm_npy_path = os.path.join(output_dir, "dsm.npy")
    np.save(dsm_npy_path, dsm)
    validate_dsm_output(dsm_npy_path, expected_shape=depth.shape)

    # 7. Save outputs/dsm.png (Contract Section 6.2)
    dsm_png_path = os.path.join(output_dir, "dsm.png")
    plt.figure(figsize=(8, 8), dpi=150)
    plt.imshow(dsm, cmap="terrain")
    plt.colorbar(label=f"Elevation ({units_str})")
    plt.title("DepthWizard — Digital Surface Model (DSM)")
    plt.axis("off")
    plt.tight_layout()
    plt.savefig(dsm_png_path, bbox_inches="tight")
    plt.close()

    # 8. Save outputs/dsm.tif (Contract Section 6.3)
    dsm_tif_path = os.path.join(output_dir, "dsm.tif")
    if is_georeferenced and target_crs and target_transform:
        # Write true GeoTIFF with actual geospatial CRS and affine transform
        profile = {
            "driver": "GTiff",
            "height": h,
            "width": w,
            "count": 1,
            "dtype": "float32",
            "crs": target_crs,
            "transform": target_transform,
            "nodata": -9999.0,
        }
        with rasterio.open(dsm_tif_path, "w", **profile) as dst:
            dst.write(dsm, 1)
    else:
        # Standard raster TIFF without inventing fake coordinates
        Image.fromarray(dsm).save(dsm_tif_path)

    min_val = float(np.min(dsm))
    max_val = float(np.max(dsm))

    # 9. Format Member 2 -> Member 3 Contract Handoff (Section 7)
    handoff_text = f"""
============================================================
MEMBER 2 -> MEMBER 3 HANDOFF
============================================================
DSM file: {dsm_npy_path}
Shape: {h} x {w}
dtype: {dsm.dtype}
Minimum: {min_val:.2f}
Maximum: {max_val:.2f}
Units: {units_str}
Resolution: {resolution_str}
CRS: {crs_str}
Georeferencing available: {'YES' if is_georeferenced else 'NO'}
Calibration method: {calib_method}
============================================================
"""
    try:
        print(handoff_text)
    except UnicodeEncodeError:
        print(handoff_text.encode("ascii", "replace").decode("ascii"))

    return {
        "dsm_npy": dsm_npy_path,
        "dsm_png": dsm_png_path,
        "dsm_tif": dsm_tif_path,
        "shape": (h, w),
        "min": min_val,
        "max": max_val,
        "units": units_str,
        "resolution": resolution_str,
        "crs": crs_str,
        "georeferencing": is_georeferenced,
        "calibration_method": calib_method,
        "handoff_summary": handoff_text.strip(),
    }


def main():
    parser = argparse.ArgumentParser(description="DepthWizard Member 2 — GIS / Calibration Pipeline")
    parser.add_argument("--depth", "-d", default="outputs/depth.npy", help="Path to outputs/depth.npy")
    parser.add_argument("--geotiff", "-g", default=None, help="Path to source GeoTIFF if georeferenced")
    parser.add_argument("--dem", default=None, help="Path to reference DEM / SRTM tile")
    parser.add_argument("--output", "-o", default="outputs", help="Output directory")
    parser.add_argument("--min-elev", type=float, default=0.0, help="Base elevation")
    parser.add_argument("--max-elev", type=float, default=100.0, help="Peak elevation")
    args = parser.parse_args()

    run_member2_gis_pipeline(
        depth_input_path=args.depth,
        source_geotiff_path=args.geotiff,
        reference_dem_path=args.dem,
        output_dir=args.output,
        min_elev=args.min_elev,
        max_elev=args.max_elev,
    )


if __name__ == "__main__":
    main()
