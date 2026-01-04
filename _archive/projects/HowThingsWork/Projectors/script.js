let activeSlide = 0;

const slideContainer = document.querySelector(".slides");
const slides = slideContainer.children;

document.addEventListener("DOMContentLoaded", attachEvents);

function attachEvents() {
  // Event listener for slide navigation
  var prevButton = document.getElementById("previousButton");
  var nextButton = document.getElementById("nextButton");

  prevButton.addEventListener("click", function () {
    navigateSlide(-1);
  });
  nextButton.addEventListener("click", function () {
    navigateSlide(1);
  });

  // Event listener for keyboard navigation
  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      navigateSlide(-1);
    } else if (event.key === "ArrowRight") {
      navigateSlide(1);
    }
  });
}

function navigateSlide(direction) {
  // Function to navigate the slides based on the direction
  let newSlide = activeSlide + direction;
  console.log(
    "newSlide=" +
      newSlide +
      " activeSlide=" +
      activeSlide +
      " direction=" +
      direction
  );

  if (newSlide < activeSlide && activeSlide > 0) {
    activeSlide -= 1;
  } else if (slides[newSlide]) {
    activeSlide += 1;
  } else if (slides[newSlide] == undefined) {
    activeSlide = 0;
  }

  slideContainer.style.marginLeft = `-${activeSlide}00vw`;
  let activeSlideElement = document.querySelector(".active.slide");
  activeSlideElement.classList.remove("active");
  slides[activeSlide].classList.add("active");

  // Clear video wrapper and hide media container
  let mediaContainer = document.getElementById("mediaContainer");
  let videoWrapper = mediaContainer.querySelector(".videoWrapper");
  while (videoWrapper.firstChild) {
    videoWrapper.removeChild(videoWrapper.firstChild);
  }
  mediaContainer.style.display = "none";

  // Add delay for media show button visibility
  showMediaButton();
}

function showMediaButton() {
  let toggleContainer = document.getElementById("toggleContainer");
  toggleContainer.style.display = "none";
  if (activeSlide >= 1 && activeSlide <= 7) {
    setTimeout(() => {
      toggleContainer.style.display = "block";
    }, 2000);
  } else {
    toggleContainer.style.display = "none";
  }
}

//   Add listener for media container toggle to clear container and fill it with the media content of the current slide
document.getElementById("mediaToggle").addEventListener("click", showMedia);

function showMedia() {
  // Function to show the media container and fill it with the media content of the current slide
  let mediaContainer = document.getElementById("mediaContainer");
  let toggleContainer = document.getElementById("toggleContainer");

  mediaContainer.style.display = "block";
  toggleContainer.style.display = "none";

  let activeSlideElement = document.querySelector(".active.slide");
  let mediaPath = activeSlideElement.getAttribute("data-media");

  if (mediaPath) {
    console.log("mediaPath=" + mediaPath);
    embedMedia();
  } else {
    console.log("No media for this slide");
    toggleContainer.style.display = "block";
    mediaContainer.style.display = "none";
  }
}

// function to create an iframe and load a YouTube video in the media container
function embedMedia() {
  // Get the video ID from the data attribute of the active slide, or use the given parameter
  let videoId = document
    .querySelector(".active.slide")
    .getAttribute("data-media");
  if (!videoId) {
    videoId = "dQw4w9WgXcQ"; // Rickroll
  }

  // Get video start time from the data attribute of the active slide, if there is one
  let start =
    document.querySelector(".active.slide").getAttribute("data-start") || 0; // Default to 0 if not specified
  let end = document.querySelector(".active.slide").getAttribute("data-end"); // This might be null or undefined

  // Get the elements for the media container
  let mediaContainer = document.getElementById("mediaContainer");
  let videoWrapper = mediaContainer.querySelector(".videoWrapper");

  console.log("videoId=" + videoId);

  // Construct the base URL
  let baseUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&cc_load_policy=1&cc_load_policy=1&start=${start}`;
  // Conditionally add the end parameter
  let embedUrl = end ? `${baseUrl}&end=${end}` : baseUrl;

  // Create an iframe element for the YouTube video
  var iframe = document.createElement("iframe");
  iframe.setAttribute("src", embedUrl);
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute(
    "allow",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  );
  iframe.setAttribute("allowfullscreen", "true");

  // Append the iframe to the media container
  videoWrapper.appendChild(iframe);
}
