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

import styles from "./chat-history.scss?lit";

/**
 * Chat History panel menu (section header).
 * Acts as a row in the treegrid with a single gridcell containing the section title and expand/collapse indicator.
 *
 * @element cds-aichat-history-panel-menu
 *
 */
@carbonElement(`${prefix}-history-panel-menu`)
class CDSAIChatHistoryPanelMenu extends CDSSideNavMenu {
  static styles = styles;

  connectedCallback() {
    super.connectedCallback();
    // Add treegrid row role and ARIA attributes
    this.setAttribute("role", "row");
    this.setAttribute("aria-level", "1");

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
}

export { CDSAIChatHistoryPanelMenu };
export default CDSAIChatHistoryPanelMenu;
