/*
 *  Copyright IBM Corp. 2026
 *
 *  This source code is licensed under the Apache-2.0 license found in the
 *  LICENSE file in the root directory of this source tree.
 *
 *  @license
 */

import prefix from "../../../globals/settings.js";
import { carbonElement } from "../../../globals/decorators/carbon-element.js";
import CDSSideNavMenu from "@carbon/web-components/es/components/ui-shell/side-nav-menu.js";
import HostListener from "@carbon/web-components/es/globals/decorators/host-listener.js";
import HostListenerMixin from "@carbon/web-components/es/globals/mixins/host-listener.js";

import styles from "./chat-history.scss?lit";

/**
 * Chat History panel menu (section header).
 * Acts as a row in the treegrid with expand/collapse functionality.
 *
 * @element cds-aichat-history-panel-menu
 *
 */
@carbonElement(`${prefix}-history-panel-menu`)
class CDSAIChatHistoryPanelMenu extends HostListenerMixin(CDSSideNavMenu) {
  static styles = styles;

  connectedCallback() {
    super.connectedCallback();
    // Add treegrid row role and ARIA attributes
    this.setAttribute("role", "row");
    this.setAttribute("aria-level", "1");
    // Make the menu itself focusable (acts as its own gridcell)
    this.setAttribute("tabindex", "-1");

    // Set aria-expanded based on the expanded property
    // The expanded property is managed by the parent CDSSideNavMenu
    this.setAttribute("aria-expanded", this.expanded ? "true" : "false");
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Update aria-expanded when the expanded property changes
    if (changedProperties.has("expanded")) {
      this.setAttribute("aria-expanded", this.expanded ? "true" : "false");
    }
  }

  /**
   * Handle keyboard navigation for expand/collapse
   */
  @HostListener("keydown")
  // @ts-ignore: The decorator refers to this method but TS thinks this method is not referred to
  private _handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
        if (!this.expanded) {
          event.preventDefault();
          event.stopPropagation();
          this.expanded = true;
        }
        break;

      case 'ArrowLeft':
        if (this.expanded) {
          event.preventDefault();
          event.stopPropagation();
          this.expanded = false;
        }
        break;

      case 'Enter':
      case ' ':
        // Toggle expanded state
        event.preventDefault();
        event.stopPropagation();
        this.expanded = !this.expanded;
        break;

      default:
        // Let other keys bubble up to the treegrid container
        break;
    }
  }
}

export { CDSAIChatHistoryPanelMenu };
export default CDSAIChatHistoryPanelMenu;
