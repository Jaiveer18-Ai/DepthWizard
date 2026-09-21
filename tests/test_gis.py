"""
DepthWizard 2026 — Member 2: GIS / Remote Sensing
Automated Test Suite for GIS Operations, Raster Alignment & Contract Compliance
"""

import os
import shutil
import tempfile
import unittest
import numpy as np
import rasterio
from rasterio.transform import from_origin

from gis.raster_ops import (
    inspect_raster,
    get_raster_metadata,
    pixel_to_world,
    world_to_pixel,
    check_crs,
    reproject_raster,
    resample_raster,
    clip_raster,
    align_rasters,
    validate_alignment,
    create_valid_mask,
)
from gis.validators import (
    validate_depth_input,
    validate_dimension_rule,
    validate_geotiff,
    validate_dsm_output,
)
from gis.pipeline import run_member2_gis_pipeline


class TestGISOperations(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

        # 1. Create a synthetic georeferenced GeoTIFF for testing
        # LABEL: SYNTHETIC TEST DATA ONLY (NOT real satellite or SRTM data)
        self.synth_tif_path = os.path.join(self.test_dir, "synthetic_test_raster.tif")
        self.synth_crs = "EPSG:32643"  # UTM Zone 43N (Metric coordinates)
        self.synth_transform = from_origin(700000.0, 3100000.0, 10.0, 10.0)
        self.synth_data = np.linspace(100, 500, 64 * 64, dtype=np.float32).reshape((1, 64, 64))

        with rasterio.open(
            self.synth_tif_path,
            "w",
            driver="GTiff",
            height=64,
            width=64,
            count=1,
            dtype="float32",
            crs=self.synth_crs,
            transform=self.synth_transform,
            nodata=-9999.0,
        ) as dst:
            dst.write(self.synth_data)

        # 2. Create synthetic Member 1 depth input
        self.synth_depth_path = os.path.join(self.test_dir, "depth.npy")
        self.synth_depth = np.random.uniform(0.1, 10.0, (64, 64)).astype(np.float32)
        np.save(self.synth_depth_path, self.synth_depth)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_inspect_raster(self):
        meta = inspect_raster(self.synth_tif_path)
        self.assertEqual(meta["width"], 64)
        self.assertEqual(meta["height"], 64)
        self.assertEqual(meta["count"], 1)
        self.assertTrue(meta["is_georeferenced"])
        self.assertEqual(meta["epsg"], 32643)
        self.assertEqual(meta["resolution"], (10.0, 10.0))

    def test_step2_pixel_to_world_center_pixel(self):
        """Test 1: Center pixel conversion matches exact theoretical coordinates."""
        # Raster is 64x64, resolution 10x10, origin (700000.0, 3100000.0)
        # Center of pixel (row=32, col=32):
        # x = 700000 + 32 * 10 + 5 = 700325.0
        # y = 3100000 - 32 * 10 - 5 = 3099675.0
        res = pixel_to_world(self.synth_tif_path, row=32, col=32, offset="center")
        self.assertEqual(res["row"], 32)
        self.assertEqual(res["column"], 32)
        self.assertAlmostEqual(res["x"], 700325.0, places=2)
        self.assertAlmostEqual(res["y"], 3099675.0, places=2)
        self.assertEqual(res["crs"], "EPSG:32643")
        self.assertEqual(res["offset"], "center")

    def test_step2_pixel_to_world_different_pixels(self):
        """Test 2: Multiple distinct pixel locations across the raster."""
        test_pixels = [(10, 20), (5, 50), (40, 15)]
        for r, c in test_pixels:
            res = pixel_to_world(self.synth_tif_path, row=r, col=c)
            self.assertEqual(res["row"], r)
            self.assertEqual(res["column"], c)
            expected_x = 700000.0 + c * 10.0 + 5.0
            expected_y = 3100000.0 - r * 10.0 - 5.0
            self.assertAlmostEqual(res["x"], expected_x, places=2)
            self.assertAlmostEqual(res["y"], expected_y, places=2)

    def test_step2_pixel_to_world_boundaries(self):
        """Test 3: Boundary pixels (0, 0) and bottom-right (height-1, width-1)."""
        # Top-left valid pixel
        res_tl = pixel_to_world(self.synth_tif_path, row=0, col=0)
        self.assertEqual(res_tl["row"], 0)
        self.assertEqual(res_tl["column"], 0)
        self.assertAlmostEqual(res_tl["x"], 700005.0, places=2)
        self.assertAlmostEqual(res_tl["y"], 3099995.0, places=2)

        # Bottom-right valid pixel
        res_br = pixel_to_world(self.synth_tif_path, row=63, col=63)
        self.assertEqual(res_br["row"], 63)
        self.assertEqual(res_br["column"], 63)
        self.assertAlmostEqual(res_br["x"], 700635.0, places=2)
        self.assertAlmostEqual(res_br["y"], 3099365.0, places=2)

    def test_step2_pixel_to_world_invalid_row(self):
        """Test 4: Out-of-bound rows raise clear validation error without clamping."""
        # Negative row
        with self.assertRaises(IndexError) as ctx_neg:
            pixel_to_world(self.synth_tif_path, row=-1, col=10)
        self.assertIn("Requested row -1 is outside raster bounds", str(ctx_neg.exception))

        # Row exceeding height
        with self.assertRaises(IndexError) as ctx_high:
            pixel_to_world(self.synth_tif_path, row=64, col=10)
        self.assertIn("Requested row 64 is outside raster bounds", str(ctx_high.exception))

    def test_step2_pixel_to_world_invalid_column(self):
        """Test 5: Out-of-bound columns raise clear validation error without clamping."""
        # Negative column
        with self.assertRaises(IndexError) as ctx_neg:
            pixel_to_world(self.synth_tif_path, row=10, col=-5)
        self.assertIn("Requested column -5 is outside raster bounds", str(ctx_neg.exception))

        # Column exceeding width
        with self.assertRaises(IndexError) as ctx_high:
            pixel_to_world(self.synth_tif_path, row=10, col=100)
        self.assertIn("Requested column 100 is outside raster bounds", str(ctx_high.exception))

    def test_step2_pixel_to_world_crs_preservation(self):
        """Test 6: Verify returned CRS accurately reflects source raster."""
        res = pixel_to_world(self.synth_tif_path, row=0, col=0)
        self.assertEqual(res["crs"], self.synth_crs)

    def test_step2_pixel_to_world_non_trivial_transform(self):
        """Test 7: Support non-trivial (rotated/sheared) affine transform matrix."""
        rotated_tif = os.path.join(self.test_dir, "rotated_test.tif")
        # Rotated transform: a=8.66, b=-5.0, c=500000.0, d=5.0, e=8.66, f=4000000.0
        import affine
        rot_transform = affine.Affine(8.66, -5.0, 500000.0, 5.0, 8.66, 4000000.0)

        with rasterio.open(
            rotated_tif,
            "w",
            driver="GTiff",
            height=20,
            width=20,
            count=1,
            dtype="float32",
            crs="EPSG:32643",
            transform=rot_transform,
        ) as dst:
            dst.write(np.zeros((1, 20, 20), dtype=np.float32))

        res = pixel_to_world(rotated_tif, row=10, col=10, offset="center")
        self.assertEqual(res["row"], 10)
        self.assertEqual(res["column"], 10)
        # Expected using matrix math:
        # x' = a*(col+0.5) + b*(row+0.5) + c = 8.66*10.5 - 5.0*10.5 + 500000 = 500038.43
        # y' = d*(col+0.5) + e*(row+0.5) + f = 5.0*10.5 + 8.66*10.5 + 4000000 = 4000143.43
        self.assertAlmostEqual(res["x"], 500038.43, places=1)
        self.assertAlmostEqual(res["y"], 4000143.43, places=1)

    def test_step2_pixel_center_vs_pixel_corner(self):
        """Verify distinction between pixel center and pixel corner coordinates."""
        center_res = pixel_to_world(self.synth_tif_path, row=0, col=0, offset="center")
        corner_res = pixel_to_world(self.synth_tif_path, row=0, col=0, offset="ul")

        # Upper-left corner is exact origin: (700000.0, 3100000.0)
        self.assertAlmostEqual(corner_res["x"], 700000.0, places=2)
        self.assertAlmostEqual(corner_res["y"], 3100000.0, places=2)

        # Center is offset by (+5.0, -5.0) for 10x10 resolution
        self.assertAlmostEqual(center_res["x"], 700005.0, places=2)
        self.assertAlmostEqual(center_res["y"], 3099995.0, places=2)

    def test_step2_world_to_pixel_roundtrip(self):
        """Test bidirectional world-to-pixel inverse transform."""
        p2w = pixel_to_world(self.synth_tif_path, row=15, col=25, offset="center")
        w2p = world_to_pixel(self.synth_tif_path, x=p2w["x"], y=p2w["y"])

        self.assertEqual(w2p["row"], 15)
        self.assertEqual(w2p["column"], 25)
        self.assertTrue(w2p["is_inside"])

    def test_check_crs(self):
        self.assertTrue(check_crs("EPSG:4326", "EPSG:4326"))
        self.assertTrue(check_crs("EPSG:32643", 32643))
        self.assertFalse(check_crs("EPSG:4326", "EPSG:3857"))

    def test_resample_raster(self):
        resampled_path = os.path.join(self.test_dir, "resampled.tif")
        resample_raster(self.synth_tif_path, resampled_path, (32, 32))
        meta = inspect_raster(resampled_path)
        self.assertEqual(meta["height"], 32)
        self.assertEqual(meta["width"], 32)
        self.assertAlmostEqual(meta["resolution"][0], 20.0, delta=0.1)

    def test_reproject_raster(self):
        reprojected_path = os.path.join(self.test_dir, "reprojected_wgs84.tif")
        reproject_raster(self.synth_tif_path, reprojected_path, target_crs="EPSG:4326")
        meta = inspect_raster(reprojected_path)
        self.assertEqual(meta["epsg"], 4326)

    def test_spatial_alignment_and_validation(self):
        # Create a coarse reference DEM over the same region (32x32)
        coarse_dem_path = os.path.join(self.test_dir, "coarse_dem.tif")
        coarse_transform = from_origin(700000.0, 3100000.0, 20.0, 20.0)
        coarse_data = np.full((1, 32, 32), 250.0, dtype=np.float32)

        with rasterio.open(
            coarse_dem_path,
            "w",
            driver="GTiff",
            height=32,
            width=32,
            count=1,
            dtype="float32",
            crs=self.synth_crs,
            transform=coarse_transform,
        ) as dst:
            dst.write(coarse_data)

        # Align coarse DEM to the target 64x64 master raster
        aligned_path = os.path.join(self.test_dir, "aligned_dem.tif")
        align_rasters(coarse_dem_path, self.synth_tif_path, aligned_path)

        # Validate alignment
        val = validate_alignment(self.synth_tif_path, aligned_path)
        self.assertTrue(val["aligned"])
        self.assertTrue(val["crs_matches"])
        self.assertTrue(val["dimensions_match"])
        self.assertTrue(val["transform_matches"])

    def test_valid_mask(self):
        arr = np.array([[10.0, -9999.0], [np.nan, 25.0]], dtype=np.float32)
        mask = create_valid_mask(arr, nodata_val=-9999.0)
        expected = np.array([[True, False], [False, True]])
        np.testing.assert_array_equal(mask, expected)

    def test_dimension_rule(self):
        # Must pass when equal
        self.assertTrue(validate_dimension_rule((512, 512), (512, 512)))
        # Must raise ValueError when mismatched
        with self.assertRaises(ValueError):
            validate_dimension_rule((512, 512), (256, 256))

    def test_input_validation(self):
        # Non-existent file
        with self.assertRaises(FileNotFoundError):
            validate_depth_input("non_existent_file.npy")

        # 3D array should fail contract
        invalid_3d_path = os.path.join(self.test_dir, "invalid_3d.npy")
        np.save(invalid_3d_path, np.zeros((10, 10, 3)))
        with self.assertRaises(ValueError):
            validate_depth_input(invalid_3d_path)

    def test_end_to_end_gis_pipeline(self):
        out_dir = os.path.join(self.test_dir, "pipeline_outputs")
        res = run_member2_gis_pipeline(
            depth_input_path=self.synth_depth_path,
            source_geotiff_path=self.synth_tif_path,
            output_dir=out_dir,
            min_elev=150.0,
            max_elev=350.0,
        )

        # Check outputs generated
        self.assertTrue(os.path.isfile(res["dsm_npy"]))
        self.assertTrue(os.path.isfile(res["dsm_png"]))
        self.assertTrue(os.path.isfile(res["dsm_tif"]))

        # Verify dsm.npy
        dsm = np.load(res["dsm_npy"])
        self.assertEqual(dsm.shape, (64, 64))
        self.assertEqual(dsm.dtype, np.float32)
        self.assertAlmostEqual(float(np.min(dsm)), 150.0, delta=1.0)
        self.assertAlmostEqual(float(np.max(dsm)), 350.0, delta=1.0)

        # Verify dsm.tif preserves GeoTIFF metadata
        tif_meta = inspect_raster(res["dsm_tif"])
        self.assertEqual(tif_meta["epsg"], 32643)
        self.assertEqual(tif_meta["width"], 64)
        self.assertEqual(tif_meta["height"], 64)


if __name__ == "__main__":
    unittest.main()
