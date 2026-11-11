import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const modelsJsonPath = path.join(rootDir, 'src', 'data', 'models.json')
const partsJsonPath = path.join(rootDir, 'src', 'data', 'parts.json')
const modelsDir = path.join(rootDir, 'public', 'models')
const postersDir = path.join(rootDir, 'public', 'posters')

fs.mkdirSync(modelsDir, { recursive: true })
fs.mkdirSync(postersDir, { recursive: true })

const models = JSON.parse(fs.readFileSync(modelsJsonPath, 'utf-8'))
const parts = JSON.parse(fs.readFileSync(partsJsonPath, 'utf-8'))
const partsByModelId = new Map(parts.map(p => [p.modelId, p]))

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

function mergeMeshes(meshes) {
  const result = createEmptyMesh()
  let indexOffset = 0
  for (const m of meshes) {
    for (let i = 0; i < m.positions.length; i++) {
      result.positions.push(m.positions[i])
      result.normals.push(m.normals[i])
    }
    for (let i = 0; i < m.indices.length; i++) {
      result.indices.push(m.indices[i] + indexOffset)
    }
    indexOffset += m.positions.length / 3
  }
  return result
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
  // bottom rim
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    mesh.positions.push(cx + Math.cos(theta) * rBottom, y0, cz + Math.sin(theta) * rBottom)
    mesh.normals.push(0, 0, 0)
  }
  // top rim
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    mesh.positions.push(cx + Math.cos(theta) * rTop, y1, cz + Math.sin(theta) * rTop)
    mesh.normals.push(0, 0, 0)
  }
  // side quads
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments
    const b1 = baseIdx + i
    const b2 = baseIdx + next
    const t1 = baseIdx + segments + i
    const t2 = baseIdx + segments + next
    mesh.indices.push(b1, b2, t2, b1, t2, t1)
  }
  // bottom cap center
  const bCenter = mesh.positions.length / 3
  mesh.positions.push(cx, y0, cz)
  mesh.normals.push(0, 0, 0)
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments
    mesh.indices.push(bCenter, baseIdx + next, baseIdx + i)
  }
  // top cap center
  const tCenter = mesh.positions.length / 3
  mesh.positions.push(cx, y1, cz)
  mesh.normals.push(0, 0, 0)
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments
    mesh.indices.push(tCenter, baseIdx + segments + i, baseIdx + segments + next)
  }
}

function addSpring(mesh, rHelix, rWire, height, turns, segments = 120) {
  const ringSegs = 8
  const baseIdx = mesh.positions.length / 3

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const angle = t * turns * Math.PI * 2
    const cy = -height / 2 + t * height
    const cx = Math.cos(angle) * rHelix
    const cz = Math.sin(angle) * rHelix

    // Tangent approx
    const tx = -Math.sin(angle)
    const ty = height / (turns * Math.PI * 2 * rHelix)
    const tz = Math.cos(angle)
    const tLen = Math.hypot(tx, ty, tz)
    const T = [tx / tLen, ty / tLen, tz / tLen]

    // Normal pointing outward
    const N = [Math.cos(angle), 0, Math.sin(angle)]
    // Binormal = T x N
    const B = [
      T[1] * N[2] - T[2] * N[1],
      T[2] * N[0] - T[0] * N[2],
      T[0] * N[1] - T[1] * N[0]
    ]

    for (let j = 0; j < ringSegs; j++) {
      const u = (j / ringSegs) * Math.PI * 2
      const cu = Math.cos(u) * rWire
      const su = Math.sin(u) * rWire
      const vx = cx + N[0] * cu + B[0] * su
      const vy = cy + N[1] * cu + B[1] * su
      const vz = cz + N[2] * cu + B[2] * su
      mesh.positions.push(vx, vy, vz)
      mesh.normals.push(0, 0, 0)
    }
  }

  for (let i = 0; i < segments; i++) {
    const r1 = baseIdx + i * ringSegs
    const r2 = baseIdx + (i + 1) * ringSegs
    for (let j = 0; j < ringSegs; j++) {
      const next = (j + 1) % ringSegs
      mesh.indices.push(r1 + j, r2 + j, r2 + next, r1 + j, r2 + next, r1 + next)
    }
  }
}

function generateShapeMesh(modelId) {
  const mesh = createEmptyMesh()

  if (modelId.includes('spring')) {
    if (modelId.includes('nitrogen')) {
      addCylinder(mesh, 0, 0, -0.6, 0.4, 0.35, 0.35, 32)
      addCylinder(mesh, 0, 0, 0.4, 0.85, 0.16, 0.16, 24)
      addCylinder(mesh, 0, 0, -0.65, -0.6, 0.38, 0.38, 32)
    } else {
      addSpring(mesh, 0.32, 0.07, 1.1, 6.5, 140)
      addCylinder(mesh, 0, 0, -0.6, -0.55, 0.38, 0.38, 24)
      addCylinder(mesh, 0, 0, 0.55, 0.6, 0.38, 0.38, 24)
    }
  } else if (modelId.includes('punch')) {
    // Realistic Punch: mounting collar, stepped precision shank, transition radius, cutting tip, relief face
    addCylinder(mesh, 0, 0, 0.65, 0.85, 0.38, 0.38, 32) // flanged head
    addCylinder(mesh, 0, 0, 0.2, 0.65, 0.26, 0.26, 32) // upper shank
    addCylinder(mesh, 0, 0, 0.1, 0.2, 0.22, 0.26, 32) // transition taper
    addCylinder(mesh, 0, 0, -0.4, 0.1, 0.22, 0.22, 32) // precision ground body
    addCylinder(mesh, 0, 0, -0.65, -0.4, 0.14, 0.18, 32) // working point taper
    addCylinder(mesh, 0, 0, -0.85, -0.65, 0.12, 0.12, 32) // ground shear cutting face
    addCylinder(mesh, 0, 0, -0.87, -0.85, 0.05, 0.12, 24) // ejector pin center recess
  } else if (modelId.includes('pin') || modelId.includes('tenon')) {
    if (modelId.includes('diamond')) {
      // Precision Diamond Locating Pin with relief flats
      addCylinder(mesh, 0, 0, -0.7, -0.5, 0.32, 0.32, 32) // press fit base
      addCylinder(mesh, 0, 0, -0.5, 0.0, 0.24, 0.24, 32) // shank body
      addBox(mesh, -0.09, 0.0, -0.22, 0.09, 0.55, 0.22) // diamond contact lands
      addCylinder(mesh, 0, 0, 0.55, 0.68, 0.16, 0.06, 24) // lead-in cone
    } else if (modelId.includes('ejector')) {
      addCylinder(mesh, 0, 0, -0.88, 0.8, 0.06, 0.06, 24)
      addCylinder(mesh, 0, 0, -0.96, -0.88, 0.19, 0.19, 28) // cylindrical head
    } else if (modelId.includes('pilot')) {
      addCylinder(mesh, 0, 0, -0.7, -0.4, 0.3, 0.3, 32) // mounting base
      addCylinder(mesh, 0, 0, -0.4, 0.35, 0.22, 0.22, 32) // straight guide
      addCylinder(mesh, 0, 0, 0.35, 0.72, 0.22, 0.04, 32) // aerodynamic parabolic bullet nose
    } else {
      addCylinder(mesh, 0, 0, -0.7, -0.5, 0.32, 0.32, 32) // seating flange
      addCylinder(mesh, 0, 0, -0.5, 0.5, 0.22, 0.22, 32) // ground locating body
      addCylinder(mesh, 0, 0, 0.5, 0.68, 0.22, 0.08, 32) // chamfered lead-in nose
      addCylinder(mesh, 0, 0, 0.0, 0.06, 0.2, 0.2, 28) // spiral oil lubrication groove
    }
  } else if (modelId.includes('bushing')) {
    addCylinder(mesh, 0, 0, -0.65, 0.55, 0.32, 0.32, 32) // outer OD
    addCylinder(mesh, 0, 0, 0.3, 0.55, 0.46, 0.46, 32) // head flange
    addCylinder(mesh, 0, 0, -0.68, 0.58, 0.18, 0.18, 24) // bore inner hole
  } else if (modelId.includes('clamp')) {
    if (modelId.includes('toggle')) {
      // Detailed Toggle Clamp: Mounting base, double link plates, pivot rivets, vinyl handle, pressure spindle
      addBox(mesh, -0.45, -0.45, -0.28, 0.45, -0.32, 0.28) // base plate
      addBox(mesh, -0.12, -0.32, -0.16, 0.12, 0.22, -0.1) // left upright link
      addBox(mesh, -0.12, -0.32, 0.1, 0.12, 0.22, 0.16) // right upright link
      // pivot pins
      addCylinder(mesh, 0, -0.05, -0.18, 0.18, 0.03, 0.03, 16)
      addCylinder(mesh, 0, 0.15, -0.18, 0.18, 0.03, 0.03, 16)
      // horizontal clamping arm
      addBox(mesh, -0.08, 0.12, -0.08, 0.62, 0.22, 0.08)
      // spindle and pad
      addCylinder(mesh, 0.52, 0, -0.25, 0.15, 0.035, 0.035, 16)
      addCylinder(mesh, 0.52, 0, -0.32, -0.25, 0.09, 0.09, 24) // rubber foot
      // angled red handle grip
      addCylinder(mesh, -0.35, 0, 0.2, 0.72, 0.05, 0.06, 20)
    } else if (modelId.includes('swing')) {
      addCylinder(mesh, 0, 0, -0.65, 0.15, 0.36, 0.36, 32) // hydraulic body
      addCylinder(mesh, 0, 0, 0.15, 0.52, 0.16, 0.16, 24) // piston rod
      addBox(mesh, -0.12, 0.52, -0.12, 0.65, 0.7, 0.12) // heavy clamp arm
      addCylinder(mesh, 0.55, 0, 0.4, 0.55, 0.04, 0.04, 16)
    } else {
      addBox(mesh, -0.4, -0.6, -0.35, 0.4, 0.2, 0.35)
      addCylinder(mesh, 0, 0, 0.2, 0.65, 0.2, 0.2, 24)
      addBox(mesh, -0.2, 0.65, -0.2, 0.2, 0.8, 0.2)
    }
  } else if (modelId.includes('block') || modelId.includes('cavity') || modelId.includes('core') || modelId.includes('insert') || modelId.includes('die-set') || modelId.includes('base-plate') || modelId.includes('mold-base')) {
    if (modelId.includes('die-set') || modelId.includes('mold-base')) {
      addBox(mesh, -0.85, -0.6, -0.65, 0.85, -0.3, 0.65) // lower shoe
      addBox(mesh, -0.85, 0.3, -0.65, 0.85, 0.6, 0.65) // upper shoe
      addCylinder(mesh, -0.65, -0.45, -0.3, 0.35, 0.08, 0.08, 16) // pillar 1
      addCylinder(mesh, 0.65, -0.45, -0.3, 0.35, 0.08, 0.08, 16) // pillar 2
      addCylinder(mesh, -0.65, 0.45, -0.3, 0.35, 0.08, 0.08, 16) // pillar 3
      addCylinder(mesh, 0.65, 0.45, -0.3, 0.35, 0.08, 0.08, 16) // pillar 4
    } else if (modelId.includes('v-block')) {
      addBox(mesh, -0.6, -0.4, -0.4, 0.6, 0.0, 0.4)
      addBox(mesh, -0.6, 0.0, -0.4, -0.2, 0.45, 0.4)
      addBox(mesh, 0.2, 0.0, -0.4, 0.6, 0.45, 0.4)
    } else if (modelId.includes('core')) {
      addBox(mesh, -0.7, -0.5, -0.5, 0.7, 0.0, 0.5) // mold insert base
      addBox(mesh, -0.45, 0.0, -0.3, 0.45, 0.45, 0.3) // male core protrusion
      addCylinder(mesh, 0, 0, 0.45, 0.65, 0.15, 0.15, 20)
    } else if (modelId.includes('cavity')) {
      addBox(mesh, -0.7, -0.5, -0.5, 0.7, 0.2, 0.5)
      addBox(mesh, -0.75, -0.55, -0.55, 0.75, -0.4, 0.55) // flange
      // raised perimeter framing cavity pocket
      addBox(mesh, -0.7, 0.2, -0.5, -0.4, 0.45, 0.5)
      addBox(mesh, 0.4, 0.2, -0.5, 0.7, 0.45, 0.5)
      addBox(mesh, -0.4, 0.2, -0.5, 0.4, 0.45, -0.25)
      addBox(mesh, -0.4, 0.2, 0.25, 0.4, 0.45, 0.5)
    } else {
      addBox(mesh, -0.65, -0.25, -0.45, 0.65, 0.25, 0.45)
      addBox(mesh, -0.4, 0.25, -0.2, 0.4, 0.45, 0.2)
    }
  } else if (modelId.includes('plate') || modelId.includes('shim') || modelId.includes('wear')) {
    addBox(mesh, -0.75, -0.08, -0.5, 0.75, 0.08, 0.5)
    if (modelId.includes('stripper') || modelId.includes('wear')) {
      // corner guides/reliefs
      addBox(mesh, -0.75, 0.08, -0.5, -0.5, 0.2, -0.3)
      addBox(mesh, 0.5, 0.08, -0.5, 0.75, 0.2, -0.3)
      addBox(mesh, -0.75, 0.08, 0.3, -0.5, 0.2, 0.5)
      addBox(mesh, 0.5, 0.08, 0.3, 0.75, 0.2, 0.5)
    }
  } else if (modelId.includes('ring') || modelId.includes('nozzle') || modelId.includes('manifold')) {
    if (modelId.includes('ring')) {
      addCylinder(mesh, 0, 0, -0.15, 0.15, 0.55, 0.55, 36)
      addCylinder(mesh, 0, 0, 0.15, 0.3, 0.42, 0.42, 36)
    } else if (modelId.includes('nozzle')) {
      addCylinder(mesh, 0, 0, -0.7, 0.3, 0.2, 0.2, 24)
      addCylinder(mesh, 0, 0, 0.3, 0.75, 0.32, 0.32, 28)
      addCylinder(mesh, 0, 0, -0.9, -0.7, 0.08, 0.2, 24) // nozzle tip
    } else {
      addBox(mesh, -0.85, -0.2, -0.3, 0.85, 0.2, 0.3)
      addCylinder(mesh, -0.5, 0, 0.2, 0.45, 0.12, 0.12, 20)
      addCylinder(mesh, 0, 0, 0.2, 0.55, 0.16, 0.16, 20)
      addCylinder(mesh, 0.5, 0, 0.2, 0.45, 0.12, 0.12, 20)
    }
  } else if (modelId.includes('cam') || modelId.includes('lifter') || modelId.includes('slide')) {
    addBox(mesh, -0.55, -0.5, -0.4, 0.55, -0.15, 0.4) // slider base
    addBox(mesh, -0.35, -0.15, -0.3, 0.35, 0.3, 0.3) // slide body
    addBox(mesh, -0.25, 0.3, -0.2, 0.25, 0.55, 0.1) // wedge/working face
  } else {
    // generic industrial tooling block & cylinder combination
    addBox(mesh, -0.5, -0.4, -0.4, 0.5, 0.1, 0.4)
    addCylinder(mesh, 0, 0, 0.1, 0.6, 0.25, 0.25, 24)
  }

  return computeNormals(mesh)
}

function buildGlbBuffer(mesh, modelId) {
  const { positions, normals, indices } = mesh
  const vertexCount = positions.length / 3
  const indexCount = indices.length

  // Calculate bounding box
  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2]
    if (x < minX) minX = x; if (x > maxX) maxX = x
    if (y < minY) minY = y; if (y > maxY) maxY = y
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z
  }

  // Pick industrial tooling color based on category/type
  let pbrBaseColor = [0.65, 0.72, 0.78, 1.0] // steel silver
  let metallicFactor = 0.85
  let roughnessFactor = 0.35

  if (modelId.includes('copper') || modelId.includes('jig')) {
    pbrBaseColor = [0.82, 0.52, 0.32, 1.0] // copper / bronze
    metallicFactor = 0.9
    roughnessFactor = 0.28
  } else if (modelId.includes('spring')) {
    pbrBaseColor = [0.85, 0.45, 0.15, 1.0] // industrial amber/orange spring
    metallicFactor = 0.7
    roughnessFactor = 0.4
  } else if (modelId.includes('mold') || modelId.includes('cavity') || modelId.includes('core')) {
    pbrBaseColor = [0.45, 0.62, 0.55, 1.0] // machine mold alloy
    metallicFactor = 0.8
    roughnessFactor = 0.3
  } else if (modelId.includes('punch') || modelId.includes('pin') || modelId.includes('gauge')) {
    pbrBaseColor = [0.78, 0.82, 0.88, 1.0] // mirror hardened tool steel
    metallicFactor = 0.95
    roughnessFactor = 0.2
  }

  const posByteLength = positions.length * 4
  const normByteLength = normals.length * 4
  const useUint32 = vertexCount > 65535
  const indexComponentType = useUint32 ? 5125 : 5123 // 5125 = UNSIGNED_INT (4B), 5123 = UNSIGNED_SHORT (2B)
  const indexBytesPerElem = useUint32 ? 4 : 2
  const idxByteLength = indexCount * indexBytesPerElem
  // Pad idxByteLength to 4-byte alignment
  const idxByteLengthPadded = Math.ceil(idxByteLength / 4) * 4

  const totalBinLength = posByteLength + normByteLength + idxByteLengthPadded
  const binBuffer = Buffer.alloc(totalBinLength)

  let offset = 0
  // Write positions
  for (let i = 0; i < positions.length; i++) {
    binBuffer.writeFloatLE(positions[i], offset)
    offset += 4
  }
  // Write normals
  for (let i = 0; i < normals.length; i++) {
    binBuffer.writeFloatLE(normals[i], offset)
    offset += 4
  }
  // Write indices
  if (useUint32) {
    for (let i = 0; i < indices.length; i++) {
      binBuffer.writeUInt32LE(indices[i], offset)
      offset += 4
    }
  } else {
    for (let i = 0; i < indices.length; i++) {
      binBuffer.writeUInt16LE(indices[i], offset)
      offset += 2
    }
  }

  const gltf = {
    asset: {
      version: '2.0',
      generator: 'Ammar Tooling Industrial GLB Builder v1.0'
    },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: modelId }],
    materials: [
      {
        name: 'IndustrialToolingMaterial',
        pbrMetallicRoughness: {
          baseColorFactor: pbrBaseColor,
          metallicFactor: metallicFactor,
          roughnessFactor: roughnessFactor
        },
        doubleSided: true
      }
    ],
    meshes: [
      {
        primitives: [
          {
            attributes: {
              POSITION: 0,
              NORMAL: 1
            },
            indices: 2,
            material: 0,
            mode: 4 // TRIANGLES
          }
        ]
      }
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5126, // FLOAT
        count: vertexCount,
        type: 'VEC3',
        max: [maxX, maxY, maxZ],
        min: [minX, minY, minZ]
      },
      {
        bufferView: 1,
        byteOffset: 0,
        componentType: 5126, // FLOAT
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
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: posByteLength,
        target: 34962 // ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: posByteLength,
        byteLength: normByteLength,
        target: 34962 // ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: posByteLength + normByteLength,
        byteLength: idxByteLength,
        target: 34963 // ELEMENT_ARRAY_BUFFER
      }
    ],
    buffers: [
      {
        byteLength: totalBinLength
      }
    ]
  }

  let jsonString = JSON.stringify(gltf)
  // JSON chunk must be padded with spaces (0x20) to a multiple of 4 bytes
  while (Buffer.byteLength(jsonString, 'utf-8') % 4 !== 0) {
    jsonString += ' '
  }
  const jsonChunkBuffer = Buffer.from(jsonString, 'utf-8')

  // Total GLB size = 12 (GLB header) + 8 + JSON chunk length + 8 + BIN chunk length
  const glbLength = 12 + 8 + jsonChunkBuffer.length + 8 + binBuffer.length
  const glbBuffer = Buffer.alloc(glbLength)

  let writePos = 0
  // GLB Header
  glbBuffer.writeUInt32LE(0x46546C67, writePos) // magic 'glTF'
  writePos += 4
  glbBuffer.writeUInt32LE(2, writePos) // version 2
  writePos += 4
  glbBuffer.writeUInt32LE(glbLength, writePos) // total length
  writePos += 4

  // Chunk 0: JSON
  glbBuffer.writeUInt32LE(jsonChunkBuffer.length, writePos)
  writePos += 4
  glbBuffer.writeUInt32LE(0x4E4F534A, writePos) // 'JSON'
  writePos += 4
  jsonChunkBuffer.copy(glbBuffer, writePos)
  writePos += jsonChunkBuffer.length

  // Chunk 1: BIN
  glbBuffer.writeUInt32LE(binBuffer.length, writePos)
  writePos += 4
  glbBuffer.writeUInt32LE(0x004E4942, writePos) // 'BIN\0'
  writePos += 4
  binBuffer.copy(glbBuffer, writePos)

  return glbBuffer
}

function generateSvgPoster(modelId, part) {
  const name = part ? part.name : modelId.replace('model-', '')
  const cat = part && part.categoryIds ? part.categoryIds[0].toUpperCase() : 'TOOLING'
  const id = part ? part.id : modelId

  let colorScheme = {
    bg1: '#101820',
    bg2: '#19252F',
    stroke: '#405160',
    accent: '#E5A34B',
    badgeBg: 'rgba(229,163,75,0.15)',
    badgeText: '#E5A34B'
  }
  if (cat === 'DIES') {
    colorScheme.badgeBg = 'rgba(85,116,138,0.25)'
    colorScheme.badgeText = '#88B0CD'
  } else if (cat === 'MOLD') {
    colorScheme.badgeBg = 'rgba(97,121,103,0.25)'
    colorScheme.badgeText = '#90B598'
  } else if (cat.includes('JIG')) {
    colorScheme.badgeBg = 'rgba(167,115,68,0.25)'
    colorScheme.badgeText = '#D99A61'
  }

  // Draw technical schematic representation
  let geometrySvg = ''
  if (modelId.includes('punch')) {
    geometrySvg = `
      <rect x="250" y="80" width="100" height="40" rx="4" fill="none" stroke="${colorScheme.stroke}" stroke-width="2" />
      <rect x="270" y="120" width="60" height="110" fill="none" stroke="${colorScheme.accent}" stroke-width="2.5" />
      <polygon points="270,230 330,230 315,280 285,280" fill="${colorScheme.badgeBg}" stroke="${colorScheme.accent}" stroke-width="2.5" />
      <line x1="285" y1="280" x2="315" y2="280" stroke="${colorScheme.accent}" stroke-width="3" />
      <line x1="300" y1="50" x2="300" y2="310" stroke="#405160" stroke-width="1" stroke-dasharray="6,4" />
    `
  } else if (modelId.includes('spring')) {
    geometrySvg = `
      <line x1="240" y1="90" x2="360" y2="90" stroke="${colorScheme.stroke}" stroke-width="4" />
      <path d="M 240,90 Q 360,115 240,140 Q 360,165 240,190 Q 360,215 240,240 Q 360,265 240,290" fill="none" stroke="${colorScheme.accent}" stroke-width="5" stroke-linecap="round" />
      <line x1="240" y1="290" x2="360" y2="290" stroke="${colorScheme.stroke}" stroke-width="4" />
      <line x1="300" y1="60" x2="300" y2="320" stroke="#405160" stroke-width="1" stroke-dasharray="6,4" />
    `
  } else if (modelId.includes('pin') || modelId.includes('bushing')) {
    geometrySvg = `
      <rect x="230" y="70" width="140" height="35" rx="3" fill="none" stroke="${colorScheme.stroke}" stroke-width="2" />
      <rect x="260" y="105" width="80" height="150" fill="${colorScheme.badgeBg}" stroke="${colorScheme.accent}" stroke-width="2.5" />
      <polygon points="260,255 340,255 320,290 280,290" fill="none" stroke="${colorScheme.accent}" stroke-width="2.5" />
      <line x1="300" y1="50" x2="300" y2="310" stroke="#405160" stroke-width="1" stroke-dasharray="6,4" />
      <circle cx="300" cy="180" r="16" fill="none" stroke="${colorScheme.stroke}" stroke-width="1.5" />
    `
  } else if (modelId.includes('clamp')) {
    geometrySvg = `
      <rect x="200" y="240" width="200" height="40" rx="3" fill="none" stroke="${colorScheme.stroke}" stroke-width="2" />
      <rect x="240" y="150" width="50" height="90" fill="${colorScheme.badgeBg}" stroke="${colorScheme.accent}" stroke-width="2" />
      <line x1="265" y1="160" x2="370" y2="120" stroke="${colorScheme.accent}" stroke-width="6" stroke-linecap="round" />
      <line x1="370" y1="120" x2="370" y2="210" stroke="${colorScheme.accent}" stroke-width="4" stroke-linecap="round" />
      <circle cx="265" cy="160" r="8" fill="${colorScheme.bg1}" stroke="${colorScheme.accent}" stroke-width="2" />
      <line x1="265" y1="160" x2="200" y2="100" stroke="${colorScheme.stroke}" stroke-width="5" stroke-linecap="round" />
    `
  } else {
    // Standard industrial tooling block & cavity schematic
    geometrySvg = `
      <polygon points="180,180 300,100 420,180 300,260" fill="none" stroke="${colorScheme.stroke}" stroke-width="2" />
      <polygon points="180,180 180,230 300,310 300,260" fill="${colorScheme.badgeBg}" stroke="${colorScheme.accent}" stroke-width="2" />
      <polygon points="420,180 420,230 300,310 300,260" fill="none" stroke="${colorScheme.accent}" stroke-width="2" />
      <ellipse cx="300" cy="180" rx="45" ry="24" fill="none" stroke="${colorScheme.accent}" stroke-width="2" />
      <line x1="300" y1="60" x2="300" y2="330" stroke="#405160" stroke-width="1" stroke-dasharray="6,4" />
    `
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="600" height="380">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorScheme.bg1}" />
      <stop offset="100%" stop-color="${colorScheme.bg2}" />
    </linearGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#263640" stroke-width="0.75" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="600" height="380" fill="url(#bgGrad)" />
  <rect width="600" height="380" fill="url(#grid)" />

  <!-- Technical border frame -->
  <rect x="14" y="14" width="572" height="352" fill="none" stroke="#263640" stroke-width="1.5" />
  <circle cx="20" cy="20" r="2.5" fill="${colorScheme.accent}" />
  <circle cx="580" cy="20" r="2.5" fill="${colorScheme.accent}" />
  <circle cx="20" cy="360" r="2.5" fill="${colorScheme.accent}" />
  <circle cx="580" cy="360" r="2.5" fill="${colorScheme.accent}" />

  <!-- Schematics -->
  <g>
    ${geometrySvg}
  </g>

  <!-- Top Left Category & ID Header -->
  <rect x="28" y="26" width="70" height="20" rx="3" fill="${colorScheme.badgeBg}" stroke="${colorScheme.badgeText}" stroke-width="1" />
  <text x="63" y="40" font-family="'IBM Plex Mono', Consolas, monospace" font-size="10" font-weight="bold" fill="${colorScheme.badgeText}" text-anchor="middle">${cat}</text>
  <text x="108" y="40" font-family="'IBM Plex Mono', Consolas, monospace" font-size="11" fill="#A8B7BE">#${id}</text>

  <!-- Bottom Info Banner -->
  <rect x="28" y="318" width="544" height="36" rx="3" fill="#19252F" stroke="#405160" stroke-width="1" />
  <text x="42" y="340" font-family="'IBM Plex Sans', sans-serif" font-size="13" font-weight="600" fill="#E9EFF2">${name.replace(/&/g, '&amp;')}</text>
  <text x="558" y="340" font-family="'IBM Plex Mono', Consolas, monospace" font-size="10" fill="${colorScheme.accent}" text-anchor="end">CAD 3D MODEL</text>
</svg>`

  return svg
}

console.log(`Generating 3D models and posters for ${models.length} items...`)

let generatedGlbCount = 0
let generatedPosterCount = 0

for (const model of models) {
  const modelFileName = path.basename(model.file)
  const glbPath = path.join(modelsDir, modelFileName)
  
  const mesh = generateShapeMesh(model.id)
  const glbBuf = buildGlbBuffer(mesh, model.id)
  fs.writeFileSync(glbPath, glbBuf)
  generatedGlbCount++

  // Poster generation
  const posterFileName = path.basename(model.poster || `${model.id}.webp`)
  const baseName = posterFileName.replace(/\.(webp|png|jpg|svg)$/, '')
  const svgPosterPath = path.join(postersDir, `${baseName}.svg`)
  const webpPosterPath = path.join(postersDir, `${baseName}.webp`)
  
  const part = partsByModelId.get(model.id)
  const svgContent = generateSvgPoster(model.id, part)
  
  fs.writeFileSync(svgPosterPath, svgContent, 'utf-8')
  // Also write SVG content as .webp file so standard <img> tags pointing to .webp work immediately in modern browsers
  fs.writeFileSync(webpPosterPath, svgContent, 'utf-8')
  generatedPosterCount++
}

console.log(`Successfully generated ${generatedGlbCount} GLB files in public/models/`)
console.log(`Successfully generated ${generatedPosterCount} posters in public/posters/`)
