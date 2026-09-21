import numpy as np
import open3d as o3d
from PIL import Image
import os

def generate_mesh_and_export_glb(dsm_path, rgb_path, output_glb_path):
    print(f"Loading DSM from {dsm_path}")
    if dsm_path.endswith('.npy'):
        dsm = np.load(dsm_path)
    elif dsm_path.endswith('.tif'):
        import rasterio
        with rasterio.open(dsm_path) as src:
            dsm = src.read(1)
    else:
        raise ValueError("Unsupported DSM format. Use .npy or .tif")

    print(f"Loading RGB from {rgb_path}")
    img = Image.open(rgb_path).convert('RGB')
    
    h, w = dsm.shape
    if (img.width, img.height) != (w, h):
        print(f"Warning: RGB dimensions {(img.width, img.height)} do not match DSM dimensions {(w, h)}.")
        print("Resizing RGB to match DSM for texture mapping. The original DSM remains unchanged.")
        img = img.resize((w, h), Image.Resampling.LANCZOS)
    
    print("Generating vertices and faces...")
    x = np.linspace(0, w - 1, w)
    y = np.linspace(0, h - 1, h)
    xx, yy = np.meshgrid(x, y)
    
    zz = dsm
    vertices = np.stack([xx.flatten(), yy.flatten(), zz.flatten()], axis=-1)
    
    i = np.arange(h - 1)
    j = np.arange(w - 1)
    ii, jj = np.meshgrid(i, j, indexing='ij')
    
    idx_top_left = (ii * w + jj).flatten()
    idx_top_right = (ii * w + jj + 1).flatten()
    idx_bottom_left = ((ii + 1) * w + jj).flatten()
    idx_bottom_right = ((ii + 1) * w + jj + 1).flatten()
    
    faces_1 = np.stack([idx_top_left, idx_bottom_left, idx_top_right], axis=-1)
    faces_2 = np.stack([idx_top_right, idx_bottom_left, idx_bottom_right], axis=-1)
    faces = np.vstack([faces_1, faces_2])
    
    u = xx.flatten() / (w - 1)
    v = 1.0 - (yy.flatten() / (h - 1))
    
    uv_coords = np.stack([u, v], axis=-1)
    triangle_uvs = uv_coords[faces.flatten()]
    
    print("Constructing Open3D mesh...")
    mesh = o3d.geometry.TriangleMesh()
    mesh.vertices = o3d.utility.Vector3dVector(vertices)
    mesh.triangles = o3d.utility.Vector3iVector(faces)
    mesh.triangle_uvs = o3d.utility.Vector2dVector(triangle_uvs)
    
    o3d_img = o3d.geometry.Image(np.array(img))
    mesh.textures = [o3d_img]
    
    mesh.compute_vertex_normals()
    
    print(f"Exporting GLB to {output_glb_path}...")
    o3d.io.write_triangle_mesh(output_glb_path, mesh, write_triangle_uvs=True)
    print("GLB export complete.")
