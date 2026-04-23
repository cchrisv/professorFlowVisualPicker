import { createElement } from 'lwc';
import PflowAtomToggle from 'c/pflowAtomToggle';

function mount(props = {}) {
    const el = createElement('c-pflow-atom-toggle', { is: PflowAtomToggle });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

function fireInputChange(el, { checked, name }) {
    const input = el.shadowRoot.querySelector('lightning-input');
    Object.defineProperty(input, 'checked', { value: checked, configurable: true });
    Object.defineProperty(input, 'name', { value: name, configurable: true });
    input.dispatchEvent(new CustomEvent('change'));
}

describe('c-pflow-atom-toggle', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders a lightning-input toggle with the provided label', () => {
        const el = mount({ label: 'Show Border', name: 'showBorder' });
        const input = el.shadowRoot.querySelector('lightning-input');
        expect(input).not.toBeNull();
        expect(input.type).toBe('toggle');
        expect(input.label).toBe('Show Border');
    });

    describe('isChecked value coercion', () => {
        it('treats boolean true as checked', () => {
            expect(mount({ checked: true }).isChecked).toBe(true);
        });

        it("treats string 'true' as checked", () => {
            expect(mount({ checked: 'true' }).isChecked).toBe(true);
        });

        it('treats the CB_TRUE sentinel as checked', () => {
            expect(mount({ checked: 'CB_TRUE' }).isChecked).toBe(true);
        });

        it('treats false / undefined / empty / CB_FALSE as unchecked', () => {
            expect(mount({ checked: false }).isChecked).toBe(false);
            expect(mount({}).isChecked).toBe(false);
            expect(mount({ checked: '' }).isChecked).toBe(false);
            expect(mount({ checked: 'CB_FALSE' }).isChecked).toBe(false);
        });
    });

    describe('wireFormat = "boolean" (default)', () => {
        it('fires toggle with {name, checked:true} when the input turns on', () => {
            const el = mount({ name: 'enableThing' });
            const handler = jest.fn();
            el.addEventListener('toggle', handler);

            fireInputChange(el, { checked: true, name: 'enableThing' });

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler.mock.calls[0][0].detail).toEqual({
                name: 'enableThing',
                checked: true
            });
        });

        it('fires toggle with {name, checked:false} when the input turns off', () => {
            const el = mount({ name: 'enableThing', checked: true });
            const handler = jest.fn();
            el.addEventListener('toggle', handler);

            fireInputChange(el, { checked: false, name: 'enableThing' });

            expect(handler.mock.calls[0][0].detail).toEqual({
                name: 'enableThing',
                checked: false
            });
        });
    });

    describe('wireFormat = "cb-sentinel" (legacy Flow CPE)', () => {
        it('fires toggle with CB_TRUE sentinel when the input turns on', () => {
            const el = mount({ name: 'enableThing', wireFormat: 'cb-sentinel' });
            const handler = jest.fn();
            el.addEventListener('toggle', handler);

            fireInputChange(el, { checked: true, name: 'enableThing' });

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler.mock.calls[0][0].detail).toEqual({
                id: 'enableThing',
                newValue: true,
                newValueDataType: 'Boolean',
                newStringValue: 'CB_TRUE'
            });
        });

        it('fires toggle with CB_FALSE sentinel when the input turns off', () => {
            const el = mount({
                name: 'enableThing',
                checked: true,
                wireFormat: 'cb-sentinel'
            });
            const handler = jest.fn();
            el.addEventListener('toggle', handler);

            fireInputChange(el, { checked: false, name: 'enableThing' });

            expect(handler.mock.calls[0][0].detail.newStringValue).toBe('CB_FALSE');
        });
    });

    it('passes fieldLevelHelp through to lightning-input as native field-level-help (tooltip)', () => {
        const help = 'Toggle to enable the border';
        const el = mount({ fieldLevelHelp: help });
        return Promise.resolve().then(() => {
            const input = el.shadowRoot.querySelector('lightning-input');
            expect(input.fieldLevelHelp).toBe(help);
            expect(el.shadowRoot.querySelector('.slds-form-element__help')).toBeNull();
        });
    });

    it('respects the disabled prop', () => {
        const el = mount({ disabled: true });
        return Promise.resolve().then(() => {
            const input = el.shadowRoot.querySelector('lightning-input');
            expect(input.disabled).toBe(true);
        });
    });
});
