# DepthWizard 2026 — Member 2: GIS / Remote Sensing

> **SIH 2026 — Problem Statement 26175**  
> Role: **Member 2 — GIS / Remote Sensing & Calibration**  
> Single Source of Truth: [`contract.md`](../contact.md)

---

## 1. Overview & Core Mission

The GIS / Remote Sensing module is responsible for the **geospatial interpretation and spatial preparation of input data**. 

It answers the fundamental question:
> *"Where is this image/depth pixel located on Earth, and how can the relevant elevation reference (DEM/SRTM) be spatially aligned with it?"*

Member 2 operates as the geospatial bridge between:
- **Member 1 (AI / Depth)**: Consumes raw relative depth (`outputs/depth.npy`).
- **Member 3 (3D / Backend Integration)**: Provides clean, calibrated DSM data (`outputs/dsm.npy`, `outputs/dsm.png`, `outputs/dsm.tif`) with explicit metadata handoffs.

---

## 2. Core Concepts Explained

### What is a Raster Pixel?
A raster dataset is a two-dimensional grid of numerical cells. In digital image and GIS processing, each pixel is addressed by discrete integer grid indices:
- **`row`**: The vertical position index ($0$-indexed from top to bottom, corresponding to height $H$).
- **`column`**: The horizontal position index ($0$-indexed from left to right, corresponding to width $W$).

### What is a World Coordinate?
A world coordinate represents a physical location on the surface of the Earth, expressed according to the dataset's **Coordinate Reference System (CRS)**:
- In a **projected CRS** (such as UTM Zone 43N, `EPSG:32643`), coordinates are measured in **meters** as **Easting $(X)$** and **Northing $(Y)$**.
- In a **geographic CRS** (such as WGS84, `EPSG:4326`), coordinates are measured in **decimal degrees** as **Longitude $(X)$** and **Latitude $(Y)$**.

### What is an Affine Transform?
An affine transformation is a 6-parameter mathematical mapping that links raster grid indices `(col, row)` to real-world coordinates `(X, Y)`:

$$\begin{bmatrix} X \\ Y \\ 1 \end{bmatrix} = \begin{bmatrix} a & b & c \\ d & e & f \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} \text{col} \\ \text{row} \\ 1 \end{bmatrix}$$

Where:
- $a$: Pixel width (resolution in X).
- $e$: Pixel height (typically negative for north-up rasters).
- $c$: Upper-left corner world X coordinate.
- $f$: Upper-left corner world Y coordinate.
- $b, d$: Rotation and shearing coefficients (0 for standard north-up rasters).

### Why is Coordinate Mapping Important?
Relative depth maps produced by monocular AI models have no inherent concept of geographic coordinates. To scale or calibrate this depth using external elevation sources (such as NASA SRTM or Copernicus DEM tiles), we must precisely determine:
$$\text{Relative Depth Pixel } (\text{row}, \text{col}) \xrightarrow{\text{Affine Transform}} \text{World Coordinate } (X, Y) \xrightarrow{\text{DEM Grid Alignment}} \text{Reference Elevation } Z_{\text{ref}}$$

### Pixel Center vs. Pixel Corner
A pixel represents a continuous spatial area, not an infinitely small point:
- **Pixel Corner (Upper-Left, `offset="ul"`)**: The exact boundary corner of the cell where the affine origin begins.
- **Pixel Center (`offset="center"`)**: The centroid of the grid cell, shifted by $+0.5 \times \text{pixel\_width}$ and $+0.5 \times \text{pixel\_height}$.
- **Convention**: For GIS analysis, sampling, and elevation assignment, DepthWizard defaults strictly to **pixel center** coordinates.

### Projected CRS vs. Geographic CRS
- **Projected CRS (e.g., UTM, State Plane)**: Projects the curved Earth onto a flat 2D plane with uniform metric units (meters). Metric distance, area, and slope calculations are physically meaningful.
- **Geographic CRS (e.g., WGS84)**: Models the Earth as an ellipsoid using angular units (degrees). A degree of longitude shrinks significantly towards the poles.

### Why Must CRS Be Preserved?
Inventing or discarding CRS metadata causes severe geographic misalignment. An unprojected degree coordinate passed into a metric elevation model will cause calculation distortion. DepthWizard strictly enforces the **Contract Honesty Policy**:
- Genuine CRS is documented and preserved when georeferenced data is provided.
- If raw unreferenced RGB is input, CRS is reported honestly as `"unavailable"`, without fabricating coordinates.

---

## 3. Step 2: Pixel-to-World API Reference

### `pixel_to_world(raster, row, col, offset="center")`
Converts a raster pixel location to its world/map coordinate.

```python
from gis.raster_ops import pixel_to_world

result = pixel_to_world("data/sample/geotiff.tif", row=100, col=200, offset="center")
print(result)
# Output:
# {
#     "row": 100,
#     "column": 200,
#     "x": 702005.0,
#     "y": 3089995.0,
#     "crs": "EPSG:32643",
#     "offset": "center"
# }
```

**Validation & Error Handling**:
- Explicitly validates $0 \le \text{row} < \text{height}$ and $0 \le \text{col} < \text{width}$.
- Raises `IndexError` if coordinates are outside bounds — **never silently clamps**.

### `world_to_pixel(raster, x, y, validate_bounds=False)`
Converts geographic/projected coordinates back to integer grid indices and continuous fractional sub-pixel positions using the inverse affine transform.

```python
from gis.raster_ops import world_to_pixel

result = world_to_pixel("data/sample/geotiff.tif", x=702005.0, y=3089995.0)
print(result)
# Output:
# {
#     "x": 702005.0,
#     "y": 3089995.0,
#     "row": 100,
#     "column": 200,
#     "fractional_row": 100.0,
#     "fractional_col": 200.0,
#     "is_inside": True,
#     "crs": "EPSG:32643"
# }
```

---

## 4. Testing & Verification

Run the automated test suite covering all Step 1 and Step 2 requirements:
```bash
python -m unittest tests/test_gis.py
```
Tests include:
- Center pixel calculations against exact theoretical math
- Multi-pixel sampling across rasters
- Upper-left and bottom-right boundary validations
- Negative and out-of-bounds row/column rejection
- CRS preservation verification
- Non-trivial (rotated/sheared) affine matrix transformations
- Pixel center vs. pixel corner offset validation
- Bidirectional round-trip coordinate consistency
