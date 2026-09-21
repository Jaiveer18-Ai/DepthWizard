import { CONTRACT_PATHS, DEMO_TERRAIN_METADATA } from '../data/demoData';
import { PipelineOutputs, TerrainMetadata } from '../types';

/**
 * Service that directly checks and loads the contract-defined file outputs
 * according to contract.md (Section 4, 14, 19).
 * Detects SPA fallback to avoid treating 200 text/html as valid binary assets.
 */
export async function checkFileAvailability(path: string): Promise<boolean> {
  try {
    const response = await fetch(`/${path}`, { method: 'HEAD' });
    if (!response.ok) return false;
    const contentType = response.headers.get('content-type') || '';
    
    // If server returned index.html (SPA fallback) for non-html assets, the file does NOT exist
    if (contentType.includes('text/html') && !path.endsWith('.html')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Scan all contract output files in outputs/
 */
export async function checkPipelineOutputs(): Promise<PipelineOutputs> {
  const [
    hasOriginal,
    hasDepthImg,
    hasDepthNpy,
    hasDsmImg,
    hasDsmNpy,
    hasDsmTif,
    hasGlb,
    hasHtml,
  ] = await Promise.all([
    checkFileAvailability(CONTRACT_PATHS.ORIGINAL_IMAGE),
    checkFileAvailability(CONTRACT_PATHS.DEPTH_PNG),
    checkFileAvailability(CONTRACT_PATHS.DEPTH_NPY),
    checkFileAvailability(CONTRACT_PATHS.DSM_PNG),
    checkFileAvailability(CONTRACT_PATHS.DSM_NPY),
    checkFileAvailability(CONTRACT_PATHS.DSM_TIF),
    checkFileAvailability(CONTRACT_PATHS.TERRAIN_GLB),
    checkFileAvailability(CONTRACT_PATHS.TERRAIN_HTML),
  ]);

  const hasRealData = hasOriginal || hasDepthImg || hasDsmImg || hasGlb || hasHtml;

  return {
    originalImage: hasOriginal ? `/${CONTRACT_PATHS.ORIGINAL_IMAGE}` : null,
    depthImage: hasDepthImg ? `/${CONTRACT_PATHS.DEPTH_PNG}` : null,
    dsmImage: hasDsmImg ? `/${CONTRACT_PATHS.DSM_PNG}` : null,
    terrainGlb: hasGlb ? `/${CONTRACT_PATHS.TERRAIN_GLB}` : null,
    terrainHtml: hasHtml ? `/${CONTRACT_PATHS.TERRAIN_HTML}` : null,
    depthNpy: hasDepthNpy ? `/${CONTRACT_PATHS.DEPTH_NPY}` : null,
    dsmNpy: hasDsmNpy ? `/${CONTRACT_PATHS.DSM_NPY}` : null,
    dsmTif: hasDsmTif ? `/${CONTRACT_PATHS.DSM_TIF}` : null,
    isRealData: hasRealData,
    source: hasRealData ? 'real' : 'none',
  };
}

/**
 * Parse .npy metadata and basic statistics if available in browser
 */
export async function parseNpyStats(npyUrl: string): Promise<Partial<TerrainMetadata> | null> {
  try {
    const res = await fetch(npyUrl);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) return null;

    const buffer = await res.arrayBuffer();
    
    // Check NPY magic string (\x93NUMPY)
    const magic = new Uint8Array(buffer.slice(0, 6));
    const magicStr = String.fromCharCode(...magic);
    if (!magicStr.includes('NUMPY')) {
      return null;
    }

    // Read header length
    const headerLenView = new DataView(buffer.slice(8, 10));
    const headerLen = headerLenView.getUint16(0, true);
    const headerBytes = new Uint8Array(buffer.slice(10, 10 + headerLen));
    const headerStr = new TextDecoder('ascii').decode(headerBytes);

    // Extract shape from python dict string: 'shape': (512, 512)
    const shapeMatch = headerStr.match(/'shape':\s*\(([^)]+)\)/);
    let shape: [number, number] = [512, 512];
    if (shapeMatch && shapeMatch[1]) {
      const parts = shapeMatch[1].split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (parts.length >= 2) {
        shape = [parts[0], parts[1]];
      }
    }

    // Read float32 array
    const dataOffset = 10 + headerLen;
    const floatArray = new Float32Array(buffer.slice(dataOffset));
    
    if (floatArray.length === 0) return null;

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    const stride = Math.max(1, Math.floor(floatArray.length / 5000));
    let sampledCount = 0;

    for (let i = 0; i < floatArray.length; i += stride) {
      const v = floatArray[i];
      if (!isNaN(v) && isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
        sum += v;
        sampledCount++;
      }
    }

    const avg = sampledCount > 0 ? sum / sampledCount : 0;

    return {
      minElevation: parseFloat(min.toFixed(2)),
      maxElevation: parseFloat(max.toFixed(2)),
      avgElevation: parseFloat(avg.toFixed(2)),
      elevationRange: parseFloat((max - min).toFixed(2)),
      shape,
      isDemoData: false,
    };
  } catch (err) {
    console.warn('Could not parse .npy file:', err);
    return null;
  }
}
