/*
 *  Copyright IBM Corp. 2026
 *
 *  This source code is licensed under the Apache-2.0 license found in the
 *  LICENSE file in the root directory of this source tree.
 *
 *  @license
 */

/**
 * Manages focus and keyboard navigation for the chat history treegrid.
 * Implements roving tabindex pattern as required by W3C ARIA treegrid specification.
 */
export class TreegridFocusManager {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Get all rows in the treegrid (both menu headers and items)
   * Returns rows in DOM order
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
  getVisibleRows(): HTMLElement[] {
    const allRows = this.getAllRows();
    const visibleRows: HTMLElement[] = [];

    for (const row of allRows) {
      // Menu headers are always visible
      if (row.tagName.toLowerCase().includes("menu")) {
        visibleRows.push(row);
        continue;
      }

      // Check if item is within a collapsed section
      const parentMenu = this.findParentMenu(row);
      if (parentMenu) {
        const expanded = (parentMenu as any).expanded;
        if (!expanded) {
          continue;
        }
      }

      visibleRows.push(row);
    }

    return visibleRows;
  }

  /**
   * Find the parent menu for an item
   */
  private findParentMenu(item: HTMLElement): HTMLElement | null {
    // Walk up the DOM to find the parent menu
    let current = item.previousElementSibling;
    while (current) {
      if (current.tagName.toLowerCase().includes("menu")) {
        return current as HTMLElement;
      }
      current = current.previousElementSibling;
    }
    return null;
  }

  /**
   * Get the gridcell element within a row
   */
  private getGridcell(row: HTMLElement): HTMLElement | null {
    // For panel-menu, the gridcell might be in shadow DOM or the element itself
    if (row.tagName.toLowerCase().includes("menu")) {
      // Menu headers act as their own gridcell
      return row;
    }

    // For panel-item, find the gridcell in shadow DOM
    const gridcell = row.shadowRoot?.querySelector(
      '[role="gridcell"]',
    ) as HTMLElement;
    return gridcell || null;
  }

  /**
   * Set focus to a specific row
   * Implements roving tabindex by setting tabindex="0" on target and tabindex="-1" on others
   */
  setFocusToRow(targetRow: HTMLElement) {
    const allRows = this.getAllRows();

    // Update tabindex on all rows (roving tabindex pattern)
    allRows.forEach((row) => {
      const gridcell = this.getGridcell(row);
      if (gridcell) {
        gridcell.setAttribute("tabindex", row === targetRow ? "0" : "-1");
      }
    });

    // Focus the target row's gridcell
    const targetCell = this.getGridcell(targetRow);
    if (targetCell) {
      targetCell.focus();
    }
  }

  /**
   * Move focus to the next visible row
   */
  focusNextRow(currentRow: HTMLElement): boolean {
    const visibleRows = this.getVisibleRows();
    const currentIndex = visibleRows.indexOf(currentRow);

    if (currentIndex === -1 || currentIndex === visibleRows.length - 1) {
      return false; // Already at last row or row not found
    }

    const nextRow = visibleRows[currentIndex + 1];
    this.setFocusToRow(nextRow);
    return true;
  }

  /**
   * Move focus to the previous visible row
   */
  focusPreviousRow(currentRow: HTMLElement): boolean {
    const visibleRows = this.getVisibleRows();
    const currentIndex = visibleRows.indexOf(currentRow);

    if (currentIndex <= 0) {
      return false; // Already at first row or row not found
    }

    const previousRow = visibleRows[currentIndex - 1];
    this.setFocusToRow(previousRow);
    return true;
  }

  /**
   * Move focus to the first visible row
   */
  focusFirstRow(): boolean {
    const visibleRows = this.getVisibleRows();
    if (visibleRows.length === 0) {
      return false;
    }

    this.setFocusToRow(visibleRows[0]);
    return true;
  }

  /**
   * Move focus to the last visible row
   */
  focusLastRow(): boolean {
    const visibleRows = this.getVisibleRows();
    if (visibleRows.length === 0) {
      return false;
    }

    this.setFocusToRow(visibleRows[visibleRows.length - 1]);
    return true;
  }

  /**
   * Initialize the treegrid with proper tabindex values
   * Sets tabindex="0" on the first visible row or selected row
   */
  initialize() {
    const visibleRows = this.getVisibleRows();
    if (visibleRows.length === 0) {
      return;
    }

    // Find selected row
    const selectedRow = visibleRows.find((row) => {
      return (
        row.hasAttribute("selected") ||
        row.getAttribute("aria-selected") === "true"
      );
    });

    // Focus selected row or first row
    const initialRow = selectedRow || visibleRows[0];
    this.setFocusToRow(initialRow);
  }
}

// Made with Bob
