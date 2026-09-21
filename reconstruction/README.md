# Member 3: 3D Reconstruction / Backend Integration

This directory contains the Member 3 implementation for creating a 3D terrain mesh from a DSM and an RGB image.

## Overview

The pipeline converts a 2D elevation grid (DSM) into a 3D surface model. It generates two formats:
1. `terrain.glb`: A fully textured, high-resolution 3D model (Standard glTF format).
2. `terrain.html`: A fallback interactive 3D visualization using Plotly.

## Input Files

The pipeline expects the following inputs (as produced by Members 1 and 2):
- **DSM**: `outputs/dsm.npy` (or `dsm.tif`). A 2D array representing elevation values.
- **RGB Image**: `outputs/original.png`. The original reference image used for texture mapping.

## Output Files

The pipeline generates the following outputs:
- **`outputs/terrain.glb`**: The primary 3D model with the original RGB image mapped as a texture.
- **`outputs/terrain.html`**: A standalone HTML file containing an interactive 3D plot.

## How to Run (CLI)

```bash
# Install dependencies
pip install -r reconstruction/requirements.txt

# Run the pipeline
python reconstruction/terrain_builder.py \
  --dsm outputs/dsm.npy \
  --rgb outputs/original.png \
  --output outputs/terrain
```

## Coordinate & Elevation Assumptions

- **X / Y Coordinates**: Correspond directly to the 2D grid indices of the DSM. The dimensions map 1:1 with the DSM width and height.
- **Z (Elevation)**: Represents the raw values taken directly from the input DSM. No modifications, smoothing, or fabrications are applied to the true Z values.

## Limitations & Constraints

### HTML Output Limitations
To prevent browser crashes, the HTML visualization (`terrain.html`) may internally **downsample** the surface geometry (to a max dimension of 256x256). Additionally, Plotly does not natively support true UV texture wrapping, so the HTML output uses a standard elevation-based colorscale (Earth colorscale) rather than the original RGB texture. 
*Note: This downsampling and coloring affects **only** the HTML visualization. The original DSM values and the exported GLB model remain completely unaltered.*

### GLB Output
The `.glb` file retains the maximum mesh resolution dictated by the input DSM. 
*Note: Depending on the specific version of `open3d` installed in the environment, the `.glb` exporter may not natively support writing RGB textures and UV coordinates to the file. If this limitation is encountered, the output will be a valid untextured elevation mesh representing the DSM geometry, and the terminal will output a warning.*

## Instructions for Member 4 (Frontend)

- **Loading GLB**: You can seamlessly load `outputs/terrain.glb` using Three.js (`GLTFLoader`), Babylon.js, or model-viewer `<model-viewer src="outputs/terrain.glb"></model-viewer>`.
- **Loading HTML**: If the GLB is too heavy or a direct fallback is needed, simply embed `outputs/terrain.html` via an `<iframe>`.
- Always expect the 3D files to be generated in the `outputs/` directory. Be resilient to missing files (e.g., show "Not Available" if a file doesn't exist yet).
