let activeSlide = 0;

const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const slideContainer = document.querySelector(".slides");
const slides = slideContainer.children

const previousSlide = () => {
    if (activeSlide > 0) {
        activeSlide -= 1;
        updateUI()
    }
};

const nextSlide = () => {
    if (slides[activeSlide + 1]) {
        activeSlide += 1;
        updateUI()
    }
};

const updateUI = () => {
    slideContainer.style.marginLeft = `-${activeSlide}00vw`;
    let activeSlideElement = document.querySelector(".active.slide")
    activeSlideElement.classList.remove('active');
    slides[activeSlide].classList.add('active');
}

const attachEvents = () => {
    previousButton.addEventListener("click", previousSlide);
    nextButton.addEventListener("click", nextSlide);
};

attachEvents();
