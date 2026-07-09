import { formatFrequency, formatPercent } from "./dom.js";

export class AnalysisReadout {
  constructor(root) {
    this.root = root;
    this.fields = {
      frequency: root.querySelector("[data-readout='frequency']"),
      wavelength: root.querySelector("[data-readout='wavelength']"),
      color: root.querySelector("[data-readout='color']"),
      rgb: root.querySelector("[data-readout='rgb']"),
      mapping: root.querySelector("[data-readout='mapping']"),
      amplitude: root.querySelector("[data-readout='amplitude']"),
      centroid: root.querySelector("[data-readout='centroid']"),
    };
  }

  update(frame) {
    const { analysis, color } = frame;

    this.setField("frequency", formatFrequency(analysis.dominantFrequencyHz));
    this.setField(
      "centroid",
      analysis.spectralCentroidHz
        ? formatFrequency(analysis.spectralCentroidHz)
        : "0 Hz"
    );
    this.setField(
      "wavelength",
      color.wavelengthNm ? `${color.wavelengthNm.toFixed(1)} nm` : "0 nm"
    );
    this.setField("color", color.hex.toUpperCase());
    this.setField("rgb", `rgb(${color.rgb.join(", ")})`);
    this.setField("mapping", color.modeLabel);
    this.setField("amplitude", formatPercent(analysis.amplitude));
  }

  setField(name, value) {
    if (this.fields[name]) {
      this.fields[name].textContent = value;
    }
  }
}
