const fs = require('fs');

const files = [
  'd:/Coding/Projects/eduvantix/eduvantix-frontend/src/app/(dashboard)/settings/verification/page.jsx',
  'd:/Coding/Projects/eduvantix/eduvantix-frontend/src/app/(dashboard)/admin/verification/page.jsx',
  'd:/Coding/Projects/eduvantix/eduvantix-frontend/src/app/(dashboard)/verified/page.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Container Backgrounds & Text Base
  content = content.replace(/background: "var\(--bg, #0f0f14\)", /g, '');
  content = content.replace(/color: "var\(--text, #e2e8f0\)"/g, 'color: "var(--text-primary)"');
  
  // Text Colors
  content = content.replace(/color: "#64748b"/g, 'color: "var(--text-muted)"');
  content = content.replace(/color: "#475569"/g, 'color: "var(--text-secondary)"');
  content = content.replace(/color: "#94a3b8"/g, 'color: "var(--text-secondary)"');
  content = content.replace(/color: "#e2e8f0"/g, 'color: "var(--text-primary)"');
  content = content.replace(/color: "#cbd5e1"/g, 'color: "var(--text-secondary)"');
  content = content.replace(/color: "inherit"/g, 'color: "var(--text-primary)"'); // mostly for inputs
  
  // Backgrounds
  content = content.replace(/background: "rgba\(255,255,255,0\.02\)"/g, 'background: "var(--bg-secondary)"');
  content = content.replace(/background: "rgba\(255,255,255,0\.03\)"/g, 'background: "var(--bg-card)"');
  content = content.replace(/background: "rgba\(255,255,255,0\.04\)"/g, 'background: "var(--bg-secondary)"');
  content = content.replace(/background: "rgba\(255,255,255,0\.05\)"/g, 'background: "var(--bg-hover)"');
  content = content.replace(/background: "rgba\(255,255,255,0\.07\)"/g, 'background: "var(--bg-hover)"');
  content = content.replace(/background: "rgba\(255,255,255,0\.1\)"/g, 'background: "var(--bg-hover)"');
  
  // Panel background
  content = content.replace(/background: "#0f0f18"/g, 'background: "var(--bg-card)"');
  
  // Borders
  content = content.replace(/border: "1px solid rgba\(255,255,255,0\.08\)"/g, 'border: "1px solid var(--border-primary)"');
  content = content.replace(/border: "1px solid rgba\(255,255,255,0\.07\)"/g, 'border: "1px solid var(--border-primary)"');
  content = content.replace(/border: "1px solid rgba\(255,255,255,0\.1\)"/g, 'border: "1px solid var(--border-primary)"');
  content = content.replace(/border: "1px solid rgba\(255,255,255,0\.05\)"/g, 'border: "1px solid var(--border-primary)"');
  content = content.replace(/border: "1px solid rgba\(255,255,255,0\.15\)"/g, 'border: "1px solid var(--border-primary)"');
  
  content = content.replace(/borderBottom: "1px solid rgba\(255,255,255,0\.05\)"/g, 'borderBottom: "1px solid var(--border-primary)"');
  content = content.replace(/borderBottom: "1px solid rgba\(255,255,255,0\.07\)"/g, 'borderBottom: "1px solid var(--border-primary)"');
  content = content.replace(/borderTop: "1px solid rgba\(255,255,255,0\.06\)"/g, 'borderTop: "1px solid var(--border-primary)"');
  content = content.replace(/borderLeft: "1px solid rgba\(255,255,255,0\.1\)"/g, 'borderLeft: "1px solid var(--border-primary)"');
  
  content = content.replace(/border: "2px solid rgba\(255,255,255,0\.15\)"/g, 'border: "2px solid var(--border-primary)"');
  content = content.replace(/border: "2px solid rgba\(255,255,255,0\.1\)"/g, 'border: "2px solid var(--border-primary)"');

  // Specific dynamic borders
  content = content.replace(/border: `1px solid \$\{active \? t\.color \+ "60" : "rgba\\(255,255,255,0\\.08\\)"\}`/g, 'border: `1px solid ${active ? t.color + "60" : "var(--border-primary)"}`');
  content = content.replace(/border: `2px solid \$\{done \? "#22c55e" : "rgba\\(255,255,255,0\\.15\\)"\}`/g, 'border: `2px solid ${done ? "#22c55e" : "var(--border-primary)"}`');
  content = content.replace(/border: `1px solid \$\{reviewAction === action \? color \+ "60" : "rgba\\(255,255,255,0\\.1\\)"\}`/g, 'border: `1px solid ${reviewAction === action ? color + "60" : "var(--border-primary)"}`');
  content = content.replace(/background: \$\{statusFilter === s \? cfg\.bg : "rgba\\(255,255,255,0\\.03\\)"\}/g, 'background: ${statusFilter === s ? cfg.bg : "var(--bg-secondary)"}');
  content = content.replace(/background: active \? `\$\{t\.color\}20` : "rgba\\(255,255,255,0\\.04\\)"/g, 'background: active ? `${t.color}20` : "var(--bg-secondary)"');
  content = content.replace(/background: reviewAction === action \? `\$\{color\}20` : "rgba\\(255,255,255,0\\.04\\)"/g, 'background: reviewAction === action ? `${color}20` : "var(--bg-secondary)"');
  content = content.replace(/border: `1px solid \$\{statusFilter === s \? cfg\.color \+ "60" : "rgba\\(255,255,255,0\\.07\\)"\}`/g, 'border: `1px solid ${statusFilter === s ? cfg.color + "60" : "var(--border-primary)"}`');

  fs.writeFileSync(file, content);
});

console.log('Theme updates complete!');
