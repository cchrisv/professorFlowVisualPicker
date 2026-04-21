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

export default class PflowAtomIcon extends LightningElement {
    @api name = '';
    @api size = 'md';
    @api alternativeText = '';
    @api title = '';

    get resolvedSize() {
        return SIZE_ALIASES[this.size] || 'md';
    }

    get wrapperClass() {
        return `pflow-icon pflow-icon_size-${this.resolvedSize}`;
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
