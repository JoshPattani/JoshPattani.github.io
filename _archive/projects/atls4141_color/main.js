// DROPDOWN MENU
// Get all the dropdown from document
document.querySelectorAll(".dropdown-toggle").forEach(dropDownFunc);

// Dropdown Open and Close function
function dropDownFunc(dropDown) {
  console.log(dropDown.classList.contains("click-dropdown"));

  if (dropDown.classList.contains("click-dropdown") === true) {
    dropDown.addEventListener("click", function (e) {
      e.preventDefault();

      if (
        this.nextElementSibling.classList.contains("dropdown-active") === true
      ) {
        // Close the clicked dropdown
        this.parentElement.classList.remove("dropdown-open");
        this.nextElementSibling.classList.remove("dropdown-active");

        // Add the text for closed album text
        const menuText = document.getElementById("menu-text");
        if (menuText !== null) {
          menuText.style.textAlign = "left";
          menuText.textContent = "Select Album";
        }

        // Change the menu text for reopen track list
        const trackText = document.getElementById("track-name");
        if (trackText !== null) {
          // change menuText text-align style
          trackText.style.textAlign = "left";
          trackText.textContent = trackName;
        }
      } else {
        // Close the opened dropdown
        closeDropdown();

        // Change the menu text for open album menu
        menuText = document.getElementById("menu-text");
        if (menuText !== null) {
          // change menuText text-align style
          menuText.style.textAlign = "center";
          menuText.textContent = "Albums";
        }

        // add the open and active class(Opening the DropDown)
        this.parentElement.classList.add("dropdown-open");
        this.nextElementSibling.classList.add("dropdown-active");

        // Change the menu text for reopen track list
        menuText = document.getElementById("track-name");
        if (menuText !== null) {
          // change menuText text-align style
          menuText.style.textAlign = "center";
          menuText.textContent = albumName;
        }
      }
    });
  }
}

// #
// ##
// ###
// ####
// #####
// ######
// #####
// ####
// ###
// ##
// #

// EVENT HANDLERS

// Dropdown window functions

// Listen to the doc click
window.addEventListener("click", function (e) {
  // Close the menu if click happen outside menu
  if (e.target.closest(".dropdown-container") === null) {
    // Close the opened dropdown
    closeDropdown();
  }
});

// Close the opened Dropdowns
function closeDropdown() {
  console.log("run");

  // remove the open and active class from other opened Dropdown (Closing the opened DropDown)
  document
    .querySelectorAll(".dropdown-container")
    .forEach(function (container) {
      container.classList.remove("dropdown-open");
    });

  document.querySelectorAll(".dropdown-menu").forEach(function (menu) {
    menu.classList.remove("dropdown-active");
  });

  // Add the menu text for closed album menu
  menuText = document.getElementById("menu-text");
  if (menuText !== null) {
    // change menuText text-align style
    menuText.style.textAlign = "left";
    menuText.textContent = "Select Album";
  }

  // Add the menu text for closed track menu
  // Change the menu text for reopen track list
  menuText = document.getElementById("track-name");
  if (menuText !== null) {
    // change menuText text-align style
    menuText.style.textAlign = "left";
    menuText.textContent = trackName;
  }
}

// Music Selection Handlers

// create audio player
function setupPlayer(file) {
  // call p5 canvas setup function passing song file as param
  if (!song) {
    console.log("calling setup");
    setup(file);

    // Reset the dropdown menu back to base form with album selection options

    // make sure select appears with dropdowm toggle interaction again
    const select = document.getElementById("album-selection-dropdown");
    if (select !== null) {
      select.style.visibility = "visible";
    }
  } else if (song) {
    if (song.isPlaying()) {
      // Ensures there is no song currently playing before calling p5 setup
      // case for selecting a new track when one has already started

      // stop the current song
      song.stop();

      // clear the canvas
      background(220);
      textAlign(CENTER);
      text("Press to Continue Visualization", width / 2, height / 2);

      // remove the pause button
      const pauseButton = document.getElementById("pause-button");
      if (pauseButton) pauseButton.remove();
      // Call the setup function again with the new file
      setup(file);
    }
  } else {
    console.log("no song");
  }
}

let fileHandler = new FileHandler();

// Dynamically load and populate albums when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  fileHandler.loadAllAlbums(); // Populates dropdown with albums
  setupEventListeners();
});

// Function to set up event listeners for album and track selection
function setupEventListeners() {
  // Album Selection Listener
  document
    .getElementById("album-selection-dropdown")
    .addEventListener("change", function () {
      const selectedAlbumId = this.value;
      fileHandler.loadTracksForAlbum(selectedAlbumId);
    });

  // Track Selection Listener
  document
    .getElementById("track-selection-dropdown")
    .addEventListener("change", function () {
      let selectedOption = this.options[this.selectedIndex];
      let filePath = selectedOption.getAttribute("data-filepath");
      let trackName = String(selectedOption.getAttribute("data-trackname"));

      console.log(filePath);
      console.log(trackName);
      fileHandler.selectTrack(filePath, trackName);
    });
}

// create audio player controls
let controlGui = [];
function createControls() {
  controlGui = document.getElementsByClassName("gui-controls");
  controlGui.forEach((elem) => {
    elem.style.display = "flex";
  });
}
function closeInteractiveGUI() {
  controlGui.style.display = "none";
}

function playSong() {
  if (!song.isPlaying()) {
    song.play();

    // Remove the play button
    const playButton = document.getElementById("play-button");
    if (playButton) {
      playButton.remove();
      // Add a pause button
      const controls = document.getElementById("interactive_gui"); // Ensure this is the correct parent element ID
      if (controls) {
        const pauseButtonDiv = document.createElement("div");
        pauseButtonDiv.id = "pause-button";
        pauseButtonDiv.innerHTML = '<button id="pause">Pause</button>';
        controls.appendChild(pauseButtonDiv);

        // Add event listener to the new pause button
        const pauseButton = document.getElementById("pause");
        if (pauseButton) pauseButton.addEventListener("click", pauseSong);
      }
    }
  }
}

function pauseSong() {
  if (song.isPlaying()) {
    song.pause();

    // Hide pause button
    const pauseButton = document.getElementById("pause-button");
    if (pauseButton) {
      pauseButton.remove();

      // Add the play button
      const controls = document.getElementById("interactive_gui"); // Ensure this is the correct parent element ID
      if (controls) {
        const playButtonDiv = document.createElement("div");
        playButtonDiv.id = "play-button";
        playButtonDiv.innerHTML = '<button id="play">Play</button>';
        controls.appendChild(playButtonDiv);

        // Add event listener to the new play button
        const playButton = document.getElementById("play");
        if (playButton) playButton.addEventListener("click", playSong);
      }
    }
  }
}

// stop button
let stopButton = document.getElementById("stop-button");
stopButton.addEventListener("click", stopSong);

function stopSong() {
  song.stop();
}

// reset button
let resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", resetPage);

function resetPage() {
  location.reload();
}

// mute button
let muteState;
let muteButton = document.getElementById("mute-button");
muteButton.addEventListener("click", tog);

// Mute toggles
function tog() {
  //calls certain functons depending on if we are mutes
  if (muteState === true) {
    muteOff(); //turns mute off
    muteState = false; //adjusts state variable
  } else {
    muteOn(); //turns mute on
    muteState = true; //adjusts state variable
  }
}

function muteOn() {
  //changes bg color and hard sets all volumes to minimum
  bgColor = [255, 255, 0];
  song.setVolume(0);
}

function muteOff() {
  //changes bg color and runs normal volume instructions
  bgColor = [0, 255, 0];
  sliderMoved();
}
