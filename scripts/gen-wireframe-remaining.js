// Adds the 18 remaining screen wireframes to wireframe.excalidraw
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'wireframe.excalidraw');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let id = 9000;
let seed = 9000;
const els = [];

// ─── Primitives ─────────────────────────────────────────────────────────────────
function R(x, y, w, h, bg, stroke, rounded, sw) {
  return { id:'g'+id++, type:'rectangle', x:Math.round(x), y:Math.round(y), width:Math.round(w), height:Math.round(h), angle:0, strokeColor:stroke||'#d1d5db', backgroundColor:bg||'transparent', fillStyle:'solid', strokeWidth:sw!==undefined?sw:1, strokeStyle:'solid', roughness:0, opacity:100, groupIds:[], frameId:null, roundness:rounded?{type:3}:null, seed:seed++, version:1, versionNonce:seed++, isDeleted:false, boundElements:null, updated:1774624284918, link:null, locked:false };
}
function T(x, y, w, h, txt, size, color, align) {
  return { id:'g'+id++, type:'text', x:Math.round(x), y:Math.round(y), width:Math.round(w), height:Math.round(h), angle:0, strokeColor:color||'#374151', backgroundColor:'transparent', fillStyle:'solid', strokeWidth:1, strokeStyle:'solid', roughness:0, opacity:100, groupIds:[], frameId:null, roundness:null, seed:seed++, version:1, versionNonce:seed++, isDeleted:false, boundElements:null, updated:1774624284918, link:null, locked:false, text:txt, fontSize:size||12, fontFamily:1, textAlign:align||'left', verticalAlign:'top', containerId:null, originalText:txt, lineHeight:1.25, baseline:size||12 };
}

// ─── Shared helpers ──────────────────────────────────────────────────────────────
function sectionHead(x, y, txt) {
  els.push(R(x-6, y-8, 1120, 36, '#f0f4ff', '#c7d2fe', true, 1));
  els.push(T(x, y, 1100, 24, txt, 18, '#1e3a5f'));
}
function browserFrame(x, y, w, h, route, label) {
  els.push(T(x, y-22, w, 16, label, 11, '#6b7280'));
  els.push(R(x, y, w, h, '#ffffff', '#94a3b8', true, 1));
  els.push(R(x, y, w, 22, '#f1f5f9', '#cbd5e1', false, 1));
  [0,1,2].forEach(i=>els.push(R(x+6+i*11, y+7, 8, 8, ['#f87171','#fbbf24','#34d399'][i], ['#f87171','#fbbf24','#34d399'][i], true, 0)));
  els.push(R(x+38, y+4, w-80, 14, '#ffffff', '#e2e8f0', true, 1));
  els.push(T(x+44, y+6, w-88, 11, route, 9, '#94a3b8'));
}
function sidebar(x, y, h) {
  els.push(R(x, y+22, 72, h-22, '#f8fafc', '#e2e8f0', false, 1));
  els.push(T(x+6, y+28, 60, 14, 'DonorConnect', 8, '#5B9FDF'));
  ['Dashboard','Donors','Donations','Campaigns','Segments','Workflows','Tasks'].forEach((n,i)=>{
    els.push(T(x+8, y+46+i*24, 56, 14, n, 9, '#6b7280'));
  });
  els.push(R(x+4, y+h-60, 64, 20, '#fef2f2', '#fca5a5', true, 1));
  els.push(T(x+10, y+h-55, 52, 14, 'Logout', 9, '#ef4444'));
  els.push(R(x+4, y+h-36, 64, 22, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(x+8, y+h-31, 56, 14, '+ Donor', 9, '#ffffff'));
}
function publicNav(x, y, w) {
  els.push(R(x, y+22, w, 30, '#ffffff', '#e2e8f0', false, 1));
  els.push(T(x+10, y+28, 80, 14, 'DonorConnect', 10, '#5B9FDF'));
  ['Home','AI Policy','About','Why DC'].forEach((n,i)=>els.push(T(x+w-170+i*44, y+30, 42, 12, n, 8, '#5B9FDF')));
}
function pageHdr(cx, cy, title, sub, btn) {
  els.push(T(cx+4, cy+4, 180, 18, title, 14, '#1f2937'));
  if (sub) els.push(T(cx+4, cy+24, 220, 11, sub, 9, '#9ca3af'));
  if (btn) {
    els.push(R(cx+180, cy+4, 78, 24, '#5B9FDF', '#5B9FDF', true, 0));
    els.push(T(cx+184, cy+10, 70, 14, btn, 8, '#ffffff'));
  }
}
function formField(cx, y, label, ph, tall) {
  els.push(T(cx+4, y, 200, 11, label, 9, '#374151'));
  const fh = tall ? 36 : 22;
  els.push(R(cx+4, y+13, 252, fh, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx+8, y+17, 240, 11, ph, 8, '#9ca3af'));
}
function saveCancelBtns(cx, y) {
  els.push(R(cx+4, y, 110, 28, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+20, y+7, 90, 14, 'Save Changes', 9, '#ffffff'));
  els.push(R(cx+122, y, 68, 28, '#f9fafb', '#d1d5db', true, 1));
  els.push(T(cx+136, y+7, 40, 14, 'Cancel', 9, '#6b7280'));
}
function contentSection(cx, y, w, title, lines) {
  els.push(R(cx, y, w, 20+lines.length*18+8, '#ffffff', '#e5e7eb', true, 1));
  els.push(T(cx+8, y+6, w-16, 13, title, 10, '#1f2937'));
  lines.forEach((l,i)=>els.push(T(cx+8, y+22+i*18, w-16, 14, typeof l==='object'?l.t:l, 9, typeof l==='object'?(l.c||'#4b5563'):'#4b5563')));
}

// ─── Grid layout  ────────────────────────────────────────────────────────────────
// Canvas bottom from previous run was 4580; start new section at 4700
// 3 cols × 6 rows, SW=340 SH=480
const SW=340, SH=480, hGap=50, vGap=90;
const cols=[40,430,820];
const rows=[4760, 5360, 5960, 6560, 7160, 7760];

// ═════════════════════════════════════════════════════════════════════════════════
// ROW 1 — Public informational pages  (y=4760)
// ═════════════════════════════════════════════════════════════════════════════════
sectionHead(40, rows[0]-60, 'Public Informational Pages');

// ── /about ──
{
  const [sx,sy]=[cols[0],rows[0]];
  browserFrame(sx, sy, SW, SH, '/about', 'About');
  publicNav(sx, sy, SW);
  const cx=sx, cy=sy+52;
  els.push(T(cx+10, cy+8, 320, 20, 'About DonorConnect', 15, '#1f2937'));
  els.push(T(cx+10, cy+32, 320, 12, 'DonorConnect is built to help nonprofits improve donor retention.', 9, '#6b7280'));
  [
    ['Problem explained', 'After a donor\'s first gift, the next best follow-up often isn\'t clear…'],
    ['Why this matters', 'Donor retention is one of the biggest levers for sustainable fundraising…'],
    ['Who is affected', 'Development directors, fundraisers, and volunteer coordinators…'],
    ['What happens without it', 'First-time donors are less likely to give again, revenue becomes less predictable…'],
    ['What makes it different', 'Surfaces retention-focused insights (risk level) and campaign trends…'],
  ].forEach(([title, body], i) => {
    const by = cy+52+i*72;
    els.push(R(cx+10, by, 320, 62, '#ffffff', '#e5e7eb', true, 1));
    els.push(T(cx+16, by+8, 308, 13, title, 10, '#1f2937'));
    els.push(T(cx+16, by+24, 308, 30, body, 8, '#6b7280'));
  });
  // FAB
  els.push(R(cx+SW-78, sy+SH-36, 68, 26, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+SW-70, sy+SH-30, 60, 14, 'Get started', 9, '#ffffff'));
}

// ── /ai-policy ──
{
  const [sx,sy]=[cols[1],rows[0]];
  browserFrame(sx, sy, SW, SH, '/ai-policy', 'AI Policy & Safeguards');
  publicNav(sx, sy, SW);
  const cx=sx, cy=sy+52;
  els.push(T(cx+10, cy+8, 320, 20, 'AI Policy & Safeguards', 15, '#1f2937'));
  els.push(T(cx+10, cy+30, 320, 12, 'How DonorConnect uses AI and the safeguards in place.', 9, '#6b7280'));
  [
    ['Responsible AI use', '• Human-in-the-loop: staff review every draft\n• Non-automated: AI outputs are drafts only\n• Access control: signed-in users only'],
    ['AI model used', 'Optional external LLM for outreach drafts; falls back to template if unavailable.'],
    ['Prompt crafting', '• Conservative system instruction: no invented facts\n• Minimal data: name, email, totals, last 3 donations\n• Required structured output format'],
    ['How AI improves it', '• Generates email/call drafts for faster follow-up\n• "Next steps" checklist per campaign\n• Staff always in control — never auto-sent'],
  ].forEach(([title, body], i) => {
    const by = cy+50+i*98;
    els.push(R(cx+10, by, 320, 88, '#ffffff', '#e5e7eb', true, 1));
    els.push(T(cx+16, by+8, 308, 13, title, 10, '#1f2937'));
    els.push(T(cx+16, by+24, 308, 58, body, 8, '#6b7280'));
  });
}

// ── /why-donorconnect ──
{
  const [sx,sy]=[cols[2],rows[0]];
  browserFrame(sx, sy, SW, SH, '/why-donorconnect', 'Why DonorConnect');
  publicNav(sx, sy, SW);
  const cx=sx, cy=sy+52;
  els.push(T(cx+10, cy+8, 320, 20, 'Why DonorConnect', 15, '#1f2937'));
  els.push(T(cx+10, cy+30, 320, 12, 'A quick overview of what DonorConnect is and how it works.', 9, '#6b7280'));
  [
    ['Solution idea', 'Centralizes donor profiles + donation history so staff can quickly see who needs attention.'],
    ['Key features', '• Donor profiles + donation history\n• Retention risk insights\n• Campaign insights\n• Tasks + workflow automation'],
    ['Challenges planned for', '• Data consistency (PostgreSQL + Prisma)\n• Multi-tenant safety (org boundary)\n• Cookie-based auth\n• Trustworthy insights'],
    ['System summary', '30 pages: public + protected dashboard area.\nPostgreSQL: Organization, User, Donor, Donation, Campaign, Task.'],
  ].forEach(([title, body], i) => {
    const by = cy+50+i*96;
    els.push(R(cx+10, by, 320, 86, '#ffffff', '#e5e7eb', true, 1));
    els.push(T(cx+16, by+8, 308, 13, title, 10, '#1f2937'));
    els.push(T(cx+16, by+24, 308, 55, body, 8, '#6b7280'));
  });
  els.push(R(cx+SW-78, sy+SH-36, 68, 26, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+SW-70, sy+SH-30, 60, 14, 'Get started', 9, '#ffffff'));
}

// ═════════════════════════════════════════════════════════════════════════════════
// ROW 2 — Campaign detail / edit / add-donor  (y=5360)
// ═════════════════════════════════════════════════════════════════════════════════
sectionHead(40, rows[1]-60, 'Campaign Sub-pages');

// ── /campaigns/[id] ──
{
  const [sx,sy]=[cols[0],rows[1]];
  browserFrame(sx, sy, SW, SH, '/campaigns/[id]', 'Campaign Detail');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  // header card
  els.push(R(cx+4, cy+4, 258, 116, '#ffffff', '#e5e7eb', true, 1));
  els.push(T(cx+10, cy+12, 200, 16, 'Spring Drive', 14, '#1f2937'));
  els.push(T(cx+10, cy+30, 180, 11, 'Mar 1, 2026 • Jun 30, 2026', 8, '#9ca3af'));
  els.push(R(cx+208, cy+12, 46, 18, '#d1fae5', '#d1fae5', true, 0));
  els.push(T(cx+213, cy+16, 36, 11, 'ACTIVE', 7, '#065f46'));
  els.push(R(cx+208, cy+34, 44, 22, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+214, cy+39, 32, 12, 'Edit', 9, '#ffffff'));
  // amount + progress
  els.push(T(cx+10, cy+52, 120, 22, '$4,200', 18, '#5FBF6F'));
  els.push(T(cx+10, cy+74, 160, 11, '/ $6,500 goal', 9, '#9ca3af'));
  els.push(R(cx+10, cy+88, 240, 8, '#f3f4f6', '#e5e7eb', false, 1));
  els.push(R(cx+10, cy+88, 156, 8, '#5B9FDF', '#5B9FDF', false, 0));
  els.push(T(cx+10, cy+100, 240, 11, '64.6% of goal reached', 8, '#6b7280'));
  // stat row
  [['Donations','22'],['Avg gift','$191'],['Donors','18']].forEach(([l,v],i)=>{
    els.push(R(cx+4+i*86, cy+126, 80, 36, '#f0f9ff', '#bae6fd', true, 1));
    els.push(T(cx+8+i*86, cy+130, 72, 10, l, 8, '#6b7280'));
    els.push(T(cx+8+i*86, cy+142, 72, 14, v, 12, '#1e40af'));
  });
  // Top donors
  els.push(R(cx+4, cy+170, 158, 120, '#ffffff', '#e5e7eb', true, 1));
  els.push(T(cx+10, cy+176, 146, 13, 'Top Donors', 10, '#374151'));
  [['JD','Jane Doe','$1,200'],['MS','Mark S.','$800'],['AK','Alice K.','$500']].forEach(([ini,name,amt],i)=>{
    const ry=cy+192+i*34;
    els.push(R(cx+10, ry+2, 26, 24, '#dbeafe', '#93c5fd', true, 1));
    els.push(T(cx+14, ry+8, 18, 12, ini, 8, '#1e40af'));
    els.push(T(cx+40, ry+4, 80, 12, name, 9, '#374151'));
    els.push(T(cx+122, ry+4, 34, 12, amt, 9, '#5B9FDF'));
  });
  // Recent donations
  els.push(R(cx+168, cy+170, 94, 120, '#ffffff', '#e5e7eb', true, 1));
  els.push(T(cx+174, cy+176, 82, 13, 'Recent', 10, '#374151'));
  [['Jane D.','$500','Mar 20'],['Mark S.','$200','Mar 18'],['Alice K.','$100','Mar 15']].forEach(([n,a,d],i)=>{
    const ry=cy+192+i*34;
    els.push(T(cx+174, ry+2, 82, 11, n, 8, '#374151'));
    els.push(T(cx+174, ry+14, 40, 11, a, 8, '#5B9FDF'));
    els.push(T(cx+214, ry+14, 44, 11, d, 8, '#9ca3af'));
  });
  // Add donor btn
  els.push(R(cx+4, cy+298, 130, 28, '#10b981', '#10b981', true, 0));
  els.push(T(cx+12, cy+305, 114, 14, '+ Add Donor to Campaign', 8, '#ffffff'));
}

// ── /campaigns/[id]/edit ──
{
  const [sx,sy]=[cols[1],rows[1]];
  browserFrame(sx, sy, SW, SH, '/campaigns/[id]/edit', 'Edit Campaign');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  pageHdr(cx, cy, 'Edit Campaign', 'Update campaign details');
  [
    ['Campaign Name *', 'Spring Drive'],
    ['Description', 'Our annual spring fundraiser…'],
    ['Goal (USD)', '6500'],
  ].forEach(([label, ph], i) => formField(cx, cy+44+i*46, label, ph, i===1));
  // Date row
  els.push(T(cx+4, cy+188, 120, 11, 'Start Date', 9, '#374151'));
  els.push(R(cx+4, cy+201, 118, 22, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx+8, cy+205, 110, 11, '2026-03-01', 8, '#374151'));
  els.push(T(cx+132, cy+188, 120, 11, 'End Date', 9, '#374151'));
  els.push(R(cx+132, cy+201, 118, 22, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx+136, cy+205, 110, 11, '2026-06-30', 8, '#374151'));
  // Status select
  formField(cx, cy+232, 'Status', 'ACTIVE  ▼', false);
  saveCancelBtns(cx, cy+290);
}

// ── /campaigns/[id]/add-donor ──
{
  const [sx,sy]=[cols[2],rows[1]];
  browserFrame(sx, sy, SW, SH, '/campaigns/[id]/add-donor', 'Add Donor to Campaign');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  // Campaign context ribbon
  els.push(R(cx+4, cy+4, 258, 28, '#eff6ff', '#bfdbfe', true, 1));
  els.push(T(cx+10, cy+12, 248, 12, 'Campaign: Spring Drive', 10, '#1e40af'));
  pageHdr(cx, cy+36, 'Add Donor to Campaign', 'Create a new donor linked to this campaign');
  [
    ['First Name *','First name'],
    ['Last Name *','Last name'],
    ['Email','donor@email.org'],
    ['Phone','(555) 000-0000'],
  ].forEach(([l,p],i)=>formField(cx, cy+80+i*46, l, p, false));
  // Donation toggle
  els.push(R(cx+4, cy+270, 258, 28, '#f0fdf4', '#86efac', true, 1));
  els.push(T(cx+10, cy+278, 240, 12, '☑  Log initial donation for this campaign', 9, '#166534'));
  formField(cx, cy+306, 'Amount', '500', false);
  formField(cx, cy+352, 'Payment method', 'Credit Card  ▼', false);
  // Submit
  els.push(R(cx+4, cy+400, 140, 28, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+10, cy+407, 128, 14, 'Add Donor & Log Donation', 9, '#ffffff'));
}

// ═════════════════════════════════════════════════════════════════════════════════
// ROW 3 — Donation new / Donor edit / Segment detail  (y=5960)
// ═════════════════════════════════════════════════════════════════════════════════
sectionHead(40, rows[2]-60, 'Donation / Donor Edit / Segment Detail');

// ── /donations/new ──
{
  const [sx,sy]=[cols[0],rows[2]];
  browserFrame(sx, sy, SW, SH, '/donations/new', 'Log Donation');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  pageHdr(cx, cy, 'Log Donation', 'Record a new donation');
  // donor picker
  els.push(T(cx+4, cy+44, 200, 11, 'Select Donor *', 9, '#374151'));
  els.push(R(cx+4, cy+57, 256, 22, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx+8, cy+61, 248, 11, 'Jane Doe  ▼', 9, '#374151'));
  [
    ['Amount *','500'],
    ['Date *','2026-03-27'],
    ['Payment Method','Credit Card  ▼'],
    ['Campaign (optional)','Spring Drive  ▼'],
  ].forEach(([l,p],i)=>formField(cx, cy+88+i*46, l, p, false));
  // checkboxes
  ['☑  Send thank-you email', '☑  Send donation receipt', '☐  Create follow-up task'].forEach((c,i)=>{
    els.push(T(cx+8, cy+288+i*22, 248, 14, c, 9, '#374151'));
  });
  els.push(R(cx+4, cy+360, 110, 28, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+14, cy+367, 90, 14, 'Log Donation', 9, '#ffffff'));
  els.push(R(cx+122, cy+360, 68, 28, '#f9fafb', '#d1d5db', true, 1));
  els.push(T(cx+136, cy+367, 40, 14, 'Cancel', 9, '#6b7280'));
}

// ── /donors/[id]/edit ──
{
  const [sx,sy]=[cols[1],rows[2]];
  browserFrame(sx, sy, SW, SH, '/donors/[id]/edit', 'Edit Donor');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  pageHdr(cx, cy, 'Edit Donor', 'Update donor information');
  [
    ['First Name *','Jane'],
    ['Last Name *','Doe'],
    ['Email','jane.doe@email.org'],
    ['Phone','(555) 123-4567'],
  ].forEach(([l,p],i)=>formField(cx, cy+44+i*46, l, p, false));
  // Address section
  els.push(T(cx+4, cy+232, 100, 11, 'Address', 9, '#9ca3af'));
  [['Street','123 Main St'],['City','Springfield'],['State / Zip','IL  /  62701']].forEach(([l,p],i)=>formField(cx, cy+248+i*36, l, p, false));
  formField(cx, cy+364, 'Status', 'ACTIVE  ▼', false);
  saveCancelBtns(cx, cy+400);
}

// ── /segments/[id] ──
{
  const [sx,sy]=[cols[2],rows[2]];
  browserFrame(sx, sy, SW, SH, '/segments/[id]', 'Segment Detail');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  els.push(T(cx+4, cy+2, 80, 12, '← Back to segments', 9, '#5B9FDF'));
  // Header card
  els.push(R(cx+4, cy+18, 258, 70, '#ffffff', '#e5e7eb', true, 1));
  els.push(T(cx+10, cy+26, 200, 16, 'Recent Donors', 14, '#1f2937'));
  els.push(T(cx+10, cy+44, 240, 11, 'Donors who gave in the last 30 days', 9, '#9ca3af'));
  els.push(R(cx+10, cy+58, 80, 18, '#eff6ff', '#bfdbfe', true, 1));
  els.push(T(cx+14, cy+62, 72, 11, '42 members', 9, '#1e40af'));
  // Rules section
  els.push(R(cx+4, cy+96, 258, 58, '#fff7ed', '#fed7aa', true, 1));
  els.push(T(cx+10, cy+102, 248, 13, 'Segment Rules', 10, '#92400e'));
  els.push(T(cx+10, cy+118, 248, 11, 'lastGiftDate  ≥  2026-02-26', 9, '#6b7280'));
  els.push(T(cx+10, cy+132, 248, 11, 'status  =  ACTIVE', 9, '#6b7280'));
  // Add donor
  els.push(R(cx+4, cy+162, 130, 26, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+12, cy+168, 114, 12, '+ Add Donor to Segment', 9, '#ffffff'));
  // Member table
  els.push(R(cx+4, cy+196, 258, 20, '#f3f4f6', '#e5e7eb', false, 1));
  ['Name','Email','Risk','Gifts'].forEach((h,i)=>els.push(T(cx+8+i*64, cy+200, 60, 11, h, 8, '#6b7280')));
  [['Jane Doe','jane@…','HIGH','7'],['Mark S.','mark@…','LOW','12'],['Alice M.','alice@…','MED','3'],['Bob T.','bob@…','LOW','5']].forEach((row,i)=>{
    const ry=cy+218+i*26;
    els.push(R(cx+4, ry-2, 258, 24, '#ffffff', '#e5e7eb', false, 1));
    row.forEach((cell,j)=>{
      const c = j===2?(cell==='HIGH'?'#dc2626':cell==='MED'?'#d97706':'#16a34a'):'#374151';
      els.push(T(cx+8+j*64, ry+2, 60, 11, cell, 8, c));
    });
    els.push(R(cx+210, ry, 44, 18, '#fef2f2', '#fca5a5', true, 1));
    els.push(T(cx+216, ry+4, 32, 11, 'Remove', 7, '#dc2626'));
  });
}

// ═════════════════════════════════════════════════════════════════════════════════
// ROW 4 — Segment new / Task new / Task edit  (y=6560)
// ═════════════════════════════════════════════════════════════════════════════════
sectionHead(40, rows[3]-60, 'Segment New / Task Forms');

// ── /segments/new ──
{
  const [sx,sy]=[cols[0],rows[3]];
  browserFrame(sx, sy, SW, SH, '/segments/new', 'New Segment');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  pageHdr(cx, cy, 'New Segment', 'Build a dynamic group of donors');
  // Presets
  els.push(R(cx+4, cy+44, 258, 68, '#f8fafc', '#e2e8f0', true, 1));
  els.push(T(cx+10, cy+50, 248, 13, 'Quick presets', 10, '#374151'));
  ['Recent Donors (30 days)', 'Lapsed Major Donors (12+ mo, >$1k)', 'New Contacts (90 days)'].forEach((p,i)=>{
    els.push(R(cx+10, cy+64+i*18, 240, 14, '#eff6ff', '#bfdbfe', false, 1));
    els.push(T(cx+14, cy+66+i*18, 236, 11, p, 8, '#1e40af'));
  });
  formField(cx, cy+122, 'Segment Name *', 'e.g. Recent Donors', false);
  formField(cx, cy+162, 'Description', 'Optional description…', true);
  // Rules builder
  els.push(T(cx+4, cy+220, 200, 13, 'Add conditions', 10, '#374151'));
  els.push(R(cx+4, cy+234, 90, 22, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx+8, cy+238, 82, 11, 'lastGiftDate  ▼', 8, '#374151'));
  els.push(R(cx+100, cy+234, 60, 22, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx+104, cy+238, 52, 11, 'less than  ▼', 8, '#374151'));
  els.push(R(cx+166, cy+234, 64, 22, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx+170, cy+238, 56, 11, '2025-03-27', 8, '#374151'));
  els.push(R(cx+236, cy+234, 26, 22, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+240, cy+238, 18, 12, '+', 10, '#ffffff'));
  // Added condition
  els.push(R(cx+4, cy+264, 258, 20, '#f0fdf4', '#86efac', true, 1));
  els.push(T(cx+8, cy+268, 240, 12, 'lastGiftDate  <  2025-03-27   ×', 9, '#166534'));
  els.push(R(cx+4, cy+296, 120, 28, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+14, cy+303, 100, 14, 'Create Segment', 9, '#ffffff'));
  els.push(R(cx+132, cy+296, 68, 28, '#f9fafb', '#d1d5db', true, 1));
  els.push(T(cx+146, cy+303, 40, 14, 'Cancel', 9, '#6b7280'));
}

// ── /tasks/new ──
{
  const [sx,sy]=[cols[1],rows[3]];
  browserFrame(sx, sy, SW, SH, '/tasks/new', 'New Task');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  pageHdr(cx, cy, 'New Task', 'Create a donor outreach task');
  [
    ['Title *','e.g. Call Jane re: lapsed gift'],
    ['Description','Additional notes or context…'],
    ['Donor','Jane Doe  ▼'],
    ['Assigned To','Staff member  ▼'],
    ['Priority','HIGH / MEDIUM / LOW  ▼'],
    ['Due Date','2026-04-01'],
  ].forEach(([l,p],i)=>formField(cx, cy+44+i*50, l, p, i===1));
  els.push(R(cx+4, cy+348, 110, 28, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+16, cy+355, 86, 14, 'Create Task', 9, '#ffffff'));
  els.push(R(cx+122, cy+348, 68, 28, '#f9fafb', '#d1d5db', true, 1));
  els.push(T(cx+136, cy+355, 40, 14, 'Cancel', 9, '#6b7280'));
}

// ── /tasks/[id]/edit ──
{
  const [sx,sy]=[cols[2],rows[3]];
  browserFrame(sx, sy, SW, SH, '/tasks/[id]/edit', 'Edit Task');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  pageHdr(cx, cy, 'Edit Task', 'Update task details');
  [
    ['Title *','Call Jane re: lapsed gift'],
    ['Description','Follow up on last donation in Dec 2025…'],
    ['Donor','Jane Doe  ▼'],
    ['Assigned To','Admin User  ▼'],
    ['Priority','HIGH  ▼'],
    ['Due Date','2026-03-28'],
  ].forEach(([l,p],i)=>formField(cx, cy+44+i*50, l, p, i===1));
  // status
  formField(cx, cy+350, 'Status', 'TODO / IN_PROGRESS / COMPLETED  ▼', false);
  saveCancelBtns(cx, cy+390);
}

// ═════════════════════════════════════════════════════════════════════════════════
// ROW 5 — Workflow new / Workflow [id] / Workflow [id]/edit  (y=7160)
// ═════════════════════════════════════════════════════════════════════════════════
sectionHead(40, rows[4]-60, 'Workflow Sub-pages');

// ── /workflows/new ──
{
  const [sx,sy]=[cols[0],rows[4]];
  browserFrame(sx, sy, SW, SH, '/workflows/new', 'New Workflow');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  pageHdr(cx, cy, 'New Workflow', 'Automate donor follow-up sequences');
  // Presets strip
  els.push(R(cx+4, cy+44, 258, 58, '#f8fafc', '#e2e8f0', true, 1));
  els.push(T(cx+10, cy+50, 248, 12, 'Quick presets', 9, '#374151'));
  [['Donation Thank-you','DONATION_RECEIVED'],['New Donor Follow-up','FIRST_DONATION'],['Lapsed Re-engagement','INACTIVITY_THRESHOLD']].forEach(([n,t],i)=>{
    els.push(R(cx+10, cy+64+i*14, 248, 12, '#eff6ff', '#bfdbfe', false, 1));
    els.push(T(cx+14, cy+65+i*14, 244, 10, n+'  — '+t, 7, '#1e40af'));
  });
  formField(cx, cy+112, 'Workflow Name *', 'Donation Thank-you', false);
  formField(cx, cy+152, 'Description', 'Send immediate thank-you after donation', true);
  formField(cx, cy+210, 'Trigger', 'DONATION_RECEIVED  ▼', false);
  // Steps builder
  els.push(T(cx+4, cy+252, 200, 13, 'Workflow Steps', 10, '#374151'));
  els.push(R(cx+4, cy+266, 258, 28, '#f0fdf4', '#86efac', true, 1));
  els.push(T(cx+8, cy+274, 248, 14, 'Step 1: sendEmail — thankyou_template   ×', 8, '#166534'));
  // Add step row
  els.push(R(cx+4, cy+302, 90, 22, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx+8, cy+306, 82, 11, 'sendEmail  ▼', 8, '#374151'));
  els.push(R(cx+100, cy+302, 120, 22, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx+104, cy+306, 112, 11, 'template ID…', 8, '#9ca3af'));
  els.push(R(cx+226, cy+302, 36, 22, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+232, cy+306, 24, 12, '+ Add', 7, '#ffffff'));
  // active toggle
  els.push(T(cx+4, cy+336, 200, 12, '☑  Activate workflow on save', 9, '#374151'));
  els.push(R(cx+4, cy+358, 120, 28, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+14, cy+365, 100, 14, 'Create Workflow', 9, '#ffffff'));
  els.push(R(cx+130, cy+358, 68, 28, '#f9fafb', '#d1d5db', true, 1));
  els.push(T(cx+144, cy+365, 40, 14, 'Cancel', 9, '#6b7280'));
}

// ── /workflows/[id] (view/detail) ──
{
  const [sx,sy]=[cols[1],rows[4]];
  browserFrame(sx, sy, SW, SH, '/workflows/[id]', 'Workflow Detail');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  pageHdr(cx, cy, 'Donation Thank-you', 'Workflow detail & execution log');
  // Status + Edit
  els.push(R(cx+4, cy+44, 258, 40, '#ffffff', '#e5e7eb', true, 1));
  els.push(R(cx+10, cy+52, 50, 20, '#d1fae5', '#d1fae5', true, 0));
  els.push(T(cx+14, cy+56, 42, 12, 'Active', 8, '#065f46'));
  els.push(T(cx+68, cy+50, 140, 12, 'Trigger: DONATION_RECEIVED', 9, '#374151'));
  els.push(R(cx+212, cy+50, 40, 22, '#5B9FDF', '#5B9FDF', true, 0));
  els.push(T(cx+218, cy+55, 28, 12, 'Edit', 9, '#ffffff'));
  // Steps card
  els.push(R(cx+4, cy+92, 258, 80, '#ffffff', '#e5e7eb', true, 1));
  els.push(T(cx+10, cy+98, 248, 13, 'Steps', 10, '#374151'));
  [['1','sendEmail','thankyou_template'],['2','createTask','Follow-up task']].forEach(([n,act,param],i)=>{
    const ry=cy+114+i*32;
    els.push(R(cx+10, ry, 238, 24, '#f0f9ff', '#bae6fd', true, 1));
    els.push(T(cx+16, ry+6, 230, 12, 'Step '+n+': '+act+' — '+param, 9, '#1e40af'));
  });
  // Execution log
  els.push(R(cx+4, cy+180, 258, 180, '#ffffff', '#e5e7eb', true, 1));
  els.push(T(cx+10, cy+186, 248, 13, 'Execution log', 10, '#374151'));
  [['Mar 27 2026','Jane Doe donation','✓ Success'],['Mar 26 2026','Mark Smith donation','✓ Success'],['Mar 25 2026','Alice donation','✓ Success'],['Mar 24 2026','Bob Turner donation','✗ Failed'],['Mar 23 2026','Carol W. donation','✓ Success']].forEach(([date,event,status],i)=>{
    const ry=cy+202+i*30;
    els.push(R(cx+6, ry, 248, 24, i%2===0?'#f9fafb':'#ffffff', '#f3f4f6', false, 1));
    els.push(T(cx+10, ry+6, 68, 11, date, 8, '#9ca3af'));
    els.push(T(cx+80, ry+6, 130, 11, event, 8, '#374151'));
    const sc=status.startsWith('✓')?'#16a34a':'#dc2626';
    els.push(T(cx+212, ry+6, 38, 11, status.startsWith('✓')?'✓':'✗', 10, sc));
  });
}

// ── /workflows/[id]/edit ──
{
  const [sx,sy]=[cols[2],rows[4]];
  browserFrame(sx, sy, SW, SH, '/workflows/[id]/edit', 'Edit Workflow');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  pageHdr(cx, cy, 'Edit Workflow', 'Update workflow configuration');
  formField(cx, cy+44, 'Name *', 'Donation Thank-you', false);
  formField(cx, cy+84, 'Trigger', 'DONATION_RECEIVED  ▼', false);
  // Conditions textarea
  els.push(T(cx+4, cy+124, 200, 11, 'Conditions (one per line)', 9, '#374151'));
  els.push(R(cx+4, cy+137, 256, 48, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx+8, cy+141, 248, 36, 'Amount > 0', 8, '#374151'));
  // Actions textarea
  els.push(T(cx+4, cy+196, 200, 11, 'Actions (one per line)', 9, '#374151'));
  els.push(R(cx+4, cy+209, 256, 48, '#f9fafb', '#d1d5db', false, 1));
  els.push(T(cx+8, cy+213, 248, 36, 'Send thank-you email\nAdd to recent-donors segment', 8, '#374151'));
  // Active toggle
  els.push(T(cx+4, cy+268, 200, 12, '☑  Workflow is active', 9, '#374151'));
  saveCancelBtns(cx, cy+292);
}

// ═════════════════════════════════════════════════════════════════════════════════
// ROW 6 — Evidence/Rubric & Reflection (admin-only, dashboard)  (y=7760)
// ═════════════════════════════════════════════════════════════════════════════════
sectionHead(40, rows[5]-60, 'Evidence / Rubric & Reflection (Admin only)');

// ── /evidence-rubric ──
{
  const [sx,sy]=[cols[0],rows[5]];
  browserFrame(sx, sy, SW, SH, '/evidence-rubric', 'Evidence / Rubric');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  pageHdr(cx, cy, 'Evidence / Rubric', 'Features mapped to project rubric');
  // Direct links card
  els.push(R(cx+4, cy+44, 258, 72, '#ffffff', '#e5e7eb', true, 1));
  els.push(T(cx+10, cy+50, 248, 13, 'Direct links', 10, '#374151'));
  [['GitHub repository','Source code'],['Trello board','Planning checklist'],['Vercel','Live deployment'],['Wireframe','Excalidraw design']].forEach(([n,sub],i)=>{
    els.push(R(cx+10+Math.floor(i/2)*132, cy+66+(i%2)*26, 126, 20, '#f0f9ff', '#bae6fd', true, 1));
    els.push(T(cx+14+Math.floor(i/2)*132, cy+70+(i%2)*26, 118, 12, n, 8, '#1e40af'));
  });
  // Evidence sections
  [
    ['CCC.1.3 — Utilize conditionals','Retention risk on Dashboard (HIGH/MED/LOW)\nWorkflow condition builder\nSee: /dashboard, /workflows'],
    ['TS.6.2 — Use AI responsibly','Human-in-the-loop outreach drafts\nNo auto-send, data minimization\nSee: /ai-policy'],
    ['TS.6.3 — Integrate AI tools','AI outreach drafts on Donor detail\nCampaign Insights next steps\nSee: /donors/[id], /dashboard'],
  ].forEach(([title, body], i) => {
    const by=cy+124+i*100;
    els.push(R(cx+4, by, 258, 88, '#ffffff', '#e5e7eb', true, 1));
    els.push(T(cx+10, by+8, 248, 13, title, 10, '#1f2937'));
    els.push(T(cx+10, by+26, 248, 55, body, 8, '#6b7280'));
    els.push(R(cx+10, by+66, 120, 16, '#eff6ff', '#bfdbfe', true, 1));
    els.push(T(cx+14, by+69, 112, 11, 'View where this is used →', 8, '#1e40af'));
  });
}

// ── /reflection ──
{
  const [sx,sy]=[cols[1],rows[5]];
  browserFrame(sx, sy, SW, SH, '/reflection', 'Reflection');
  sidebar(sx, sy, SH);
  const cx=sx+74, cy=sy+28;
  pageHdr(cx, cy, 'Reflection', 'Project reflection and lessons learned');
  [
    ['What went well', 'Creating the rubric evidence and reflection pages went well. The CSS looked fine and it wasn\'t hard to decide what content to include.'],
    ['What was challenging', 'CSS was challenging — after making the public pages I realized the design looked bland. Making them match the rest of the app took iteration.'],
    ['What I learned', 'Building real products involves agreements and explanations, depending on what you\'re doing in the app.'],
    ['How AI helped', 'I used AI to get ideas for how to integrate AI into the app. Started by explaining the app to ChatGPT, then asked how AI could be integrated.'],
  ].forEach(([title, body], i) => {
    const by=cy+44+i*104;
    els.push(R(cx+4, by, 258, 92, '#ffffff', '#e5e7eb', true, 1));
    els.push(T(cx+10, by+8, 248, 13, title, 10, '#1f2937'));
    els.push(T(cx+10, by+26, 248, 62, body, 8, '#6b7280'));
  });
}

// ─── Append and save ────────────────────────────────────────────────────────────
data.elements.push(...els);

// Update screen inventory text to note full coverage
const invText = data.elements.find(e => e.id === 'screen-inventory-text');
if (invText) {
  invText.text = invText.text.replace('Updated: 2026-03-27', 'Updated: 2026-03-27 — All 30 screens wireframed');
  invText.originalText = invText.text;
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
process.stdout.write('Done! Added ' + els.length + ' elements. Total: ' + data.elements.length + '\n');
