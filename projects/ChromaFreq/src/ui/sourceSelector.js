import { $all } from "./dom.js";

export class SourceSelector {
  constructor(root, callbacks = {}) {
    this.root = root;
    this.callbacks = callbacks;
    this.buttons = $all("[data-source]", root);
    this.activeSource = "demo";

    for (const button of this.buttons) {
      button.addEventListener("click", () => {
        if (button.disabled) return;
        const mode = button.dataset.source;
        this.setActive(mode);
        callbacks.onChange?.(mode);
      });
    }

    this.setActive(this.activeSource);
  }

  setActive(mode) {
    this.activeSource = mode;

    for (const button of this.buttons) {
      const isActive = button.dataset.source === mode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    }
  }

  setDisabled(mode, disabled) {
    const button = this.buttons.find((candidate) => candidate.dataset.source === mode);
    if (!button) return;
    button.disabled = disabled;
    button.setAttribute("aria-disabled", String(disabled));
  }
}
