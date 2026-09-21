import numpy as np
from PIL import Image
import os
import subprocess

def create_synthetic_data(dsm_path, rgb_path):
    print("Creating synthetic test data...")
    # Create 64x64 DSM with some elevation variation
    x = np.linspace(-5, 5, 64)
    y = np.linspace(-5, 5, 64)
    xx, yy = np.meshgrid(x, y)
    z = np.sin(np.sqrt(xx**2 + yy**2)) * 10 + 20 # elevation between 10 and 30
    dsm = z.astype(np.float32)
    np.save(dsm_path, dsm)
    
    # Create 64x64 RGB image
    img = np.zeros((64, 64, 3), dtype=np.uint8)
    img[:, :, 0] = (xx + 5) / 10 * 255 # R varying with X
    img[:, :, 1] = (yy + 5) / 10 * 255 # G varying with Y
    img[:, :, 2] = 128                 # B constant
    
    pil_img = Image.fromarray(img)
    pil_img.save(rgb_path)

def test_pipeline():
    os.makedirs('data/sample', exist_ok=True)
    os.makedirs('outputs', exist_ok=True)
    
    dsm_path = 'outputs/dsm.npy'
    rgb_path = 'outputs/original.png'
    output_base = 'outputs/terrain'
    
    create_synthetic_data(dsm_path, rgb_path)
    
    # Execute the CLI script using the current python executable
    import sys
    cmd = [
        sys.executable, 'reconstruction/terrain_builder.py',
        '--dsm', dsm_path,
        '--rgb', rgb_path,
        '--output', output_base
    ]
    print(f"Running pipeline command: {' '.join(cmd)}")
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print("Pipeline execution failed!")
        print(result.stderr)
        return False
        
    if not os.path.exists(f"{output_base}.glb"):
        print("Failed: GLB not found.")
        return False
        
    if not os.path.exists(f"{output_base}.html"):
        print("Failed: HTML not found.")
        return False
        
    print("Test passed successfully!")
    return True

if __name__ == "__main__":
    test_pipeline()
