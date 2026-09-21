#!/usr/bin/env python3
"""
DepthWizard 2026 — Member 1: AI / Depth
Monocular Relative Depth Estimation Pipeline

Author: Member 1 — AI / Depth
Integration Specification: CONTRACT.md
Pipeline Stage: RGB Image -> Relative Depth (depth.npy + depth.png + original.png)
"""

import argparse
import os
import sys
import urllib.request
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

# Model information
MODEL_NAME = "MiDaS v2.1 Small (ONNX)"
MODEL_URL = "https://github.com/isl-org/MiDaS/releases/download/v2_1/model-small.onnx"
DEFAULT_INPUT_SIZE = (256, 256)
SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tif", ".tiff"}

# ImageNet normalization parameters for MiDaS
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

COLORMAP_MAP = {
    "inferno": cv2.COLORMAP_INFERNO,
    "magma": cv2.COLORMAP_MAGMA,
    "plasma": cv2.COLORMAP_PLASMA,
    "viridis": cv2.COLORMAP_VIRIDIS,
    "turbo": cv2.COLORMAP_TURBO,
}


def resolve_model_weights(custom_weights_path: str = None) -> Path:
    """Resolve or download the pretrained MiDaS ONNX model weights."""
    if custom_weights_path and os.path.isfile(custom_weights_path):
        return Path(custom_weights_path)

    # Search known candidate locations
    candidates = [
        Path("models/model-small.onnx"),
        Path("depth/weights/model-small.onnx"),
        Path(__file__).resolve().parent.parent / "models" / "model-small.onnx",
        Path(__file__).resolve().parent / "weights" / "model-small.onnx",
    ]

    for candidate in candidates:
        if candidate.is_file():
            return candidate

    # If not found, download to models/model-small.onnx
    target_path = Path("models/model-small.onnx")
    target_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Model weights not found locally. Downloading {MODEL_NAME} from:")
    print(f"  {MODEL_URL}")
    print(f"Saving to: {target_path} ...")

    def _progress(count, block_size, total_size):
        if total_size > 0:
            percent = int(count * block_size * 100 / total_size)
            sys.stdout.write(f"\rDownloading weights: {min(100, percent)}%")
            sys.stdout.flush()

    urllib.request.urlretrieve(MODEL_URL, str(target_path), reporthook=_progress)
    print("\nDownload complete.")
    return target_path


def load_and_preprocess_image(input_path: Path):
    """Load an RGB image and prepare the tensor blob for model inference."""
    if not input_path.is_file():
        raise FileNotFoundError(f"Input file does not exist: {input_path}")

    ext = input_path.suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported image extension '{ext}'. Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )

    # Load with PIL to ensure consistent RGB channel order
    pil_img = Image.open(str(input_path)).convert("RGB")
    orig_w, orig_h = pil_img.size

    # Convert to NumPy RGB array
    rgb_arr = np.array(pil_img, dtype=np.uint8)

    # Resize to model input dimensions
    img_resized = cv2.resize(rgb_arr, DEFAULT_INPUT_SIZE, interpolation=cv2.INTER_CUBIC)

    # Normalize: [0, 255] -> [0.0, 1.0] -> standard ImageNet mean & std
    img_float = img_resized.astype(np.float32) / 255.0
    img_norm = (img_float - IMAGENET_MEAN) / IMAGENET_STD

    # HWC -> CHW -> NCHW (1, 3, 256, 256)
    blob = np.transpose(img_norm, (2, 0, 1))[np.newaxis, ...]
    return pil_img, rgb_arr, blob, (orig_h, orig_w)


def run_inference(net: cv2.dnn.Net, blob: np.ndarray, target_shape: tuple) -> np.ndarray:
    """Execute forward inference and resize prediction back to original dimensions."""
    net.setInput(blob)
    output = net.forward()

    # Extract 2D prediction map (H_model, W_model)
    depth_raw = np.squeeze(output)
    if depth_raw.ndim != 2:
        raise RuntimeError(f"Expected 2D depth output, got shape {depth_raw.shape}")

    orig_h, orig_w = target_shape

    # Bilinear/bicubic resize back to exact original image dimensions
    depth_resized = cv2.resize(depth_raw, (orig_w, orig_h), interpolation=cv2.INTER_CUBIC)
    depth_resized = depth_resized.astype(np.float32)

    # Integrity verification
    if not np.isfinite(depth_resized).all():
        raise ValueError("Depth map contains non-finite values (NaN or Inf).")

    return depth_resized


def create_depth_visualization(depth: np.ndarray, colormap: str = "inferno") -> np.ndarray:
    """Normalize relative depth to [0, 255] and apply a perceptual colormap."""
    d_min = float(depth.min())
    d_max = float(depth.max())

    if d_max > d_min:
        norm = (depth - d_min) / (d_max - d_min)
    else:
        norm = np.zeros_like(depth)

    vis_uint8 = np.clip(norm * 255.0, 0, 255).astype(np.uint8)

    if colormap == "gray":
        return cv2.cvtColor(vis_uint8, cv2.COLOR_GRAY2BGR)

    cmap_code = COLORMAP_MAP.get(colormap.lower(), cv2.COLORMAP_INFERNO)
    return cv2.applyColorMap(vis_uint8, cmap_code)


def main():
    parser = argparse.ArgumentParser(
        description="DepthWizard Member 1 — Monocular Relative Depth Inference"
    )
    parser.add_argument(
        "--input",
        "-i",
        type=str,
        default="data/sample/input.png",
        help="Path to input RGB image (PNG, JPG, JPEG)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="outputs",
        help="Output directory for contract artifacts (default: outputs)",
    )
    parser.add_argument(
        "--weights",
        "-w",
        type=str,
        default=None,
        help="Path to pretrained ONNX model weights (optional; auto-resolved if omitted)",
    )
    parser.add_argument(
        "--colormap",
        "-c",
        type=str,
        default="inferno",
        choices=["inferno", "magma", "plasma", "viridis", "turbo", "gray"],
        help="Colormap for depth.png visualization (default: inferno)",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # 1. Resolve model weights
    weights_path = resolve_model_weights(args.weights)
    if not weights_path.is_file():
        print(f"Error: Model weights not found at {weights_path}", file=sys.stderr)
        sys.exit(1)

    # 2. Load neural network via OpenCV DNN
    try:
        net = cv2.dnn.readNetFromONNX(str(weights_path))
    except Exception as e:
        print(f"Error loading ONNX network: {e}", file=sys.stderr)
        sys.exit(1)

    # Prefer CPU for universal reproducibility
    net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
    net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

    # 3. Load and preprocess image
    try:
        pil_img, rgb_arr, blob, (orig_h, orig_w) = load_and_preprocess_image(input_path)
    except Exception as e:
        print(f"Error reading input image: {e}", file=sys.stderr)
        sys.exit(1)

    # 4. Run monocular depth inference
    try:
        depth = run_inference(net, blob, (orig_h, orig_w))
    except Exception as e:
        print(f"Error during depth inference: {e}", file=sys.stderr)
        sys.exit(1)

    # 5. Prepare output filenames according to CONTRACT.md
    out_original_png = output_dir / "original.png"
    out_depth_npy = output_dir / "depth.npy"
    out_depth_png = output_dir / "depth.png"

    # Save outputs/original.png (exact RGB input preserved for downstream members)
    pil_img.save(str(out_original_png))

    # Save outputs/depth.npy (raw relative depth as float32 NumPy array)
    np.save(str(out_depth_npy), depth)

    # Save outputs/depth.png (normalized visualization for frontend/display)
    vis_bgr = create_depth_visualization(depth, colormap=args.colormap)
    cv2.imwrite(str(out_depth_png), vis_bgr)

    # 6. Display inference report conforming to integration contract
    print("============================================================")
    print("MEMBER 1 -- AI / DEPTH INFERENCE")
    print("============================================================")
    print(f"Model: {MODEL_NAME}")
    print(f"Input: {input_path}")
    print(f"Original size: {orig_w} x {orig_h}")
    print(f"Depth shape: {depth.shape[0]} x {depth.shape[1]}")
    print(f"dtype: {depth.dtype}")
    print(f"Minimum: {depth.min():.6f}")
    print(f"Maximum: {depth.max():.6f}")
    print(f"Is Metric: NO (Relative Depth only)")
    print()
    print("Saved:")
    print(f"{out_original_png.as_posix()}")
    print(f"{out_depth_npy.as_posix()}")
    print(f"{out_depth_png.as_posix()}")
    print("============================================================")


if __name__ == "__main__":
    main()
