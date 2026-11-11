import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const iconsDir = path.resolve(__dirname, '../public/icons')

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

function generateSvgIcon(size) {
  const pad = size * 0.12
  const center = size / 2
  const rOuter = size * 0.38
  const rInner = size * 0.22
  const rHole = size * 0.12

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#101820"/>
  <rect x="4" y="4" width="${size - 8}" height="${size - 8}" rx="${size * 0.16}" fill="none" stroke="#263640" stroke-width="4"/>
  
  <!-- Caliper / Gear Industrial Motif -->
  <g transform="translate(${center}, ${center})">
    <!-- Outer Gear teeth ring -->
    <circle r="${rOuter}" fill="none" stroke="#E5A34B" stroke-width="${size * 0.05}" stroke-dasharray="${size * 0.06} ${size * 0.04}"/>
    <circle r="${rInner}" fill="#19252F" stroke="#CAD2D7" stroke-width="${size * 0.02}"/>
    <!-- Center Tool Punch Cross -->
    <path d="M-${size * 0.04} -${rOuter + size * 0.04} L${size * 0.04} -${rOuter + size * 0.04} L${size * 0.04} ${rOuter + size * 0.04} L-${size * 0.04} ${rOuter + size * 0.04} Z" fill="#E5A34B"/>
    <path d="M-${rOuter + size * 0.04} -${size * 0.04} L${rOuter + size * 0.04} -${size * 0.04} L${rOuter + size * 0.04} ${size * 0.04} L-${rOuter + size * 0.04} ${size * 0.04} Z" fill="#E5A34B"/>
    <circle r="${rHole}" fill="#101820" stroke="#E5A34B" stroke-width="${size * 0.02}"/>
    <circle r="${rHole * 0.4}" fill="#E5A34B"/>
  </g>
  
  <!-- Industrial Accent Lines -->
  <line x1="${pad}" y1="${size - pad}" x2="${size - pad}" y2="${size - pad}" stroke="#E5A34B" stroke-width="4"/>
  <text x="${center}" y="${size - pad * 1.3}" font-family="monospace" font-size="${size * 0.08}" font-weight="bold" fill="#E9EFF2" text-anchor="middle" letter-spacing="2">TOOLING</text>
</svg>`
}

// Generate SVG icons
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.svg'), generateSvgIcon(192), 'utf-8')
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.svg'), generateSvgIcon(512), 'utf-8')
fs.writeFileSync(path.join(iconsDir, 'maskable-icon-512x512.svg'), generateSvgIcon(512), 'utf-8')

// Also create favicon.svg if needed
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#101820"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#E5A34B" stroke-width="4" stroke-dasharray="6 4"/>
  <circle cx="32" cy="32" r="14" fill="#19252F" stroke="#CAD2D7" stroke-width="2"/>
  <circle cx="32" cy="32" r="5" fill="#E5A34B"/>
</svg>`
fs.writeFileSync(path.resolve(__dirname, '../public/favicon.svg'), faviconSvg, 'utf-8')

console.log('Icons generated successfully.')
