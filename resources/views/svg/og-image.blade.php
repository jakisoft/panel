<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" width="1200" height="500">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07080f" />
      <stop offset="50%" stop-color="#0c0e1a" />
      <stop offset="100%" stop-color="#080912" />
    </linearGradient>

    <!-- Glowing Accents -->
    <radialGradient id="indigoGlow" cx="20%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#4f46e5" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#4f46e5" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="cyanGlow" cx="80%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25" />
      <stop offset="60%" stop-color="#06b6d4" stop-opacity="0.03" />
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="purpleGlow" cx="50%" cy="90%" r="60%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
    </radialGradient>

    <!-- Grid Pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#312e81" stroke-width="0.75" stroke-opacity="0.15" />
    </pattern>

    <!-- Logo & Accent Gradients -->
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#e0e7ff" />
      <stop offset="100%" stop-color="#a5b4fc" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#34d399" />
    </linearGradient>

    <!-- Glow Filters -->
    <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="500" fill="url(#bgGrad)" />
  <rect width="1200" height="500" fill="url(#grid)" />
  <rect width="1200" height="500" fill="url(#indigoGlow)" />
  <rect width="1200" height="500" fill="url(#cyanGlow)" />
  <rect width="1200" height="500" fill="url(#purpleGlow)" />

  <!-- Outer Glowing Border Frame -->
  <rect x="20" y="20" width="1160" height="460" rx="28" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-opacity="0.25" />
  <rect x="21" y="21" width="1158" height="458" rx="27" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.05" />

  <!-- Top Pill / Status Tag -->
  <g transform="translate(60, 55)">
    <rect width="275" height="34" rx="17" fill="#1e1b4b" fill-opacity="0.6" stroke="#6366f1" stroke-width="1" stroke-opacity="0.4" filter="url(#softShadow)" />
    <circle cx="18" cy="17" r="5" fill="#10b981">
      <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
    </circle>
    <text x="32" y="22" fill="#a5b4fc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" letter-spacing="1">{{ $tag }}</text>
  </g>

  <!-- Top Right Version Badge -->
  <g transform="translate(950, 55)">
    <rect width="190" height="34" rx="17" fill="#0f172a" fill-opacity="0.8" stroke="#334155" stroke-width="1" />
    <text x="95" y="22" fill="#94a3b8" font-family="'JetBrains Mono', 'Fira Code', monospace, sans-serif" font-size="12" font-weight="600" text-anchor="middle">{{ $version }}</text>
  </g>

  <!-- Central Brand & Icon Area -->
  <g transform="translate(60, 115)">
    <!-- Logo Icon Box -->
    <g transform="translate(0, 5)">
      <rect width="84" height="84" rx="24" fill="url(#cardGrad)" stroke="#6366f1" stroke-width="1.5" stroke-opacity="0.4" filter="url(#softShadow)" />
      
      <!-- JKSoft Shield Symbol -->
      <g transform="translate(14, 14)">
        <path d="M28 10L45 19L28 28L11 19L28 10Z" fill="url(#indigoGrad)" opacity="0.95" />
        <path d="M11 24.5L28 33.5L45 24.5" stroke="url(#indigoGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M11 32.5L28 41.5L45 32.5" stroke="url(#cyanGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="28" cy="19" r="3" fill="#ffffff" filter="url(#glowEffect)" />
      </g>
    </g>

    <!-- Main Headings -->
    <g transform="translate(108, 0)">
      <text x="0" y="{{ $fontSize > 36 ? 45 : 40 }}" fill="url(#textGrad)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="{{ $fontSize }}" font-weight="900" letter-spacing="-1">
        {!! $formattedTitle !!}
      </text>
      <text x="0" y="{{ $fontSize > 36 ? 78 : 72 }}" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500">
        {{ $description }}
      </text>
    </g>
  </g>

  <!-- Feature Grid Cards / Badges (4 Columns) -->
  <g transform="translate(60, 240)">
    <!-- Card 1: Docker Isolation -->
    <g transform="translate(0, 0)">
      <rect width="258" height="96" rx="20" fill="url(#cardGrad)" stroke="#312e81" stroke-width="1.2" stroke-opacity="0.5" filter="url(#softShadow)" />
      <circle cx="36" cy="36" r="16" fill="#4f46e5" fill-opacity="0.2" stroke="#6366f1" stroke-width="1" />
      <path d="M 30 40 L 36 28 L 42 40 Z" fill="#818cf8" />
      <text x="64" y="34" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700">Docker &amp; Isolation</text>
      <text x="64" y="52" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11">Wings Daemon • Low Latency</text>
      <rect x="20" y="72" width="218" height="3" rx="1.5" fill="#4f46e5" fill-opacity="0.4" />
    </g>

    <!-- Card 2: Real-time Terminal & SFTP -->
    <g transform="translate(274, 0)">
      <rect width="258" height="96" rx="20" fill="url(#cardGrad)" stroke="#0e7490" stroke-width="1.2" stroke-opacity="0.5" filter="url(#softShadow)" />
      <circle cx="36" cy="36" r="16" fill="#06b6d4" fill-opacity="0.2" stroke="#22d3ee" stroke-width="1" />
      <rect x="29" y="29" width="14" height="14" rx="3" fill="#22d3ee" />
      <text x="64" y="34" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700">Real-Time Console</text>
      <text x="64" y="52" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11">Live Websockets • Fast SFTP</text>
      <rect x="20" y="72" width="218" height="3" rx="1.5" fill="#06b6d4" fill-opacity="0.4" />
    </g>

    <!-- Card 3: Automated Backups & Schedules -->
    <g transform="translate(548, 0)">
      <rect width="258" height="96" rx="20" fill="url(#cardGrad)" stroke="#065f46" stroke-width="1.2" stroke-opacity="0.5" filter="url(#softShadow)" />
      <circle cx="36" cy="36" r="16" fill="#10b981" fill-opacity="0.2" stroke="#34d399" stroke-width="1" />
      <path d="M 36 28 L 42 34 L 36 40 L 30 34 Z" fill="#34d399" />
      <text x="64" y="34" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700">Automated Backups</text>
      <text x="64" y="52" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11">S3 / Local Storage • Schedules</text>
      <rect x="20" y="72" width="218" height="3" rx="1.5" fill="#10b981" fill-opacity="0.4" />
    </g>

    <!-- Card 4: Enterprise Security & 2FA -->
    <g transform="translate(822, 0)">
      <rect width="258" height="96" rx="20" fill="url(#cardGrad)" stroke="#701a75" stroke-width="1.2" stroke-opacity="0.5" filter="url(#softShadow)" />
      <circle cx="36" cy="36" r="16" fill="#d946ef" fill-opacity="0.2" stroke="#f472b6" stroke-width="1" />
      <circle cx="36" cy="36" r="6" fill="#f472b6" />
      <text x="64" y="34" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700">Enterprise Security</text>
      <text x="64" y="52" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11">2FA • API Keys • RBAC Control</text>
      <rect x="20" y="72" width="218" height="3" rx="1.5" fill="#d946ef" fill-opacity="0.4" />
    </g>
  </g>

  <!-- Bottom Tech Stack Chips Bar -->
  <g transform="translate(60, 375)">
    <rect width="1080" height="60" rx="18" fill="#0b0d18" fill-opacity="0.75" stroke="#1e293b" stroke-width="1" />
    
    <!-- Chip 1: Supported Environments -->
    <g transform="translate(24, 34)">
      <text fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600">
        <tspan fill="#6366f1" font-weight="800">ENVIRONMENTS:</tspan> Minecraft • SteamCMD • Node.js • Python • Rust • ARK • Palworld • Custom Docker
      </text>
    </g>

    <!-- Chip 2: Quick Features Badges -->
    <g transform="translate(720, 18)">
      <rect x="0" y="-3" width="110" height="26" rx="8" fill="#1e1b4b" stroke="#4338ca" stroke-width="0.8" />
      <text x="55" y="14" fill="#c7d2fe" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" text-anchor="middle">⚡ REAL-TIME WS</text>

      <rect x="120" y="-3" width="110" height="26" rx="8" fill="#083344" stroke="#0891b2" stroke-width="0.8" />
      <text x="175" y="14" fill="#a5f3fc" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" text-anchor="middle">🔄 AUTO BACKUP</text>

      <rect x="240" y="-3" width="110" height="26" rx="8" fill="#052e16" stroke="#16a34a" stroke-width="0.8" />
      <text x="295" y="14" fill="#bbf7d0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" text-anchor="middle">🔒 2FA &amp; RBAC</text>
    </g>
  </g>
</svg>
