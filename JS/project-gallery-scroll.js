/**
 * Project Gallery Scroll
 * Handles the scrolling photo gallery in the left margin
 */

(function() {
  'use strict';
  
  const gallery = document.getElementById('gallery-scroll');
  const items = document.querySelectorAll('.project-gallery-scroll__item');
  
  if (!gallery || items.length === 0) {
    return;
  }
  
  let ticking = false;
  let currentActiveIndex = 0; // Start with first image active
  
  function updateGallery() {
    // Only run on large screens
    if (window.innerWidth < 1500) {
      gallery.classList.remove('visible');
      return;
    }
    
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Show gallery after scrolling 500px
    if (scrollY > 500 && scrollY < 2000) {
      gallery.classList.add('visible');
    } else {
      gallery.classList.remove('visible');
    }
    
    // Always update active image regardless of visibility
    // Find which image should be active based on scroll position
    let newActiveIndex = 0; // Default to first image
    
    items.forEach((item, index) => {
      const startScroll = parseInt(item.dataset.scrollStart, 10);
      const endScroll = parseInt(item.dataset.scrollEnd, 10);
      
      if (scrollY >= startScroll && scrollY < endScroll) {
        newActiveIndex = index;
      }
    });
    
    // Update if the active image has changed
    if (newActiveIndex !== currentActiveIndex) {
      items.forEach((item, index) => {
        if (index === newActiveIndex) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      currentActiveIndex = newActiveIndex;
    }
    
    ticking = false;
  }
  
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateGallery);
      ticking = true;
    }
  }
  
  // Initial check on load
  setTimeout(updateGallery, 100);
  
  // Listen to scroll events
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateGallery, 250);
  });
  
})();
