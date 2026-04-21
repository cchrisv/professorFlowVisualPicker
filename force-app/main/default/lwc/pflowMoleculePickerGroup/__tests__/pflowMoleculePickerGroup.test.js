import { createElement } from 'lwc';
import PflowMoleculePickerGroup from 'c/pflowMoleculePickerGroup';

const ITEMS = [
    { id: '1', label: 'Alpha', sublabel: '', icon: '', badge: '', helpText: '', value: 'a', disabled: false },
    { id: '2', label: 'Beta', sublabel: '', icon: '', badge: '', helpText: '', value: 'b', disabled: false },
    { id: '3', label: 'Gamma', sublabel: '', icon: '', badge: '', helpText: '', value: 'c', disabled: false }
];

function mount(overrides = {}) {
    const el = createElement('c-pflow-molecule-picker-group', { is: PflowMoleculePickerGroup });
    el.items = overrides.items || ITEMS;
    el.variant = overrides.variant || 'grid';
    el.selectionMode = overrides.selectionMode || 'single';
    el.selectedValues = overrides.selectedValues || [];
    el.minSelections = overrides.minSelections || 0;
    el.maxSelections = overrides.maxSelections;
    el.showSelectAll = overrides.showSelectAll || false;
    el.enableSearch = overrides.enableSearch || false;
    document.body.appendChild(el);
    return el;
}

function dispatchCardSelect(hostEl, value) {
    const card = hostEl.shadowRoot.querySelector('c-pflow-atom-visual-pick');
    card.dispatchEvent(new CustomEvent('cardselect', {
        detail: { value },
        bubbles: true
    }));
}

describe('c-pflow-molecule-picker-group', () => {
    afterEach(() => {
        while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    });

    it('renders one tile per item', async () => {
        const el = mount();
        await Promise.resolve();
        const cards = el.shadowRoot.querySelectorAll('c-pflow-atom-visual-pick');
        expect(cards).toHaveLength(3);
    });

    it('emits selectionchange with a single value in single-select mode', async () => {
        const el = mount();
        const handler = jest.fn();
        el.addEventListener('selectionchange', handler);
        await Promise.resolve();
        dispatchCardSelect(el, 'b');
        await Promise.resolve();
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail.values).toEqual(['b']);
    });

    it('toggles values in multi-select mode', async () => {
        const el = mount({ selectionMode: 'multi' });
        const handler = jest.fn();
        el.addEventListener('selectionchange', handler);
        await Promise.resolve();
        dispatchCardSelect(el, 'a');
        dispatchCardSelect(el, 'b');
        expect(handler).toHaveBeenCalledTimes(2);
        expect(handler.mock.calls[1][0].detail.values).toEqual(['a', 'b']);
        dispatchCardSelect(el, 'a');
        expect(handler.mock.calls[2][0].detail.values).toEqual(['b']);
    });

    it('respects maxSelections', async () => {
        const el = mount({ selectionMode: 'multi', maxSelections: 1 });
        const handler = jest.fn();
        el.addEventListener('selectionchange', handler);
        await Promise.resolve();
        dispatchCardSelect(el, 'a');
        dispatchCardSelect(el, 'b');
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail.values).toEqual(['a']);
    });

    it('shows Select all / Clear all toolbar in multi with showSelectAll', async () => {
        const el = mount({ selectionMode: 'multi', showSelectAll: true });
        await Promise.resolve();
        const buttons = el.shadowRoot.querySelectorAll('.pflow-toolbar__btn');
        expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('ignores events in preview mode', async () => {
        const el = mount();
        el.previewMode = true;
        const handler = jest.fn();
        el.addEventListener('selectionchange', handler);
        await Promise.resolve();
        dispatchCardSelect(el, 'b');
        expect(handler).not.toHaveBeenCalled();
    });

    it('renders the rich combobox for dropdown variant', async () => {
        const el = mount({ variant: 'dropdown' });
        await Promise.resolve();
        expect(el.shadowRoot.querySelector('c-pflow-molecule-rich-combobox')).not.toBeNull();
    });

    it('passes rich dropdown changes through selectionchange', async () => {
        const el = mount({ variant: 'dropdown' });
        const handler = jest.fn();
        el.addEventListener('selectionchange', handler);
        await Promise.resolve();

        const combobox = el.shadowRoot.querySelector('c-pflow-molecule-rich-combobox');
        combobox.dispatchEvent(new CustomEvent('change', {
            detail: { value: 'c' },
            bubbles: true
        }));
        await Promise.resolve();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail.values).toEqual(['c']);
    });
});
