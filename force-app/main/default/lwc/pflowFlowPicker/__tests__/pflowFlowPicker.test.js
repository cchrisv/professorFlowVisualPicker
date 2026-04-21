import { createElement } from 'lwc';
import PflowFlowPicker from 'c/pflowFlowPicker';

function mount(configOverrides = {}) {
    const config = {
        dataSource: 'custom',
        layout: 'grid',
        selectionMode: 'single',
        autoAdvance: false,
        label: 'Choose one',
        custom: { items: [{ label: 'A', value: 'a' }] },
        ...configOverrides
    };
    const el = createElement('c-pflow-flow-picker', { is: PflowFlowPicker });
    el.pickerConfigJson = JSON.stringify(config);
    document.body.appendChild(el);
    return el;
}

describe('c-pflow-flow-picker', () => {
    afterEach(() => {
        while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    });

    it('parses pickerConfigJson and passes to organism', async () => {
        const el = mount();
        await Promise.resolve();
        const organism = el.shadowRoot.querySelector('c-pflow-organism-data-picker');
        expect(organism).not.toBeNull();
        expect(organism.label).toBe('Choose one');
        expect(organism.sourceType).toBe('custom');
    });

    it('falls back to defaults on malformed JSON', async () => {
        const el = createElement('c-pflow-flow-picker', { is: PflowFlowPicker });
        el.pickerConfigJson = '{ not valid';
        document.body.appendChild(el);
        await Promise.resolve();
        const organism = el.shadowRoot.querySelector('c-pflow-organism-data-picker');
        expect(organism.sourceType).toBe('custom');
    });

    it('validate() delegates to the organism', async () => {
        const el = mount();
        await Promise.resolve();
        const result = el.validate();
        expect(result).toBeDefined();
        expect(result.isValid).toBeDefined();
    });
});
