/**
 * Inline SVG sprites for pflowAtomIcon.
 *
 * Each entry is the inner HTML of a 24×24 viewBox <svg>. Uses stroke="currentColor"
 * fill="none" so the icon colorizes from the parent's CSS color. Lucide-inspired,
 * MIT-compatible shapes — no Lightning/SLDS runtime dependency.
 *
 * Keys mirror the standard SLDS icon naming (`standard:account`, `utility:search`,
 * etc.) so admins can keep using familiar names without changing their configs.
 * Unknown names fall back to DEFAULT_PATH (a small dot).
 */

const S = 'stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

// A visible, neutral placeholder for unknown icon names. Draws a small rounded
// square with a diagonal slash so it reads as "icon" instead of disappearing.
export const DEFAULT_PATH = `<rect x="4" y="4" width="16" height="16" rx="3" ${S}/><line x1="8" y1="8" x2="16" y2="16" ${S}/>`;

export const ICON_PATHS = {
    // -------- Navigation --------
    'utility:chevronleft':   `<polyline points="15 6 9 12 15 18" ${S}/>`,
    'utility:chevronright':  `<polyline points="9 6 15 12 9 18" ${S}/>`,
    'utility:chevronup':     `<polyline points="6 15 12 9 18 15" ${S}/>`,
    'utility:chevrondown':   `<polyline points="6 9 12 15 18 9" ${S}/>`,
    'utility:right':         `<line x1="5" y1="12" x2="19" y2="12" ${S}/><polyline points="12 5 19 12 12 19" ${S}/>`,
    'utility:left':          `<line x1="19" y1="12" x2="5" y2="12" ${S}/><polyline points="12 19 5 12 12 5" ${S}/>`,
    'utility:close':         `<line x1="18" y1="6" x2="6" y2="18" ${S}/><line x1="6" y1="6" x2="18" y2="18" ${S}/>`,
    'utility:add':           `<line x1="12" y1="5" x2="12" y2="19" ${S}/><line x1="5" y1="12" x2="19" y2="12" ${S}/>`,
    'utility:undo':          `<path d="M9 14l-4-4 4-4" ${S}/><path d="M5 10h9a4 4 0 010 8h-3" ${S}/>`,
    'utility:check':         `<polyline points="20 6 9 17 4 12" ${S}/>`,
    'utility:more':          `<circle cx="12" cy="12" r="1" ${S}/><circle cx="19" cy="12" r="1" ${S}/><circle cx="5" cy="12" r="1" ${S}/>`,

    // -------- Feedback & status --------
    'utility:search':        `<circle cx="11" cy="11" r="7" ${S}/><line x1="21" y1="21" x2="16.65" y2="16.65" ${S}/>`,
    'utility:error':         `<circle cx="12" cy="12" r="10" ${S}/><line x1="12" y1="8" x2="12" y2="12" ${S}/><line x1="12" y1="16" x2="12.01" y2="16" ${S}/>`,
    'utility:warning':       `<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" ${S}/><line x1="12" y1="9" x2="12" y2="13" ${S}/><line x1="12" y1="17" x2="12.01" y2="17" ${S}/>`,
    'utility:success':       `<circle cx="12" cy="12" r="10" ${S}/><polyline points="8 12 11 15 16 9" ${S}/>`,
    'utility:info':          `<circle cx="12" cy="12" r="10" ${S}/><line x1="12" y1="16" x2="12" y2="12" ${S}/><line x1="12" y1="8" x2="12.01" y2="8" ${S}/>`,
    'utility:preview':       `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" ${S}/><circle cx="12" cy="12" r="3" ${S}/>`,
    'utility:favorite':      `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" ${S}/>`,
    'utility:picklist':      `<polyline points="6 9 12 15 18 9" ${S}/><line x1="3" y1="5" x2="21" y2="5" ${S}/>`,

    // -------- Standard SLDS object icons --------
    'standard:account':      `<path d="M3 21V10l9-6 9 6v11" ${S}/><path d="M9 21v-6h6v6" ${S}/>`,
    'standard:contact':      `<circle cx="12" cy="8" r="4" ${S}/><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" ${S}/>`,
    'standard:opportunity':  `<polyline points="3 17 9 11 13 15 21 7" ${S}/><polyline points="14 7 21 7 21 14" ${S}/>`,
    'standard:document':     `<path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" ${S}/><polyline points="13 2 13 9 20 9" ${S}/>`,
    'standard:product':      `<path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" ${S}/><polyline points="3 7 12 12 21 7" ${S}/><line x1="12" y1="22" x2="12" y2="12" ${S}/>`,
    'standard:event':        `<rect x="3" y="4" width="18" height="18" rx="2" ry="2" ${S}/><line x1="16" y1="2" x2="16" y2="6" ${S}/><line x1="8" y1="2" x2="8" y2="6" ${S}/><line x1="3" y1="10" x2="21" y2="10" ${S}/>`,
    'standard:photo':        `<rect x="3" y="3" width="18" height="18" rx="2" ry="2" ${S}/><circle cx="8.5" cy="8.5" r="1.5" ${S}/><polyline points="21 15 16 10 5 21" ${S}/>`,
    'standard:custom':       `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" ${S}/>`,
    'standard:case':         `<rect x="2" y="7" width="20" height="14" rx="2" ry="2" ${S}/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" ${S}/>`,
    'standard:lead':         `<path d="M12 1l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 8l6-1z" ${S}/>`,
    'standard:home':         `<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" ${S}/><polyline points="9 22 9 12 15 12 15 22" ${S}/>`,
    'standard:feed':         `<path d="M4 11a9 9 0 019 9" ${S}/><path d="M4 4a16 16 0 0116 16" ${S}/><circle cx="5" cy="19" r="1" ${S}/>`,

    // -------- Utility content / layout --------
    'utility:moneybag':      `<path d="M12 6V2M9 6h6M7 11c-2 0-4 3-4 7a4 4 0 004 4h10a4 4 0 004-4c0-4-2-7-4-7z" ${S}/>`,
    'utility:date_time':     `<circle cx="12" cy="12" r="10" ${S}/><polyline points="12 6 12 12 16 14" ${S}/>`,
    'utility:event':         `<rect x="3" y="4" width="18" height="18" rx="2" ry="2" ${S}/><line x1="16" y1="2" x2="16" y2="6" ${S}/><line x1="8" y1="2" x2="8" y2="6" ${S}/><line x1="3" y1="10" x2="21" y2="10" ${S}/>`,
    'utility:open':          `<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" ${S}/><polyline points="15 3 21 3 21 9" ${S}/><line x1="10" y1="14" x2="21" y2="3" ${S}/>`,
    'utility:settings':      `<circle cx="12" cy="12" r="3" ${S}/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" ${S}/>`,
    'utility:threedots':     `<circle cx="12" cy="12" r="1" ${S}/><circle cx="19" cy="12" r="1" ${S}/><circle cx="5" cy="12" r="1" ${S}/>`,
    'utility:refresh':       `<polyline points="23 4 23 10 17 10" ${S}/><polyline points="1 20 1 14 7 14" ${S}/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" ${S}/>`,
    'utility:signal':        `<path d="M2 16.1A5 5 0 015.9 20M2 12.05A9 9 0 019.95 20" ${S}/><line x1="2" y1="20" x2="2.01" y2="20" ${S}/>`,
    'utility:record':        `<circle cx="12" cy="12" r="4" fill="currentColor"/>`,
    'utility:layers':        `<polygon points="12 2 2 7 12 12 22 7 12 2" ${S}/><polyline points="2 17 12 22 22 17" ${S}/><polyline points="2 12 12 17 22 12" ${S}/>`,
    'utility:rows':          `<rect x="3" y="4" width="18" height="4" rx="1" ${S}/><rect x="3" y="10" width="18" height="4" rx="1" ${S}/><rect x="3" y="16" width="18" height="4" rx="1" ${S}/>`,
    'utility:apps':          `<rect x="3" y="3" width="7" height="7" rx="1" ${S}/><rect x="14" y="3" width="7" height="7" rx="1" ${S}/><rect x="3" y="14" width="7" height="7" rx="1" ${S}/><rect x="14" y="14" width="7" height="7" rx="1" ${S}/>`,
    'utility:pill':          `<rect x="3" y="9" width="18" height="6" rx="3" ${S}/>`,
    'utility:table':         `<rect x="3" y="3" width="18" height="18" rx="2" ${S}/><line x1="3" y1="9" x2="21" y2="9" ${S}/><line x1="3" y1="15" x2="21" y2="15" ${S}/><line x1="9" y1="3" x2="9" y2="21" ${S}/>`,
    'utility:kanban':        `<rect x="3" y="3" width="6" height="18" rx="1" ${S}/><rect x="11" y="3" width="6" height="12" rx="1" ${S}/><rect x="19" y="3" width="2" height="9" rx="1" ${S}/>`,
    'utility:layout_banner': `<rect x="3" y="3" width="18" height="18" rx="2" ${S}/><line x1="3" y1="9" x2="21" y2="9" ${S}/>`,
    'utility:database':      `<ellipse cx="12" cy="5" rx="9" ry="3" ${S}/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3" ${S}/>`,
    'utility:palette':       `<circle cx="13.5" cy="6.5" r="0.6" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.6" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.6" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.6" fill="currentColor"/><path d="M12 2a10 10 0 100 20 2.5 2.5 0 002.5-2.5c0-.7-.27-1.36-.76-1.86-.48-.49-.76-1.15-.76-1.85 0-1.38 1.13-2.5 2.52-2.5H18a4 4 0 004-4A9.94 9.94 0 0012 2z" ${S}/>`,
    'utility:setup_modal':   `<rect x="3" y="3" width="18" height="18" rx="2" ${S}/><circle cx="9" cy="9" r="2" ${S}/><path d="M21 15l-3.09-3.09a2 2 0 00-2.83 0L3 21" ${S}/>`,
    'utility:help':          `<circle cx="12" cy="12" r="10" ${S}/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" ${S}/><line x1="12" y1="17" x2="12.01" y2="17" ${S}/>`,

    // -------- Additional standard objects --------
    'standard:announcement': `<path d="M3 11v2a1 1 0 001 1h1l3 7h3l-2-7h5a2 2 0 002-2v-2a2 2 0 00-2-2h-5l2-7H8l-3 7H4a1 1 0 00-1 1z" ${S}/><path d="M20 7v10" ${S}/>`,
    'standard:task':         `<path d="M9 11l3 3L22 4" ${S}/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" ${S}/>`,
    'standard:user':         `<circle cx="12" cy="8" r="4" ${S}/><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" ${S}/>`,
    'standard:note':         `<path d="M4 4a2 2 0 012-2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2z" ${S}/><polyline points="14 2 14 8 20 8" ${S}/><line x1="8" y1="13" x2="16" y2="13" ${S}/><line x1="8" y1="17" x2="14" y2="17" ${S}/>`,
    'standard:email':        `<rect x="3" y="5" width="18" height="14" rx="2" ${S}/><polyline points="3 7 12 13 21 7" ${S}/>`,
    'standard:call':         `<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" ${S}/>`,
    'standard:chat':         `<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" ${S}/>`,
    'standard:app':          `<rect x="3" y="3" width="7" height="7" rx="1" ${S}/><rect x="14" y="3" width="7" height="7" rx="1" ${S}/><rect x="3" y="14" width="7" height="7" rx="1" ${S}/><rect x="14" y="14" width="7" height="7" rx="1" ${S}/>`,
    'standard:flow':         `<circle cx="6" cy="12" r="3" ${S}/><circle cx="18" cy="6" r="3" ${S}/><circle cx="18" cy="18" r="3" ${S}/><line x1="8.5" y1="10.5" x2="15.5" y2="7" ${S}/><line x1="8.5" y1="13.5" x2="15.5" y2="17" ${S}/>`,
    'standard:orders':        `<rect x="3" y="4" width="18" height="16" rx="2" ${S}/><path d="M7 8h10" ${S}/><path d="M7 12h10" ${S}/><path d="M7 16h5" ${S}/>`,
    'standard:campaign':      `<polygon points="3 11 3 13 11 13 7 19 7 21 17 13 17 11 17 3 7 11 3 11" ${S}/>`,
    'standard:dashboard':     `<path d="M3 12a9 9 0 1118 0" ${S}/><path d="M12 12l5-3" ${S}/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>`,
    'standard:service':       `<path d="M12 2a5 5 0 00-5 5v5H5a2 2 0 00-2 2v2a2 2 0 002 2h1" ${S}/><path d="M12 2a5 5 0 015 5v5h2a2 2 0 012 2v2a2 2 0 01-2 2h-1" ${S}/>`,
    'standard:quotes':        `<path d="M6 17h3V7H6M15 17h3V7h-3" ${S}/>`,
    'standard:entitlement':   `<path d="M9 12l2 2 4-4" ${S}/><circle cx="12" cy="12" r="10" ${S}/>`,
    'standard:report':        `<path d="M3 3v18h18" ${S}/><polyline points="7 15 12 10 16 14 21 9" ${S}/>`,
    'standard:folder':        `<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" ${S}/>`,
    'standard:file':          `<path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" ${S}/><polyline points="13 2 13 9 20 9" ${S}/>`,
    'standard:group':         `<circle cx="9" cy="7" r="4" ${S}/><circle cx="17" cy="7" r="3" ${S}/><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" ${S}/><path d="M22 21v-2a4 4 0 00-3-3.87" ${S}/>`,
    'standard:users':         `<circle cx="9" cy="7" r="4" ${S}/><circle cx="17" cy="7" r="3" ${S}/><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" ${S}/><path d="M22 21v-2a4 4 0 00-3-3.87" ${S}/>`,
    'standard:location':      `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" ${S}/><circle cx="12" cy="10" r="3" ${S}/>`,
    'standard:lightning':     `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" ${S}/>`,
    'standard:sales_path':    `<path d="M3 12l5-5v3h8V7l5 5-5 5v-3H8v3z" ${S}/>`,
    'standard:poll':          `<line x1="12" y1="20" x2="12" y2="10" ${S}/><line x1="18" y1="20" x2="18" y2="4" ${S}/><line x1="6" y1="20" x2="6" y2="16" ${S}/>`,
    'standard:record':        `<rect x="3" y="3" width="18" height="18" rx="2" ${S}/><line x1="7" y1="8" x2="17" y2="8" ${S}/><line x1="7" y1="12" x2="17" y2="12" ${S}/><line x1="7" y1="16" x2="13" y2="16" ${S}/>`,
    'standard:entity':        `<path d="M3 21V10l9-6 9 6v11" ${S}/><path d="M9 21v-6h6v6" ${S}/>`,
    'standard:work_queue':    `<rect x="3" y="4" width="18" height="4" rx="1" ${S}/><rect x="3" y="10" width="18" height="4" rx="1" ${S}/><rect x="3" y="16" width="18" height="4" rx="1" ${S}/>`,
    'standard:question_feed': `<circle cx="12" cy="12" r="10" ${S}/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" ${S}/><line x1="12" y1="17" x2="12.01" y2="17" ${S}/>`,
    'standard:buyer_account': `<circle cx="12" cy="10" r="3" ${S}/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" ${S}/><rect x="2" y="3" width="20" height="18" rx="2" ${S}/>`,
    'standard:asset_object':  `<rect x="4" y="4" width="16" height="16" rx="2" ${S}/><circle cx="12" cy="12" r="3" ${S}/>`,
    'standard:apps':          `<rect x="3" y="3" width="7" height="7" rx="1" ${S}/><rect x="14" y="3" width="7" height="7" rx="1" ${S}/><rect x="3" y="14" width="7" height="7" rx="1" ${S}/><rect x="14" y="14" width="7" height="7" rx="1" ${S}/>`,

    // -------- Additional utility icons --------
    'utility:edit':          `<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" ${S}/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z" ${S}/>`,
    'utility:delete':        `<polyline points="3 6 5 6 21 6" ${S}/><path d="M19 6l-1.5 14a2 2 0 01-2 2h-7a2 2 0 01-2-2L5 6" ${S}/><path d="M10 11v6M14 11v6" ${S}/><path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" ${S}/>`,
    'utility:copy':          `<rect x="9" y="9" width="13" height="13" rx="2" ${S}/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" ${S}/>`,
    'utility:save':          `<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" ${S}/><polyline points="17 21 17 13 7 13 7 21" ${S}/><polyline points="7 3 7 8 15 8" ${S}/>`,
    'utility:download':      `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" ${S}/><polyline points="7 10 12 15 17 10" ${S}/><line x1="12" y1="15" x2="12" y2="3" ${S}/>`,
    'utility:upload':        `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" ${S}/><polyline points="17 8 12 3 7 8" ${S}/><line x1="12" y1="3" x2="12" y2="15" ${S}/>`,
    'utility:share':         `<circle cx="18" cy="5" r="3" ${S}/><circle cx="6" cy="12" r="3" ${S}/><circle cx="18" cy="19" r="3" ${S}/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" ${S}/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" ${S}/>`,
    'utility:link':          `<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" ${S}/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" ${S}/>`,
    'utility:filter':        `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" ${S}/>`,
    'utility:sort':          `<path d="M3 6h18M6 12h12M9 18h6" ${S}/>`,
    'utility:calendar':      `<rect x="3" y="4" width="18" height="18" rx="2" ry="2" ${S}/><line x1="16" y1="2" x2="16" y2="6" ${S}/><line x1="8" y1="2" x2="8" y2="6" ${S}/><line x1="3" y1="10" x2="21" y2="10" ${S}/>`,
    'utility:clock':         `<circle cx="12" cy="12" r="10" ${S}/><polyline points="12 6 12 12 16 14" ${S}/>`,
    'utility:user':          `<circle cx="12" cy="8" r="4" ${S}/><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" ${S}/>`,
    'utility:users':         `<circle cx="9" cy="7" r="4" ${S}/><circle cx="17" cy="7" r="3" ${S}/><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" ${S}/>`,
    'utility:home':          `<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" ${S}/><polyline points="9 22 9 12 15 12 15 22" ${S}/>`,
    'utility:bookmark':      `<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" ${S}/>`,
    'utility:tag':           `<path d="M20 12l-8.58 8.58a2 2 0 01-2.83 0L2 13.59V4h9.59z" ${S}/><line x1="7" y1="7" x2="7.01" y2="7" ${S}/>`,
    'utility:lock':          `<rect x="3" y="11" width="18" height="11" rx="2" ${S}/><path d="M7 11V7a5 5 0 0110 0v4" ${S}/>`,
    'utility:unlock':        `<rect x="3" y="11" width="18" height="11" rx="2" ${S}/><path d="M7 11V7a5 5 0 019.9-1" ${S}/>`,
    'utility:key':           `<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" ${S}/>`,
    'utility:shield':        `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" ${S}/>`,
    'utility:zap':           `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" ${S}/>`,
    'utility:star':          `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" ${S}/>`,
    'utility:heart':         `<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" ${S}/>`,
    'utility:cart':          `<circle cx="9" cy="21" r="1" ${S}/><circle cx="20" cy="21" r="1" ${S}/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" ${S}/>`,
    'utility:money':         `<line x1="12" y1="1" x2="12" y2="23" ${S}/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" ${S}/>`,
    'utility:chart':         `<line x1="12" y1="20" x2="12" y2="10" ${S}/><line x1="18" y1="20" x2="18" y2="4" ${S}/><line x1="6" y1="20" x2="6" y2="16" ${S}/>`,
    'utility:target':        `<circle cx="12" cy="12" r="10" ${S}/><circle cx="12" cy="12" r="6" ${S}/><circle cx="12" cy="12" r="2" ${S}/>`,
    'utility:thumbs_up':     `<path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" ${S}/>`,
    'utility:play':          `<polygon points="5 3 19 12 5 21 5 3" ${S}/>`,
    'utility:pause':         `<rect x="6" y="4" width="4" height="16" ${S}/><rect x="14" y="4" width="4" height="16" ${S}/>`,
    'utility:record_lookup': `<circle cx="11" cy="11" r="7" ${S}/><line x1="21" y1="21" x2="16.65" y2="16.65" ${S}/>`,
    'utility:bell':          `<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" ${S}/><path d="M13.73 21a2 2 0 01-3.46 0" ${S}/>`,
    'utility:knowledge_base':`<path d="M4 19.5A2.5 2.5 0 016.5 17H20" ${S}/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" ${S}/>`,
    'utility:new':           `<line x1="12" y1="5" x2="12" y2="19" ${S}/><line x1="5" y1="12" x2="19" y2="12" ${S}/>`,
    'utility:add_contact':   `<circle cx="12" cy="8" r="4" ${S}/><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" ${S}/><line x1="20" y1="8" x2="20" y2="14" ${S}/><line x1="23" y1="11" x2="17" y2="11" ${S}/>`,
    'utility:announcement':  `<path d="M3 11v2a1 1 0 001 1h1l3 7h3l-2-7h5a2 2 0 002-2v-2a2 2 0 00-2-2h-5l2-7H8l-3 7H4a1 1 0 00-1 1z" ${S}/><path d="M20 7v10" ${S}/>`
};

/**
 * Normalize an icon name — accepts `standard:account`, `utility:search`, or
 * bare keys. Strips SLDS-style colons if the key is unknown and retries.
 */
export function resolveIconContent(name) {
    if (!name) return DEFAULT_PATH;
    if (ICON_PATHS[name]) return ICON_PATHS[name];
    // Try with standard: or utility: prefix stripped
    const bare = name.includes(':') ? name.split(':').pop() : name;
    const withUtility = `utility:${bare}`;
    const withStandard = `standard:${bare}`;
    if (ICON_PATHS[withUtility]) return ICON_PATHS[withUtility];
    if (ICON_PATHS[withStandard]) return ICON_PATHS[withStandard];
    return DEFAULT_PATH;
}
