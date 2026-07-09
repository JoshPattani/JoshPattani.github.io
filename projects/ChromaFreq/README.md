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

The tests cover the wavelength-to-RGB helper and the named frequency-to-color
mapping modes.

## Source modes

- Demo: generated oscillator tones. This is the safest built-in portfolio demo
  and does not require copyrighted audio.
- Local File: user-selected audio files decoded by the browser and analyzed with
  Web Audio.
- Live Input: microphone input with permission. Audio monitoring is disabled to
  avoid feedback.
- Spotify Companion: reserved for future metadata, album art, search, and links.
  Spotify is not used as a raw audio source.

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

The conversion path is:

```text
audio frequency -> mapped/scaled light frequency or wavelength -> RGB/HEX color
```

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
- The generated demo is intentionally synthetic and should not be treated as a
  substitute for musical analysis.
- The visualizer currently maps a dominant FFT bin to color; richer future
  versions could blend multiple bands into layered color fields.
- Spotify metadata/OAuth is not implemented yet.

## Future ideas

- Add precomputed analysis JSON for approved demo pieces.
- Add optional album art and metadata display for local files.
- Add a banded color mode that maps bass, midrange, and treble separately.
- Add exported stills or short analysis snapshots for portfolio documentation.
- Add Spotify OAuth only for metadata and links.
