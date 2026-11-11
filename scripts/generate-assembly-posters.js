import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const postersDir = path.join(rootDir, 'public', 'posters')
fs.mkdirSync(postersDir, { recursive: true })

const assemblies = [
  {
    id: 'assembly-dies',
    name: 'STAMPING DIE ASSEMBLY',
    sub: 'Upper Shoe • Punch Plate • Stripper • Die Cavity • Guide Pillars',
    tag: 'DIES SET',
    color1: '#55748A',
    color2: '#2B4252',
    accent: '#E5A34B',
    type: 'dies'
  },
  {
    id: 'assembly-mold',
    name: 'INJECTION MOLD ASSEMBLY',
    sub: 'Cavity Plate • Core Plate • Ejector System • Hot Runner • Cooling Lines',
    tag: 'MOLD SET',
    color1: '#617967',
    color2: '#2D3F32',
    accent: '#82C193',
    type: 'mold'
  },
  {
    id: 'assembly-jig-fixture',
    name: 'JIG & FIXTURE ASSEMBLY',
    sub: 'Ground Base • Locating Pins • Toggle Clamps • Drill Bushing Blocks',
    tag: 'FIXTURE SET',
    color1: '#A77344',
    color2: '#4A331E',
    accent: '#F3A96A',
    type: 'jig-fixture'
  }
]

function renderRealisticDiesSvg() {
  return `
    <!-- Top Bolster Plate / Upper Shoe -->
    <g filter="url(#dropShadow)">
      <path d="M 120,70 L 480,70 L 440,115 L 80,115 Z" fill="url(#steelTop)" stroke="#6A8090" stroke-width="1.5" />
      <path d="M 80,115 L 440,115 L 440,145 L 80,145 Z" fill="url(#steelFront)" stroke="#4A5C6A" stroke-width="1.5" />
      <path d="M 440,115 L 480,70 L 480,100 L 440,145 Z" fill="url(#steelSide)" stroke="#384955" stroke-width="1.5" />
    </g>

    <!-- Guide Pillars & Bushings (Left & Right) -->
    <!-- Left Pillar -->
    <g>
      <rect x="130" y="145" width="28" height="175" rx="3" fill="url(#chromeCylinder)" stroke="#8FA3B0" stroke-width="1.2" />
      <!-- Bushing sleeve -->
      <rect x="124" y="145" width="40" height="36" rx="2" fill="url(#brassBushing)" stroke="#D4AF37" stroke-width="1" />
      <!-- Pillar highlight line -->
      <line x1="138" y1="181" x2="138" y2="320" stroke="#FFFFFF" stroke-width="1.5" opacity="0.6" />
    </g>
    <!-- Right Pillar -->
    <g>
      <rect x="402" y="145" width="28" height="175" rx="3" fill="url(#chromeCylinder)" stroke="#8FA3B0" stroke-width="1.2" />
      <rect x="396" y="145" width="40" height="36" rx="2" fill="url(#brassBushing)" stroke="#D4AF37" stroke-width="1" />
      <line x1="410" y1="181" x2="410" y2="320" stroke="#FFFFFF" stroke-width="1.5" opacity="0.6" />
    </g>

    <!-- Punch Holder & Punches -->
    <g filter="url(#softShadow)">
      <polygon points="180,135 380,135 360,165 160,165" fill="url(#steelTop)" stroke="#5B6D7A" stroke-width="1" />
      <polygon points="160,165 360,165 360,185 160,185" fill="url(#steelFront)" stroke="#475662" stroke-width="1" />
      
      <!-- Central Stamping Punches (Carbide / Nitrided steel) -->
      <rect x="210" y="185" width="22" height="55" rx="1" fill="url(#carbidePunch)" stroke="#E5A34B" stroke-width="1.2" />
      <polygon points="210,240 232,240 226,252 216,252" fill="#D48B28" stroke="#E5A34B" stroke-width="1" />

      <rect x="268" y="185" width="30" height="60" rx="1" fill="url(#carbidePunch)" stroke="#E5A34B" stroke-width="1.5" />
      <polygon points="268,245 298,245 292,260 274,260" fill="#D48B28" stroke="#E5A34B" stroke-width="1" />

      <rect x="334" y="185" width="20" height="52" rx="1" fill="url(#carbidePunch)" stroke="#E5A34B" stroke-width="1.2" />
      <polygon points="334,237 354,237 348,248 340,248" fill="#D48B28" stroke="#E5A34B" stroke-width="1" />
    </g>

    <!-- Nitrogen Gas Springs (Heavy Duty Gold/Blue) -->
    <g>
      <!-- Left Gas Spring -->
      <rect x="175" y="210" width="24" height="60" rx="2" fill="url(#gasSpringCylinder)" stroke="#222" stroke-width="1" />
      <rect x="183" y="185" width="8" height="25" fill="url(#chromePiston)" stroke="#666" stroke-width="1" />
      <!-- Right Gas Spring -->
      <rect x="365" y="210" width="24" height="60" rx="2" fill="url(#gasSpringCylinder)" stroke="#222" stroke-width="1" />
      <rect x="373" y="185" width="8" height="25" fill="url(#chromePiston)" stroke="#666" stroke-width="1" />
    </g>

    <!-- Stripper Plate (Floating middle) -->
    <g filter="url(#softShadow)">
      <polygon points="170,248 390,248 370,268 150,268" fill="url(#steelTop)" stroke="#5B6D7A" stroke-width="1" />
      <polygon points="150,268 370,268 370,278 150,278" fill="url(#steelFront)" stroke="#475662" stroke-width="1" />
    </g>

    <!-- Die Block / Lower Cavity Insert -->
    <g filter="url(#softShadow)">
      <polygon points="170,290 390,290 370,320 150,320" fill="url(#steelTopDark)" stroke="#405160" stroke-width="1.2" />
      <polygon points="150,320 370,320 370,345 150,345" fill="url(#steelFrontDark)" stroke="#32404C" stroke-width="1.2" />
      <!-- Cutting aperture slots -->
      <ellipse cx="221" cy="303" rx="12" ry="5" fill="#0D1318" stroke="#E5A34B" stroke-width="1.2" />
      <ellipse cx="283" cy="303" rx="16" ry="6" fill="#0D1318" stroke="#E5A34B" stroke-width="1.4" />
      <ellipse cx="344" cy="303" rx="11" ry="5" fill="#0D1318" stroke="#E5A34B" stroke-width="1.2" />
    </g>

    <!-- Bottom Bolster / Lower Shoe -->
    <g filter="url(#dropShadow)">
      <polygon points="120,335 480,335 440,365 80,365" fill="url(#steelTop)" stroke="#6A8090" stroke-width="1.5" />
      <polygon points="80,365 440,365 440,395 80,395" fill="url(#steelFront)" stroke="#4A5C6A" stroke-width="1.5" />
      <polygon points="440,365 480,335 480,365 440,395" fill="url(#steelSide)" stroke="#384955" stroke-width="1.5" />
      <!-- Mounting T-slots / clamping ledges -->
      <rect x="90" y="375" width="40" height="12" fill="#0E161C" stroke="#2B3944" stroke-width="1" />
      <rect x="390" y="375" width="40" height="12" fill="#0E161C" stroke="#2B3944" stroke-width="1" />
    </g>
  `
}

function renderRealisticMoldSvg() {
  return `
    <!-- Top Clamp Plate / Locating Ring & Sprue -->
    <g filter="url(#dropShadow)">
      <polygon points="120,65 480,65 440,105 80,105" fill="url(#steelTop)" stroke="#6A8090" stroke-width="1.5" />
      <polygon points="80,105 440,105 440,130 80,130" fill="url(#steelFront)" stroke="#4A5C6A" stroke-width="1.5" />
      <polygon points="440,105 480,65 480,90 440,130" fill="url(#steelSide)" stroke="#384955" stroke-width="1.5" />
      
      <!-- Locating Ring & Sprue Bushing (Center Top) -->
      <ellipse cx="280" cy="85" rx="34" ry="16" fill="url(#chromeRing)" stroke="#D4AF37" stroke-width="2" />
      <ellipse cx="280" cy="85" rx="14" ry="6" fill="#111920" stroke="#82C193" stroke-width="1.5" />
      <circle cx="280" cy="85" r="4" fill="#000" />
    </g>

    <!-- Hot Runner Manifold Plate -->
    <g filter="url(#softShadow)">
      <polygon points="135,130 465,130 430,165 100,165" fill="url(#steelTopDark)" stroke="#4F6354" stroke-width="1.2" />
      <polygon points="100,165 430,165 430,195 100,195" fill="url(#steelFrontDark)" stroke="#39473D" stroke-width="1.2" />
      <!-- Heating element wiring ports / nozzles glow -->
      <circle cx="190" cy="180" r="5" fill="#82C193" opacity="0.8" />
      <circle cx="340" cy="180" r="5" fill="#82C193" opacity="0.8" />
      <line x1="195" y1="180" x2="335" y2="180" stroke="#82C193" stroke-width="1.5" stroke-dasharray="4,3" />
    </g>

    <!-- Cavity Plate (A-Plate) -->
    <g filter="url(#softShadow)">
      <polygon points="135,195 465,195 430,230 100,230" fill="url(#steelTop)" stroke="#556E5C" stroke-width="1.2" />
      <polygon points="100,230 430,230 430,265 100,265" fill="url(#steelFront)" stroke="#3C4E41" stroke-width="1.2" />
      <!-- Cooling water manifold ports (Anodized blue/red plugs) -->
      <circle cx="120" cy="248" r="7" fill="#2E69A3" stroke="#5299E0" stroke-width="1.5" />
      <circle cx="145" cy="248" r="7" fill="#B33A3A" stroke="#E66A6A" stroke-width="1.5" />
      <circle cx="385" cy="248" r="7" fill="#2E69A3" stroke="#5299E0" stroke-width="1.5" />
      <circle cx="410" cy="248" r="7" fill="#B33A3A" stroke="#E66A6A" stroke-width="1.5" />
    </g>

    <!-- Parting Line (Precision Gap / Golden mold parting) -->
    <line x1="90" y1="267" x2="440" y2="267" stroke="#82C193" stroke-width="2" stroke-linecap="round" opacity="0.9" />

    <!-- Core Plate (B-Plate) -->
    <g filter="url(#softShadow)">
      <polygon points="135,268 465,268 430,305 100,305" fill="url(#steelTopDark)" stroke="#4A5C50" stroke-width="1.2" />
      <polygon points="100,305 430,305 430,340 100,340" fill="url(#steelFrontDark)" stroke="#354239" stroke-width="1.2" />
      <!-- Slide core mechanism on right side -->
      <polygon points="415,280 455,270 455,325 415,335" fill="url(#brassBushing)" stroke="#82C193" stroke-width="1.5" />
    </g>

    <!-- Spacer Blocks & Ejector Housing (C-Plate) -->
    <g>
      <!-- Left spacer -->
      <rect x="100" y="340" width="45" height="45" fill="url(#steelFrontDark)" stroke="#303A32" stroke-width="1.2" />
      <!-- Right spacer -->
      <rect x="385" y="340" width="45" height="45" fill="url(#steelFrontDark)" stroke="#303A32" stroke-width="1.2" />
      <!-- Ejector Plate & Pins (In between) -->
      <rect x="160" y="355" width="210" height="16" rx="2" fill="url(#steelTop)" stroke="#6A8090" stroke-width="1" />
      <rect x="200" y="338" width="6" height="17" fill="url(#chromePiston)" stroke="#888" stroke-width="0.8" />
      <rect x="262" y="338" width="6" height="17" fill="url(#chromePiston)" stroke="#888" stroke-width="0.8" />
      <rect x="325" y="338" width="6" height="17" fill="url(#chromePiston)" stroke="#888" stroke-width="0.8" />
    </g>

    <!-- Bottom Clamping Plate -->
    <g filter="url(#dropShadow)">
      <polygon points="120,385 480,385 440,410 80,410" fill="url(#steelTop)" stroke="#6A8090" stroke-width="1.5" />
      <polygon points="80,410 440,410 440,430 80,430" fill="url(#steelFront)" stroke="#4A5C6A" stroke-width="1.5" />
      <polygon points="440,410 480,385 480,405 440,430" fill="url(#steelSide)" stroke="#384955" stroke-width="1.5" />
    </g>
  `
}

function renderRealisticJigFixtureSvg() {
  return `
    <!-- Heavy Duty Cast Iron Base Plate with Precision Grid -->
    <g filter="url(#dropShadow)">
      <polygon points="120,240 500,240 440,360 60,360" fill="url(#steelTopDark)" stroke="#6E5035" stroke-width="1.8" />
      <polygon points="60,360 440,360 440,400 60,400" fill="url(#steelFrontDark)" stroke="#4E3825" stroke-width="1.8" />
      <polygon points="440,360 500,240 500,280 440,400" fill="url(#steelSide)" stroke="#38291B" stroke-width="1.8" />
      
      <!-- Precision Machined Grid Lines & Dowel Holes -->
      <line x1="140" y1="270" x2="450" y2="270" stroke="#A77344" stroke-width="0.75" stroke-dasharray="8,6" opacity="0.6" />
      <line x1="110" y1="300" x2="445" y2="300" stroke="#A77344" stroke-width="0.75" stroke-dasharray="8,6" opacity="0.6" />
      <line x1="85" y1="330" x2="440" y2="330" stroke="#A77344" stroke-width="0.75" stroke-dasharray="8,6" opacity="0.6" />
      
      <!-- Threaded Inserts / Bushing Matrix -->
      <circle cx="160" cy="285" r="4" fill="#120E0A" stroke="#F3A96A" stroke-width="1" />
      <circle cx="220" cy="285" r="4" fill="#120E0A" stroke="#F3A96A" stroke-width="1" />
      <circle cx="280" cy="285" r="4" fill="#120E0A" stroke="#F3A96A" stroke-width="1" />
      <circle cx="340" cy="285" r="4" fill="#120E0A" stroke="#F3A96A" stroke-width="1" />
      <circle cx="400" cy="285" r="4" fill="#120E0A" stroke="#F3A96A" stroke-width="1" />
      
      <circle cx="140" cy="315" r="4" fill="#120E0A" stroke="#F3A96A" stroke-width="1" />
      <circle cx="200" cy="315" r="4" fill="#120E0A" stroke="#F3A96A" stroke-width="1" />
      <circle cx="260" cy="315" r="4" fill="#120E0A" stroke="#F3A96A" stroke-width="1" />
      <circle cx="320" cy="315" r="4" fill="#120E0A" stroke="#F3A96A" stroke-width="1" />
      <circle cx="380" cy="315" r="4" fill="#120E0A" stroke="#F3A96A" stroke-width="1" />
    </g>

    <!-- Support Riser & V-Block (Left Side) -->
    <g filter="url(#softShadow)">
      <polygon points="120,200 190,200 175,250 105,250" fill="url(#steelTop)" stroke="#8A6038" stroke-width="1.2" />
      <polygon points="105,250 175,250 175,290 105,290" fill="url(#steelFront)" stroke="#614427" stroke-width="1.2" />
      <!-- V-Notch in top face -->
      <polygon points="128,215 152,235 175,215 160,208 142,222 135,208" fill="#18130E" stroke="#F3A96A" stroke-width="1.2" />
    </g>

    <!-- Precision Ground Locating Pins (Round & Diamond) -->
    <!-- Round Pin -->
    <g filter="url(#softShadow)">
      <rect x="235" y="160" width="18" height="65" rx="2" fill="url(#chromeCylinder)" stroke="#F3A96A" stroke-width="1.5" />
      <polygon points="235,160 253,160 248,145 240,145" fill="#F3A96A" stroke="#A77344" stroke-width="1" />
      <!-- Pin flange base -->
      <rect x="228" y="220" width="32" height="14" rx="2" fill="url(#brassBushing)" stroke="#F3A96A" stroke-width="1.2" />
    </g>
    <!-- Diamond Pin (Relieved locating pin) -->
    <g filter="url(#softShadow)">
      <polygon points="315,160 330,145 345,160 340,225 320,225" fill="url(#chromeCylinder)" stroke="#F3A96A" stroke-width="1.5" />
      <rect x="312" y="222" width="36" height="14" rx="2" fill="url(#brassBushing)" stroke="#F3A96A" stroke-width="1.2" />
    </g>

    <!-- Heavy-Duty Red Industrial Toggle Clamp (Right Side) -->
    <g filter="url(#dropShadow)">
      <!-- Base bracket -->
      <rect x="365" y="200" width="60" height="30" rx="3" fill="url(#steelFrontDark)" stroke="#4A3420" stroke-width="1.2" />
      <!-- Linkage arms -->
      <polygon points="380,205 405,145 420,150 395,210" fill="url(#steelTop)" stroke="#7A5633" stroke-width="1.2" />
      <circle cx="388" cy="207" r="5" fill="#F3A96A" stroke="#111" stroke-width="1.5" />
      <circle cx="412" cy="148" r="5" fill="#F3A96A" stroke="#111" stroke-width="1.5" />
      
      <!-- Red Vinyl Handle Grip -->
      <path d="M 412,148 Q 450,110 475,85" fill="none" stroke="#D32F2F" stroke-width="14" stroke-linecap="round" />
      <path d="M 412,148 Q 450,110 475,85" fill="none" stroke="#FF5252" stroke-width="4" stroke-linecap="round" opacity="0.6" />
      
      <!-- Clamp Spindle & Neoprene Cushion Pad -->
      <line x1="395" y1="175" x2="275" y2="185" stroke="url(#chromePiston)" stroke-width="8" stroke-linecap="square" />
      <circle cx="395" cy="175" r="5" fill="#F3A96A" stroke="#111" stroke-width="1.5" />
      <!-- Pressure pad touching workpiece -->
      <rect x="268" y="177" width="14" height="24" rx="2" fill="#202020" stroke="#D32F2F" stroke-width="1.5" />
    </g>

    <!-- Automotive Part Workpiece (Sheet metal bracket clamped in place) -->
    <g filter="url(#softShadow)" opacity="0.85">
      <polygon points="145,190 280,185 305,200 170,205" fill="#9FB5C4" stroke="#D8E7F0" stroke-width="1.8" />
      <circle cx="244" cy="192" r="6" fill="#1C2730" stroke="#F3A96A" stroke-width="1.5" />
      <circle cx="330" cy="198" r="6" fill="#1C2730" stroke="#F3A96A" stroke-width="1.5" />
    </g>
  `
}

function generateAssemblySvg(item) {
  let contentSvg = ''
  if (item.type === 'dies') contentSvg = renderRealisticDiesSvg()
  else if (item.type === 'mold') contentSvg = renderRealisticMoldSvg()
  else if (item.type === 'jig-fixture') contentSvg = renderRealisticJigFixtureSvg()

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
  <defs>
    <!-- Background Radial Studio Lighting -->
    <radialGradient id="studioLighting" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#24333F" />
      <stop offset="60%" stop-color="#141E26" />
      <stop offset="100%" stop-color="#0B1015" />
    </radialGradient>

    <!-- Precision Blueprint Grid -->
    <pattern id="engGrid" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#263640" stroke-width="0.7" opacity="0.4" />
    </pattern>

    <!-- Metallic Realistic Gradients -->
    <!-- Steel Top Ground Face -->
    <linearGradient id="steelTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B8C8D4" />
      <stop offset="35%" stop-color="#93A5B3" />
      <stop offset="70%" stop-color="#738694" />
      <stop offset="100%" stop-color="#5B6C77" />
    </linearGradient>

    <!-- Steel Front Polished Face -->
    <linearGradient id="steelFront" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8094A3" />
      <stop offset="30%" stop-color="#5D7180" />
      <stop offset="70%" stop-color="#41525F" />
      <stop offset="100%" stop-color="#2C3A44" />
    </linearGradient>

    <!-- Steel Side Shadow Face -->
    <linearGradient id="steelSide" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#364550" />
      <stop offset="100%" stop-color="#1E272E" />
    </linearGradient>

    <!-- Dark Hardened Steel / Cast Iron -->
    <linearGradient id="steelTopDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#677884" />
      <stop offset="50%" stop-color="#4B5B66" />
      <stop offset="100%" stop-color="#323E46" />
    </linearGradient>
    <linearGradient id="steelFrontDark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#43525D" />
      <stop offset="100%" stop-color="#202A31" />
    </linearGradient>

    <!-- Chrome Plated Guide Pillar / Piston -->
    <linearGradient id="chromeCylinder" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7D93A3" />
      <stop offset="25%" stop-color="#E2EEF5" />
      <stop offset="50%" stop-color="#FFFFFF" />
      <stop offset="75%" stop-color="#A5B9C7" />
      <stop offset="100%" stop-color="#465864" />
    </linearGradient>
    <linearGradient id="chromePiston" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#B8CCD8" />
      <stop offset="100%" stop-color="#6F8492" />
    </linearGradient>

    <!-- Brass / Bronze Bushing Wear Plate -->
    <linearGradient id="brassBushing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFEAA7" />
      <stop offset="40%" stop-color="#DFB15B" />
      <stop offset="80%" stop-color="#A2782A" />
      <stop offset="100%" stop-color="#583E10" />
    </linearGradient>

    <!-- Carbide Punch / TiN Gold/Bronze -->
    <linearGradient id="carbidePunch" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A4702E" />
      <stop offset="35%" stop-color="#FCD581" />
      <stop offset="70%" stop-color="#FFEBB8" />
      <stop offset="100%" stop-color="#8E5E1C" />
    </linearGradient>

    <!-- Heavy Gas Spring Cylinder (Industrial Yellow/Gold Coating) -->
    <linearGradient id="gasSpringCylinder" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#805B14" />
      <stop offset="35%" stop-color="#E5A34B" />
      <stop offset="70%" stop-color="#FFE099" />
      <stop offset="100%" stop-color="#61440B" />
    </linearGradient>

    <!-- Chrome Ring -->
    <linearGradient id="chromeRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0F6FA" />
      <stop offset="50%" stop-color="#9CB3C2" />
      <stop offset="100%" stop-color="#546B7A" />
    </linearGradient>

    <!-- Depth Shadows -->
    <filter id="dropShadow" x="-10%" y="-10%" width="125%" height="135%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#000000" flood-opacity="0.75" />
    </filter>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Studio Background -->
  <rect width="600" height="450" fill="url(#studioLighting)" />
  <rect width="600" height="450" fill="url(#engGrid)" />

  <!-- Outer Technical Blueprint Border -->
  <rect x="14" y="14" width="572" height="422" fill="none" stroke="#2B3C48" stroke-width="1.2" />
  <rect x="18" y="18" width="564" height="414" fill="none" stroke="#1E2A33" stroke-width="0.8" />
  
  <!-- Corner Alignment Crosshairs -->
  <g stroke="${item.accent}" stroke-width="1" opacity="0.8">
    <line x1="12" y1="22" x2="26" y2="22" />
    <line x1="22" y1="12" x2="22" y2="26" />
    <line x1="574" y1="22" x2="588" y2="22" />
    <line x1="578" y1="12" x2="578" y2="26" />
    <line x1="12" y1="428" x2="26" y2="428" />
    <line x1="22" y1="418" x2="22" y2="432" />
    <line x1="574" y1="428" x2="588" y2="428" />
    <line x1="578" y1="418" x2="578" y2="432" />
  </g>

  <!-- Central Assembly Visual Model -->
  <g id="modelGeometry">
    ${contentSvg}
  </g>

  <!-- Top Header Tag -->
  <rect x="28" y="26" width="115" height="22" rx="3" fill="${item.color2}" stroke="${item.accent}" stroke-width="1.2" />
  <text x="85" y="41" font-family="'IBM Plex Mono', Consolas, monospace" font-size="10.5" font-weight="bold" fill="${item.accent}" text-anchor="middle" letter-spacing="1">${item.tag}</text>
  <text x="155" y="41" font-family="'IBM Plex Mono', Consolas, monospace" font-size="10" fill="#889CA8" letter-spacing="0.5">FULL ASSEMBLY • 1:1 SCALE</text>

  <!-- Bottom Info Panel -->
  <rect x="28" y="380" width="544" height="44" rx="4" fill="#141E26" stroke="#364956" stroke-width="1.2" />
  <text x="44" y="401" font-family="'IBM Plex Sans', sans-serif" font-size="13" font-weight="700" fill="#F0F5F8" letter-spacing="0.5">${item.name}</text>
  <text x="44" y="416" font-family="'IBM Plex Mono', Consolas, monospace" font-size="9.5" fill="#9FB2BD">${item.sub}</text>
  
  <!-- Interactive Indicator Tag -->
  <rect x="468" y="390" width="92" height="24" rx="3" fill="${item.accent}" />
  <text x="514" y="406" font-family="'IBM Plex Sans', sans-serif" font-size="10.5" font-weight="bold" fill="#0E161C" text-anchor="middle">BUKA CABANG →</text>
</svg>`
}

for (const asm of assemblies) {
  const svgContent = generateAssemblySvg(asm)
  const svgPath = path.join(postersDir, `${asm.id}.svg`)
  const webpPath = path.join(postersDir, `${asm.id}.webp`)

  fs.writeFileSync(svgPath, svgContent, 'utf-8')
  fs.writeFileSync(webpPath, svgContent, 'utf-8')
  console.log(`Generated assembly poster: ${asm.id}`)
}
