import { LightningElement, api } from 'lwc';

const VALID_DISPLAY = new Set(['inline', 'bullet-list', 'table-row', 'stacked', 'timeline']);
const VALID_SEPARATOR = new Set(['dot', 'pipe', 'slash', 'dash', 'chevron', 'none']);
const VALID_FORMATS = new Set([
    'text', 'number', 'currency', 'date', 'rating',
    'star-rating', 'progress-bar', 'avatar-stack',
    'tabular-numeric', 'eyebrow'
]);

function clampPercent(raw) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
}

function parseAvatarList(raw) {
    if (Array.isArray(raw)) return raw.slice(0, 8);
    if (typeof raw === 'string') {
        return raw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean).slice(0, 8);
    }
    return [];
}

function initials(name) {
    if (!name) return '?';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default class PflowAtomMetaRow extends LightningElement {
    @api entries = [];
    @api display = 'inline';
    @api separator = 'dot';

    get computedDisplay() {
        return VALID_DISPLAY.has(this.display) ? this.display : 'inline';
    }

    get computedSeparator() {
        return VALID_SEPARATOR.has(this.separator) ? this.separator : 'dot';
    }

    get rootClass() {
        return `pflow-meta-row pflow-meta-row_${this.computedDisplay} pflow-meta-row_sep-${this.computedSeparator}`;
    }

    get normalizedEntries() {
        if (!Array.isArray(this.entries)) return [];
        return this.entries.map((entry, index) => {
            const fmt = VALID_FORMATS.has(entry?.format) ? entry.format : 'text';
            const base = {
                key: entry.key || `meta-${index}`,
                label: entry.label,
                value: entry.value,
                icon: entry.icon,
                format: fmt,
                hasLabel: Boolean(entry.label),
                hasIcon: Boolean(entry.icon),
                itemClass: `pflow-meta-row__item pflow-meta-row__item_${fmt}`,
                isProgress: fmt === 'progress-bar',
                isAvatars: fmt === 'avatar-stack',
                isEyebrow: fmt === 'eyebrow',
                isStarRating: fmt === 'star-rating' || fmt === 'rating',
                isTabular: fmt === 'tabular-numeric',
                isPlain: fmt === 'text' || fmt === 'number' || fmt === 'currency' || fmt === 'date'
            };
            if (base.isProgress) {
                const pct = clampPercent(entry.rawValue ?? entry.value);
                base.percent = pct;
                base.barFillStyle = `width:${pct}%`;
            }
            if (base.isAvatars) {
                const list = parseAvatarList(entry.rawValue ?? entry.value);
                base.avatars = list.map((a, idx) => {
                    const isUrl = typeof a === 'string' && /^https?:/i.test(a);
                    return {
                        key: `av-${idx}`,
                        url: isUrl ? a : '',
                        initials: isUrl ? '' : initials(a),
                        isUrl,
                        className: `pflow-meta-row__avatar pflow-meta-row__avatar_${idx % 5}`
                    };
                });
                base.overflow = list.length > 4 ? list.length - 4 : 0;
                base.visibleAvatars = base.avatars.slice(0, 4);
            }
            return base;
        });
    }
}
