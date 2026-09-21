import plotly.graph_objects as go
import numpy as np
from PIL import Image
import os

def generate_html_viewer(dsm_path, rgb_path, output_html_path):
    print(f"Generating HTML viewer from {dsm_path} and {rgb_path}")
    if dsm_path.endswith('.npy'):
        dsm = np.load(dsm_path)
    elif dsm_path.endswith('.tif'):
        import rasterio
        with rasterio.open(dsm_path) as src:
            dsm = src.read(1)
    else:
        raise ValueError("Unsupported DSM format. Use .npy or .tif")

    img = Image.open(rgb_path).convert('RGB')
    
    h, w = dsm.shape
    
    # Downsample for HTML visualization to prevent browser crash
    # Original DSM is completely untouched. Downsampling is done only in memory for HTML plot.
    max_dim = 256
    scale = min(1.0, max_dim / max(h, w))
    
    if scale < 1.0:
        print(f"Downsampling HTML surface to max dimension {max_dim} for performance. True DSM values are untouched.")
        step = int(1 / scale)
        dsm_ds = dsm[::step, ::step]
    else:
        dsm_ds = dsm

    # Limitation: Plotly Surface does not natively support true image-to-surface texture mapping 
    # without complex workaround (like discrete colored points or colored voxels).
    # Since we prioritize simple, reliable MVP as per contract, we will use an elevation colorscale.
    
    fig = go.Figure(data=[go.Surface(z=dsm_ds, colorscale='Earth')])
    
    # Compute a reasonable aspect ratio so the terrain isn't extremely stretched or flattened
    range_x = dsm_ds.shape[1]
    range_y = dsm_ds.shape[0]
    z_min, z_max = np.nanmin(dsm_ds), np.nanmax(dsm_ds)
    range_z = max((z_max - z_min), 1.0)
    
    # Rough scaling for aspect ratio
    max_xy = max(range_x, range_y)
    z_ratio = range_z / max_xy
    
    fig.update_layout(
        title='3D Terrain Visualization (Downsampled, Elevation Colorscale)',
        scene=dict(
            xaxis_title='X Axis',
            yaxis_title='Y Axis',
            zaxis_title='Elevation (Z)',
            aspectratio=dict(x=1, y=range_y/range_x, z=z_ratio)
        ),
        margin=dict(l=0, r=0, b=0, t=30)
    )
    
    fig.add_annotation(
        text="<b>HTML Limitations:</b><br>- Geometry is downsampled for browser performance.<br>- Plotly does not natively support RGB texture wrapping; an elevation colorscale ('Earth') is used.<br>- Please use the <b>terrain.glb</b> file for full-resolution, textured 3D models.",
        xref="paper", yref="paper",
        x=0.01, y=0.98, showarrow=False,
        align="left",
        font=dict(size=12, color="red"),
        bgcolor="rgba(255, 255, 255, 0.8)",
        bordercolor="black", borderwidth=1
    )
    
    fig.write_html(output_html_path)
    print(f"HTML viewer exported to {output_html_path}")
