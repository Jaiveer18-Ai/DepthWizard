# Member 1 — AI / Depth: Monocular Depth Estimation

**SIH-DepthWizard 2026** — *PS 26175*  
**Module**: Member 1 (AI / Depth)  
**Integration Contract**: [CONTRACT.md](../CONTRACT.md)  
**Branch**: `AI/DEPTH`  

---

## 1. Module Overview

The **Member 1 (AI / Depth)** module is the entry stage of the DepthWizard pipeline:

$$\text{RGB Image} \longrightarrow \text{Member 1 (AI/Depth)} \longrightarrow \begin{cases} \texttt{outputs/original.png} \\ \texttt{outputs/depth.npy} \\ \texttt{outputs/depth.png} \end{cases}$$

This module converts an input aerial, satellite, or landscape RGB image into a high-fidelity **relative monocular depth map** using a pretrained deep convolutional/vision transformer model (**MiDaS v2.1 Small**).

---

## 2. Installation & Requirements

The module is optimized for high reliability, minimal footprint, and zero dependency conflicts. It utilizes OpenCV DNN and NumPy, requiring no heavy PyTorch installation:

```bash
pip install -r depth/requirements.txt
```

### Dependencies (`depth/requirements.txt`)
- `numpy>=1.22.0`
- `opencv-python>=4.5.0`
- `Pillow>=9.0.0`
- `requests>=2.25.0`

---

## 3. How to Run Inference

Execute inference from the repository root:

```bash
python depth/inference.py --input data/sample/input.png --output outputs
```

### CLI Arguments
| Option | Default | Description |
|---|---|---|
| `--input`, `-i` | `data/sample/input.png` | Path to RGB image (PNG, JPG, JPEG, BMP, TIF) |
| `--output`, `-o` | `outputs` | Output directory conforming to `CONTRACT.md` |
| `--weights`, `-w` | `models/model-small.onnx` | Path to ONNX weights (auto-downloaded if missing) |
| `--colormap`, `-c` | `inferno` | Colormap for `depth.png` (`inferno`, `magma`, `viridis`, `plasma`, `turbo`, `gray`) |

---

## 4. Input Contract

- Supported formats: **PNG, JPG, JPEG, BMP, TIF, TIFF**
- Image channels: **RGB** (3-channel)
- Golden integration test sample: `data/sample/input.png`

---

## 5. Output Contract

All outputs are written to `outputs/` strictly matching `CONTRACT.md`:

| Filename | Format | Description | Primary Consumer |
|---|---|---|---|
| `outputs/original.png` | PNG | Exact copy of input RGB image | Downstream pipeline, Member 3, Member 4 |
| `outputs/depth.npy` | NumPy `.npy` | 2D `float32` array of relative depth | **Member 2 (GIS / Calibration)** |
| `outputs/depth.png` | PNG | Normalized 8-bit visual map (inferno colormap) | Member 4 (Frontend / Demo display) |

---

## 6. Understanding `depth.npy`

### ⚠️ IMPORTANT: Relative Depth vs. Metric Elevation
- `depth.npy` contains **RELATIVE MONOCULAR DEPTH** (inverse depth / disparity representation).
- **It is NOT metric elevation in metres.**
- Member 1 does not fabricate metric elevations or claim calibrated geospatial units.
- Calibration to real-world elevation (DSM) using ground control points (GCPs) or DEM/SRTM references is the sole responsibility of **Member 2 (GIS / Calibration)**.

### Array Specifications
- **Data type**: `np.float32`
- **Dimensions**: 2-dimensional `(H, W)`
- **Spatial Alignment**: $(H, W)$ matches the input image dimensions $(H_{\text{original}}, W_{\text{original}})$ exactly.

---

## 7. Downstream Handoff (Member 2 Integration)

Member 2 (GIS / Calibration) loads `depth.npy` directly:

```python
import numpy as np
from PIL import Image

# 1. Load relative depth
depth = np.load("outputs/depth.npy")

# 2. Load matching RGB
original_image = Image.open("outputs/original.png")

# 3. Contract Assertions
assert depth.ndim == 2
assert depth.shape == (original_image.height, original_image.width)
assert np.isfinite(depth).all()
assert depth.dtype == np.float32

# Member 2 continues with GIS calibration / DSM generation...
```
