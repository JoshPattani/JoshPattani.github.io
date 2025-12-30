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
 // Create lightbox elements
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
      <img class="lightbox__image" src="" alt="" />
      <div class="lightbox__caption">
        <span class="lightbox__type"></span>
        <h4 class="lightbox__title"></h4>
        <p class="lightbox__desc"></p>
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
      max-width: 90vw;
      max-height: 90vh;
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
      transition: color 0.3s ease;
    }
    
    .lightbox__close:hover {
      color: var(--color-accent-primary);
    }
    
    .lightbox__image {
      max-width: 100%;
      max-height: 70vh;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
    }
    
    .lightbox__caption {
      text-align: center;
      margin-top: var(--space-lg);
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
  `;
 document.head.appendChild(lightboxStyles);

 // Lightbox functionality
 const lightboxOverlay = lightbox.querySelector(".lightbox__overlay");
 const lightboxClose = lightbox.querySelector(".lightbox__close");
 const lightboxImage = lightbox.querySelector(".lightbox__image");
 const lightboxType = lightbox.querySelector(".lightbox__type");
 const lightboxTitle = lightbox.querySelector(".lightbox__title");
 const lightboxDesc = lightbox.querySelector(".lightbox__desc");

 galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
   const img = item.querySelector("img");
   const type = item.querySelector(".climbing-showcase__type");
   const title = item.querySelector(".climbing-showcase__title");
   const desc = item.querySelector(".climbing-showcase__desc");

   lightboxImage.src = img.src;
   lightboxImage.alt = img.alt;
   lightboxType.textContent = type ? type.textContent : "";
   lightboxTitle.textContent = title ? title.textContent : "";
   lightboxDesc.textContent = desc ? desc.textContent : "";

   lightbox.classList.add("active");
   document.body.style.overflow = "hidden";
  });
 });

 const closeLightbox = () => {
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
 };

 lightboxOverlay.addEventListener("click", closeLightbox);
 lightboxClose.addEventListener("click", closeLightbox);

 document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("active")) {
   closeLightbox();
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
