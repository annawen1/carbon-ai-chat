/*
 *  Copyright IBM Corp. 2026
 *
 *  This source code is licensed under the Apache-2.0 license found in the
 *  LICENSE file in the root directory of this source tree.
 *
 *  @license
 */

import prefix from "../../../globals/settings.js";
import { property } from "lit/decorators.js";
import { carbonElement } from "../../../globals/decorators/carbon-element.js";
import CDSSideNavItems from "@carbon/web-components/es/components/ui-shell/side-nav-items.js";
import HostListener from "@carbon/web-components/es/globals/decorators/host-listener.js";
import HostListenerMixin from "@carbon/web-components/es/globals/mixins/host-listener.js";

import { TreegridFocusManager } from "./treegrid-focus-manager.js";
import styles from "./chat-history.scss?lit";

/**
 * Chat History panel items container.
 * Implements W3C ARIA treegrid pattern with roving tabindex for keyboard navigation.
 *
 * @element cds-aichat-history-panel-items
 *
 */
@carbonElement(`${prefix}-history-panel-items`)
class CDSAIChatHistoryPanelItems extends HostListenerMixin(CDSSideNavItems) {
  static styles = styles;

  /**
   * aria-label for the panel items container
   */
  @property({ type: String, reflect: true })
  label = "chat history";

  private _focusManager?: TreegridFocusManager;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("data-floating-menu-container", "");
    // Add treegrid role and label for accessibility
    this.setAttribute("role", "treegrid");
    this.setAttribute("aria-label", this.label);

    // Initialize focus manager after a short delay to ensure children are rendered
    requestAnimationFrame(() => {
      this._focusManager = new TreegridFocusManager(this);
      this._focusManager.initialize();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._focusManager = undefined;
  }

  /**
   * Handle keyboard navigation within the treegrid
   */
  @HostListener("keydown")
  // @ts-ignore: The decorator refers to this method but TS thinks this method is not referred to
  private _handleKeyDown(event: KeyboardEvent) {
    if (!this._focusManager) {
      return;
    }

    // Get the currently focused row
    const activeElement = this.shadowRoot?.activeElement || document.activeElement;
    const currentRow = this._findRowElement(activeElement as HTMLElement);

    if (!currentRow) {
      return;
    }

    let handled = false;

    switch (event.key) {
      case 'ArrowDown':
        handled = this._focusManager.focusNextRow(currentRow);
        break;

      case 'ArrowUp':
        handled = this._focusManager.focusPreviousRow(currentRow);
        break;

      case 'Home':
        handled = this._focusManager.focusFirstRow();
        break;

      case 'End':
        handled = this._focusManager.focusLastRow();
        break;

      case 'ArrowRight':
      case 'ArrowLeft':
        // Let the row handle expand/collapse
        // Don't prevent default here
        return;

      default:
        return;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Find the row element (panel-menu or panel-item) that contains the given element
   */
  private _findRowElement(element: HTMLElement | null): HTMLElement | null {
    if (!element) {
      return null;
    }

    // Check if element itself is a row
    if (element.tagName.toLowerCase().includes('history-panel')) {
      return element;
    }

    // Walk up to find a row element
    let current = element;
    while (current && current !== this) {
      if (current.tagName.toLowerCase().includes('history-panel-menu') ||
          current.tagName.toLowerCase().includes('history-panel-item')) {
        return current;
      }
      current = current.parentElement as HTMLElement;
    }

    return null;
  }
}

export { CDSAIChatHistoryPanelItems };
export default CDSAIChatHistoryPanelItems;
