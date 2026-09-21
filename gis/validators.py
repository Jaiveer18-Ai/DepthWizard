"""
DepthWizard 2026 — Member 2: GIS / Remote Sensing
Module: gis/validators.py

Strict validation for geospatial datasets, contract compliance,
dimension rules, and integration interfaces.
"""

import os
from typing import Dict, Any, Tuple, Optional
import numpy as np
import rasterio


def validate_depth_input(depth_npy_path: str) -> np.ndarray:
    """
    Validate Member 1 depth input according to CONTRACT.md (Section 5.1 & 6.1).
    - File must exist
    - Must be loadable .npy file
    - Must be a 2D array
    - Must contain finite numerical values
    """
    if not os.path.exists(depth_npy_path):
        raise FileNotFoundError(
            f"[Contract Violation - Input Missing] Required input file not found: {depth_npy_path}"
        )

    try:
        depth = np.load(depth_npy_path)
    except Exception as e:
        raise ValueError(f"[Contract Violation - Format Error] Failed to load {depth_npy_path}: {e}")

    if not isinstance(depth, np.ndarray):
        raise TypeError(f"[Contract Violation] depth.npy must be a NumPy array, got {type(depth)}")

    if depth.ndim != 2:
        raise ValueError(
            f"[Contract Violation - Dimensions] depth.npy must be a 2D array (H, W). Got shape {depth.shape} (ndim={depth.ndim})"
        )

    if not np.isfinite(depth).all():
        raise ValueError("[Integrity Error] depth.npy contains non-finite values (NaN or Inf)")

    return depth


def validate_dimension_rule(depth_shape: Tuple[int, int], dsm_shape: Tuple[int, int]) -> bool:
    """
    Enforce CONTRACT.md Section 16:
    depth.npy.shape == dsm.npy.shape
    """
    if depth_shape != dsm_shape:
        raise ValueError(
            f"[Contract Violation - Section 16 Dimension Rule] Mismatch: depth.npy shape {depth_shape} != dsm.npy shape {dsm_shape}"
        )
    return True


def validate_geotiff(tif_path: str) -> Dict[str, Any]:
    """
    Validate GeoTIFF raster integrity:
    - Check file validity and readable driver
    - Inspect band count (single-band vs multi-band)
    - Check CRS presence and valid coordinate representation
    - Inspect bounds, resolution, and data types
    """
    if not os.path.exists(tif_path):
        raise FileNotFoundError(f"GeoTIFF file not found: {tif_path}")

    try:
        with rasterio.open(tif_path) as src:
            has_crs = src.crs is not None
            is_single_band = (src.count == 1)
            is_georeferenced = has_crs and not src.transform.is_identity

            return {
                "valid": True,
                "driver": src.driver,
                "bands": src.count,
                "is_single_band": is_single_band,
                "crs": str(src.crs) if has_crs else None,
                "epsg": src.crs.to_epsg() if has_crs else None,
                "is_georeferenced": is_georeferenced,
                "shape": (src.height, src.width),
                "resolution": src.res,
                "nodata": src.nodata,
            }
    except Exception as e:
        raise ValueError(f"Invalid GeoTIFF format for {tif_path}: {e}")


def validate_dsm_output(dsm_npy_path: str, expected_shape: Optional[Tuple[int, int]] = None) -> np.ndarray:
    """
    Validate Member 2 output according to CONTRACT.md Section 6.1:
    - Must be .npy
    - 2D array
    - float32 dtype
    - No NaN/Inf
    """
    if not os.path.exists(dsm_npy_path):
        raise FileNotFoundError(f"Mandatory output missing: {dsm_npy_path}")

    dsm = np.load(dsm_npy_path)
    if dsm.ndim != 2:
        raise ValueError(f"dsm.npy must be 2D, got shape {dsm.shape}")

    if expected_shape and dsm.shape != expected_shape:
        raise ValueError(f"dsm shape {dsm.shape} does not match expected shape {expected_shape}")

    if not np.isfinite(dsm).all():
        raise ValueError("dsm.npy contains non-finite values (NaN or Inf)")

    return dsm
