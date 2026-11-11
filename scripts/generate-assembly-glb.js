import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const modelsDir = path.join(rootDir, 'public', 'models')
fs.mkdirSync(modelsDir, { recursive: true })

function createEmptyMesh() {
  return { positions: [], normals: [], indices: [] }
}

function computeNormals(mesh) {
  const { positions, indices } = mesh
  const normals = new Array(positions.length).fill(0)
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i] * 3
    const i1 = indices[i + 1] * 3
    const i2 = indices[i + 2] * 3

    const p0x = positions[i0], p0y = positions[i0 + 1], p0z = positions[i0 + 2]
    const p1x = positions[i1], p1y = positions[i1 + 1], p1z = positions[i1 + 2]
    const p2x = positions[i2], p2y = positions[i2 + 1], p2z = positions[i2 + 2]

    const ax = p1x - p0x, ay = p1y - p0y, az = p1z - p0z
    const bx = p2x - p0x, by = p2y - p0y, bz = p2z - p0z

    let nx = ay * bz - az * by
    let ny = az * bx - ax * bz
    let nz = ax * by - ay * bx
    const len = Math.hypot(nx, ny, nz) || 1
    nx /= len; ny /= len; nz /= len

    normals[i0] += nx; normals[i0 + 1] += ny; normals[i0 + 2] += nz
    normals[i1] += nx; normals[i1 + 1] += ny; normals[i1 + 2] += nz
    normals[i2] += nx; normals[i2 + 1] += ny; normals[i2 + 2] += nz
  }
  for (let i = 0; i < normals.length; i += 3) {
    const l = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1
    normals[i] /= l; normals[i + 1] /= l; normals[i + 2] /= l
  }
  mesh.normals = normals
  return mesh
}

function addBox(mesh, minX, minY, minZ, maxX, maxY, maxZ) {
  const p = [
    [minX, minY, minZ], [maxX, minY, minZ], [maxX, maxY, minZ], [minX, maxY, minZ],
    [minX, minY, maxZ], [maxX, minY, maxZ], [maxX, maxY, maxZ], [minX, maxY, maxZ]
  ]
  const faces = [
    [0, 1, 2, 3], // back
    [5, 4, 7, 6], // front
    [4, 0, 3, 7], // left
    [1, 5, 6, 2], // right
    [3, 2, 6, 7], // top
    [4, 5, 1, 0]  // bottom
  ]
  for (const f of faces) {
    const startIdx = mesh.positions.length / 3
    for (const vIdx of f) {
      mesh.positions.push(p[vIdx][0], p[vIdx][1], p[vIdx][2])
      mesh.normals.push(0, 0, 0)
    }
    mesh.indices.push(startIdx, startIdx + 1, startIdx + 2, startIdx, startIdx + 2, startIdx + 3)
  }
}

function addCylinder(mesh, cx, cz, y0, y1, rBottom, rTop, segments = 24) {
  const baseIdx = mesh.positions.length / 3
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    mesh.positions.push(cx + Math.cos(theta) * rBottom, y0, cz + Math.sin(theta) * rBottom)
    mesh.normals.push(0, 0, 0)
  }
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    mesh.positions.push(cx + Math.cos(theta) * rTop, y1, cz + Math.sin(theta) * rTop)
    mesh.normals.push(0, 0, 0)
  }
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments
    const b1 = baseIdx + i
    const b2 = baseIdx + next
    const t1 = baseIdx + segments + i
    const t2 = baseIdx + segments + next
    mesh.indices.push(b1, b2, t2, b1, t2, t1)
  }
  // caps
  const bCenter = mesh.positions.length / 3
  mesh.positions.push(cx, y0, cz)
  mesh.normals.push(0, 0, 0)
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments
    mesh.indices.push(bCenter, baseIdx + next, baseIdx + i)
  }
  const tCenter = mesh.positions.length / 3
  mesh.positions.push(cx, y1, cz)
  mesh.normals.push(0, 0, 0)
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments
    mesh.indices.push(tCenter, baseIdx + segments + i, baseIdx + segments + next)
  }
}

function buildGlbBuffer(mesh, colorFactor = [0.65, 0.72, 0.8, 1.0], roughness = 0.35, metallic = 0.85) {
  computeNormals(mesh)

  const vertexCount = mesh.positions.length / 3
  const indexCount = mesh.indices.length

  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
  for (let i = 0; i < mesh.positions.length; i += 3) {
    const x = mesh.positions[i]
    const y = mesh.positions[i + 1]
    const z = mesh.positions[i + 2]
    if (x < minX) minX = x; if (x > maxX) maxX = x
    if (y < minY) minY = y; if (y > maxY) maxY = y
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z
  }

  const posByteLength = mesh.positions.length * 4
  const normByteLength = mesh.normals.length * 4
  const use32BitIndex = vertexCount > 65535
  const indexComponentType = use32BitIndex ? 5125 : 5123
  const bytesPerIndex = use32BitIndex ? 4 : 2
  const idxByteLength = indexCount * bytesPerIndex
  const paddedIdxByteLength = Math.ceil(idxByteLength / 4) * 4

  const totalBinLength = posByteLength + normByteLength + paddedIdxByteLength
  const binBuffer = Buffer.alloc(totalBinLength)

  let offset = 0
  for (let i = 0; i < mesh.positions.length; i++) {
    binBuffer.writeFloatLE(mesh.positions[i], offset)
    offset += 4
  }
  for (let i = 0; i < mesh.normals.length; i++) {
    binBuffer.writeFloatLE(mesh.normals[i], offset)
    offset += 4
  }
  if (use32BitIndex) {
    for (let i = 0; i < mesh.indices.length; i++) {
      binBuffer.writeUInt32LE(mesh.indices[i], offset)
      offset += 4
    }
  } else {
    for (let i = 0; i < mesh.indices.length; i++) {
      binBuffer.writeUInt16LE(mesh.indices[i], offset)
      offset += 2
    }
  }

  const gltf = {
    asset: { version: '2.0', generator: 'Ammar Realistic Tooling 3D Engine' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    materials: [
      {
        name: 'IndustrialMachinedSteel',
        pbrMetallicRoughness: {
          baseColorFactor: colorFactor,
          metallicFactor: metallic,
          roughnessFactor: roughness
        },
        doubleSided: true
      }
    ],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1 },
            indices: 2,
            material: 0,
            mode: 4
          }
        ]
      }
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5126,
        count: vertexCount,
        type: 'VEC3',
        max: [maxX, maxY, maxZ],
        min: [minX, minY, minZ]
      },
      {
        bufferView: 1,
        byteOffset: 0,
        componentType: 5126,
        count: vertexCount,
        type: 'VEC3'
      },
      {
        bufferView: 2,
        byteOffset: 0,
        componentType: indexComponentType,
        count: indexCount,
        type: 'SCALAR'
      }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posByteLength, target: 34962 },
      { buffer: 0, byteOffset: posByteLength, byteLength: normByteLength, target: 34962 },
      { buffer: 0, byteOffset: posByteLength + normByteLength, byteLength: idxByteLength, target: 34963 }
    ],
    buffers: [{ byteLength: totalBinLength }]
  }

  let jsonString = JSON.stringify(gltf)
  while (Buffer.byteLength(jsonString, 'utf-8') % 4 !== 0) {
    jsonString += ' '
  }
  const jsonChunkBuffer = Buffer.from(jsonString, 'utf-8')

  const glbLength = 12 + 8 + jsonChunkBuffer.length + 8 + binBuffer.length
  const glbBuffer = Buffer.alloc(glbLength)

  let writePos = 0
  glbBuffer.writeUInt32LE(0x46546C67, writePos); writePos += 4
  glbBuffer.writeUInt32LE(2, writePos); writePos += 4
  glbBuffer.writeUInt32LE(glbLength, writePos); writePos += 4

  glbBuffer.writeUInt32LE(jsonChunkBuffer.length, writePos); writePos += 4
  glbBuffer.writeUInt32LE(0x4E4F534A, writePos); writePos += 4
  jsonChunkBuffer.copy(glbBuffer, writePos)
  writePos += jsonChunkBuffer.length

  glbBuffer.writeUInt32LE(binBuffer.length, writePos); writePos += 4
  glbBuffer.writeUInt32LE(0x004E4942, writePos); writePos += 4
  binBuffer.copy(glbBuffer, writePos)

  return glbBuffer
}

// 1. DIES ASSEMBLY SET: Upper shoe, pillars, punch plate, cluster punches, stripper, die block, lower bolster
function createDiesAssembly() {
  const mesh = createEmptyMesh()

  // Upper bolster plate
  addBox(mesh, -0.9, 0.65, -0.65, 0.9, 0.8, 0.65)
  // Punch holder plate
  addBox(mesh, -0.7, 0.52, -0.45, 0.7, 0.65, 0.45)

  // 4 Corner Guide Pillars & Bushings
  const pillarOffset = [
    [-0.75, -0.5], [0.75, -0.5],
    [-0.75, 0.5], [0.75, 0.5]
  ]
  for (const [px, pz] of pillarOffset) {
    // Upper bushing sleeve
    addCylinder(mesh, px, pz, 0.5, 0.65, 0.12, 0.12, 24)
    // Precision ground chrome pillar
    addCylinder(mesh, px, pz, -0.6, 0.55, 0.08, 0.08, 24)
    // Lower mounting flange
    addCylinder(mesh, px, pz, -0.65, -0.55, 0.11, 0.11, 24)
  }

  // Nitrogen Gas Springs (2 units)
  addCylinder(mesh, -0.38, 0, 0.15, 0.48, 0.09, 0.09, 20)
  addCylinder(mesh, -0.38, 0, 0.48, 0.52, 0.04, 0.04, 16)
  addCylinder(mesh, 0.38, 0, 0.15, 0.48, 0.09, 0.09, 20)
  addCylinder(mesh, 0.38, 0, 0.48, 0.52, 0.04, 0.04, 16)

  // Punches (Multi-station cluster: blanking & piercing punches)
  addCylinder(mesh, -0.2, -0.15, 0.18, 0.52, 0.06, 0.06, 20)
  addCylinder(mesh, -0.2, -0.15, 0.08, 0.18, 0.03, 0.06, 20)

  addBox(mesh, -0.08, 0.15, -0.2, 0.08, 0.52, 0.2) // center rectangular punch
  addBox(mesh, -0.06, 0.05, -0.18, 0.06, 0.15, 0.18) // cutting edge

  addCylinder(mesh, 0.2, 0.15, 0.18, 0.52, 0.06, 0.06, 20)
  addCylinder(mesh, 0.2, 0.15, 0.08, 0.18, 0.03, 0.06, 20)

  // Stripper Plate (Spring loaded floating plate)
  addBox(mesh, -0.65, 0.05, -0.42, 0.65, 0.15, 0.42)

  // Die Block / Lower Cavity Insert
  addBox(mesh, -0.7, -0.35, -0.45, 0.7, -0.02, 0.45)

  // Lower Bolster Plate / Lower Shoe
  addBox(mesh, -0.9, -0.65, -0.65, 0.9, -0.35, 0.65)
  // Clamping T-slots
  addBox(mesh, -0.92, -0.55, -0.5, -0.85, -0.45, 0.5)
  addBox(mesh, 0.85, -0.55, -0.5, 0.92, -0.45, 0.5)

  return mesh
}

// 2. MOLD ASSEMBLY SET: Clamping plate, Hot runner, Cavity plate, Core plate, Ejector system, Cooling ports
function createMoldAssembly() {
  const mesh = createEmptyMesh()

  // Top Clamp Plate
  addBox(mesh, -0.8, 0.6, -0.6, 0.8, 0.72, 0.6)
  // Locating ring & Sprue bushing
  addCylinder(mesh, 0, 0, 0.72, 0.85, 0.25, 0.25, 32)
  addCylinder(mesh, 0, 0, 0.72, 0.88, 0.06, 0.06, 20)

  // Hot Runner Manifold Plate
  addBox(mesh, -0.75, 0.42, -0.55, 0.75, 0.6, 0.55)
  // 2 Hot runner nozzles
  addCylinder(mesh, -0.3, 0, 0.25, 0.42, 0.06, 0.08, 20)
  addCylinder(mesh, 0.3, 0, 0.25, 0.42, 0.06, 0.08, 20)

  // A-Plate (Cavity Plate)
  addBox(mesh, -0.75, 0.1, -0.55, 0.75, 0.42, 0.55)
  // Water cooling ports on side
  addCylinder(mesh, -0.78, -0.2, 0.25, 0.25, 0.03, 0.03, 16)
  addCylinder(mesh, -0.78, 0.2, 0.25, 0.25, 0.03, 0.03, 16)
  addCylinder(mesh, 0.78, -0.2, 0.25, 0.25, 0.03, 0.03, 16)
  addCylinder(mesh, 0.78, 0.2, 0.25, 0.25, 0.03, 0.03, 16)

  // B-Plate (Core Plate)
  addBox(mesh, -0.75, -0.25, -0.55, 0.75, 0.08, 0.55)
  // Slide core unit on X+ side
  addBox(mesh, 0.5, -0.15, -0.2, 0.85, 0.05, 0.2)

  // 4 Corner Mold Guide Pins
  const pinOffset = [
    [-0.62, -0.45], [0.62, -0.45],
    [-0.62, 0.45], [0.62, 0.45]
  ]
  for (const [px, pz] of pinOffset) {
    addCylinder(mesh, px, pz, -0.4, 0.5, 0.065, 0.065, 24)
  }

  // Spacer Blocks (U-shape housing for ejector plate)
  addBox(mesh, -0.75, -0.55, -0.55, -0.55, -0.25, 0.55)
  addBox(mesh, 0.55, -0.55, -0.55, 0.75, -0.25, 0.55)

  // Ejector Plate & Retainer Assembly
  addBox(mesh, -0.5, -0.48, -0.45, 0.5, -0.38, 0.45)
  // Ejector pins through B-plate
  addCylinder(mesh, -0.25, -0.15, -0.38, 0.08, 0.02, 0.02, 16)
  addCylinder(mesh, 0.25, -0.15, -0.38, 0.08, 0.02, 0.02, 16)
  addCylinder(mesh, -0.25, 0.15, -0.38, 0.08, 0.02, 0.02, 16)
  addCylinder(mesh, 0.25, 0.15, -0.38, 0.08, 0.02, 0.02, 16)

  // Bottom Clamping Plate
  addBox(mesh, -0.8, -0.68, -0.6, 0.8, -0.55, 0.6)

  return mesh
}

// 3. JIG & FIXTURE ASSEMBLY: Tooling ground base, locating pin matrix, V-block, toggle clamp, clamped workpiece
function createJigFixtureAssembly() {
  const mesh = createEmptyMesh()

  // Precision Tooling Sub-Plate / Base Plate
  addBox(mesh, -0.85, -0.4, -0.6, 0.85, -0.2, 0.6)

  // Dowel Bushings / Matrix Grid Holes (Raised relief bushings)
  const gridPositions = [
    [-0.5, -0.3], [0, -0.3], [0.5, -0.3],
    [-0.5, 0], [0, 0], [0.5, 0],
    [-0.5, 0.3], [0, 0.3], [0.5, 0.3]
  ]
  for (const [gx, gz] of gridPositions) {
    addCylinder(mesh, gx, gz, -0.2, -0.17, 0.05, 0.05, 16)
  }

  // Left Rest Pad & V-Block Riser
  addBox(mesh, -0.65, -0.2, -0.35, -0.35, 0.05, -0.05)
  // V-block prism notch
  addBox(mesh, -0.6, 0.05, -0.32, -0.4, 0.18, -0.08)

  // Precision Round Locating Pin (Flanged)
  addCylinder(mesh, -0.25, 0.1, -0.2, -0.08, 0.08, 0.08, 20)
  addCylinder(mesh, -0.25, 0.1, -0.08, 0.25, 0.045, 0.045, 20)
  addCylinder(mesh, -0.25, 0.1, 0.25, 0.3, 0.02, 0.045, 16)

  // Precision Diamond Locating Pin
  addCylinder(mesh, 0.1, 0.1, -0.2, -0.08, 0.08, 0.08, 20)
  addBox(mesh, 0.06, -0.08, 0.02, 0.14, 0.26, 0.18)

  // Industrial Toggle Clamp System (Right side)
  // Clamp base mounting block
  addBox(mesh, 0.35, -0.2, -0.15, 0.65, -0.05, 0.15)
  // Upright bracket ears
  addBox(mesh, 0.42, -0.05, -0.08, 0.48, 0.25, 0.08)
  addBox(mesh, 0.55, -0.05, -0.08, 0.61, 0.25, 0.08)
  // Pivot cross pin
  addCylinder(mesh, 0.5, 0, 0.18, 0.2, 0.025, 0.025, 16)

  // Clamping Arm extending over workpiece
  addBox(mesh, -0.05, 0.15, -0.04, 0.52, 0.22, 0.04)
  // Threaded pressure spindle & Neoprene rubber cushion pad
  addCylinder(mesh, 0, 0, 0.02, 0.2, 0.02, 0.02, 16)
  addCylinder(mesh, 0, 0, -0.03, 0.02, 0.055, 0.055, 20)

  // Clamp Vinyl Handle Lever (Angled backward)
  addCylinder(mesh, 0.68, 0, 0.22, 0.55, 0.03, 0.035, 16)
  addCylinder(mesh, 0.72, 0, 0.45, 0.68, 0.045, 0.045, 20)

  // Clamped Workpiece (Simulated automotive sheet metal bracket)
  addBox(mesh, -0.45, -0.05, -0.25, 0.25, -0.01, 0.25)
  addBox(mesh, -0.45, -0.01, -0.25, -0.41, 0.15, 0.25) // bent flange

  return mesh
}

console.log('Generating realistic 3D GLB Assemblies...')

// Dies: Polished Tool Steel
const diesMesh = createDiesAssembly()
const diesGlb = buildGlbBuffer(diesMesh, [0.65, 0.75, 0.85, 1.0], 0.28, 0.85)
fs.writeFileSync(path.join(modelsDir, 'assembly-dies.glb'), diesGlb)
console.log('-> Generated public/models/assembly-dies.glb')

// Mold: Precision Gunmetal Steel
const moldMesh = createMoldAssembly()
const moldGlb = buildGlbBuffer(moldMesh, [0.68, 0.78, 0.72, 1.0], 0.32, 0.82)
fs.writeFileSync(path.join(modelsDir, 'assembly-mold.glb'), moldGlb)
console.log('-> Generated public/models/assembly-mold.glb')

// Jig & Fixture: Burnished Tooling Copper / Steel
const jigMesh = createJigFixtureAssembly()
const jigGlb = buildGlbBuffer(jigMesh, [0.82, 0.72, 0.6, 1.0], 0.35, 0.8)
fs.writeFileSync(path.join(modelsDir, 'assembly-jig-fixture.glb'), jigGlb)
console.log('-> Generated public/models/assembly-jig-fixture.glb')
