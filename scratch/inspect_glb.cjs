/**
 * Parse terrain.glb binary format directly to extract mesh vertex data
 * without needing browser APIs like ProgressEvent.
 * 
 * GLB format:
 * - 12 byte header: magic(4) + version(4) + length(4)
 * - chunks: each has length(4) + type(4) + data(length)
 *   - chunk type 0x4E4F534A = JSON
 *   - chunk type 0x004E4942 = BIN
 */
const fs = require('fs');
const path = require('path');

const glbPath = path.resolve(__dirname, '../outputs/terrain.glb');

if (!fs.existsSync(glbPath)) {
  console.error('terrain.glb not found at', glbPath);
  process.exit(1);
}

const buffer = fs.readFileSync(glbPath);
console.log('File size:', buffer.length, 'bytes');

// Parse header
const magic = buffer.readUInt32LE(0);
const version = buffer.readUInt32LE(4);
const totalLength = buffer.readUInt32LE(8);
console.log('Magic:', magic === 0x46546C67 ? 'glTF (valid)' : 'INVALID');
console.log('Version:', version);
console.log('Total length:', totalLength);

// Parse chunks
let offset = 12;
let jsonChunk = null;
let binChunk = null;

while (offset < buffer.length) {
  const chunkLength = buffer.readUInt32LE(offset);
  const chunkType = buffer.readUInt32LE(offset + 4);
  const chunkData = buffer.slice(offset + 8, offset + 8 + chunkLength);
  
  if (chunkType === 0x4E4F534A) { // JSON
    jsonChunk = JSON.parse(chunkData.toString('utf8'));
  } else if (chunkType === 0x004E4942) { // BIN
    binChunk = chunkData;
  }
  
  offset += 8 + chunkLength;
}

if (!jsonChunk) {
  console.error('No JSON chunk found in GLB');
  process.exit(1);
}

console.log('\n=== GLTF JSON STRUCTURE ===');
console.log('Nodes:', jsonChunk.nodes?.length || 0);
console.log('Meshes:', jsonChunk.meshes?.length || 0);
console.log('Accessors:', jsonChunk.accessors?.length || 0);
console.log('BufferViews:', jsonChunk.bufferViews?.length || 0);
console.log('Buffers:', jsonChunk.buffers?.length || 0);

// Print node hierarchy with transforms
console.log('\n=== NODE HIERARCHY ===');
if (jsonChunk.nodes) {
  for (let i = 0; i < jsonChunk.nodes.length; i++) {
    const node = jsonChunk.nodes[i];
    console.log(`Node[${i}] name="${node.name || ''}":`);
    if (node.translation) console.log(`  translation: [${node.translation.join(', ')}]`);
    if (node.rotation) console.log(`  rotation: [${node.rotation.join(', ')}]`);
    if (node.scale) console.log(`  scale: [${node.scale.join(', ')}]`);
    if (node.matrix) console.log(`  matrix: [${node.matrix.join(', ')}]`);
    if (node.mesh !== undefined) console.log(`  mesh: ${node.mesh}`);
    if (node.children) console.log(`  children: [${node.children.join(', ')}]`);
    if (!node.translation && !node.rotation && !node.scale && !node.matrix) {
      console.log('  (identity transform)');
    }
  }
}

// Scene info
if (jsonChunk.scenes) {
  for (const scene of jsonChunk.scenes) {
    console.log(`\nScene "${scene.name || ''}": root nodes = [${scene.nodes?.join(', ') || ''}]`);
  }
}

// Find POSITION accessors and extract actual vertex data
console.log('\n=== MESH VERTEX DATA ===');
if (jsonChunk.meshes && binChunk) {
  for (let mi = 0; mi < jsonChunk.meshes.length; mi++) {
    const mesh = jsonChunk.meshes[mi];
    console.log(`\nMesh[${mi}] "${mesh.name || ''}":`);
    
    for (let pi = 0; pi < mesh.primitives.length; pi++) {
      const prim = mesh.primitives[pi];
      const posAccessorIdx = prim.attributes?.POSITION;
      
      if (posAccessorIdx === undefined) {
        console.log(`  Primitive[${pi}]: no POSITION attribute`);
        continue;
      }
      
      const accessor = jsonChunk.accessors[posAccessorIdx];
      const bufferView = jsonChunk.bufferViews[accessor.bufferView];
      
      const componentType = accessor.componentType; // 5126 = FLOAT
      const count = accessor.count;
      const type = accessor.type; // VEC3
      
      console.log(`  Primitive[${pi}] POSITION accessor:`);
      console.log(`    count: ${count} vertices`);
      console.log(`    type: ${type}`);
      console.log(`    componentType: ${componentType} (5126=FLOAT)`);
      
      if (accessor.min) console.log(`    accessor.min: [${accessor.min.join(', ')}]`);
      if (accessor.max) console.log(`    accessor.max: [${accessor.max.join(', ')}]`);
      
      // Calculate size from accessor min/max
      if (accessor.min && accessor.max) {
        const sizeX = accessor.max[0] - accessor.min[0];
        const sizeY = accessor.max[1] - accessor.min[1];
        const sizeZ = accessor.max[2] - accessor.min[2];
        const centerX = (accessor.max[0] + accessor.min[0]) / 2;
        const centerY = (accessor.max[1] + accessor.min[1]) / 2;
        const centerZ = (accessor.max[2] + accessor.min[2]) / 2;
        
        console.log(`    SIZE: X=${sizeX.toFixed(4)}, Y=${sizeY.toFixed(4)}, Z=${sizeZ.toFixed(4)}`);
        console.log(`    CENTER: X=${centerX.toFixed(4)}, Y=${centerY.toFixed(4)}, Z=${centerZ.toFixed(4)}`);
        
        const maxDim = Math.max(sizeX, sizeY, sizeZ);
        const radius = Math.sqrt(sizeX*sizeX + sizeY*sizeY + sizeZ*sizeZ) / 2;
        console.log(`    maxDimension: ${maxDim.toFixed(4)}`);
        console.log(`    approx bounding sphere radius: ${radius.toFixed(4)}`);
      }
      
      // Also verify by reading actual vertex data from binary
      if (componentType === 5126 && binChunk) {
        const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
        const stride = bufferView.byteStride || (3 * 4); // 3 floats * 4 bytes
        
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        
        for (let i = 0; i < count; i++) {
          const base = byteOffset + i * stride;
          const x = binChunk.readFloatLE(base);
          const y = binChunk.readFloatLE(base + 4);
          const z = binChunk.readFloatLE(base + 8);
          
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          if (z < minZ) minZ = z;
          if (z > maxZ) maxZ = z;
        }
        
        console.log(`    [VERIFIED from binary]`);
        console.log(`    vertex X range: [${minX.toFixed(6)}, ${maxX.toFixed(6)}]`);
        console.log(`    vertex Y range: [${minY.toFixed(6)}, ${maxY.toFixed(6)}]`);
        console.log(`    vertex Z range: [${minZ.toFixed(6)}, ${maxZ.toFixed(6)}]`);
        console.log(`    actual size: X=${(maxX-minX).toFixed(4)}, Y=${(maxY-minY).toFixed(4)}, Z=${(maxZ-minZ).toFixed(4)}`);
        console.log(`    actual center: X=${((maxX+minX)/2).toFixed(4)}, Y=${((maxY+minY)/2).toFixed(4)}, Z=${((maxZ+minZ)/2).toFixed(4)}`);
      }
    }
  }
}

// Camera math based on accessor min/max
console.log('\n=== CAMERA MATH ===');
if (jsonChunk.meshes) {
  // Collect all position accessors to get overall bounds
  let globalMinX = Infinity, globalMaxX = -Infinity;
  let globalMinY = Infinity, globalMaxY = -Infinity;
  let globalMinZ = Infinity, globalMaxZ = -Infinity;
  
  for (const mesh of jsonChunk.meshes) {
    for (const prim of mesh.primitives) {
      const posIdx = prim.attributes?.POSITION;
      if (posIdx === undefined) continue;
      const acc = jsonChunk.accessors[posIdx];
      if (acc.min && acc.max) {
        if (acc.min[0] < globalMinX) globalMinX = acc.min[0];
        if (acc.max[0] > globalMaxX) globalMaxX = acc.max[0];
        if (acc.min[1] < globalMinY) globalMinY = acc.min[1];
        if (acc.max[1] > globalMaxY) globalMaxY = acc.max[1];
        if (acc.min[2] < globalMinZ) globalMinZ = acc.min[2];
        if (acc.max[2] > globalMaxZ) globalMaxZ = acc.max[2];
      }
    }
  }
  
  const sizeX = globalMaxX - globalMinX;
  const sizeY = globalMaxY - globalMinY;
  const sizeZ = globalMaxZ - globalMinZ;
  const centerX = (globalMaxX + globalMinX) / 2;
  const centerY = (globalMaxY + globalMinY) / 2;
  const centerZ = (globalMaxZ + globalMinZ) / 2;
  const maxDim = Math.max(sizeX, sizeY, sizeZ);
  const radius = Math.sqrt(sizeX*sizeX + sizeY*sizeY + sizeZ*sizeZ) / 2;
  
  console.log(`Global bounds: X=[${globalMinX.toFixed(4)}, ${globalMaxX.toFixed(4)}] Y=[${globalMinY.toFixed(4)}, ${globalMaxY.toFixed(4)}] Z=[${globalMinZ.toFixed(4)}, ${globalMaxZ.toFixed(4)}]`);
  console.log(`Global size: X=${sizeX.toFixed(4)}, Y=${sizeY.toFixed(4)}, Z=${sizeZ.toFixed(4)}`);
  console.log(`Global center: (${centerX.toFixed(4)}, ${centerY.toFixed(4)}, ${centerZ.toFixed(4)})`);
  console.log(`maxDimension: ${maxDim.toFixed(4)}`);
  console.log(`bounding sphere radius: ${radius.toFixed(4)}`);
  
  const fov45 = 45 * Math.PI / 180;
  const idealDist = Math.abs(maxDim / 2 / Math.tan(fov45 / 2));
  console.log(`\nFor FOV=45deg:`);
  console.log(`  idealCameraDistance (no padding): ${idealDist.toFixed(4)}`);
  console.log(`  idealCameraDistance (1.3x): ${(idealDist*1.3).toFixed(4)}`);
  console.log(`  idealCameraDistance (1.5x): ${(idealDist*1.5).toFixed(4)}`);
  
  console.log(`\nCurrent camera defaults: position=[18,14,22], maxDistance=80`);
  const camDist = Math.sqrt(18*18 + 14*14 + 22*22);
  console.log(`  Current camera distance to origin: ${camDist.toFixed(4)}`);
  const camDistToCenter = Math.sqrt((18-centerX)**2 + (14-centerY)**2 + (22-centerZ)**2);
  console.log(`  Current camera distance to model center: ${camDistToCenter.toFixed(4)}`);
  
  if (idealDist > 80) {
    console.log(`\n*** CRITICAL: idealDist (${idealDist.toFixed(1)}) > maxDistance (80)! Camera CANNOT zoom out enough! ***`);
  }
  if (idealDist > camDist) {
    console.log(`\n*** CRITICAL: idealDist (${idealDist.toFixed(1)}) > current camera distance (${camDist.toFixed(1)})! Camera is too close! ***`);
  }
  if (Math.abs(centerX) > 10 || Math.abs(centerY) > 10 || Math.abs(centerZ) > 10) {
    console.log(`\n*** NOTE: Model center is significantly offset from origin! ***`);
  }
}
