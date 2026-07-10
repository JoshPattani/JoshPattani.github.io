# ChromaFreq V2 Roadmap

## Complete in this pass

- Static ES module app shell.
- Web Audio analysis engine.
- Local file, generated demo, and live microphone source paths.
- Spotify companion placeholder with no protected-audio analysis.
- Modular color mapping with legacy and log modes.
- Signal Observatory, Legacy Spectrum Sweep, and Hybrid Spectrum Field visual modes.
- Reference Sine Sweep demo generated in-browser from 40 Hz to 16 kHz.
- Color driver setting for Dominant Peak, Spectral Centroid, and Weighted Band Blend.
- Analysis readout that separates dominant frequency, centroid, color source,
  mapped wavelength, RGB/HEX, amplitude, mapping mode, and reference sweep tone.
- Layout refinement for desktop viewport fit, panel scrolling, and cleaner header rhythm.
- PNG canvas snapshot export.
- Documentation and lightweight color/analysis tests.

## Next

- Add approved precomputed demo analysis data.
- Add richer local-file metadata extraction where browser APIs allow it.
- Tune the weighted band blend model with adjustable user-facing band weights.
- Add visual style presets that still derive color from analysis.
- Add a project page card/link from the main portfolio if desired.

## Later

- Add Spotify OAuth for metadata, album art, and "open in Spotify" links only.
- Add configurable band weighting for bass, mid, and treble color layers.
- Add a written technical case study comparing the legacy octave mapping and the
  V2 perceptual log mapping.
- Add optional short video or frame-sequence export for portfolio documentation.