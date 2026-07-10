import { formatFrequency, formatPercent } from "./dom.js";

export class AnalysisReadout {
  constructor(root) {
    this.root = root;
    this.fields = {
      frequency: root.querySelector("[data-readout='frequency']"),
      centroid: root.querySelector("[data-readout='centroid']"),
      colorSource: root.querySelector("[data-readout='color-source']"),
      colorDriver: root.querySelector("[data-readout='color-driver']"),
      referenceTone: root.querySelector("[data-readout='reference-tone']"),
      wavelength: root.querySelector("[data-readout='wavelength']"),
      color: root.querySelector("[data-readout='color']"),
      rgb: root.querySelector("[data-readout='rgb']"),
      mapping: root.querySelector("[data-readout='mapping']"),
      amplitude: root.querySelector("[data-readout='amplitude']"),
    };
  }

  update(frame) {
    const { analysis, color, sourceHints } = frame;
    const hasSignal = Boolean(analysis.hasSignal);

    this.setField(
      "frequency",
      hasSignal ? formatFrequency(analysis.dominantFrequencyHz) : "0 Hz"
    );
    this.setField(
      "centroid",
      hasSignal ? formatFrequency(analysis.spectralCentroidHz) : "0 Hz"
    );
    this.setField(
      "colorSource",
      hasSignal ? formatFrequency(analysis.colorFrequencyHz) : "Silent"
    );
    this.setField("colorDriver", analysis.colorDriverLabel ?? "Dominant Peak");
    this.setField(
      "referenceTone",
      sourceHints?.sweepFrequencyHz
        ? formatFrequency(sourceHints.sweepFrequencyHz)
        : "Not active"
    );
    this.setField(
      "wavelength",
      color.wavelengthNm && !color.isSilent
        ? `${color.wavelengthNm.toFixed(1)} nm`
        : "0 nm"
    );
    this.setField("color", color.hex.toUpperCase());
    this.setField("rgb", `rgb(${color.rgb.join(", ")})`);
    this.setField("mapping", color.modeLabel);
    this.setField("amplitude", formatPercent(hasSignal ? analysis.amplitude : 0));
  }

  setField(name, value) {
    if (this.fields[name]) {
      this.fields[name].textContent = value;
    }
  }
}
