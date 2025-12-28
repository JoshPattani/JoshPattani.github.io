/**
 * Josh Pattani Portfolio - Main JavaScript
 * Handles navigation, animations, and interactions
 */

// ===== DOM ELEMENTS =====
const header = document.getElementById('header');
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav__link');
const backToTop = document.getElementById('back-to-top');
const cursorFollower = document.querySelector('.cursor-follower');
const portfolioFilters = document.querySelectorAll('.portfolio__filter');
const portfolioCards = document.querySelectorAll('.portfolio__card');

// ===== MOBILE NAVIGATION =====
function openNav() {
  navMenu.classList.add('show');
  navToggle.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeNav() {
  navMenu.classList.remove('show');
  navToggle.classList.remove('active');
  document.body.style.overflow = '';
}

if (navToggle) {
  navToggle.addEventListener('click', () => {
    if (navMenu.classList.contains('show')) {
      closeNav();
    } else {
      openNav();
    }
  });
}

if (navClose) {
  navClose.addEventListener('click', closeNav);
}

// Close menu when clicking on nav links
navLinks.forEach(link => {
  link.addEventListener('click', closeNav);
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (navMenu.classList.contains('show') && 
      !navMenu.contains(e.target) && 
      !navToggle.contains(e.target)) {
    closeNav();
  }
});

// ===== HEADER SCROLL EFFECT =====
function handleHeaderScroll() {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleHeaderScroll);

// ===== ACTIVE NAV LINK HIGHLIGHT =====
function highlightActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY;
  
  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);
    
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => link.classList.remove('active'));
      if (navLink) navLink.classList.add('active');
    }
  });
}

window.addEventListener('scroll', highlightActiveSection);

// ===== BACK TO TOP BUTTON =====
function handleBackToTop() {
  if (window.scrollY > 500) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}

window.addEventListener('scroll', handleBackToTop);

// ===== CURSOR FOLLOWER (Desktop only) =====
if (cursorFollower && window.matchMedia('(pointer: fine)').matches) {
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function animateCursor() {
    const speed = 0.15;
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    
    cursorFollower.style.left = cursorX + 'px';
    cursorFollower.style.top = cursorY + 'px';
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();
  
  // Grow cursor on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .portfolio__card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorFollower.style.width = '40px';
      cursorFollower.style.height = '40px';
      cursorFollower.style.opacity = '0.3';
    });
    
    el.addEventListener('mouseleave', () => {
      cursorFollower.style.width = '20px';
      cursorFollower.style.height = '20px';
      cursorFollower.style.opacity = '0.5';
    });
  });
}

// ===== PORTFOLIO FILTER =====
if (portfolioFilters.length > 0) {
  portfolioFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      // Update active filter
      portfolioFilters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      
      const filterValue = filter.getAttribute('data-filter');
      
      // Filter cards
      portfolioCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filterValue === 'all' || category.includes(filterValue)) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

// ===== SCROLL REVEAL ANIMATION =====
function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');
  
  reveals.forEach(element => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;
    const revealPoint = 100;
    
    if (elementTop < windowHeight - revealPoint) {
      element.classList.add('active');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observerCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

// Observe elements with animation classes
document.querySelectorAll('.skills__category, .portfolio__card, .experience__item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Add animate-in styles
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ===== TYPING EFFECT FOR HERO (Optional) =====
class TypeWriter {
  constructor(element, words, wait = 2000) {
    this.element = element;
    this.words = words;
    this.wait = parseInt(wait, 10);
    this.wordIndex = 0;
    this.txt = '';
    this.isDeleting = false;
    this.type();
  }
  
  type() {
    const current = this.wordIndex % this.words.length;
    const fullTxt = this.words[current];
    
    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }
    
    this.element.innerHTML = `<span class="typed-text">${this.txt}</span>`;
    
    let typeSpeed = 100;
    
    if (this.isDeleting) {
      typeSpeed /= 2;
    }
    
    if (!this.isDeleting && this.txt === fullTxt) {
      typeSpeed = this.wait;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
      this.isDeleting = false;
      this.wordIndex++;
      typeSpeed = 500;
    }
    
    setTimeout(() => this.type(), typeSpeed);
  }
}

// Initialize typing effect if element exists
const typedElement = document.querySelector('.hero__typed');
if (typedElement) {
  const words = ['Designer', 'Developer', 'Maker', 'Engineer'];
  new TypeWriter(typedElement, words, 2000);
}

// ===== PARALLAX EFFECT =====
function handleParallax() {
  const parallaxElements = document.querySelectorAll('.hero__shape');
  const scrolled = window.pageYOffset;
  
  parallaxElements.forEach((el, index) => {
    const speed = 0.5 + (index * 0.1);
    el.style.transform = `translateY(${scrolled * speed}px)`;
  });
}

window.addEventListener('scroll', handleParallax);

// ===== LOAD ANIMATIONS =====
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  
  // Trigger initial animations
  setTimeout(() => {
    handleHeaderScroll();
    highlightActiveSection();
    handleBackToTop();
    revealOnScroll();
  }, 100);
});

// ===== FORM HANDLING (if contact form is added later) =====
const contactForm = document.querySelector('.contact__form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Add your form submission logic here
    console.log('Form submitted:', data);
    
    // Show success message
    alert('Thanks for reaching out! I\'ll get back to you soon.');
    contactForm.reset();
  });
}

// ===== PERFORMANCE: DEBOUNCE SCROLL HANDLERS =====
function debounce(func, wait = 10) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply debounce to scroll handlers for better performance
const debouncedScrollHandlers = debounce(() => {
  handleHeaderScroll();
  highlightActiveSection();
  handleBackToTop();
  revealOnScroll();
  handleParallax();
}, 10);

window.addEventListener('scroll', debouncedScrollHandlers);

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
  // Close mobile menu with Escape
  if (e.key === 'Escape' && navMenu.classList.contains('show')) {
    closeNav();
  }
});

console.log('🚀 Portfolio site loaded successfully!');
