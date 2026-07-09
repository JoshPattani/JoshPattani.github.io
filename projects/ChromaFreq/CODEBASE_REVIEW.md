# ChromaFreq Codebase Review

Date: 2026-07-08

## 1. Current project structure

ChromaFreq currently lives under `projects/ChromaFreq/` and contains a preserved `v1/` archive:

- `v1/index.html`: legacy single-page p5.js app shell.
- `v1/style.css`: legacy app styles and dropdown/button styling.
- `v1/main.js`: dropdown behavior, player controls, track selection, mute/stop/reset handlers.
- `v1/fileHandler.js`: hard-coded album, track, cover, and local file metadata.
- `v1/sketch.js`: active p5.js/p5.sound canvas, playback, FFT analysis, frequency-to-color mapping, and rendering experiments.
- `v1/util/`: older utility experiments. `util.js` duplicates much of the color/FFT logic, `freqCalc.js` contains an incomplete MIDI helper, and `physics.js` is commented-out sound velocity work.
- `v1/assets/`: large local audio and cover assets. The archive contains 26 WAV files and 13 FLAC files, totaling about 3.56 GB. Some appear to be commercial/copyrighted music.
- `v1/docs/ColorFreq_Documentation.docx`: original documentation artifact.

The parent portfolio repo is a static site with no root `package.json` and no current build step. That makes a lightweight ES module V2 the safest first modernization path. A Vite migration could be useful later if ChromaFreq grows into a larger standalone app, but adding a build pipeline now would create extra deployment and maintenance surface for a GitHub Pages portfolio.

## 2. Main files and responsibilities

- `index.html` loads p5.js, p5.sound, `fileHandler.js`, `sketch.js`, and `main.js`. It provides a centered title, album art placeholder, album/track selects, and basic playback controls.
- `fileHandler.js` defines album constants and a `FileHandler` class. Most commercial album entries are commented out in the active album list, while the current active choices are a sine sweep, drum-and-bass file, and a local composition.
- `main.js` owns DOM interaction: dropdown toggling, album/track change handlers, play/pause/stop/reset/mute controls, and calls into `setup(file)` from `sketch.js`.
- `sketch.js` owns p5 setup/draw, p5.sound loading/playback, FFT and amplitude setup, dominant-frequency approximation, color mapping, and visual drawing functions.
- `util/util.js` is not loaded by `index.html` and appears to be an older scratchpad or previous version of the same concepts.

## 3. Current audio ingestion/playback flow

The legacy app uses local files only. It does not stream from Spotify or any service.

1. `DOMContentLoaded` creates a `FileHandler` and populates the album dropdown.
2. Selecting an album updates cover art and populates a track dropdown.
3. Selecting a track calls `fileHandler.selectTrack()`.
4. `selectTrack()` calls `setupPlayer(trackFile)` in `main.js`.
5. `setupPlayer()` calls the global p5 `setup(file)`.
6. `setup(file)` calls `loadSound(file)` from p5.sound and creates a p5 canvas.
7. A canvas click calls `playSong()` or `pauseSong()`.
8. `draw()` checks `song.isPlaying()`, runs `fft.analyze()`, and calls `analyzeAudio()`.

This flow is tightly coupled across global variables and cross-file globals. It also depends on local file paths being present and browser-accessible.

## 4. Current FFT/frequency/color-mapping logic

The active analysis path is in `v1/sketch.js`.

- `fft = new p5.FFT()` and `song.connect(fft)` create the analyzer.
- `draw()` calls `fft.analyze()` each frame.
- `analyzeAudio(spectrum)` uses `fft.getCentroid()` as the frequency value. The variable is called `dominantFrequency`, but it is actually the spectral centroid.
- The active V1 color path calls `soundFreqToLightWavelength(dominantFrequency)`.
- `soundFreqToLightWavelength()` logarithmically maps audio frequencies from about 64 Hz to 16000 Hz into 400-675 nm, then converts that wavelength to RGB.
- A legacy linear/octave mapping remains in `resonantRGB()`: it doubles an audio frequency until it reaches the visible-light frequency range, converts light frequency to wavelength, then converts wavelength to RGB.
- `getColorFromWavelength()` implements a Dan Bruton-style wavelength-to-RGB conversion with intensity falloff near the vision limits.

The conceptual lineage is worth preserving: audio frequency, octave-scaling toward visible light, wavelength conversion, RGB output, and a later logarithmic mapping for better perceptual spacing.

## 5. Current UI/styling approach

The V1 UI is a centered student-prototype layout:

- A title and short tagline.
- A 256 px album art placeholder.
- Custom-styled dropdowns for album and track selection.
- Basic text buttons for stop, mute, reset, and dynamically inserted play/pause.
- A p5-generated volume slider.
- A single gray canvas with color-wave drawing after playback starts.

The CSS uses broad fixed sizing, heavy centered layout, repeated dropdown styling, and a generic blue/white control palette. It does not yet feel like a polished portfolio artifact or immersive creative-technology instrument.

## 6. Bugs, fragile areas, dead code, duplicated logic, outdated dependencies

- The legacy `index.html` references `/libraries/p5/lib/p5.js`, `/libraries/p5/lib/addons/p5.sound.js`, and `/atls4141_color/assets/coverImg.png`; those absolute paths are not present in this portfolio repo.
- Script order loads `sketch.js` before p5.js. Because functions are not called until later, this may not fail immediately, but it is fragile.
- `loadSound(file, console.log(...))` passes the result of `console.log` instead of a callback.
- `song.duration()` is read immediately after `loadSound()`, before the async load is guaranteed to complete.
- Several globals are undeclared or implicit, including `songLength`, `spectralCentroid`, `menuText`, `bgColor`, `albumName`, and `trackName`.
- `HTMLCollection.forEach()` is used in `createControls()`, but `getElementsByClassName()` returns an `HTMLCollection` that does not reliably support `forEach()`.
- `stopSong()`, `muteOn()`, and `muteOff()` assume `song` exists.
- `closeInteractiveGUI()` treats a collection as one element.
- `draw()` logs every frame, which will flood the console.
- `drawWaveform()` references `colors[i]`, but `colors` is not defined.
- `util/util.js` duplicates core color and analysis logic but is not loaded. It also contains an RGB conversion bug that multiplies already-255-scaled values by 255 again.
- `util/freqCalc.js` exports an incomplete `getFrequency()` function in a project otherwise written as non-module browser globals.
- `util/physics.js` is entirely commented out.
- Large commercial music assets are present in the archive. V2 should not depend on them.
- There is no local test harness for color conversion or mapping behavior.
- p5.js and p5.sound are not vendored in the current project, and the legacy absolute CDN/local-library references are stale.

## 7. Recommended V2 architecture

Use a static, buildless ES module architecture for V2:

- `audio/AudioEngine`: shared Web Audio context, analyser, gain, playback state, FFT settings, and analysis frame generation.
- `audio/LocalFileSource`: user-owned file decoding and playback through Web Audio.
- `audio/DemoSource`: generated oscillator/tone source so the demo does not require copyrighted assets.
- `audio/LiveInputSource`: microphone source with permission handling and no output monitoring by default.
- `audio/PrecomputedAnalysisSource`: placeholder for future pre-rendered analysis datasets.
- `spotify/SpotifyMetadataSource`: optional metadata/context placeholder only. It must not access or analyze Spotify audio.
- `visuals/ChromaFreqVisualizer`: canvas orchestration, resizing, animation, and visual state.
- `visuals/SpectrumRenderer`: reusable drawing routines for spectrum bars, waveform, and glow fields.
- `color/colorMapping`: named mapping modes and analysis-to-color conversion.
- `color/wavelengthToRgb`: testable wavelength-to-RGB conversion.
- `ui/playerControls`, `ui/sourceSelector`, `ui/analysisReadout`: small DOM binding modules.

This structure keeps ChromaFreq deployable as a static portfolio page while separating audio, color science, visuals, and UI concerns.

## 8. What can be preserved from the original project

- The core concept: translating sound analysis into visible color.
- Local-file-first analysis rather than streaming-service audio access.
- The legacy octave-scaling/resonant-color mapping as a named mapping mode.
- The logarithmic mapping direction as the default conceptual approach.
- The wavelength-to-RGB conversion lineage and visible-spectrum falloff.
- The sine-sweep/test-tone idea as a safe demo path.
- The "color waves" visualization as inspiration, but not as the only visual treatment.
- The historical `v1/` archive for reference.

## 9. What should be replaced or refactored

- Replace p5.sound playback and FFT with direct Web Audio API modules.
- Replace hard-coded album catalogs with local upload, generated demo, live input, and optional precomputed metadata.
- Remove runtime dependence on commercial or copied audio files.
- Replace cross-file globals with explicit classes and module exports.
- Replace duplicated mapping functions with tested color modules.
- Replace clunky dropdown/button layout with a responsive stage, source panel, analysis panel, and settings controls.
- Replace console-heavy frame logging with visible analysis readouts and clean debug boundaries.
- Add safeguards for out-of-range frequencies, unsupported file loads, denied microphone permission, and absent Spotify credentials.
- Keep Spotify as metadata/context only. It should never be treated as an audio source.
