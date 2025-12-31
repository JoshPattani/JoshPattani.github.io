/* ===== CLIMBING WALL SHOWCASE PAGE SCRIPTS ===== */

document.addEventListener("DOMContentLoaded", () => {
 // ===== GALLERY FILTER FUNCTIONALITY =====
 const filterButtons = document.querySelectorAll(".climbing-showcase__filter");
 const galleryItems = document.querySelectorAll(".climbing-showcase__item");

 filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
   // Update active state
   filterButtons.forEach((btn) => btn.classList.remove("active"));
   button.classList.add("active");

   const filter = button.dataset.filter;

   // Filter gallery items with animation
   galleryItems.forEach((item) => {
    const category = item.dataset.category;

    if (filter === "all" || category === filter) {
     item.classList.remove("hidden");
     // Add stagger animation
     item.style.opacity = "0";
     item.style.transform = "scale(0.9)";
     setTimeout(() => {
      item.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      item.style.opacity = "1";
      item.style.transform = "scale(1)";
     }, 50);
    } else {
     item.style.transition = "opacity 0.3s ease, transform 0.3s ease";
     item.style.opacity = "0";
     item.style.transform = "scale(0.9)";
     setTimeout(() => {
      item.classList.add("hidden");
     }, 300);
    }
   });
  });
 });

 // ===== SCROLL REVEAL ANIMATIONS =====
 const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
 };

 const revealOnScroll = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
   if (entry.isIntersecting) {
    entry.target.classList.add("revealed");
    revealOnScroll.unobserve(entry.target);
   }
  });
 }, observerOptions);

 // Observe process steps
 document.querySelectorAll(".climbing-process__step").forEach((step, index) => {
  step.style.opacity = "0";
  step.style.transform = "translateX(-30px)";
  step.style.transition = `opacity 0.6s ease ${
   index * 0.1
  }s, transform 0.6s ease ${index * 0.1}s`;

  revealOnScroll.observe(step);
 });

 // Observe tool categories
 document
  .querySelectorAll(".climbing-tools__category")
  .forEach((category, index) => {
   category.style.opacity = "0";
   category.style.transform = "translateY(30px)";
   category.style.transition = `opacity 0.6s ease ${
    index * 0.15
   }s, transform 0.6s ease ${index * 0.15}s`;

   revealOnScroll.observe(category);
  });

 // Observe value cards
 document.querySelectorAll(".climbing-value__card").forEach((card, index) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(30px)";
  card.style.transition = `opacity 0.6s ease ${
   index * 0.1
  }s, transform 0.6s ease ${index * 0.1}s`;

  revealOnScroll.observe(card);
 });

 // Observe gallery items
 document
  .querySelectorAll(".climbing-showcase__item")
  .forEach((item, index) => {
   item.style.opacity = "0";
   item.style.transform = "scale(0.95)";
   item.style.transition = `opacity 0.5s ease ${
    index * 0.08
   }s, transform 0.5s ease ${index * 0.08}s`;

   revealOnScroll.observe(item);
  });

 // Add revealed class styles
 const style = document.createElement("style");
 style.textContent = `
    .revealed {
      opacity: 1 !important;
      transform: translateX(0) translateY(0) scale(1) !important;
    }
  `;
 document.head.appendChild(style);

 // ===== GALLERY LIGHTBOX FUNCTIONALITY =====
 // Gallery state
 let currentGallery = [];
 let currentIndex = 0;

 // Create lightbox elements with navigation
 const lightbox = document.createElement("div");
 lightbox.className = "lightbox";
 lightbox.innerHTML = `
    <div class="lightbox__overlay"></div>
    <div class="lightbox__content">
      <button class="lightbox__close" aria-label="Close lightbox">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <div class="lightbox__image-container">
        <img class="lightbox__image" src="" alt="" />
      </div>
      
      <button class="lightbox__nav lightbox__nav--next" aria-label="Next image">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      
      <div class="lightbox__footer">
        <div class="lightbox__caption">
          <span class="lightbox__type"></span>
          <h4 class="lightbox__title"></h4>
          <p class="lightbox__desc"></p>
        </div>
        <div class="lightbox__counter">
          <span class="lightbox__current">1</span> / <span class="lightbox__total">3</span>
        </div>
        <div class="lightbox__thumbnails"></div>
      </div>
    </div>
  `;
 document.body.appendChild(lightbox);

 // Add lightbox styles
 const lightboxStyles = document.createElement("style");
 lightboxStyles.textContent = `
    .lightbox {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    
    .lightbox.active {
      opacity: 1;
      visibility: visible;
    }
    
    .lightbox__overlay {
      position: absolute;
      inset: 0;
      background: rgba(10, 10, 15, 0.95);
      backdrop-filter: blur(10px);
    }
    
    .lightbox__content {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 95vw;
      max-height: 95vh;
      transform: scale(0.9);
      transition: transform 0.3s ease;
    }
    
    .lightbox.active .lightbox__content {
      transform: scale(1);
    }
    
    .lightbox__close {
      position: absolute;
      top: -50px;
      right: 0;
      background: none;
      border: none;
      color: var(--color-text-primary);
      cursor: pointer;
      padding: 10px;
      transition: all 0.3s ease;
      z-index: 10;
    }
    
    .lightbox__close:hover {
      color: var(--color-accent-primary);
      transform: scale(1.1);
    }
    
    .lightbox__image-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .lightbox__image {
      max-width: 85vw;
      max-height: 65vh;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      transition: opacity 0.3s ease;
    }
    
    .lightbox__image.loading {
      opacity: 0.5;
    }
    
    .lightbox__nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-primary);
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      z-index: 10;
    }
    
    .lightbox__nav:hover {
      background: var(--color-accent-primary);
      border-color: var(--color-accent-primary);
      transform: translateY(-50%) scale(1.1);
    }
    
    .lightbox__nav--prev {
      left: -80px;
    }
    
    .lightbox__nav--next {
      right: -80px;
    }
    
    .lightbox__nav:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    .lightbox__nav:disabled:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-50%) scale(1);
    }
    
    .lightbox__footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
      margin-top: var(--space-lg);
      width: 100%;
    }
    
    .lightbox__caption {
      text-align: center;
      color: var(--color-text-primary);
    }
    
    .lightbox__type {
      display: inline-block;
      font-size: var(--fs-xs);
      font-weight: var(--fw-semibold);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-accent-primary);
      margin-bottom: var(--space-xs);
    }
    
    .lightbox__title {
      font-family: var(--font-heading);
      font-size: var(--fs-xl);
      font-weight: var(--fw-bold);
      margin-bottom: var(--space-xs);
    }
    
    .lightbox__desc {
      font-size: var(--fs-sm);
      color: var(--color-text-secondary);
    }
    
    .lightbox__counter {
      font-size: var(--fs-sm);
      color: var(--color-text-muted);
      font-weight: var(--fw-medium);
    }
    
    .lightbox__current {
      color: var(--color-accent-primary);
      font-weight: var(--fw-bold);
    }
    
    .lightbox__thumbnails {
      display: flex;
      gap: var(--space-sm);
      margin-top: var(--space-sm);
    }
    
    .lightbox__thumbnail {
      width: 60px;
      height: 45px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: pointer;
      opacity: 0.5;
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }
    
    .lightbox__thumbnail:hover {
      opacity: 0.8;
    }
    
    .lightbox__thumbnail.active {
      opacity: 1;
      border-color: var(--color-accent-primary);
    }
    
    .lightbox__thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    @media screen and (max-width: 992px) {
      .lightbox__nav--prev {
        left: 10px;
      }
      
      .lightbox__nav--next {
        right: 10px;
      }
      
      .lightbox__nav {
        width: 44px;
        height: 44px;
        background: rgba(0, 0, 0, 0.5);
      }
      
      .lightbox__image {
        max-width: 95vw;
        max-height: 55vh;
      }
    }
    
    @media screen and (max-width: 480px) {
      .lightbox__nav {
        width: 40px;
        height: 40px;
      }
      
      .lightbox__nav svg {
        width: 20px;
        height: 20px;
      }
      
      .lightbox__thumbnail {
        width: 45px;
        height: 35px;
      }
    }
  `;
 document.head.appendChild(lightboxStyles);

 // Lightbox elements
 const lightboxOverlay = lightbox.querySelector(".lightbox__overlay");
 const lightboxClose = lightbox.querySelector(".lightbox__close");
 const lightboxImage = lightbox.querySelector(".lightbox__image");
 const lightboxType = lightbox.querySelector(".lightbox__type");
 const lightboxTitle = lightbox.querySelector(".lightbox__title");
 const lightboxDesc = lightbox.querySelector(".lightbox__desc");
 const lightboxPrev = lightbox.querySelector(".lightbox__nav--prev");
 const lightboxNext = lightbox.querySelector(".lightbox__nav--next");
 const lightboxCurrent = lightbox.querySelector(".lightbox__current");
 const lightboxTotal = lightbox.querySelector(".lightbox__total");
 const lightboxThumbnails = lightbox.querySelector(".lightbox__thumbnails");

 // Update lightbox image
 const updateLightboxImage = (index) => {
  if (currentGallery.length === 0) return;

  currentIndex = index;
  const image = currentGallery[index];

  // Add loading state
  lightboxImage.classList.add("loading");

  // Preload image
  const img = new Image();
  img.onload = () => {
   lightboxImage.src = image.src;
   lightboxImage.alt = image.alt;
   lightboxImage.classList.remove("loading");
  };
  img.src = image.src;

  // Update counter
  lightboxCurrent.textContent = index + 1;

  // Update thumbnails
  document.querySelectorAll(".lightbox__thumbnail").forEach((thumb, i) => {
   thumb.classList.toggle("active", i === index);
  });

  // Update navigation buttons
  lightboxPrev.disabled = index === 0;
  lightboxNext.disabled = index === currentGallery.length - 1;
 };

 // Create thumbnails
 const createThumbnails = (gallery) => {
  lightboxThumbnails.innerHTML = "";
  gallery.forEach((image, index) => {
   const thumb = document.createElement("div");
   thumb.className = `lightbox__thumbnail ${index === 0 ? "active" : ""}`;
   thumb.innerHTML = `<img src="${image.src}" alt="${image.alt}" />`;
   thumb.addEventListener("click", () => updateLightboxImage(index));
   lightboxThumbnails.appendChild(thumb);
  });
 };

 // Open lightbox
 galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
   const type = item.querySelector(".climbing-showcase__type");
   const title = item.querySelector(".climbing-showcase__title");
   const desc = item.querySelector(".climbing-showcase__desc");

   // Get gallery data
   const galleryData = item.dataset.gallery;
   if (galleryData) {
    try {
     currentGallery = JSON.parse(galleryData);
    } catch (e) {
     // Fallback to single image
     const img = item.querySelector("img");
     currentGallery = [{ src: img.src, alt: img.alt }];
    }
   } else {
    // Fallback to single image
    const img = item.querySelector("img");
    currentGallery = [{ src: img.src, alt: img.alt }];
   }

   currentIndex = 0;

   // Set caption
   lightboxType.textContent = type ? type.textContent : "";
   lightboxTitle.textContent = title ? title.textContent : "";
   lightboxDesc.textContent = desc ? desc.textContent : "";

   // Set counter
   lightboxTotal.textContent = currentGallery.length;

   // Create thumbnails
   createThumbnails(currentGallery);

   // Show/hide navigation based on gallery size
   const hasMultiple = currentGallery.length > 1;
   lightboxPrev.style.display = hasMultiple ? "flex" : "none";
   lightboxNext.style.display = hasMultiple ? "flex" : "none";
   lightboxThumbnails.style.display = hasMultiple ? "flex" : "none";
   lightbox.querySelector(".lightbox__counter").style.display = hasMultiple
    ? "block"
    : "none";

   // Load first image
   updateLightboxImage(0);

   lightbox.classList.add("active");
   document.body.style.overflow = "hidden";
  });
 });

 // Navigation
 lightboxPrev.addEventListener("click", () => {
  if (currentIndex > 0) {
   updateLightboxImage(currentIndex - 1);
  }
 });

 lightboxNext.addEventListener("click", () => {
  if (currentIndex < currentGallery.length - 1) {
   updateLightboxImage(currentIndex + 1);
  }
 });

 // Close lightbox
 const closeLightbox = () => {
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
  currentGallery = [];
  currentIndex = 0;
 };

 lightboxOverlay.addEventListener("click", closeLightbox);
 lightboxClose.addEventListener("click", closeLightbox);

 // Keyboard navigation
 document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("active")) return;

  switch (e.key) {
   case "Escape":
    closeLightbox();
    break;
   case "ArrowLeft":
    if (currentIndex > 0) {
     updateLightboxImage(currentIndex - 1);
    }
    break;
   case "ArrowRight":
    if (currentIndex < currentGallery.length - 1) {
     updateLightboxImage(currentIndex + 1);
    }
    break;
  }
 });

 // ===== PARALLAX EFFECT FOR HERO SHAPES =====
 const heroShapes = document.querySelectorAll(".climbing-hero__shape");

 if (heroShapes.length > 0) {
  window.addEventListener("mousemove", (e) => {
   const x = (e.clientX / window.innerWidth - 0.5) * 2;
   const y = (e.clientY / window.innerHeight - 0.5) * 2;

   heroShapes.forEach((shape, index) => {
    const speed = (index + 1) * 10;
    shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
   });
  });
 }

 console.log("Climbing Wall Showcase page initialized");
});
