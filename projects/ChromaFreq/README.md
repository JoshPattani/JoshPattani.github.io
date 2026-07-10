# ChromaFreq V2

ChromaFreq is an experimental listening instrument that translates sound into
visible color, using real-time frequency analysis and wavelength mapping to
explore the space between music, perception, and light.

The original ChromaFreq prototype was built for an ATLAS Institute color study
course with p5.js and p5.sound. V2 keeps the concept but moves the runtime to
plain browser-native Web Audio modules so it can live cleanly inside this static
portfolio site.

## Run locally

From the repository root:

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080/projects/ChromaFreq/
```

The app uses ES modules, so serve it over HTTP instead of opening the HTML file
directly from disk.

## Tests

```powershell
cd projects/ChromaFreq
npm test
```

The tests cover the wavelength-to-RGB helper, named frequency-to-color mapping
modes, and the analysis helpers that select the active color driver.

## Source modes

- Demo: Reference Sine Sweep, a generated logarithmic sine sweep from 40 Hz to
  16 kHz. It is rights-safe, generated in-browser, and exposes sweep frequency
  hints to the readout and visualizer.
- Local File: user-selected audio files decoded by the browser and analyzed with
  Web Audio.
- Live Input: microphone input with permission. Audio monitoring is disabled to
  avoid feedback.
- Spotify Companion: reserved for future metadata, album art, search, and links.
  Spotify is not used as a raw audio source.

## Visual modes

- Signal Observatory: the polished V2 radial/waveform/FFT instrument view.
- Legacy Spectrum Sweep: a full horizontal visible-spectrum field with FFT bars
  mapped through the real wavelength-to-RGB and frequency-to-color code.
- Hybrid Spectrum Field: combines the visible-spectrum reference layer with the
  V2 radial glow, waveform motion, and mapped wavelength cursor.

Use the PNG snapshot button to export the current canvas for portfolio images.

## Analysis and color drivers

The conversion path is:

```text
audio frequency -> mapped wavelength -> RGB/HEX color
```

The Color driver setting chooses which analysis value feeds that path:

- Dominant Peak: strongest FFT bin in the analyzed range.
- Spectral Centroid: weighted center of spectral energy.
- Weighted Band Blend: coarse bass, mid, presence, and air bands blended by
  energy.

The readout shows dominant frequency, spectral centroid, selected color source,
reference sweep tone when available, mapped wavelength, HEX, RGB, amplitude, and
mapping mode. Low-amplitude input is guarded so silence does not display random
colors as if they were meaningful analysis.

## Spotify constraint

ChromaFreq does not rip, download, record, bypass DRM, or analyze Spotify's
protected audio stream. If Spotify support is added later, it should remain a
companion/context layer only. Real analysis should come from local/user-owned
files, generated demo tones, live microphone input, or approved precomputed
analysis data.

## Color mapping

The color engine exposes named mapping modes:

- Perceptual Log Mapping: the default V2 mode. Audio frequency is mapped on a
  logarithmic scale across visible wavelengths, with lower frequencies toward
  red and higher frequencies toward violet.
- Legacy Linear / 40-Octave Mapping: preserves the original resonant-color idea
  by doubling an audio frequency by octaves until it reaches the visible-light
  frequency band, then converting that light frequency to wavelength and RGB.
- V1 Log Ramp: preserves the archived p5 prototype's log-ramp direction.

The wavelength-to-RGB helper clamps or reports out-of-range values and is kept in
`src/color/wavelengthToRgb.js` for testing.

## Architecture

```text
src/
  audio/
    AudioEngine.js
    DemoSource.js
    LiveInputSource.js
    LocalFileSource.js
    PrecomputedAnalysisSource.js
  color/
    colorMapping.js
    wavelengthToRgb.js
  spotify/
    SpotifyMetadataSource.js
  ui/
    analysisReadout.js
    dom.js
    playerControls.js
    sourceSelector.js
  visuals/
    ChromaFreqVisualizer.js
    SpectrumRenderer.js
```

The legacy prototype remains under `v1/` for reference. V2 does not depend on
the copied legacy audio assets.

## Known limitations

- Browser audio decoding support varies by file type.
- Microphone mode requires HTTPS in production or localhost during development.
- The generated sine sweep is intentionally synthetic and should not be treated
  as a substitute for musical analysis.
- Weighted Band Blend is intentionally coarse; future versions could expose
  editable band weights or per-band color layers.
- Spotify metadata/OAuth is not implemented yet.

## Future ideas

- Add precomputed analysis JSON for approved demo pieces.
- Add optional album art and metadata display for local files.
- Add a banded color mode that maps bass, midrange, and treble separately.
- Add exported short analysis clips for portfolio documentation.
- Add Spotify OAuth only for metadata and links.