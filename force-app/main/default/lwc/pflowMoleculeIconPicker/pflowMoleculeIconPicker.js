import { LightningElement, api, track } from 'lwc';
import { ICON_SETS, iconsForSet, filterIcons, findIconByName } from './iconCatalog';

const MODE_COMBOBOX = 'combobox';
const MODE_TABS = 'tabs';

export default class PflowMoleculeIconPicker extends LightningElement {
    @api label = 'Icon';
    @api fieldLevelHelp = '';
    @api required = false;
    @api disabled = false;
    @api mode = MODE_COMBOBOX;

    _value = '';
    _allowedSets = [...ICON_SETS];
    @track _searchTerm = '';
    @track _activeSet = 'standard';
    @track _isOpen = false;

    @api
    get value() { return this._value; }
    set value(v) {
        this._value = v || '';
        const match = findIconByName(this._value);
        if (match) this._activeSet = match.set;
    }

    @api
    get allowedSets() { return this._allowedSets; }
    set allowedSets(v) {
        if (Array.isArray(v) && v.length > 0) {
            this._allowedSets = v.filter((s) => ICON_SETS.includes(s));
            if (!this._allowedSets.includes(this._activeSet)) {
                this._activeSet = this._allowedSets[0];
            }
        }
    }

    get isCombobox() { return this.mode === MODE_COMBOBOX; }
    get isTabs() { return this.mode === MODE_TABS; }

    get setTabs() {
        return this._allowedSets.map((s) => ({
            key: s,
            label: s.charAt(0).toUpperCase() + s.slice(1),
            active: s === this._activeSet,
            buttonClass: s === this._activeSet
                ? 'slds-tabs_default__link slds-is-active'
                : 'slds-tabs_default__link',
            liClass: s === this._activeSet
                ? 'slds-tabs_default__item slds-is-active'
                : 'slds-tabs_default__item',
            ariaSelected: String(s === this._activeSet),
            tabIndex: s === this._activeSet ? 0 : -1
        }));
    }

    get visibleIcons() {
        const base = iconsForSet(this._activeSet);
        const filtered = filterIcons(base, this._searchTerm);
        return filtered.map((entry) => ({
            ...entry,
            selected: entry.iconName === this._value,
            buttonClass: entry.iconName === this._value
                ? 'pflow-icon-cell pflow-icon-cell_selected'
                : 'pflow-icon-cell'
        }));
    }

    get selectedEntry() {
        return findIconByName(this._value);
    }

    get selectedLabel() {
        const e = this.selectedEntry;
        return e ? e.iconName : '';
    }

    get placeholderLabel() {
        return this.selectedLabel || 'Select an icon...';
    }

    get hasSelection() { return Boolean(this._value); }
    get comboboxPanelClass() {
        return this._isOpen
            ? 'pflow-combobox__panel pflow-combobox__panel_open'
            : 'pflow-combobox__panel';
    }

    handleTabClick(event) {
        const key = event.currentTarget.dataset.set;
        if (key) this._activeSet = key;
    }

    handleTabKeydown(event) {
        const { key } = event;
        if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') return;
        event.preventDefault();
        const sets = this._allowedSets;
        const current = sets.indexOf(this._activeSet);
        let next = current;
        if (key === 'ArrowLeft') next = (current - 1 + sets.length) % sets.length;
        else if (key === 'ArrowRight') next = (current + 1) % sets.length;
        else if (key === 'Home') next = 0;
        else if (key === 'End') next = sets.length - 1;
        this._activeSet = sets[next];
    }

    handleSearchInput(event) {
        this._searchTerm = event.target.value || '';
    }

    handleIconClick(event) {
        const iconName = event.currentTarget.dataset.icon;
        this.selectIcon(iconName);
    }

    handleIconKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
            const iconName = event.currentTarget.dataset.icon;
            this.selectIcon(iconName);
        }
    }

    handleOpen() {
        if (this.disabled) return;
        this._isOpen = !this._isOpen;
    }

    handleBlur() {
        setTimeout(() => { this._isOpen = false; }, 150);
    }

    handleClear(event) {
        event.stopPropagation();
        this.selectIcon('');
    }

    selectIcon(iconName) {
        this._value = iconName || '';
        this._isOpen = false;
        this.dispatchEvent(new CustomEvent('iconselect', {
            detail: { iconName: this._value },
            bubbles: true,
            composed: true
        }));
    }

    @api
    focus() {
        const trigger = this.template.querySelector('.pflow-combobox__trigger');
        if (trigger) trigger.focus();
    }

    @api
    reportValidity() {
        if (!this.required) return true;
        return Boolean(this._value);
    }
}
