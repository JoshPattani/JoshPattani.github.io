import {
  AudioEngine,
  COLOR_DRIVERS,
  DEFAULT_COLOR_DRIVER,
} from "./audio/AudioEngine.js";
import { DemoSource } from "./audio/DemoSource.js";
import { LiveInputSource } from "./audio/LiveInputSource.js";
import { LocalFileSource } from "./audio/LocalFileSource.js";
import { DEFAULT_MAPPING_MODE, MAPPING_MODES } from "./color/colorMapping.js";
import { SpotifyMetadataSource } from "./spotify/SpotifyMetadataSource.js";
import { AnalysisReadout } from "./ui/analysisReadout.js";
import { $ } from "./ui/dom.js";
import { PlayerControls } from "./ui/playerControls.js";
import { SourceSelector } from "./ui/sourceSelector.js";
import {
  ChromaFreqVisualizer,
  DEFAULT_VISUAL_MODE,
  VISUAL_MODES,
} from "./visuals/ChromaFreqVisualizer.js";

const SILENT_THEME = {
  hex: "#93d8b6",
  rgb: [147, 216, 182],
};

const engine = new AudioEngine();
const spotify = new SpotifyMetadataSource();
const visualizer = new ChromaFreqVisualizer($("#chroma-canvas"));
const readout = new AnalysisReadout($("#analysis-panel"));
const app = {
  activeSourceMode: "demo",
  selectedFile: null,
  mappingMode: DEFAULT_MAPPING_MODE,
  visualMode: DEFAULT_VISUAL_MODE,
  colorDriver: DEFAULT_COLOR_DRIVER,
  isBooted: false,
};

const controls = new PlayerControls($("#control-panel"), {
  onPlay: () => runAction(playActiveSource),
  onPause: () => runAction(() => engine.pause()),
  onStop: () => runAction(() => engine.stop()),
  onFile: (file) => runAction(() => selectLocalFile(file)),
  onVolume: (value) => engine.setVolume(value),
  onSmoothing: (value) => engine.setSmoothing(value),
  onSensitivity: (value) => engine.setSensitivity(value),
  onFftSize: (value) => engine.setFftSize(value),
  onMappingMode: (value) => {
    app.mappingMode = value;
  },
  onVisualMode: (value) => {
    app.visualMode = value;
  },
  onColorDriver: (value) => {
    app.colorDriver = value;
  },
});

const sourceSelector = new SourceSelector($("#source-selector"), {
  onChange: (mode) => runAction(() => selectSourceMode(mode)),
});

$("#snapshot-button").addEventListener("click", () => {
  visualizer.downloadSnapshot();
  controls.setStatus("Canvas snapshot exported as PNG.");
});

engine.addEventListener("statechange", (event) => {
  controls.setPlaybackState(event.detail);
});

initialize();
requestAnimationFrame(renderLoop);

async function initialize() {
  populateMappingModes();
  populateVisualModes();
  populateColorDrivers();
  controls.setSourceMode("demo");
  controls.setTrack({
    title: "Reference Sine Sweep",
    artist: "ChromaFreq generated source",
    duration: 18,
    detail: "Log sweep from 40 Hz to 16 kHz, generated in-browser",
  });
  controls.setStatus("Reference sine sweep ready. Press Play to start.");
  controls.setPlaybackState(engine.getState());

  if (!spotify.isConfigured) {
    sourceSelector.setDisabled("spotify", false);
  }
}

function populateMappingModes() {
  const select = $("#mapping-mode");
  select.innerHTML = "";

  for (const mode of Object.values(MAPPING_MODES)) {
    const option = document.createElement("option");
    option.value = mode.id;
    option.textContent = mode.label;
    option.selected = mode.id === DEFAULT_MAPPING_MODE;
    select.appendChild(option);
  }
}

function populateVisualModes() {
  const select = $("#visual-mode");
  select.innerHTML = "";

  for (const mode of Object.values(VISUAL_MODES)) {
    const option = document.createElement("option");
    option.value = mode.id;
    option.textContent = mode.label;
    option.selected = mode.id === DEFAULT_VISUAL_MODE;
    select.appendChild(option);
  }
}

function populateColorDrivers() {
  const select = $("#color-driver");
  select.innerHTML = "";

  for (const driver of Object.values(COLOR_DRIVERS)) {
    const option = document.createElement("option");
    option.value = driver.id;
    option.textContent = driver.label;
    option.selected = driver.id === DEFAULT_COLOR_DRIVER;
    select.appendChild(option);
  }
}

async function selectSourceMode(mode) {
  app.activeSourceMode = mode;
  controls.setSourceMode(mode);

  if (mode === "demo") {
    await engine.setSource(new DemoSource());
    controls.setTrack(engine.currentSource.metadata);
    controls.setStatus("Reference sine sweep selected.");
    return;
  }

  if (mode === "local") {
    await engine.clearSource();
    if (app.selectedFile) {
      await selectLocalFile(app.selectedFile);
    } else {
      controls.setTrack(null);
      controls.setStatus("Choose a local audio file to analyze.");
    }
    return;
  }

  if (mode === "live") {
    await engine.clearSource();
    const liveSource = new LiveInputSource();
    controls.setTrack(liveSource.metadata);
    controls.setStatus("Live input selected. Press Play to request microphone access.");
    return;
  }

  if (mode === "spotify") {
    await engine.clearSource();
    controls.setTrack(spotify.metadata);
    controls.setStatus(spotify.getStatus().message);
  }
}

async function selectLocalFile(file) {
  app.selectedFile = file;
  app.activeSourceMode = "local";
  sourceSelector.setActive("local");
  controls.setSourceMode("local");
  controls.setStatus("Decoding local file...");
  await engine.setSource(new LocalFileSource(file));
  controls.setTrack(engine.currentSource.metadata);
  controls.setStatus("Local file ready. Press Play to analyze.");
}

async function playActiveSource() {
  if (app.activeSourceMode === "spotify") {
    controls.setStatus(spotify.getStatus().message);
    return;
  }

  if (app.activeSourceMode === "demo") {
    if (engine.currentSource?.mode !== "demo") {
      await engine.setSource(new DemoSource());
      controls.setTrack(engine.currentSource.metadata);
    }
  }

  if (app.activeSourceMode === "local" && !engine.currentSource) {
    controls.setStatus("Choose a local audio file before playback.");
    return;
  }

  if (app.activeSourceMode === "live") {
    await engine.setSource(new LiveInputSource());
    controls.setTrack(engine.currentSource.metadata);
  }

  await engine.play();
  const state = engine.getState();
  controls.setStatus(
    state.monitorEnabled
      ? "Analysis running."
      : "Live input analysis running. Audio monitoring is disabled."
  );
}

function renderLoop() {
  const frame = engine.getAnalysisFrame(app.mappingMode, app.colorDriver);
  visualizer.render(frame, app.visualMode);
  readout.update(frame);
  updateAnalysisTheme(frame);
  requestAnimationFrame(renderLoop);
}

function updateAnalysisTheme(frame) {
  const root = document.documentElement;
  const theme = frame.analysis.hasSignal
    ? { hex: frame.color.hex, rgb: frame.color.rgb }
    : SILENT_THEME;

  root.style.setProperty("--analysis-color", theme.hex);
  root.style.setProperty("--analysis-rgb", theme.rgb.join(" "));
  root.style.setProperty("--analysis-energy", frame.analysis.energy.toFixed(3));
}

async function runAction(action) {
  try {
    await action();
  } catch (error) {
    controls.setStatus(error.message || "Something went wrong.");
  }
}
