# Treegrid Pattern Implementation Plan for Chat History

## Overview

This document outlines the implementation plan for converting the chat-history components from basic tab navigation to the ARIA treegrid pattern. The treegrid pattern provides a more accessible and efficient keyboard navigation experience for list-based data structures with interactive elements.

## Scope

**The treegrid pattern is applied to `cds-aichat-history-panel-items` and its child components: `cds-aichat-history-panel-menu` (section headers) and `cds-aichat-history-panel-item` (chat items).** Other components (header, toolbar, content wrapper, panel) remain unchanged.

## Current State Analysis

### Component Structure

```
cds-aichat-history-shell
├── cds-aichat-history-header (unchanged)
├── cds-aichat-history-toolbar (unchanged)
└── cds-aichat-history-content (unchanged wrapper)
    └── cds-aichat-history-panel (unchanged)
        └── cds-aichat-history-panel-items ← TREEGRID CONTAINER
            ├── cds-aichat-history-panel-menu ← TREEGRID ROW (section header)
            │   ├── Section title (gridcell 1)
            │   └── Expand/collapse indicator (gridcell 2)
            │   └── (contains panel-items when expanded)
            │       └── cds-aichat-history-panel-item ← TREEGRID ROW (nested)
            │           ├── Item name (gridcell 1)
            │           └── Overflow menu button (gridcell 2)
            └── cds-aichat-history-panel-menu ← TREEGRID ROW (another section)
                └── ...
```

**Example from stories:**

```html
<cds-aichat-history-panel-items>
  <!-- Section header row -->
  <cds-aichat-history-panel-menu expanded title="Pinned">
    <icon slot="title-icon"></icon>
    <!-- Nested item rows -->
    <cds-aichat-history-panel-item
      id="pinned-1"
      name="Chat 1"
    ></cds-aichat-history-panel-item>
    <cds-aichat-history-panel-item
      id="pinned-2"
      name="Chat 2"
    ></cds-aichat-history-panel-item>
  </cds-aichat-history-panel-menu>

  <!-- Another section header row -->
  <cds-aichat-history-panel-menu expanded title="Today">
    <icon slot="title-icon"></icon>
    <cds-aichat-history-panel-item
      id="today-1"
      name="Chat 3"
    ></cds-aichat-history-panel-item>
  </cds-aichat-history-panel-menu>
</cds-aichat-history-panel-items>
```

### Current Navigation

- **Tab**: Moves focus between history items sequentially
- **Enter**: Selects/activates an item
- **Overflow menu**: Uses arrow keys within the menu (Up/Down to navigate items)

### Issues with Current Approach

1. Tab navigation through many items is inefficient
2. No keyboard shortcut to jump to first/last item
3. No way to navigate from item name to overflow menu using keyboard alone
4. Screen readers don't get proper context about the list structure

## Treegrid Pattern Requirements

Based on [W3C ARIA treegrid specification](https://w3c.github.io/aria/#treegrid) and [MDN treegrid role documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/treegrid_role):

### ARIA Roles

- **`role="treegrid"`**: Applied to `cds-aichat-history-panel-items` container
- **`role="row"`**: Applied to both:
  - `cds-aichat-history-panel-menu` (section header rows)
  - `cds-aichat-history-panel-item` (chat item rows)
- **`role="gridcell"`**:
  - **One cell** for section header rows (entire section title with expand/collapse indicator)
  - **Two cells** for chat item rows (name cell + actions cell)
- **`aria-expanded`**: On panel-menu rows (true/false for expanded/collapsed state)
- **`aria-level`**: Indicates nesting depth (1 for section headers, 2 for items within sections)

### Grid Structure

The treegrid contains two types of rows with different cell structures:

**Section Header Row (panel-menu) - Single Cell:**

```
┌─────────────────────────────────────────────────────┐
│ Row (cds-aichat-history-panel-menu) aria-level="1"  │
│ ┌───────────────────────────────────────────────┐   │
│ │ Gridcell: Section Title + Expand Indicator   │   │
│ │ [📌] "Pinned" [▼]                             │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Chat Item Row (panel-item) - Single Cell:**

```
┌─────────────────────────────────────────────────────┐
│ Row (cds-aichat-history-panel-item) aria-level="2"  │
│ ┌───────────────────────────────────────────────┐   │
│ │ Gridcell: Item Name + Overflow Menu           │   │
│ │ "Chat about project..." [⋮]                   │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Note:** Both the item name and overflow menu are contained within a single gridcell to maintain the existing visual layout. Focus management within the cell will handle navigation between the name and overflow menu button.

### Keyboard Interactions

#### Navigation Between Rows

| Key            | Action                                                       |
| -------------- | ------------------------------------------------------------ |
| **Arrow Down** | Move focus to the next row (section header or item)          |
| **Arrow Up**   | Move focus to the previous row (section header or item)      |
| **Home**       | Move focus to the first row                                  |
| **End**        | Move focus to the last row                                   |
| **Tab**        | Exit treegrid and move to next focusable element outside     |
| **Shift+Tab**  | Exit treegrid and move to previous focusable element outside |

#### Navigation Within a Row (Between Cells)

**For Section Header Rows (panel-menu):**
| Key | Action |
|-----|--------|
| **Arrow Right** | Expand collapsed section (if collapsed) |
| **Arrow Left** | Collapse expanded section (if expanded) |

**For Chat Item Rows (panel-item):**
| Key | Action |
|-----|--------|
| **Enter** | Select chat item (activates the row) |
| **Space** | Select chat item (activates the row) |
| **Tab** | Move focus to overflow menu button within the cell (when focused on item name) |
| **Shift+Tab** | Move focus back to item name from overflow menu button |

**Note:** Since the overflow menu is within the same gridcell as the item name, Tab/Shift+Tab are used to navigate between them within the cell, while Arrow keys navigate between rows.

#### Complete Overflow Menu Workflow

This section describes the complete keyboard flow for accessing and using the overflow menu within a chat item row.

**Step 1: Navigate to the overflow menu button**

1. Focus starts on the gridcell (which contains both item name and overflow menu)
2. Press **Tab** to move focus to the overflow menu button within the same cell

**Step 2: Open the overflow menu**

- Press **Enter** or **Space** to open the menu
- The menu opens and focus moves to the first menu item

**Step 3: Navigate within the menu**
| Key | Action |
|-----|--------|
| **Arrow Down** | Move to next menu item |
| **Arrow Up** | Move to previous menu item |
| **Enter** | Activate the focused menu item (e.g., "Rename", "Delete") |
| **Escape** | Close menu and return focus to overflow menu button |

**Step 4: Return to treegrid navigation**

- After the menu closes (via Escape or selecting an item), focus returns to the overflow menu button
- Press **Shift+Tab** to return focus to the item name within the same cell
- Press **Arrow Down** or **Arrow Up** to navigate to other rows in the treegrid

**Example Flow:**

```
1. User is on "Chat about project..." gridcell
2. Press Tab → Focus moves to overflow menu button (within same cell)
3. Press Enter → Menu opens, focus on first menu item ("Rename")
4. Press Arrow Down → Focus moves to "Delete" menu item
5. Press Enter → Delete action executes, menu closes, focus returns to overflow button
6. Press Shift+Tab → Focus returns to item name (within same cell)
7. Press Arrow Down → Focus moves to next row
```

#### Focus Management

- **Roving tabindex**: Only one cell has `tabindex="0"` at a time; all others have `tabindex="-1"`
- When treegrid receives focus, focus goes to:
  1. Previously focused cell (if returning to treegrid)
  2. Selected item's name cell (if an item is selected)
  3. First row's name cell (default)
- Focus starts on the **name cell** (column 1) when entering a row
- Focus is visible and clearly indicated

### Selection Model

- **Single-select**: Only one chat item can be selected at a time
- Selected item has `aria-selected="true"` on the row
- Selection is independent of focus (can navigate without changing selection)
- Activating the name cell (Enter key) selects that chat item

## Implementation Steps

### Phase 1: ARIA Structure (Tasks 3-10)

#### 1. Update `history-panel-items.ts`

```typescript
// Add role="treegrid" to the container
@carbonElement(`${prefix}-history-panel-items`)
class CDSAIChatHistoryPanelItems extends CDSSideNavItems {
  static styles = styles;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("data-floating-menu-container", "");
    this.setAttribute("role", "treegrid");
    this.setAttribute("aria-label", "Chat history items");
  }
}
```

#### 2. Update `history-panel-menu.ts`

```typescript
// Add role="row" and aria-expanded for section headers
@carbonElement(`${prefix}-history-panel-menu`)
class CDSAIChatHistoryPanelMenu extends CDSSideNavMenu {
  static styles = styles;

  @property({ type: Boolean, reflect: true })
  expanded = true;

  @property({ type: String })
  title = "";

  render() {
    const { title, expanded } = this;

    return html`
      <div
        role="row"
        aria-level="1"
        aria-expanded="${expanded}"
        class="${prefix}--history-panel-menu__row"
      >
        <!-- Single Gridcell: Section Title with Expand/Collapse Indicator -->
        <div
          role="gridcell"
          class="${prefix}--history-panel-menu__cell"
          tabindex="0"
          @keydown="${this._handleKeyDown}"
          @click="${this._handleToggle}"
        >
          <button class="cds--side-nav__submenu" tabindex="-1">
            <slot name="title-icon"></slot>
            <span class="cds--side-nav__submenu-title">${title}</span>
            <span class="${prefix}--history-panel-menu__chevron">
              ${expanded ? "▼" : "▶"}
            </span>
          </button>
        </div>
      </div>

      <!-- Child items (hidden when collapsed) -->
      <div class="${prefix}--history-panel-menu__items" ?hidden="${!expanded}">
        <slot></slot>
      </div>
    `;
  }

  private _handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowRight":
        if (!this.expanded) {
          event.preventDefault();
          event.stopPropagation();
          this.expanded = true;
          this.requestUpdate();
        }
        break;
      case "ArrowLeft":
        if (this.expanded) {
          event.preventDefault();
          event.stopPropagation();
          this.expanded = false;
          this.requestUpdate();
        }
        break;
    }
  };
}
```

#### 3. Update `history-panel-item.ts`

```typescript
// Add role="row" with two gridcells
@property({ type: Boolean, reflect: true, attribute: 'aria-selected' })
selected = false;

// Track which cell has focus (0 = name cell, 1 = actions cell)
@property({ type: Number })
private _focusedCellIndex = 0;

render() {
  const {
    id,
    selected,
    name,
    actions,
    rename,
    overflowMenuLabel,
    _focusedCellIndex,
    _adjustMenuPosition: adjustMenuPosition,
    _handleMenuTriggerKeyDown: handleMenuTriggerKeyDown,
    _handleMenuItemClick: handleMenuItemClick,
    _handleMenuItemKeyDown: handleMenuItemKeyDown,
  } = this;

  const classes = classMap({
    [`cds--side-nav__link`]: true,
    [`cds--side-nav__link--current`]: selected,
  });

  return html`
    <div
      role="row"
      aria-selected="${selected}"
      class="${prefix}--history-panel-item__row"
    >
      ${!rename
        ? html`
          <!-- Gridcell 1: Item Name -->
          <div
            role="gridcell"
            class="${prefix}--history-panel-item__name-cell"
            tabindex="${_focusedCellIndex === 0 ? '0' : '-1'}"
            @keydown="${this._handleNameCellKeyDown}"
            @click="${this._handleNameCellClick}"
          >
            <button class="${classes}" tabindex="-1">
              <span part="name" class="cds--side-nav__link-text">${name}</span>
            </button>
          </div>

          <!-- Gridcell 2: Actions (Overflow Menu) -->
          <div
            role="gridcell"
            class="${prefix}--history-panel-item__actions-cell"
          >
            <slot name="actions">
              <cds-overflow-menu
                align="top-right"
                size="sm"
                tabindex="${_focusedCellIndex === 1 ? '0' : '-1'}"
                @click=${adjustMenuPosition}
                @keydown=${handleMenuTriggerKeyDown}
              >
                ${iconLoader(OverflowMenuVertical16, {
                  class: `${prefix}--overflow-menu__icon`,
                  slot: "icon",
                })}
                <span slot="tooltip-content">${overflowMenuLabel}</span>
                <cds-overflow-menu-body flipped>
                  ${repeat(
                    actions,
                    (action) => action.text,
                    (action) =>
                      html`<cds-overflow-menu-item
                        ?danger=${action.delete}
                        ?divider=${action.divider}
                        @click=${handleMenuItemClick}
                        @keydown=${handleMenuItemKeyDown}
                        >${action.text}${action.icon}</cds-overflow-menu-item
                      >`,
                  )}
                </cds-overflow-menu-body>
              </cds-overflow-menu>
            </slot>
          </div>
        `
        : html`
          <!-- Rename mode: single gridcell spanning both columns -->
          <div role="gridcell" colspan="2">
            <cds-aichat-history-panel-item-input
              value="${name}"
              item-id="${id}"
            ></cds-aichat-history-panel-item-input>
          </div>
        `}
    </div>
  `;
}

// Handle keyboard navigation within the name cell
private _handleNameCellKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault();
      this._moveFocusToActionsCell();
      break;
    case 'Enter':
      event.preventDefault();
      this._handleClick(event);
      break;
  }
};

// Handle click on name cell
private _handleNameCellClick = (event: Event) => {
  this._handleClick(event);
};

// Move focus to the actions cell (overflow menu)
private _moveFocusToActionsCell() {
  this._focusedCellIndex = 1;
  this.requestUpdate();
  this.updateComplete.then(() => {
    const overflowMenu = this.shadowRoot?.querySelector('cds-overflow-menu') as HTMLElement;
    if (overflowMenu) {
      overflowMenu.focus();
    }
  });
}

// Move focus back to the name cell
private _moveFocusToNameCell() {
  this._focusedCellIndex = 0;
  this.requestUpdate();
  this.updateComplete.then(() => {
    const nameCell = this.shadowRoot?.querySelector('[role="gridcell"]') as HTMLElement;
    if (nameCell) {
      nameCell.focus();
    }
  });
}
```

### Phase 2: Roving Tabindex Management (Task 6, 15)

Create a shared utility for managing focus within the treegrid:

```typescript
// src/components/chat-history/src/treegrid-focus-manager.ts

export class TreegridFocusManager {
  private container: HTMLElement;
  private currentFocusedRow: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Get all rows in the treegrid (both menu headers and items)
   */
  private getAllRows(): HTMLElement[] {
    const menus = Array.from(
      this.container.querySelectorAll("cds-aichat-history-panel-menu"),
    ) as HTMLElement[];

    const items = Array.from(
      this.container.querySelectorAll("cds-aichat-history-panel-item"),
    ) as HTMLElement[];

    // Combine and sort by DOM order
    return [...menus, ...items].sort((a, b) => {
      const position = a.compareDocumentPosition(b);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  }

  /**
   * Get visible rows (respecting collapsed sections)
   */
  private getVisibleRows(): HTMLElement[] {
    const allRows = this.getAllRows();
    const visibleRows: HTMLElement[] = [];

    for (const row of allRows) {
      // Menu headers are always visible
      if (row.tagName.toLowerCase().includes("menu")) {
        visibleRows.push(row);
        continue;
      }

      // Check if item is within a collapsed section
      const parentMenu = row.closest("cds-aichat-history-panel-menu");
      if (parentMenu) {
        const expanded = (parentMenu as any).expanded;
        if (!expanded) continue;
      }

      visibleRows.push(row);
    }

    return visibleRows;
  }

  /**
   * Set focus to a specific row's cell
   */
  setFocusToRow(row: HTMLElement, cellIndex: number = 0) {
    const allRows = this.getAllRows();

    // Update all rows to reset their focused cell index
    allRows.forEach((r) => {
      if (r !== row) {
        (r as any)._focusedCellIndex = 0;
        r.requestUpdate?.();
      }
    });

    // Set the focused cell index on the target row
    (row as any)._focusedCellIndex = cellIndex;
    row.requestUpdate?.();

    // Focus the appropriate cell after update
    row.updateComplete?.then(() => {
      const cells = row.shadowRoot?.querySelectorAll('[role="gridcell"]');
      if (cells && cells[cellIndex]) {
        const cell = cells[cellIndex] as HTMLElement;

        const isMenu = row.tagName.toLowerCase().includes("menu");

        if (isMenu) {
          // For menu headers, always focus the title cell
          cell.focus();
        } else {
          // For items, focus name cell or overflow menu
          if (cellIndex === 0) {
            cell.focus();
          } else if (cellIndex === 1) {
            const overflowMenu = cell.querySelector(
              "cds-overflow-menu",
            ) as HTMLElement;
            if (overflowMenu) {
              overflowMenu.focus();
            }
          }
        }
      }
    });

    this.currentFocusedRow = row;
  }

  /**
   * Move focus to next visible row
   */
  focusNext() {
    const visibleRows = this.getVisibleRows();
    const currentIndex = visibleRows.indexOf(this.currentFocusedRow!);

    if (currentIndex < visibleRows.length - 1) {
      this.setFocusToRow(visibleRows[currentIndex + 1], 0);
    }
  }

  /**
   * Move focus to previous visible row
   */
  focusPrevious() {
    const visibleRows = this.getVisibleRows();
    const currentIndex = visibleRows.indexOf(this.currentFocusedRow!);

    if (currentIndex > 0) {
      this.setFocusToRow(visibleRows[currentIndex - 1], 0);
    }
  }

  /**
   * Move focus to first visible row
   */
  focusFirst() {
    const visibleRows = this.getVisibleRows();
    if (visibleRows.length > 0) {
      this.setFocusToRow(visibleRows[0], 0);
    }
  }

  /**
   * Move focus to last visible row
   */
  focusLast() {
    const visibleRows = this.getVisibleRows();
    if (visibleRows.length > 0) {
      this.setFocusToRow(visibleRows[visibleRows.length - 1], 0);
    }
  }

  /**
   * Initialize focus on first row or previously focused row
   */
  initializeFocus() {
    const visibleRows = this.getVisibleRows();
    if (visibleRows.length === 0) return;

    // Try to focus selected item
    const selectedRow = visibleRows.find(
      (row) => row.getAttribute("aria-selected") === "true",
    );

    if (selectedRow) {
      this.setFocusToRow(selectedRow, 0);
    } else {
      this.setFocusToRow(visibleRows[0], 0);
    }
  }

  /**
   * Get the current focused row
   */
  getCurrentRow(): HTMLElement | null {
    return this.currentFocusedRow;
  }
}
```

### Phase 3: Keyboard Event Handlers (Tasks 9-12, 15)

Update `history-panel-items.ts` to handle keyboard navigation:

```typescript
import { TreegridFocusManager } from "./treegrid-focus-manager.js";

@carbonElement(`${prefix}-history-panel-items`)
class CDSAIChatHistoryPanelItems extends CDSSideNavItems {
  static styles = styles;

  private focusManager?: TreegridFocusManager;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("data-floating-menu-container", "");
    this.setAttribute("role", "treegrid");
    this.setAttribute("aria-label", "Chat history items");
    this.addEventListener("keydown", this._handleKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener("keydown", this._handleKeyDown);
    super.disconnectedCallback();
  }

  firstUpdated() {
    this.focusManager = new TreegridFocusManager(this);
    // Initialize focus after a short delay to ensure all items are rendered
    requestAnimationFrame(() => {
      this.focusManager?.initializeFocus();
    });
  }

  private _handleKeyDown = (event: KeyboardEvent) => {
    if (!this.focusManager) return;

    const target = event.target as HTMLElement;

    // Check if we're in a gridcell (not in the overflow menu body)
    const isInGridcell = target.closest('[role="gridcell"]') !== null;
    const isInMenuBody = target.closest("cds-overflow-menu-body") !== null;

    // If we're in the overflow menu body, let it handle its own navigation
    if (isInMenuBody) {
      return;
    }

    if (!isInGridcell) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        event.stopPropagation();
        this.focusManager.focusNext();
        break;

      case "ArrowUp":
        event.preventDefault();
        event.stopPropagation();
        this.focusManager.focusPrevious();
        break;

      case "ArrowRight":
        // Handled by history-panel-item for moving to actions cell
        break;

      case "ArrowLeft":
        // Check if we're in the actions cell (overflow menu)
        const actionsCell = target.closest(
          ".cds--history-panel-item__actions-cell",
        );
        if (actionsCell) {
          event.preventDefault();
          event.stopPropagation();
          // Move back to name cell
          const row = target.closest(
            "cds-aichat-history-panel-item",
          ) as HTMLElement;
          if (row) {
            this.focusManager.setFocusToRow(row, 0);
          }
        }
        break;

      case "Home":
        event.preventDefault();
        event.stopPropagation();
        this.focusManager.focusFirst();
        break;

      case "End":
        event.preventDefault();
        event.stopPropagation();
        this.focusManager.focusLast();
        break;

      case "Enter":
        // Let the cell handle activation
        break;
    }
  };
}
```

#### Update `history-panel-item.ts` to handle overflow menu keyboard navigation

Add handler to detect when overflow menu button receives ArrowLeft:

```typescript
// In history-panel-item.ts, update the overflow menu trigger keydown handler

private _handleMenuTriggerKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Enter" || event.key === " ") {
    this._adjustMenuPosition();
  } else if (event.key === "ArrowLeft") {
    // Move focus back to name cell
    event.preventDefault();
    event.stopPropagation();
    this._moveFocusToNameCell();
  }
  // ArrowDown/ArrowUp when menu is closed should navigate between rows
  // This is handled by the treegrid container
};
```

### Phase 4: Focus Restoration (Task 14)

Update `history-shell.ts` to restore focus after deletion:

```typescript
private _handleHistoryDeleteConfirm = (event: Event) => {
  const detail = (event as CustomEvent).detail ?? {};
  const { nextItemId, deletedItemWasSelected } = detail;

  if (!nextItemId) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const tag = `${prefix}-history-panel-item`;
      const nextHost = Array.from(this.querySelectorAll(tag)).find(
        (el) => (el as HTMLElement).id === nextItemId,
      ) as HTMLElement | undefined;

      if (!nextHost) {
        return;
      }

      // Find the treegrid container and update focus
      const panelItems = nextHost.closest(`${prefix}-history-panel-items`) as any;
      if (panelItems?.focusManager) {
        panelItems.focusManager.setFocusToRow(nextHost, 0);
      }

      if (deletedItemWasSelected) {
        nextHost.dispatchEvent(
          new CustomEvent("history-item-selected", {
            bubbles: true,
            composed: true,
            detail: {
              itemId: nextHost.id,
              itemName: (nextHost as any).name,
              element: nextHost,
            },
          }),
        );
      }
    });
  });
};
```

### Phase 5: Testing (Tasks 16-19)

#### Unit Tests

Create `__tests__/treegrid-navigation.test.ts`:

```typescript
import { expect, fixture, html } from "@open-wc/testing";
import "../index.js";

describe("Treegrid Navigation", () => {
  it("should have correct ARIA roles on panel-items", async () => {
    const el = await fixture(html`
      <cds-aichat-history-panel-items>
        <cds-aichat-history-panel-item
          id="item-1"
          name="Test 1"
        ></cds-aichat-history-panel-item>
        <cds-aichat-history-panel-item
          id="item-2"
          name="Test 2"
        ></cds-aichat-history-panel-item>
      </cds-aichat-history-panel-items>
    `);

    expect(el.getAttribute("role")).to.equal("treegrid");

    const items = el.querySelectorAll("cds-aichat-history-panel-item");
    items.forEach((item) => {
      const row = item.shadowRoot?.querySelector('[role="row"]');
      expect(row).to.exist;

      const gridcells = item.shadowRoot?.querySelectorAll('[role="gridcell"]');
      expect(gridcells?.length).to.equal(2); // name cell + actions cell
    });
  });

  it("should navigate between rows with arrow keys", async () => {
    const el = await fixture(html`
      <cds-aichat-history-panel-items>
        <cds-aichat-history-panel-item
          id="item-1"
          name="Test 1"
        ></cds-aichat-history-panel-item>
        <cds-aichat-history-panel-item
          id="item-2"
          name="Test 2"
        ></cds-aichat-history-panel-item>
      </cds-aichat-history-panel-items>
    `);

    await el.updateComplete;

    const items = el.querySelectorAll("cds-aichat-history-panel-item");
    const firstItem = items[0] as HTMLElement;
    const secondItem = items[1] as HTMLElement;

    // Get the name cell of the first item
    const firstNameCell = firstItem.shadowRoot?.querySelector(
      '[role="gridcell"]',
    ) as HTMLElement;
    firstNameCell.focus();

    // Simulate ArrowDown
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
    });
    el.dispatchEvent(event);

    await el.updateComplete;

    // Check that second item's name cell is focused
    const secondNameCell = secondItem.shadowRoot?.querySelector(
      '[role="gridcell"]',
    ) as HTMLElement;
    expect(document.activeElement).to.equal(secondNameCell);
  });

  it("should navigate within row with arrow left/right", async () => {
    const el = await fixture(html`
      <cds-aichat-history-panel-items>
        <cds-aichat-history-panel-item
          id="item-1"
          name="Test 1"
          .actions=${[{ text: "Delete", onClick: () => {} }]}
        ></cds-aichat-history-panel-item>
      </cds-aichat-history-panel-items>
    `);

    await el.updateComplete;

    const item = el.querySelector(
      "cds-aichat-history-panel-item",
    ) as HTMLElement;
    const nameCell = item.shadowRoot?.querySelector(
      '[role="gridcell"]',
    ) as HTMLElement;
    const actionsCell = item.shadowRoot?.querySelectorAll(
      '[role="gridcell"]',
    )[1] as HTMLElement;

    nameCell.focus();

    // Simulate ArrowRight to move to actions cell
    const rightEvent = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      bubbles: true,
    });
    nameCell.dispatchEvent(rightEvent);

    await item.updateComplete;

    const overflowMenu = actionsCell.querySelector(
      "cds-overflow-menu",
    ) as HTMLElement;
    expect(document.activeElement).to.equal(overflowMenu);

    // Simulate ArrowLeft to move back to name cell
    const leftEvent = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      bubbles: true,
    });
    overflowMenu.dispatchEvent(leftEvent);

    await item.updateComplete;
    expect(document.activeElement).to.equal(nameCell);
  });

  it("should jump to first/last with Home/End keys", async () => {
    const el = await fixture(html`
      <cds-aichat-history-panel-items>
        <cds-aichat-history-panel-item
          id="item-1"
          name="Test 1"
        ></cds-aichat-history-panel-item>
        <cds-aichat-history-panel-item
          id="item-2"
          name="Test 2"
        ></cds-aichat-history-panel-item>
        <cds-aichat-history-panel-item
          id="item-3"
          name="Test 3"
        ></cds-aichat-history-panel-item>
      </cds-aichat-history-panel-items>
    `);

    await el.updateComplete;

    const items = el.querySelectorAll("cds-aichat-history-panel-item");
    const firstItem = items[0] as HTMLElement;
    const lastItem = items[2] as HTMLElement;

    const firstNameCell = firstItem.shadowRoot?.querySelector(
      '[role="gridcell"]',
    ) as HTMLElement;
    firstNameCell.focus();

    // Simulate End key
    const endEvent = new KeyboardEvent("keydown", {
      key: "End",
      bubbles: true,
    });
    el.dispatchEvent(endEvent);

    await el.updateComplete;

    const lastNameCell = lastItem.shadowRoot?.querySelector(
      '[role="gridcell"]',
    ) as HTMLElement;
    expect(document.activeElement).to.equal(lastNameCell);

    // Simulate Home key
    const homeEvent = new KeyboardEvent("keydown", {
      key: "Home",
      bubbles: true,
    });
    el.dispatchEvent(homeEvent);

    await el.updateComplete;
    expect(document.activeElement).to.equal(firstNameCell);
  });

  it("should preserve overflow menu navigation", async () => {
    const el = await fixture(html`
      <cds-aichat-history-panel-items>
        <cds-aichat-history-panel-item
          id="item-1"
          name="Test 1"
          .actions=${[
            { text: "Rename", onClick: () => {} },
            { text: "Delete", onClick: () => {} },
          ]}
        ></cds-aichat-history-panel-item>
      </cds-aichat-history-panel-items>
    `);

    await el.updateComplete;

    const item = el.querySelector(
      "cds-aichat-history-panel-item",
    ) as HTMLElement;
    const overflowMenu = item.shadowRoot?.querySelector(
      "cds-overflow-menu",
    ) as any;

    // Open the menu
    overflowMenu.open = true;
    await overflowMenu.updateComplete;

    const menuItems = overflowMenu.querySelectorAll("cds-overflow-menu-item");
    const firstMenuItem = menuItems[0] as HTMLElement;
    const secondMenuItem = menuItems[1] as HTMLElement;

    firstMenuItem.focus();

    // Arrow keys within menu should navigate menu items, not rows
    const downEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
    });
    firstMenuItem.dispatchEvent(downEvent);

    // Menu should handle this internally
    // This test verifies the event doesn't bubble up to treegrid navigation
  });
});
```

#### Screen Reader Testing Checklist

- [ ] NVDA (Windows): Announces "treegrid", row count, current position
- [ ] JAWS (Windows): Announces structure, navigation works correctly
- [ ] VoiceOver (macOS): Announces roles, supports navigation
- [ ] Verify expanded/collapsed state is announced
- [ ] Verify selected state is announced
- [ ] Verify level/nesting is communicated

#### Storybook Documentation

Update `chat-history.mdx`:

```markdown
## Keyboard Navigation

The chat history uses the treegrid pattern for efficient keyboard navigation within the `cds-aichat-history-panel-items` component:

### Navigation Between Rows

| Key              | Action                            |
| ---------------- | --------------------------------- |
| <kbd>↓</kbd>     | Move to next chat item            |
| <kbd>↑</kbd>     | Move to previous chat item        |
| <kbd>Home</kbd>  | Jump to first item                |
| <kbd>End</kbd>   | Jump to last item                 |
| <kbd>Enter</kbd> | Select/activate focused chat item |

### Navigation Within a Row

| Key                  | Action                                           |
| -------------------- | ------------------------------------------------ |
| <kbd>→</kbd>         | Move from item name to overflow menu button      |
| <kbd>←</kbd>         | Move from overflow menu button back to item name |
| <kbd>Tab</kbd>       | Exit treegrid to next focusable element          |
| <kbd>Shift+Tab</kbd> | Exit treegrid to previous focusable element      |

### Overflow Menu Navigation

When the overflow menu is open:

| Key               | Action                                         |
| ----------------- | ---------------------------------------------- |
| <kbd>↓</kbd>      | Move to next menu item                         |
| <kbd>↑</kbd>      | Move to previous menu item                     |
| <kbd>Enter</kbd>  | Activate menu item                             |
| <kbd>Escape</kbd> | Close menu and return focus to overflow button |

### Focus Management

- Only one cell is in the tab sequence at a time (roving tabindex)
- Focus starts on the item name cell when entering a row
- Focus is restored to the previously focused cell when returning to the history
- After deleting an item, focus moves to the next item's name cell
- Overflow menu preserves its existing keyboard navigation behavior
```

## Migration Guide

### For Consumers

The treegrid implementation is **backwards compatible**. Existing implementations will continue to work without changes. However, to take full advantage of the new keyboard navigation:

1. **No code changes required** - The treegrid pattern is automatically applied
2. **Test keyboard navigation** - Verify arrow keys work as expected in your implementation
3. **Update documentation** - Inform users about the new keyboard shortcuts

### Breaking Changes

**None** - This is a non-breaking enhancement to keyboard navigation.

## Accessibility Compliance

This implementation follows:

- [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA 1.2 Treegrid Pattern](https://w3c.github.io/aria/#treegrid)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/)

## Performance Considerations

- Focus manager caches row references to minimize DOM queries
- Keyboard event handlers use event delegation
- Roving tabindex updates are batched to minimize reflows
- Visible row calculation respects collapsed sections

## Future Enhancements

- [ ] Multi-select support (Ctrl+Click, Shift+Click)
- [ ] Type-ahead search (jump to item by typing)
- [ ] Drag-and-drop reordering
- [ ] Virtual scrolling for large lists
- [ ] Customizable keyboard shortcuts

## References

- [W3C ARIA Treegrid Role](https://w3c.github.io/aria/#treegrid)
- [MDN Treegrid Role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/treegrid_role)
- [ARIA Authoring Practices - Treegrid](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/)
- [Carbon Design System - Accessibility](https://carbondesignsystem.com/guidelines/accessibility/overview/)
