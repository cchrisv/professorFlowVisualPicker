# Professor Flow — Visual Picker

> A unified, modern visual tile picker for Salesforce Flow Screens — powered by a point-and-click Custom Property Editor.

![Salesforce API](https://img.shields.io/badge/Salesforce%20API-v66.0-blue?logo=salesforce)
![LWC](https://img.shields.io/badge/LWC-JavaScript-yellow?logo=javascript)
![Apex](https://img.shields.io/badge/Apex-with%20sharing-success?logo=salesforce)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Table of Contents

- [Overview](#overview)
- [Features at a Glance](#features-at-a-glance)
- [Data Sources](#data-sources)
- [Layouts](#layouts)
- [Selection Modes](#selection-modes)
- [Visual Customization](#visual-customization)
- [Flow Outputs](#flow-outputs)
- [Component Architecture](#component-architecture)
- [Apex Layer](#apex-layer)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Testing](#testing)

---

## Overview

**Professor Flow Visual Picker** replaces plain picklists and radio groups on Flow Screens with a rich, visually customizable tile picker. Everything -- data source, layout, appearance, validation -- is configured through a built-in Custom Property Editor (CPE). No code, no formula fields, no hacks.

Drop the `Professor Flow | Visual Picker` component onto any Flow Screen and the CPE walks you through:

1. Where to get the options (picklist, record collection, SOQL query, static list, or a text collection)
2. How to display them (grid, list, horizontal, dropdown, or radio group)
3. How they should look (size, aspect ratio, icons, badges, patterns, elevation, spacing)
4. What the Flow should receive when a user picks something (value, label, full SObject record)

---

## Features at a Glance

| Capability | Detail |
|---|---|
| **5 data sources** | Picklist field, Record collection, String collection, SOQL query, Custom static list |
| **5 layouts** | Grid, List, Horizontal ribbon, Dropdown, Radio group |
| **Selection modes** | Single and Multi (with configurable min/max) |
| **Auto-advance** | Automatically navigates to the next screen after a single selection |
| **Search/filter** | Inline search bar filters tiles as the user types |
| **Select all** | One-click select-all button for multi-select mode |
| **None option** | Configurable --None-- tile that clears the selection (position: start or end) |
| **8 output variables** | value, values, selectedRecord, selectedRecords, selectedLabel, selectedLabels, allValues, allLabels |
| **Item overrides** | Per-item label, icon, badge, and help text overrides layered on top of any data source |
| **Sort and limit** | Sort by label, value, or source order; optional result cap |
| **Required validation** | Block flow navigation with a configurable error message |
| **SLDS 2 compliant** | Styling hooks, design tokens, dark-mode support, WCAG 2.1 AA accessibility, RTL |

---

## Data Sources

Configure the source once in the CPE; the component handles fetching, normalizing, and rendering.

### Picklist

Reads values from any SObject picklist or multi-select picklist field. Supports record type filtering so only active, record-type-appropriate values appear. Values can be the API name (default) or the label.

### Record Collection

Accepts a Flow record collection variable (`{T[]}`) as input. A field-mapping section in the CPE lets you point Label, Sublabel, Icon, Badge, Help Text, and Value at any field on the collection's SObject -- no Apex required.

### String Collection

Accepts a Flow `String[]` variable. Each string becomes a tile where both the label and the value equal the string. Item overrides can enrich the tiles with icons or sublabels.

### SOQL Query

Issues a server-side SOQL query at runtime via `PflowPickerController.queryItems`. The CPE exposes:

- **Object picker** -- searchable dropdown of all accessible SObjects
- **WHERE builder** -- visual clause builder with field picker, type-aware operator sets, and AND/OR logic
- **Field mapping** -- map any field to label, sublabel, value, icon, badge, and help text
- **ORDER BY** -- field + direction selector
- **LIMIT** -- row cap (max 2,000)

All queries run in `USER_MODE` and field-level security is enforced server-side.

### Custom (Static) List

Type options directly into the CPE. Each item has a label, value, sublabel, icon, and badge. Useful for short, stable lists that don't live in the org's data model.

---

## Layouts

| Layout | Best for |
|---|---|
| **Grid** | Visual, icon-forward choices; responsive tile grid with configurable column count or auto-fill |
| **List** | Dense option sets; stacked rows with icon, label, sublabel, and badge |
| **Horizontal** | Timeline steps, status sequences, or any scrollable ribbon of options |
| **Dropdown** | Space-constrained screens; compact combobox that expands on click |
| **Radio** | Accessibility-first flows; native radio group with SLDS 2 styling |

---

## Selection Modes

| Mode | Behaviour |
|---|---|
| **Single** | One tile selected at a time. Outputs `value`, `selectedRecord`, `selectedLabel`. |
| **Multi** | Any number of tiles. Configurable `minSelections` and `maxSelections` enforce constraints. Outputs `values`, `selectedRecords`, `selectedLabels`. |

Both modes support the `required` flag, which blocks the Flow's Next button until a valid selection is made and shows a configurable error message.

---

## Visual Customization

All visual settings are managed through the CPE's Appearance tab -- no CSS editing required.

### Tile Size and Aspect Ratio

| Size | Column width |
|---|---|
| Small | 7.5 rem |
| Medium | 12 rem (default) |
| Large | 16 rem |

Aspect ratio options: `1:1` (square), `4:3` (landscape), `16:9` (wide), `3:4` (portrait).

### Elevation

Controls the tile card style: `outlined` (1px border, hover shadow), `flat` (no border), or `elevated` (permanent drop shadow).

### Selection Indicator

How a selected tile communicates its state:

- `checkmark` -- floating circle badge at the top-right corner (default)
- `fill` -- tile surface fills with brand-weak colour
- `bar` -- thick brand-coloured bar on the leading edge

### Patterns and Surface Styles

Layered decorative overlays on the tile figure: `dots`, `lines`, `diagonal`, `grid`, `glow`, `noise`, `paper`, `waves`, or `none`. Each pattern can be tinted with a tone (brand, success, warning, error, or a custom hex).

### Badges

Every tile can carry a badge from its data source. The CPE lets you configure position (`top-left`, `top-right`, `bottom-left`, `bottom-right`, `bottom-inline`), shape (`pill` / `square`), and variant (standard SLDS semantic tones plus custom hex).

### Spacing

Grid gap, margin, and padding all accept SLDS 2 spacing tokens (`1`--`12`, `none`) or raw CSS values. Linked toggles apply one value to all sides at once.

---

## Flow Outputs

Every output is available as a Flow resource once the component is placed on a screen.

| Variable | Type | Description |
|---|---|---|
| `value` | String | The value of the currently selected option (single mode) |
| `values` | String[] | All selected values (multi mode) |
| `selectedRecord` | SObject | The full record for the selected option (record-backed sources, single mode) |
| `selectedRecords` | SObject[] | All selected records (record-backed sources, multi mode) |
| `selectedLabel` | String | Display label of the selected option (single mode) |
| `selectedLabels` | String[] | Display labels of all selected options (multi mode) |
| `allValues` | String[] | Every value rendered by the picker, in display order |
| `allLabels` | String[] | Every label rendered by the picker, in display order |

---

## Component Architecture

The project follows the LWC Atomic Design pattern. Every layer has a single responsibility.

```
pflowFlowPicker                       <- Flow Screen component (entry point)
  +-- pflowFlowPickerCpe              <- Custom Property Editor (Flow Builder panel)
        +-- pflowFlowPickerConfigModal <- Full-screen configuration modal

pflowOrganismDataPicker               <- Data loading, source switching, state machine
  +-- pflowMoleculePickerGroup        <- Renders the correct layout + search/select-all
        +-- pflowAtomVisualPick       <- Individual tile (icon, label, sublabel, badge)

CPE helper organisms
  pflowOrganismResourcePicker         <- Flow Builder resource/merge-field combobox
  pflowOrganismWhereBuilder           <- Visual SOQL WHERE clause builder

Molecules
  pflowMoleculeCustomLookup           <- Searchable lookup with server typeahead
  pflowMoleculeFieldPicker            <- Object-scoped field selector
  pflowMoleculeIconPicker             <- SLDS icon name picker
  pflowMoleculeOrderLimit             <- Sort + limit controls
  pflowMoleculeRichCombobox           <- Combobox with icon + sublabel support

Atoms
  pflowAtomToggle                     <- Reusable toggle switch (boolean or CB_TRUE/CB_FALSE wire format)
  pflowAtomIcon                       <- Icon renderer with Lucide-style SVG catalog
  pflowAtomVisualPick                 <- Visual picker tile (label / sublabel / badge / icon)

Utilities
  pflowUtilityPickerDataSources       <- Normalizers for all 5 data sources; filter/sort/limit
  pflowUtilityCpeHelpers              <- Flow Builder context helpers (merge fields, types)
```

---

## Apex Layer

| Class | Role |
|---|---|
| `PflowPickerController` | `@AuraEnabled(cacheable=true)` endpoint for the SOQL data source. Deserializes the query config JSON and delegates to the service layer. |
| `PflowPickerService` | Maps SObject records to `PflowPickerItemDTO` instances using field mappings from `PflowPickerQueryDTO`. |
| `PflowPickerSelector` | Builds and executes the dynamic SOQL query in `USER_MODE`. Validates object and field accessibility; enforces a 2,000-row hard cap. |
| `PflowPickerQueryDTO` | Input DTO: object API name, WHERE clause, ORDER BY, LIMIT, and field mappings. |
| `PflowPickerItemDTO` | Output DTO: `id`, `label`, `sublabel`, `icon`, `badge`, `helpText`, `value`, `disabled`. |
| `PflowPickerException` | Typed exception surfaced to the LWC as an `AuraHandledException`. |
| `PFlowCpeChoiceEngineController` | Design-time Apex for the CPE: `searchSObjectTypes`, `searchFields`, `getObjectFields` -- powers the object/field pickers in the config modal. |

All classes run `with sharing`. SOQL is executed via `Database.queryWithBinds` with `AccessLevel.USER_MODE` to respect field-level security.

---

## Installation

### Prerequisites

- [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli) (sf v2+)
- A Salesforce org (Developer Edition, scratch org, or sandbox)

### Deploy to an existing org

```bash
# Authenticate
sf org login web --alias my-org

# Deploy all metadata
sf project deploy start --source-dir force-app --target-org my-org
```

### Scratch org quick-start

```bash
# Create a scratch org
sf org create scratch \
  --definition-file config/project-scratch-def.json \
  --alias pflow-dev \
  --duration-days 30

# Deploy
sf project deploy start --source-dir force-app --target-org pflow-dev

# Open the org
sf org open --target-org pflow-dev
```

### Post-install

1. Assign the permission set to users who will configure or run flows containing this component:
   ```bash
   sf org assign permset --name PflowVisualPicker --target-org my-org
   ```
2. In Flow Builder, drag **Professor Flow | Visual Picker** onto a Screen element.
3. Click the component to open the CPE and configure your data source, layout, and appearance.

---

## Development Setup

```bash
# Install Node dependencies
npm install

# Run the linter
npm run lint

# Format all source files
npm run prettier
```

[Husky](https://typicode.github.io/husky/) runs Prettier, ESLint, and the Jest suite against staged files on every commit via `lint-staged`. No additional setup is needed after `npm install`.

---

## Testing

### LWC Unit Tests (Jest)

```bash
# Run all tests once
npm run test:unit

# Watch mode (re-runs on file save)
npm run test:unit:watch

# With coverage report
npm run test:unit:coverage
```

Test files live under `force-app/main/default/lwc/<component>/__tests__/`.

### Apex Tests

```bash
sf apex run test --target-org my-org --result-format human --wait 10
```

Key test classes: `PflowPickerController_Test`, `PflowPickerService_Test`, `PflowPickerSelector_Test`. All use `PflowPickerTestDataFactory` for consistent setup data.

---

## License

MIT (c) Professor Flow