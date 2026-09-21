import argparse
import os
import sys

# Add the parent directory to sys.path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from mesh_generator import generate_mesh_and_export_glb
from viewer import generate_html_viewer

def main():
    parser = argparse.ArgumentParser(description="DepthWizard Member 3 - 3D Terrain Builder")
    parser.add_argument('--dsm', required=True, help='Path to input DSM file (.npy or .tif)')
    parser.add_argument('--rgb', required=True, help='Path to input RGB original image')
    parser.add_argument('--output', required=True, help='Base path to output files (e.g. outputs/terrain will create outputs/terrain.glb and outputs/terrain.html)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.dsm):
        print(f"Error: DSM file not found at {args.dsm}")
        sys.exit(1)
        
    if not os.path.exists(args.rgb):
        print(f"Error: RGB file not found at {args.rgb}")
        sys.exit(1)
        
    output_dir = os.path.dirname(args.output)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
        
    glb_path = f"{args.output}.glb"
    html_path = f"{args.output}.html"
    
    print("========================================")
    print(" Starting 3D Terrain Construction (Member 3)")
    print("========================================")
    print(f" DSM Input: {args.dsm}")
    print(f" RGB Input: {args.rgb}")
    
    try:
        generate_mesh_and_export_glb(args.dsm, args.rgb, glb_path)
    except Exception as e:
        print(f"Error during GLB generation: {e}")
        
    try:
        generate_html_viewer(args.dsm, args.rgb, html_path)
    except Exception as e:
        print(f"Error during HTML generation: {e}")
        
    print("========================================")
    print(" 3D Terrain Construction Complete")
    print(f" Outputs generated at {glb_path} and {html_path}")
    print("========================================")

if __name__ == "__main__":
    main()
