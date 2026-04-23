import { LightningElement, api } from 'lwc';
import { resolveIconContent } from './iconPaths';

const SIZE_ALIASES = {
    'xx-small': 'xs',
    'x-small':  'sm',
    'small':    'sm',
    'medium':   'md',
    'large':    'lg',
    'xs': 'xs', 'sm': 'sm', 'md': 'md', 'lg': 'lg', 'xl': 'xl'
};

const VALID_VARIANTS = new Set(['error', 'warning', 'success', 'brand', 'inverse']);

export default class PflowAtomIcon extends LightningElement {
    @api name = '';
    @api size = 'md';
    @api alternativeText = '';
    @api title = '';
    /** @type {'error'|'warning'|'success'|'brand'|'inverse'|undefined} */
    @api variant;

    get resolvedSize() {
        return SIZE_ALIASES[this.size] || 'md';
    }

    get wrapperClass() {
        const cls = ['pflow-icon', `pflow-icon_size-${this.resolvedSize}`];
        if (VALID_VARIANTS.has(this.variant)) {
            cls.push(`pflow-icon_variant-${this.variant}`);
        }
        return cls.join(' ');
    }

    get role() {
        return this.alternativeText ? 'img' : null;
    }

    get ariaHidden() {
        return this.alternativeText ? null : 'true';
    }

    renderedCallback() {
        const svg = this.template.querySelector('svg');
        if (!svg) return;
        if (svg.dataset.iconName === this.name) return;
        svg.innerHTML = resolveIconContent(this.name);
        svg.dataset.iconName = this.name || '';
    }
}
