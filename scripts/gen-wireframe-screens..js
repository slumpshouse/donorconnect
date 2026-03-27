// Generates detailed screen wireframe elements and appends them to wireframe.excalidraw
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'wireframe.excalidraw');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let idCounter = 6000;
let seedCounter = 6000;
const els = [];

// ─── primitives ────────────────────────────────────────────────────────────────

function R(x, y, w, h, bg, stroke, rounded, sw) {
  return {
    id: 'g' + idCounter++,
    type: 'rectangle',
    x: Math.round(x), y: Math.round(y),
    width: Math.round(w), height: Math.round(h),
    angle: 0,
    strokeColor: stroke || '#d1d5db',
    backgroundColor: bg || 'transparent',
    fillStyle: 'solid',
    strokeWidth: sw !== undefined ? sw : 1,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    groupIds: [], frameId: null,
    roundness: rounded ? { type: 3 } : null,
    seed: seedCounter++, version: 1, versionNonce: seedCounter++,
    isDeleted: false, boundElements: null,
    updated: 1774624284918, link: null, locked: false,
  };
}

function T(x, y, w, h, txt, size, color, align) {
  return {
    id: 'g' + idCounter++,
    type: 'text',
    x: Math.round(x), y: Math.round(y),
    width: Math.round(w), height: Math.round(h),
    angle: 0,
    strokeColor: color || '#374151',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1, strokeStyle: 'solid',
    roughness: 0, opacity: 100,
    groupIds: [], frameId: null, roundness: null,
    seed: seedCounter++, version: 1, versionNonce: seedCounter++,
    isDeleted: false, boundElements: null,
    updated: 1774624284918, link: null, locked: false,
    text: txt, fontSize: size || 12, fontFamily: 1,
    textAlign: align || 'left', verticalAlign: 'top',
    containerId: null, originalText: txt,
    lineHeight: 1.25, baseline: size || 12,
  };
}

// ─── reusable helpers ──────────────────────────────────────────────────────────

function sectionHeading(x, y, txt) {
  els.push(R(x - 6, y - 8, 1120, 36, '#f8fafc', '#e2e8f0', true, 1));
  els.push(T(x, y, 1100, 24, txt, 18, '#1e3a5f'));
}

// Browser-chrome wrapper for a screen
function screenFrame(x, y, w, h, route, label) {
  // Label above
  els.push(T(x, y - 24, w, 18, label, 12, '#6b7280'));
  // Outer frame (white bg)
  els.push(R(x, y, w, h, '#ffffff', '#94a3b8', true, 1));
  // Top browser bar
  els.push(R(x, y, w, 22, '#f1f5f9', '#cbd5e1', false, 1));
  // Dot indicators
  [0, 1, 2].forEach(i => els.push(R(x + 6 + i * 11, y + 7, 8, 8, ['#f87171', '#fbbf24', '#34d399'][i], ['#f87171', '#fbbf24', '#34d399'][i], true, 0)));
  // Route label
  els.push(R(x + 38, y + 4, w - 80, 14, '#ffffff', '#e2e8f0', true, 1));
  els.push(T(x + 44, y + 6, w - 88, 11, route, 9, '#94a3b8'));
}

// Sidebar strip for dashboard pages
function sidebar(x, y, h) {
  els.push(R(x, y + 22, 72, h - 22, '#f8fafc', '#e2e8f0', false, 1));
  els.push(T(x + 6, y + 28, 60, 14, 'DonorConnect', 8, '#5B9FDF'));
  ['Dashboard', 'Donors', 'Donations', 'Campaigns', 'Segments', 'Workflows', 'Tasks'].forEach((n, i) => {
    els.push(T(x + 8, y + 46 + i * 24, 56, 14, n, 9, '#6b7280'));
  });
  // Logout
  els.push(R(x + 4, y + h - 60, 64, 20, '#fef2f2', '#fca5a5', true, 1));
  els.push(T(x + 10, y + h - 55, 52, 14, 'Logout', 9, '#ef4444'));
  // Add donor btn
  els.push(R(x + 4, y + h - 36, 64, 22, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(x + 8, y + h - 31, 56, 14, '+ Donor', 9, '#ffffff'));
}

// Page header row (title + subtitle + optional button)
function pageHeader(cx, cy, title, subtitle, btnLabel) {
  els.push(T(cx + 4, cy + 4, 180, 18, title, 14, '#1f2937'));
  els.push(T(cx + 4, cy + 24, 200, 11, subtitle, 9, '#9ca3af'));
  if (btnLabel) {
    els.push(R(cx + 178, cy + 4, 76, 24, '#5B9FDF', '#5B9FDF', true, 0));
    els.push(T(cx + 182, cy + 10, 68, 14, btnLabel, 8, '#ffffff'));
  }
}

// ─── GRID LAYOUT ──────────────────────────────────────────────────────────────
// 3 screens per row, W=340 H=480, hGap=50, vGap=90
const SW = 340, SH = 480;
const hGap = 50, vGap = 90;
const colX = [40, 430, 820];
const rowY = [2200, 2800, 3400, 4000];

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 1 — Auth & Public Pages (y=2200)
// ═══════════════════════════════════════════════════════════════════════════════
sectionHeading(40, rowY[0] - 60, 'Auth & Public Pages');

// ── LOGIN (/login) ──
{
  const [sx, sy] = [colX[0], rowY[0]];
  screenFrame(sx, sy, SW, SH, '/login', 'Login');
  const cx = sx + 22, cy = sy + 30;
  // Card
  els.push(R(cx + 14, cy + 6, 274, 342, '#ffffff', '#e5e7eb', true, 1));
  els.push(T(cx + 24, cy + 18, 254, 20, 'Sign in to your account', 13, '#1f2937'));
  els.push(T(cx + 24, cy + 40, 254, 11, 'Enter your credentials to access the dashboard.', 9, '#9ca3af'));
  // Email
  els.push(T(cx + 24, cy + 62, 100, 12, 'Email', 10, '#374151'));
  els.push(R(cx + 24, cy + 76, 232, 24, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx + 30, cy + 81, 200, 12, 'you@organization.org', 9, '#9ca3af'));
  // Password
  els.push(T(cx + 24, cy + 112, 100, 12, 'Password', 10, '#374151'));
  els.push(R(cx + 24, cy + 126, 232, 24, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx + 30, cy + 131, 200, 12, '••••••••••', 9, '#9ca3af'));
  // Buttons
  els.push(R(cx + 24, cy + 168, 90, 28, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx + 38, cy + 175, 65, 14, 'Sign in', 10, '#ffffff'));
  els.push(T(cx + 186, cy + 175, 80, 12, 'Create account →', 9, '#5B9FDF'));
  // Divider + note
  els.push(R(cx + 24, cy + 216, 232, 1, 'transparent', '#e5e7eb', false, 1));
  els.push(T(cx + 24, cy + 226, 254, 11, 'Demo: admin@hopefoundation.org', 9, '#9ca3af'));
  els.push(T(cx + 24, cy + 239, 254, 11, 'Password: password123', 9, '#9ca3af'));
}

// ── REGISTER (/register) ──
{
  const [sx, sy] = [colX[1], rowY[0]];
  screenFrame(sx, sy, SW, SH, '/register', 'Register');
  const cx = sx + 22, cy = sy + 30;
  els.push(R(cx + 8, cy + 4, 288, 420, '#ffffff', '#e5e7eb', true, 1));
  els.push(T(cx + 18, cy + 16, 255, 20, 'Create your account', 13, '#1f2937'));
  els.push(T(cx + 18, cy + 38, 255, 11, 'Register to manage donors and donations.', 9, '#9ca3af'));
  ['First name', 'Last name', 'Email', 'Password', 'Organization (optional)'].forEach((label, i) => {
    const fy = cy + 62 + i * 52;
    els.push(T(cx + 18, fy, 200, 12, label, 10, '#374151'));
    els.push(R(cx + 18, fy + 14, 252, 24, '#f9fafb', '#d1d5db', false, 1));
  });
  els.push(R(cx + 18, cy + 338, 120, 28, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx + 30, cy + 345, 100, 14, 'Create account', 10, '#ffffff'));
  els.push(T(cx + 186, cy + 345, 80, 12, 'Sign in →', 9, '#5B9FDF'));
}

// ── HOME / LANDING (/) ──
{
  const [sx, sy] = [colX[2], rowY[0]];
  screenFrame(sx, sy, SW, SH, '/', 'Home / Landing');
  // Nav bar
  els.push(R(sx, sy + 22, SW, 34, '#f8fafc', '#e2e8f0', false, 1));
  els.push(T(sx + 10, sy + 30, 100, 14, 'DonorConnect', 12, '#5B9FDF'));
  els.push(T(sx + 222, sy + 32, 50, 12, 'Login', 10, '#6b7280'));
  els.push(T(sx + 274, sy + 32, 60, 12, 'Register', 10, '#6b7280'));
  // Hero
  els.push(R(sx + 10, sy + 64, 320, 160, '#eef6ff', '#bfdbfe', true, 1));
  els.push(T(sx + 20, sy + 78, 300, 26, 'DonorConnect', 20, '#1e3a5f'));
  els.push(T(sx + 20, sy + 108, 300, 14, 'Turn first-time donors into', 12, '#374151'));
  els.push(T(sx + 20, sy + 124, 300, 14, 'lifelong supporters.', 12, '#374151'));
  els.push(R(sx + 20, sy + 148, 100, 26, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(sx + 32, sy + 154, 80, 14, 'Get Started →', 10, '#ffffff'));
  els.push(T(sx + 140, sy + 154, 80, 12, 'Learn More', 10, '#5B9FDF'));
  // Feature list
  els.push(T(sx + 10, sy + 242, 320, 14, 'Why DonorConnect?', 12, '#374151'));
  ['✓  Donor retention analytics', '✓  AI-powered outreach drafts', '✓  Campaign tracking & insights', '✓  Workflow automation'].forEach((f, i) => {
    els.push(T(sx + 10, sy + 262 + i * 22, 320, 14, f, 10, '#4b5563'));
  });
  // Footer links
  els.push(T(sx + 10, sy + 440, 320, 12, '/about  •  /ai-policy  •  /why-donorconnect', 9, '#9ca3af'));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 2 — Dashboard & Core Lists (y=2800)
// ═══════════════════════════════════════════════════════════════════════════════
sectionHeading(40, rowY[1] - 60, 'Dashboard & Core List Pages');

// ── DASHBOARD (/dashboard) ──
{
  const [sx, sy] = [colX[0], rowY[1]];
  screenFrame(sx, sy, SW, SH, '/dashboard', 'Dashboard');
  sidebar(sx, sy, SH);
  const cx = sx + 74, cy = sy + 28;
  pageHeader(cx, cy, 'Dashboard', 'Welcome to your donor retention platform');
  // Stat cards
  [['Total Donors', '75', '#5B9FDF'], ['Donations', '243', '#5B9FDF'], ['Total Raised', '$48,250', '#5B9FDF']].forEach(([label, val, c], i) => {
    els.push(R(cx + 4 + i * 84, cy + 46, 78, 44, '#eff6ff', '#bfdbfe', true, 1));
    els.push(T(cx + 8 + i * 84, cy + 50, 70, 11, label, 8, '#6b7280'));
    els.push(T(cx + 8 + i * 84, cy + 64, 70, 16, val, 12, c));
  });
  // At-risk panel
  els.push(R(cx + 4, cy + 98, 122, 142, '#ffffff', '#fca5a5', true, 1));
  els.push(T(cx + 8, cy + 104, 114, 12, 'At-risk Donors', 10, '#1f2937'));
  els.push(T(cx + 8, cy + 118, 40, 22, '12', 18, '#dc2626'));
  els.push(T(cx + 8, cy + 142, 114, 10, 'HIGH or CRITICAL risk', 8, '#9ca3af'));
  ['Jane D. — HIGH', 'Mark R. — HIGH', 'Alice M. — CRIT'].forEach((n, i) => {
    els.push(T(cx + 10, cy + 158 + i * 18, 112, 12, n, 8, '#6b7280'));
    els.push(R(cx + 6, cy + 170 + i * 18, 116, 1, 'transparent', '#f3f4f6', false, 1));
  });
  // Recent donations panel
  els.push(R(cx + 132, cy + 98, 126, 142, '#ffffff', '#d1d5db', true, 1));
  els.push(T(cx + 136, cy + 104, 118, 12, 'Recent Donations', 10, '#1f2937'));
  [['Jane D.', '$500'], ['John S.', '$120'], ['Mary K.', '$250'], ['Bob T.', '$75'], ['Alex P.', '$1,000']].forEach(([name, amt], i) => {
    els.push(T(cx + 136, cy + 120 + i * 22, 60, 11, name, 8, '#374151'));
    els.push(T(cx + 200, cy + 120 + i * 22, 48, 11, amt, 8, '#5B9FDF'));
    els.push(R(cx + 134, cy + 132 + i * 22, 122, 1, 'transparent', '#f3f4f6', false, 1));
  });
  // Campaign Insights
  els.push(R(cx + 4, cy + 248, 254, 80, '#fffbeb', '#fde68a', true, 1));
  els.push(T(cx + 10, cy + 254, 244, 12, '✦ Campaign Insights (AI-powered)', 10, '#92400e'));
  [['Spring Drive', '↑ UP', '$4,200'], ['Year-End Fund', '→ FLAT', '$12,000'], ['Major Donor Push', '↓ DOWN', '$3,200']].forEach(([name, trend, amt], i) => {
    els.push(T(cx + 10, cy + 270 + i * 18, 244, 11, name.padEnd(18) + trend.padEnd(8) + amt, 9, '#374151'));
  });
}

// ── DONORS LIST (/donors) ──
{
  const [sx, sy] = [colX[1], rowY[1]];
  screenFrame(sx, sy, SW, SH, '/donors', 'Donors List');
  sidebar(sx, sy, SH);
  const cx = sx + 74, cy = sy + 28;
  pageHeader(cx, cy, 'Donors', 'Manage your donor relationships', '+ Add Donor');
  // Search + filters
  els.push(R(cx + 4, cy + 46, 168, 24, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx + 8, cy + 52, 140, 12, 'Search donors by name or email', 9, '#9ca3af'));
  els.push(R(cx + 178, cy + 46, 52, 24, '#5B9FDF', '#5B9FDF', false, 1));
  els.push(T(cx + 182, cy + 52, 44, 12, '🔍 Search', 8, '#ffffff'));
  ['All status ▼', 'All risk ▼', '10/pg ▼'].forEach((f, i) => {
    els.push(R(cx + 4 + i * 78, cy + 76, 72, 20, '#f9fafb', '#d1d5db', false, 1));
    els.push(T(cx + 8 + i * 78, cy + 80, 64, 12, f, 8, '#6b7280'));
  });
  // Table header
  els.push(R(cx + 4, cy + 102, 254, 20, '#f3f4f6', '#e5e7eb', false, 1));
  ['Name', 'Email', 'Status', 'Risk'].forEach((h, i) => {
    els.push(T(cx + 8 + i * 64, cy + 106, 60, 12, h, 8, '#6b7280'));
  });
  // Rows
  [
    ['Jane Doe', 'jane@…', 'ACTIVE', 'HIGH'],
    ['John Smith', 'john@…', 'ACTIVE', 'LOW'],
    ['Mary Kim', 'mary@…', 'INACTIVE', 'MED'],
    ['Bob Turner', 'bob@…', 'ACTIVE', 'CRIT'],
    ['Alice M.', 'alice@…', 'ACTIVE', 'LOW'],
  ].forEach((row, i) => {
    const ry = cy + 124 + i * 26;
    els.push(R(cx + 4, ry - 2, 254, 24, '#ffffff', '#e5e7eb', false, 1));
    row.forEach((cell, j) => {
      const color = j === 3 ? (cell === 'HIGH' || cell === 'CRIT' ? '#dc2626' : '#16a34a') : '#374151';
      els.push(T(cx + 8 + j * 64, ry + 2, 60, 12, cell, 8, color));
    });
  });
  // Pagination
  els.push(T(cx + 4, cy + 262, 120, 12, '← Page 1 of 8 →', 9, '#6b7280'));
}

// ── DONATIONS LIST (/donations) ──
{
  const [sx, sy] = [colX[2], rowY[1]];
  screenFrame(sx, sy, SW, SH, '/donations', 'Donations List');
  sidebar(sx, sy, SH);
  const cx = sx + 74, cy = sy + 28;
  pageHeader(cx, cy, 'Donations', 'Search, filter, and manage all donations', '+ Log Donation');
  // Stat row
  [['Total', '$48,250'], ['Count', '243'], ['Online', '112']].forEach(([label, val], i) => {
    els.push(R(cx + 4 + i * 84, cy + 44, 78, 36, '#f0f9ff', '#bae6fd', true, 1));
    els.push(T(cx + 8 + i * 84, cy + 48, 70, 10, label, 8, '#6b7280'));
    els.push(T(cx + 8 + i * 84, cy + 60, 70, 14, val, 11, '#1e40af'));
  });
  // Search
  els.push(R(cx + 4, cy + 88, 254, 24, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx + 8, cy + 94, 220, 12, 'Search by name, email, ID, phone…', 9, '#9ca3af'));
  // Table header
  els.push(R(cx + 4, cy + 118, 254, 20, '#f3f4f6', '#e5e7eb', false, 1));
  ['Donor', 'Amount', 'Date', 'Campaign'].forEach((h, i) => {
    els.push(T(cx + 8 + i * 64, cy + 122, 60, 12, h, 8, '#6b7280'));
  });
  [
    ['Jane Doe', '$500', 'Mar 20', 'Spring'],
    ['John S.', '$120', 'Mar 18', 'Annual'],
    ['Mary K.', '$250', 'Mar 15', 'Spring'],
    ['Bob T.', '$75', 'Mar 12', 'Major'],
    ['Alex P.', '$1,000', 'Mar 10', 'Annual'],
  ].forEach((row, i) => {
    const ry = cy + 140 + i * 26;
    els.push(R(cx + 4, ry - 2, 254, 24, '#ffffff', '#e5e7eb', false, 1));
    row.forEach((cell, j) => els.push(T(cx + 8 + j * 64, ry + 2, 60, 12, cell, 8, '#374151')));
  });
  els.push(T(cx + 4, cy + 278, 120, 12, '← Page 1 of 25 →', 9, '#6b7280'));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 3 — Detail & Management Pages (y=3400)
// ═══════════════════════════════════════════════════════════════════════════════
sectionHeading(40, rowY[2] - 60, 'Detail & Management Pages');

// ── DONOR DETAIL (/donors/[id]) ──
{
  const [sx, sy] = [colX[0], rowY[2]];
  screenFrame(sx, sy, SW, SH, '/donors/[id]', 'Donor Detail');
  sidebar(sx, sy, SH);
  const cx = sx + 74, cy = sy + 28;
  // Header
  els.push(T(cx + 4, cy + 4, 160, 18, 'Jane Doe', 14, '#1f2937'));
  els.push(R(cx + 168, cy + 6, 38, 18, '#fee2e2', '#fca5a5', true, 1));
  els.push(T(cx + 173, cy + 10, 28, 12, 'HIGH', 8, '#dc2626'));
  els.push(T(cx + 4, cy + 24, 220, 11, 'jane.doe@email.org  •  (555) 123-4567', 9, '#9ca3af'));
  // Tabs
  ['Overview', 'Donations', 'Interactions'].forEach((tab, i) => {
    const active = i === 0;
    els.push(R(cx + 4 + i * 76, cy + 42, 72, 22, active ? '#eff6ff' : '#f9fafb', active ? '#5B9FDF' : '#e5e7eb', false, 1));
    els.push(T(cx + 8 + i * 76, cy + 47, 64, 12, tab, 9, active ? '#5B9FDF' : '#6b7280'));
  });
  // Donor info card
  els.push(R(cx + 4, cy + 70, 256, 120, '#ffffff', '#e5e7eb', true, 1));
  [['Email', 'jane.doe@email.org'], ['Phone', '(555) 123-4567'], ['Status', 'ACTIVE'], ['Risk Level', 'HIGH'], ['Total Raised', '$2,450'], ['Total Gifts', '7 donations']].forEach(([k, v], i) => {
    const col = i >= 3 ? 132 : 4;
    const row = i % 3;
    els.push(T(cx + 8 + col, cy + 76 + row * 30, 118, 10, k, 8, '#9ca3af'));
    els.push(T(cx + 8 + col, cy + 88 + row * 30, 118, 12, v, 9, i === 3 ? '#dc2626' : '#374151'));
  });
  // Edit + Delete buttons
  els.push(R(cx + 4, cy + 200, 56, 22, '#fef3c7', '#fde68a', true, 1));
  els.push(T(cx + 10, cy + 205, 46, 12, 'Edit', 9, '#92400e'));
  els.push(R(cx + 68, cy + 200, 56, 22, '#fef2f2', '#fca5a5', true, 1));
  els.push(T(cx + 72, cy + 205, 48, 12, 'Delete', 9, '#dc2626'));
  // AI Outreach
  els.push(R(cx + 4, cy + 232, 256, 60, '#f0fdf4', '#86efac', true, 1));
  els.push(T(cx + 8, cy + 238, 244, 12, '✦ AI Outreach Generator', 10, '#166534'));
  els.push(T(cx + 8, cy + 252, 120, 10, 'Channel: Email ▼', 9, '#374151'));
  els.push(R(cx + 140, cy + 248, 110, 18, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx + 144, cy + 251, 106, 10, 'Generated draft preview…', 8, '#9ca3af'));
  els.push(R(cx + 8, cy + 274, 90, 16, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx + 12, cy + 277, 80, 12, 'Generate Draft', 8, '#ffffff'));
  // Donation history
  els.push(R(cx + 4, cy + 304, 256, 76, '#ffffff', '#e5e7eb', true, 1));
  els.push(T(cx + 8, cy + 310, 244, 12, 'Donation History', 10, '#374151'));
  [['$500', 'Mar 20, 2026', 'Spring Drive'], ['$250', 'Dec 5, 2025', 'Year-End Fund'], ['$1,000', 'Sep 1, 2025', 'Annual']].forEach(([amt, date, camp], i) => {
    els.push(T(cx + 8, cy + 326 + i * 18, 244, 11, amt + '  –  ' + date + '  –  ' + camp, 8, '#6b7280'));
    els.push(R(cx + 6, cy + 337 + i * 18, 248, 1, 'transparent', '#f3f4f6', false, 1));
  });
}

// ── CAMPAIGNS LIST (/campaigns) ──
{
  const [sx, sy] = [colX[1], rowY[2]];
  screenFrame(sx, sy, SW, SH, '/campaigns', 'Campaigns List');
  sidebar(sx, sy, SH);
  const cx = sx + 74, cy = sy + 28;
  pageHeader(cx, cy, 'Campaigns', 'Create and manage fundraising campaigns', 'Add Campaign');
  const camps = [
    { name: 'Spring Drive', dates: 'Mar 1 – Jun 30', status: 'ACTIVE', pct: 65, amount: '$4,200', goal: '$6,500' },
    { name: 'Year-End Fund', dates: 'Nov 1 – Dec 31', status: 'COMPLETED', pct: 100, amount: '$12,000', goal: '$12,000' },
    { name: 'Major Donor Push', dates: 'Jan 1 – Apr 30', status: 'ACTIVE', pct: 32, amount: '$3,200', goal: '$10,000' },
  ];
  camps.forEach((c, i) => {
    const cy2 = cy + 46 + i * 130;
    els.push(R(cx + 4, cy2, 254, 118, '#ffffff', '#e5e7eb', true, 1));
    els.push(T(cx + 10, cy2 + 8, 150, 14, c.name, 12, '#374151'));
    els.push(T(cx + 10, cy2 + 24, 180, 10, c.dates, 8, '#9ca3af'));
    const sb = c.status === 'ACTIVE' ? '#d1fae5' : '#e5e7eb';
    const st = c.status === 'ACTIVE' ? '#065f46' : '#6b7280';
    els.push(R(cx + 198, cy2 + 6, 50, 18, sb, sb, true, 0));
    els.push(T(cx + 202, cy2 + 10, 42, 12, c.status, 7, st));
    // Progress bar
    els.push(R(cx + 10, cy2 + 44, 240, 8, '#f3f4f6', '#e5e7eb', false, 1));
    els.push(R(cx + 10, cy2 + 44, Math.floor(240 * c.pct / 100), 8, '#5B9FDF', '#5B9FDF', false, 0));
    els.push(T(cx + 10, cy2 + 56, 240, 10, c.amount + ' raised of ' + c.goal + ' (' + c.pct + '%)', 8, '#374151'));
    // Action buttons
    els.push(R(cx + 10, cy2 + 80, 44, 22, '#10b981', '#10b981', true, 0));
    els.push(T(cx + 18, cy2 + 85, 30, 12, 'View', 9, '#ffffff'));
    els.push(R(cx + 62, cy2 + 80, 44, 22, '#f9fafb', '#e5e7eb', true, 1));
    els.push(T(cx + 68, cy2 + 85, 32, 12, 'Edit', 9, '#6b7280'));
    els.push(R(cx + 114, cy2 + 80, 50, 22, '#fef2f2', '#fca5a5', true, 1));
    els.push(T(cx + 118, cy2 + 85, 42, 12, 'Delete', 9, '#dc2626'));
  });
}

// ── SEGMENTS (/segments) ──
{
  const [sx, sy] = [colX[2], rowY[2]];
  screenFrame(sx, sy, SW, SH, '/segments', 'Donor Segments');
  sidebar(sx, sy, SH);
  const cx = sx + 74, cy = sy + 28;
  pageHeader(cx, cy, 'Donor Segments', 'Build dynamic groups of donors', '+ New Segment');
  // Search
  els.push(R(cx + 4, cy + 44, 254, 24, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx + 8, cy + 50, 220, 12, 'Search segments by name or description…', 9, '#9ca3af'));
  // Filter tabs
  ['All Segments', 'Suggested'].forEach((tab, i) => {
    const active = i === 0;
    els.push(R(cx + 4 + i * 86, cy + 74, 82, 22, active ? '#5B9FDF' : '#f3f4f6', active ? '#5B9FDF' : '#e5e7eb', true, 0));
    els.push(T(cx + 10 + i * 86, cy + 79, 70, 12, tab, 9, active ? '#ffffff' : '#6b7280'));
  });
  // Segment cards
  [
    { name: 'Recent Donors', desc: 'Gave in last 30 days', count: 42 },
    { name: 'Lapsed Major Donors', desc: 'No gifts in 12+ months', count: 18 },
    { name: 'New Subscribers', desc: 'Created in last 90 days', count: 120 },
    { name: 'At-Risk Donors', desc: 'HIGH/CRITICAL risk score', count: 24 },
  ].forEach((seg, i) => {
    const sy2 = cy + 104 + i * 84;
    els.push(R(cx + 4, sy2, 254, 72, '#ffffff', '#e5e7eb', true, 1));
    els.push(T(cx + 10, sy2 + 8, 180, 12, seg.name, 10, '#374151'));
    els.push(T(cx + 10, sy2 + 22, 200, 10, seg.desc, 8, '#9ca3af'));
    els.push(R(cx + 10, sy2 + 36, 160, 14, '#eff6ff', '#bfdbfe', false, 1));
    els.push(T(cx + 14, sy2 + 38, 156, 10, seg.count + ' members', 8, '#1d4ed8'));
    els.push(R(cx + 206, sy2 + 8, 44, 22, '#5B9FDF', '#5B9FDF', true, 0));
    els.push(T(cx + 214, sy2 + 13, 30, 12, 'View', 9, '#ffffff'));
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 4 — Workflow, Task & Form Pages (y=4000)
// ═══════════════════════════════════════════════════════════════════════════════
sectionHeading(40, rowY[3] - 60, 'Workflow, Task & Form Pages');

// ── WORKFLOWS (/workflows) ──
{
  const [sx, sy] = [colX[0], rowY[3]];
  screenFrame(sx, sy, SW, SH, '/workflows', 'Automation Workflows');
  sidebar(sx, sy, SH);
  const cx = sx + 74, cy = sy + 28;
  pageHeader(cx, cy, 'Automation Workflows', 'Automate thank-yous, follow-ups & journeys', '+ Workflow');
  const workflows = [
    { name: 'Donation Thank-you', trigger: 'Donation received', action: 'Send thank-you email', active: true },
    { name: 'New Donor Follow-up', trigger: 'New donor created', action: 'Create follow-up task', active: true },
    { name: 'Campaign End Report', trigger: 'Campaign ended', action: 'Generate report + email team', active: false },
  ];
  workflows.forEach((wf, i) => {
    const wy = cy + 46 + i * 130;
    els.push(R(cx + 4, wy, 262, 118, '#ffffff', '#e5e7eb', true, 1));
    els.push(T(cx + 10, wy + 8, 180, 12, wf.name, 10, '#1f2937'));
    const ab = wf.active ? '#d1fae5' : '#f3f4f6';
    const at = wf.active ? '#065f46' : '#6b7280';
    els.push(R(cx + 212, wy + 6, 46, 18, ab, ab, true, 0));
    els.push(T(cx + 216, wy + 10, 38, 12, wf.active ? 'Active' : 'Inactive', 7, at));
    els.push(T(cx + 10, wy + 26, 250, 10, 'Trigger: ' + wf.trigger, 8, '#6b7280'));
    els.push(T(cx + 10, wy + 40, 250, 10, 'Action:  ' + wf.action, 8, '#6b7280'));
    els.push(R(cx + 10, wy + 56, 180, 14, '#f0f9ff', '#bae6fd', false, 1));
    els.push(T(cx + 14, wy + 58, 176, 10, 'Condition: Amount > $0', 8, '#1e40af'));
    els.push(R(cx + 10, wy + 80, 44, 24, '#fef3c7', '#fde68a', true, 1));
    els.push(T(cx + 16, wy + 85, 34, 12, 'Edit', 9, '#92400e'));
    els.push(R(cx + 62, wy + 80, 72, 24, '#5B9FDF', '#5B9FDF', true, 0));
    els.push(T(cx + 68, wy + 85, 60, 12, wf.active ? 'Turn Off' : 'Turn On', 9, '#ffffff'));
  });
}

// ── TASKS (/tasks) ──
{
  const [sx, sy] = [colX[1], rowY[3]];
  screenFrame(sx, sy, SW, SH, '/tasks', 'Tasks');
  sidebar(sx, sy, SH);
  const cx = sx + 74, cy = sy + 28;
  pageHeader(cx, cy, 'Tasks', 'Manage donor outreach tasks', '+ New Task');
  // Stat row
  [['Open', '18'], ['Due Today', '4'], ['Overdue', '7'], ['Done/mo', '23']].forEach(([label, val], i) => {
    els.push(R(cx + 4 + i * 62, cy + 44, 56, 36, '#f0f9ff', '#bae6fd', true, 1));
    els.push(T(cx + 8 + i * 62, cy + 48, 48, 10, label, 7, '#6b7280'));
    els.push(T(cx + 8 + i * 62, cy + 60, 48, 14, val, 12, '#1e40af'));
  });
  // Filter bar
  els.push(R(cx + 4, cy + 88, 254, 22, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx + 8, cy + 93, 200, 11, 'Sort: Urgency ▼   Filter ▼   Donor search…', 8, '#9ca3af'));
  // Task items
  [
    { title: 'Call Jane re: lapsed gift', donor: 'Jane Doe', due: 'Mar 28', pri: 'HIGH' },
    { title: 'Send thank-you to new donor', donor: 'Mark R.', due: 'Mar 27', pri: 'HIGH' },
    { title: 'Review Spring Drive donors', donor: 'Campaign', due: 'Apr 2', pri: 'MED' },
    { title: '2nd gift follow-up ask', donor: 'Alice M.', due: 'Apr 5', pri: 'MED' },
    { title: 'Update major donor notes', donor: 'Bob T.', due: 'Apr 10', pri: 'LOW' },
  ].forEach((t, i) => {
    const ty = cy + 118 + i * 62;
    els.push(R(cx + 4, ty, 254, 54, '#ffffff', '#e5e7eb', true, 1));
    const pb = t.pri === 'HIGH' ? '#fee2e2' : t.pri === 'MED' ? '#fef3c7' : '#dcfce7';
    const pc = t.pri === 'HIGH' ? '#dc2626' : t.pri === 'MED' ? '#d97706' : '#16a34a';
    els.push(R(cx + 202, ty + 6, 46, 16, pb, pb, true, 0));
    els.push(T(cx + 207, ty + 9, 36, 10, t.pri, 8, pc));
    els.push(T(cx + 10, ty + 7, 186, 12, t.title, 10, '#374151'));
    els.push(T(cx + 10, ty + 22, 130, 10, 'Donor: ' + t.donor, 8, '#9ca3af'));
    els.push(T(cx + 10, ty + 34, 100, 10, 'Due: ' + t.due, 8, '#9ca3af'));
    // Checkbox
    els.push(R(cx + 230, ty + 18, 18, 18, '#f9fafb', '#d1d5db', false, 1));
  });
}

// ── NEW DONOR FORM (/donors/new) ──
{
  const [sx, sy] = [colX[2], rowY[3]];
  screenFrame(sx, sy, SW, SH, '/donors/new', 'New Donor Form');
  sidebar(sx, sy, SH);
  const cx = sx + 74, cy = sy + 28;
  pageHeader(cx, cy, 'Add New Donor', 'Create a new donor record');
  [
    { label: 'First Name *', ph: 'First name', tall: false },
    { label: 'Last Name *', ph: 'Last name', tall: false },
    { label: 'Email *', ph: 'donor@email.org', tall: false },
    { label: 'Phone', ph: '(555) 000-0000', tall: false },
    { label: 'Status', ph: 'ACTIVE  /  INACTIVE', tall: false },
    { label: 'Notes', ph: 'Add any notes here…', tall: true },
  ].forEach((f, i) => {
    const fy = cy + 44 + i * 50;
    els.push(T(cx + 4, fy, 200, 12, f.label, 9, '#374151'));
    if (f.tall) {
      els.push(R(cx + 4, fy + 14, 254, 40, '#f9fafb', '#d1d5db', false, 1));
      els.push(T(cx + 8, fy + 18, 246, 12, f.ph, 8, '#9ca3af'));
    } else {
      els.push(R(cx + 4, fy + 14, 254, 24, '#f9fafb', '#d1d5db', false, 1));
      els.push(T(cx + 8, fy + 18, 246, 12, f.ph, 8, '#9ca3af'));
    }
  });
  // Buttons
  els.push(R(cx + 4, cy + 356, 120, 30, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx + 16, cy + 363, 96, 14, 'Create Donor', 10, '#ffffff'));
  els.push(R(cx + 134, cy + 356, 80, 30, '#f9fafb', '#d1d5db', true, 1));
  els.push(T(cx + 148, cy + 363, 52, 14, 'Cancel', 10, '#6b7280'));
}

// ─── Additional screens note (forms that follow same pattern) ──────────────────
{
  const y = rowY[3] + SH + 40;
  els.push(R(40, y, 1120, 60, '#f8fafc', '#e2e8f0', true, 1));
  els.push(T(52, y + 10, 1100, 14, 'Additional screens (all follow same sidebar + form/detail pattern):', 11, '#374151'));
  els.push(T(52, y + 28, 1100, 20, '/campaigns/new  •  /campaigns/[id]/edit  •  /campaigns/[id]/add-donor  •  /segments/new  •  /segments/[id]  •  /workflows/new  •  /workflows/[id]/edit  •  /tasks/new  •  /tasks/[id]/edit  •  /donors/[id]/edit  •  /evidence-rubric  •  /reflection', 10, '#6b7280'));
}

// ─── Append and save ──────────────────────────────────────────────────────────
data.elements.push(...els);
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Done! Added ' + els.length + ' elements. Total elements: ' + data.elements.length);
