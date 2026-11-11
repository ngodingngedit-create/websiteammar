import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const categoriesPath = path.join(rootDir, 'src/data/categories.json')
const branchesPath = path.join(rootDir, 'src/data/branches.json')
const partsPath = path.join(rootDir, 'src/data/parts.json')
const modelsPath = path.join(rootDir, 'src/data/models.json')

function loadJSON(p) {
  if (!fs.existsSync(p)) throw new Error(`File not found: ${p}`)
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

let errors = []

try {
  const categories = loadJSON(categoriesPath)
  const branches = loadJSON(branchesPath)
  const parts = loadJSON(partsPath)
  const models = loadJSON(modelsPath)

  console.log(`Checking data: ${categories.length} categories, ${branches.length} branches, ${parts.length} parts, ${models.length} models.`)

  const categoryIds = new Set(categories.map(c => c.id))
  const branchIds = new Set(branches.map(b => b.id))
  const partIds = new Set(parts.map(p => p.id))
  const modelIds = new Set(models.map(m => m.id))

  // 1. Check Categories
  categories.forEach(c => {
    if (!c.id || !c.name || !c.summary) {
      errors.push(`Category missing required fields: ${JSON.stringify(c)}`)
    }
  })

  // 2. Check Branches
  branches.forEach(b => {
    if (!b.id || !b.categoryId || !b.name || !b.summary) {
      errors.push(`Branch missing required fields: ${JSON.stringify(b)}`)
    }
    if (!categoryIds.has(b.categoryId)) {
      errors.push(`Branch ${b.id} references invalid categoryId "${b.categoryId}"`)
    }
  })

  // 3. Check Parts count per branch (min 3)
  const branchCount = {}
  branches.forEach(b => { branchCount[b.id] = 0 })

  // 4. Check Parts
  parts.forEach(p => {
    const required = ['id', 'name', 'categoryIds', 'branchIds', 'functions', 'summary', 'description', 'howItWorks', 'materials', 'specs', 'automotiveUse', 'commonIssues', 'related', 'modelId']
    required.forEach(f => {
      if (p[f] === undefined || p[f] === null) {
        errors.push(`Part ${p.id} missing field "${f}"`)
      }
    })

    if (!Array.isArray(p.categoryIds) || p.categoryIds.length === 0) {
      errors.push(`Part ${p.id} must have non-empty categoryIds`)
    } else {
      p.categoryIds.forEach(cid => {
        if (!categoryIds.has(cid)) errors.push(`Part ${p.id} references unknown categoryId "${cid}"`)
      })
    }

    if (!Array.isArray(p.branchIds) || p.branchIds.length === 0) {
      errors.push(`Part ${p.id} must have non-empty branchIds`)
    } else {
      p.branchIds.forEach(bid => {
        if (!branchIds.has(bid)) {
          errors.push(`Part ${p.id} references unknown branchId "${bid}"`)
        } else {
          branchCount[bid]++
        }
      })
    }

    if (!Array.isArray(p.related) || p.related.length < 2) {
      errors.push(`Part ${p.id} must have at least 2 related parts`)
    } else {
      p.related.forEach(rid => {
        if (!partIds.has(rid)) {
          errors.push(`Part ${p.id} references non-existent related part "${rid}"`)
        }
        if (rid === p.id) {
          errors.push(`Part ${p.id} references itself in related list`)
        }
      })
    }

    if (!modelIds.has(p.modelId)) {
      errors.push(`Part ${p.id} references missing modelId "${p.modelId}"`)
    }
  })

  // Check branch count requirement (min 3 parts per branch)
  for (const [bid, count] of Object.entries(branchCount)) {
    if (count < 3) {
      errors.push(`Branch ${bid} only has ${count} parts (minimum required: 3)`)
    }
  }

  // 5. Check Models
  models.forEach(m => {
    const req = ['id', 'file', 'source', 'sourceUrl', 'author', 'license', 'attributionText', 'isPlaceholder']
    req.forEach(f => {
      if (m[f] === undefined) errors.push(`Model ${m.id} missing field "${f}"`)
    })
  })

  if (parts.length < 45) {
    errors.push(`Total parts is ${parts.length}, minimum required is 45.`)
  }

} catch (err) {
  errors.push(`Execution error: ${err.message}`)
}

if (errors.length > 0) {
  console.error(`Validation FAILED with ${errors.length} error(s):`)
  errors.slice(0, 20).forEach(e => console.error(` - ${e}`))
  if (errors.length > 20) console.error(` ... and ${errors.length - 20} more.`)
  process.exit(1)
} else {
  console.log(`Validation SUCCESS! All categories, branches, parts, and models are valid.`)
  process.exit(0)
}
