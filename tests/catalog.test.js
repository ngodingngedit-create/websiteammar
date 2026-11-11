import { describe, it, expect } from 'vitest'
import { buildBidirectionalRelations } from '../src/utils/relations.js'
import { filterParts, normalize } from '../src/utils/catalog.js'

describe('relations utility', () => {
  it('makes relations two-way and removes duplicates', () => {
    const parts = [
      { id: 'punch', related: ['die-block-insert'] },
      { id: 'die-block-insert', related: [] },
      { id: 'spring', related: ['punch'] }
    ]

    const relMap = buildBidirectionalRelations(parts)
    expect(relMap.get('die-block-insert')).toContain('punch')
    expect(relMap.get('punch')).toContain('die-block-insert')
    expect(relMap.get('punch')).toContain('spring')
  })
})

describe('catalog filter utility', () => {
  const parts = [
    {
      id: 'punch',
      name: 'Punch Piercing',
      alias: ['Pons'],
      categoryIds: ['dies'],
      branchIds: ['dies-piercing'],
      functions: ['Pemotong'],
      materials: ['SKD11'],
      automotiveUse: ['Bracket'],
      summary: 'Punch potong pelat'
    },
    {
      id: 'core',
      name: 'Core Mold',
      alias: ['Inti cetakan'],
      categoryIds: ['mold'],
      branchIds: ['mold-two-plate'],
      functions: ['Pembentuk'],
      materials: ['NAK80'],
      automotiveUse: ['Bumper'],
      summary: 'Core pembentuk rongga dalam'
    }
  ]

  it('filters by category', () => {
    const diesOnly = filterParts(parts, { category: 'dies' })
    expect(diesOnly).toHaveLength(1)
    expect(diesOnly[0].id).toBe('punch')
  })

  it('searches text across alias and material', () => {
    const byAlias = filterParts(parts, { query: 'pons' })
    expect(byAlias).toHaveLength(1)
    expect(byAlias[0].id).toBe('punch')

    const byMaterial = filterParts(parts, { query: 'nak80' })
    expect(byMaterial).toHaveLength(1)
    expect(byMaterial[0].id).toBe('core')
  })
})
