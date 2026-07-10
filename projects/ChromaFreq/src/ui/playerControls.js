import { $, $all, formatDuration } from "./dom.js";

export class PlayerControls {
  constructor(root, callbacks = {}) {
    this.root = root;
    this.callbacks = callbacks;
    this.panels = $all("[data-source-panel]", root);
    this.status = $("[data-player-status]", root);
    this.trackTitle = $("[data-track-title]", root);
    this.trackMeta = $("[data-track-meta]", root);
    this.playButton = $("[data-action='play']", root);
    this.pauseButton = $("[data-action='pause']", root);
    this.stopButton = $("[data-action='stop']", root);
    this.fileInput = $("[data-file-input]", root);
    this.dropzone = $("[data-dropzone]", root);
    this.volume = $("[data-control='volume']", root);
    this.smoothing = $("[data-control='smoothing']");
    this.sensitivity = $("[data-control='sensitivity']");
    this.fftSize = $("[data-control='fft-size']");
    this.mappingMode = $("[data-control='mapping-mode']");
    this.visualMode = $("[data-control='visual-mode']");
    this.colorDriver = $("[data-control='color-driver']");

    this.playButton.addEventListener("click", () => callbacks.onPlay?.());
    this.pauseButton.addEventListener("click", () => callbacks.onPause?.());
    this.stopButton.addEventListener("click", () => callbacks.onStop?.());
    this.fileInput.addEventListener("change", () => {
      const [file] = this.fileInput.files;
      if (file) callbacks.onFile?.(file);
    });

    this.volume.addEventListener("input", () => callbacks.onVolume?.(this.volume.value));
    this.smoothing.addEventListener("input", () =>
      callbacks.onSmoothing?.(this.smoothing.value)
    );
    this.sensitivity.addEventListener("input", () =>
      callbacks.onSensitivity?.(this.sensitivity.value)
    );
    this.fftSize.addEventListener("change", () => callbacks.onFftSize?.(this.fftSize.value));
    this.mappingMode.addEventListener("change", () =>
      callbacks.onMappingMode?.(this.mappingMode.value)
    );
    this.visualMode.addEventListener("change", () =>
      callbacks.onVisualMode?.(this.visualMode.value)
    );
    this.colorDriver.addEventListener("change", () =>
      callbacks.onColorDriver?.(this.colorDriver.value)
    );

    this.bindDropzone();
  }

  bindDropzone() {
    this.dropzone.addEventListener("click", () => this.fileInput.click());
    this.dropzone.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.fileInput.click();
      }
    });

    for (const eventName of ["dragenter", "dragover"]) {
      this.dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        this.dropzone.classList.add("is-dragging");
      });
    }

    for (const eventName of ["dragleave", "drop"]) {
      this.dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        this.dropzone.classList.remove("is-dragging");
      });
    }

    this.dropzone.addEventListener("drop", (event) => {
      const [file] = event.dataTransfer.files;
      if (file) this.callbacks.onFile?.(file);
    });
  }

  setSourceMode(mode) {
    for (const panel of this.panels) {
      panel.hidden = panel.dataset.sourcePanel !== mode;
    }
  }

  setStatus(message) {
    this.status.textContent = message;
  }

  setTrack(metadata) {
    this.trackTitle.textContent = metadata?.title ?? "No source selected";
    const detail = metadata?.detail ? ` - ${metadata.detail}` : "";
    const duration = metadata ? formatDuration(metadata.duration) : "Idle";
    this.trackMeta.textContent = metadata
      ? `${metadata.artist ?? "Analysis source"} - ${duration}${detail}`
      : "Choose a source to begin.";
  }

  setPlaybackState(state) {
    const isPlaying = Boolean(state?.isPlaying);
    this.playButton.disabled = isPlaying;
    this.pauseButton.disabled = !isPlaying;
    this.stopButton.disabled = !state || state.sourceMode === "none";
  }
}
