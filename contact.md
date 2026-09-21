# DepthWizard 2026 — MVP Integration Contract

> Single source of truth for the 4-member MVP.
>
> Problem Statement: SIH 2026 — PS 26175
>
> This document defines the interfaces between all team members.
> Do not change an interface without informing the integration lead.

---

# 1. TEAM STRUCTURE

The MVP has exactly 4 members.

| Member | Role | Responsibility |
|---|---|---|
| Member 1 | AI / Depth | RGB Image → Relative Depth |
| Member 2 | GIS / Calibration | Relative Depth → Elevation / DSM |
| Member 3 | 3D / Backend Integration | DSM + RGB → 3D Terrain |
| Member 4 | Frontend / Demo | Display the complete pipeline |

**There is NO Member 5 in this MVP.**

---

# 2. COMPLETE PIPELINE

```text
                    INPUT
                 RGB IMAGE
                     │
                     ▼
          ┌─────────────────────┐
          │ Member 1            │
          │ AI / Depth          │
          └──────────┬──────────┘
                     │
                     │ depth.npy
                     │ depth.png
                     ▼
          ┌─────────────────────┐
          │ Member 2            │
          │ GIS / Calibration   │
          └──────────┬──────────┘
                     │
                     │ dsm.npy
                     │ dsm.png
                     │ dsm.tif (optional)
                     ▼
          ┌─────────────────────┐
          │ Member 3            │
          │ 3D / Integration    │
          └──────────┬──────────┘
                     │
                     │ terrain.glb
                     │ terrain.html (fallback)
                     ▼
          ┌─────────────────────┐
          │ Member 4            │
          │ Frontend / Demo     │
          └─────────────────────┘

Core pipeline:

RGB → Depth → DSM → 3D Terrain → Frontend
3. GOLDEN SAMPLE

All members should initially work with the same sample image.

Recommended location:

data/sample/input.png

Member 1 must preserve the original input as:

outputs/original.png

The original image, depth map, and DSM must correspond to the same input image.

4. SHARED OUTPUT DIRECTORY

All MVP artifacts should be placed in:

outputs/

Expected structure:

outputs/
├── original.png
├── depth.npy
├── depth.png
├── dsm.npy
├── dsm.png
├── dsm.tif
├── terrain.glb
└── terrain.html

Not every file is mandatory.

Mandatory files:

original.png
depth.npy
depth.png
dsm.npy
dsm.png

At least one 3D output is required:

terrain.glb

or

terrain.html

Do not create fake output files just to satisfy the contract.

5. MEMBER 1 — AI / DEPTH
Responsibility

Convert an RGB image into a monocular relative depth map.

Input
data/sample/input.png
Outputs
outputs/original.png
outputs/depth.npy
outputs/depth.png
5.1 depth.npy

Requirements:

NumPy .npy
2D array
preferably float32
shape (H, W)
contains relative depth values

Example:

import numpy as np

depth = np.load("outputs/depth.npy")

assert depth.ndim == 2
Important

depth.npy represents relative depth.

It is NOT automatically elevation in metres.

Member 1 must not claim that the output is metric elevation.

5.2 depth.png

depth.png is a visualization of the depth map.

It is primarily for display.

Member 2 must use:

depth.npy

for numerical processing, not:

depth.png
5.3 Spatial dimensions

If the original image is:

H × W

the final depth array should preferably be:

H × W

If the model internally resizes the image, the final prediction should be resized back to the original image dimensions before saving.

6. MEMBER 2 — GIS / CALIBRATION
Responsibility

Convert relative depth into an elevation/DSM representation.

Primary input
outputs/depth.npy
Optional inputs
outputs/original.png

and, where available:

GeoTIFF
DEM
SRTM
GCP
Required outputs
outputs/dsm.npy
outputs/dsm.png
Optional output
outputs/dsm.tif
6.1 dsm.npy

Requirements:

NumPy .npy
2D array
preferably float32
normally same shape as depth.npy
represents elevation/height according to the calibration method

Example:

import numpy as np

dsm = np.load("outputs/dsm.npy")

assert dsm.ndim == 2
6.2 dsm.png

Visualization of the DSM/elevation map.

This is primarily for frontend/demo display.

6.3 dsm.tif

If a GeoTIFF is generated, it should contain valid geospatial metadata when such information is actually available.

Document:

CRS
Resolution
Transform
Elevation units

Do NOT invent:

CRS
coordinates
geographic location
elevation reference

when the source data does not provide them.

6.4 Calibration

Relative depth and metric elevation are different concepts.

The MVP may use a prototype calibration method when appropriate.

The implementation must clearly state whether the result is:

Relative / normalized elevation

or:

Calibrated metric elevation

Do NOT fabricate:

MAE
RMSE
Accuracy
Ground truth
7. MEMBER 2 → MEMBER 3 HANDOFF

Member 2 must provide the following information with the DSM:

DSM file:
Shape:
dtype:
Minimum:
Maximum:
Units:
Resolution:
CRS:
Georeferencing available:
Calibration method:

Example:

DSM file: outputs/dsm.npy
Shape: 512 x 512
dtype: float32
Minimum: 0.0
Maximum: 42.7
Units: prototype-relative
Resolution: 1 pixel
CRS: unavailable
Georeferencing: NO
Calibration method: prototype linear mapping

The example above is only a format example. Values must come from the actual output.

8. MEMBER 3 — 3D / BACKEND INTEGRATION
Responsibility

Convert the DSM and RGB image into an interactive 3D terrain representation.

Inputs
outputs/dsm.npy
outputs/original.png

Optional:

outputs/dsm.tif
Required output

At least one:

outputs/terrain.glb

or:

outputs/terrain.html

terrain.glb is preferred when practical.

9. 3D CONSTRUCTION

Each DSM cell represents an elevation value.

Conceptually:

(x, y, z)

where:

x = horizontal position
y = horizontal position
z = elevation

The DSM grid should be converted into vertices and connected into triangles.

Concept:

DSM GRID
────────────

z z z z
z z z z
z z z z
z z z z

       ↓

3D TERRAIN MESH
───────────────

vertices
+
triangles
+
elevation
10. RGB TEXTURE

When practical, Member 3 should use:

outputs/original.png

as the terrain texture.

Goal:

DSM geometry
     +
RGB texture
     ↓
3D terrain

The 3D output should preserve the relationship between the RGB image and the DSM.

Do not invent elevation values.

Do not silently change the meaning of the DSM.

11. MEMBER 3 → MEMBER 4 HANDOFF

Member 3 must document:

3D output:
File format:
How to load:
Coordinate convention:
Vertical scale:
Texture included:
Interactive:

Example:

3D output: outputs/terrain.glb
Format: GLB
Coordinate system: local scene coordinates
Vertical scale: based on dsm.npy
Texture included: YES
Interactive: YES

If terrain.html is used:

3D output: outputs/terrain.html
Format: standalone HTML
Browser: Chrome / Edge
12. MEMBER 4 — FRONTEND / DEMO
Responsibility

Create the demonstration interface using the outputs produced by Members 1–3.

The frontend must NOT independently recreate:

depth estimation
GIS calibration
DSM generation
3D reconstruction
13. MINIMUM FRONTEND

The demo should show:

┌─────────────────────────────────────┐
│            DEPTHWIZARD              │
├─────────────────────────────────────┤
│                                     │
│ Original RGB                        │
│ [              IMAGE              ] │
│                                     │
│ AI Depth Map                        │
│ [              IMAGE              ] │
│                                     │
│ Elevation / DSM                     │
│ [              IMAGE              ] │
│                                     │
│ 3D Terrain                          │
│ [        INTERACTIVE 3D           ] │
│                                     │
└─────────────────────────────────────┘

Optional information:

Elevation range
Height
Slope
Input metadata
Processing status

Only display numerical values that actually come from the pipeline.

Do not fabricate measurements.

14. FRONTEND FILE CONTRACT

Member 4 should expect:

outputs/original.png
outputs/depth.png
outputs/dsm.png

and one of:

outputs/terrain.glb
outputs/terrain.html

Optional:

outputs/dsm.tif

If a file is unavailable, the frontend should show:

Not available

instead of crashing.

15. DATA FORMAT RULES
Numerical data

Use:

.npy

Preferred dtype:

float32
Image visualization

Use:

.png
Geospatial raster

Use:

.tif

only when valid geospatial metadata is available.

3D

Preferred:

.glb

Fallback:

.html
16. DIMENSION RULE

By default:

depth.npy.shape == dsm.npy.shape

Example:

depth.npy → (512, 512)
dsm.npy   → (512, 512)

If a member changes the resolution, they MUST document the change.

Example:

Changed:
512 × 512 → 256 × 256

Reason:
3D performance optimization
17. NO SILENT INTERFACE CHANGES

A member must NOT silently change:

filename
file format
array shape
units
normalization
coordinate convention
output location

If an interface must change, inform the integration lead and update this contract.

18. STATUS FORMAT

Every member should report progress using:

[Member X — Role]

STATUS

Completed:
-

Working on:
-

Input required:
-

Output:
-

Blocked by:
-

Contract changes:
-
19. INTEGRATION TEST

Before the final demo, verify:

Step 1 — Original
outputs/original.png

exists.

Step 2 — Depth
outputs/depth.npy
outputs/depth.png

exist.

Step 3 — DSM
outputs/dsm.npy
outputs/dsm.png

exist.

Step 4 — 3D

At least one exists:

outputs/terrain.glb

or:

outputs/terrain.html
Step 5 — Frontend

The frontend successfully loads:

original.png
depth.png
dsm.png
3D terrain

without errors.

20. GOLDEN PIPELINE TEST

The complete MVP is integrated when:

data/sample/input.png
        │
        ▼
    MEMBER 1
        │
        ▼
outputs/depth.npy
outputs/depth.png
        │
        ▼
    MEMBER 2
        │
        ▼
outputs/dsm.npy
outputs/dsm.png
        │
        ▼
    MEMBER 3
        │
        ▼
outputs/terrain.glb
        │
        ▼
    MEMBER 4
        │
        ▼
   WORKING DEMO

All four stages must use the same golden sample.

21. MVP PRIORITY

When time is limited, use this priority:

1. Working pipeline
2. Correct file handoffs
3. Working depth map
4. Working DSM
5. Working 3D terrain
6. Frontend integration
7. UI polish
8. Advanced features

If time is running out:

Do not add new features.

Make the existing pipeline work reliably.

22. OUT OF MVP SCOPE

Do NOT spend MVP time on:

Authentication
User accounts
Database
Cloud deployment
Advanced GIS infrastructure
Training a new deep-learning model
Full GAMUS training
Multiple datasets
Advanced terrain streaming
Sophisticated LOD
Production-grade security
Unnecessary animations
23. GOLDEN RULE

When in doubt:

ASK BEFORE CHANGING THE CONTRACT.

The objective is NOT four independent modules.

The objective is ONE working system:

RGB
 ↓
DEPTH
 ↓
DSM
 ↓
3D
 ↓
FRONTEND