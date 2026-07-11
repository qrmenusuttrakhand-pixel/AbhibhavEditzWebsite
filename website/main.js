/* 
  Abhibhav Editz - Website Logic & Interaction
  Highly refined, accessible, and performant code.
*/

document.addEventListener('DOMContentLoaded', () => {
  setupHeader();
  setupMobileNav();
  setupPortfolioFilter();
  setupVideoHoverPlayback();
  setupLightbox();
  setupContactForm();
  setupShowcaseVideoAutoplay();
});

/**
 * Adds a scrolled class to the header for stylistic transition when scrolling down.
 */
function setupHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check on load
}

/**
 * Handles mobile hamburger toggle and active states.
 */
function setupMobileNav() {
  const toggle = document.getElementById('menuToggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('active');
  });

  // Close menu when a link is clicked
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('active');
    });
  });
}

/**
 * Seamless filtering animation for Selected Work grid.
 */
function setupPortfolioFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-item');
  if (filterButtons.length === 0 || items.length === 0) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active from all
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
          item.style.display = '';
          // Force a reflow for transition
          void item.offsetWidth;
          item.style.opacity = '1';
          item.style.transform = 'translateY(0) scale(1)';
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(15px) scale(0.98)';
          // Delay display none until transition finishes
          setTimeout(() => {
            if (item.style.opacity === '0') {
              item.style.display = 'none';
            }
          }, 500);
        }
      });
    });
  });
}

/**
 * Autoplays muted videos on hover, and pauses when mouse leaves.
 * Also utilizes IntersectionObserver to stop playbacks when out of view.
 */
function setupVideoHoverPlayback() {
  const videoContainers = document.querySelectorAll('.media-wrapper[data-media-type="video"]');
  if (videoContainers.length === 0) return;

  videoContainers.forEach(container => {
    const video = container.querySelector('video');
    if (!video) return;

    // Hover actions
    container.addEventListener('mouseenter', () => {
      video.play().catch(err => console.log("Muted video autoplay blocked: ", err));
    });

    container.addEventListener('mouseleave', () => {
      video.pause();
    });
  });

  // IntersectionObserver to pause out-of-screen videos (performance optimization)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('video');
      if (!video) return;

      if (!entry.isIntersecting) {
        video.pause();
      }
    });
  }, observerOptions);

  videoContainers.forEach(container => observer.observe(container));
}

/**
 * Fullscreen media lightbox modal supporting images & playable videos.
 */
function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  const mediaContainer = document.getElementById('lightboxMediaContainer');
  const caption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  
  if (!lightbox || !mediaContainer || !caption || !closeBtn) return;

  // Select all trigger points
  const triggers = document.querySelectorAll('[data-media-src]');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const type = trigger.getAttribute('data-media-type');
      const src = trigger.getAttribute('data-media-src');
      
      // Determine description text
      let text = '';
      const itemInfo = trigger.closest('.portfolio-item');
      if (itemInfo) {
        const titleEl = itemInfo.querySelector('.item-title');
        const descEl = itemInfo.querySelector('.item-description');
        if (titleEl && descEl) {
          text = `<strong>${titleEl.textContent}</strong> — ${descEl.textContent}`;
        }
      } else {
        const imgEl = trigger.querySelector('img');
        if (imgEl) {
          text = imgEl.getAttribute('alt') || 'Selected Visual Stills';
        }
      }

      openLightbox(type, src, text);
    });

    // Handle accessibility keyboard activations (Enter & Space) for triggers (like div.grid-thumb or div.media-wrapper)
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });

  const openLightbox = (type, src, text) => {
    mediaContainer.innerHTML = ''; // Clear previous
    caption.innerHTML = text;

    if (type === 'video') {
      const video = document.createElement('video');
      video.className = 'lightbox-media';
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      
      const source = document.createElement('source');
      source.src = src;
      source.type = 'video/mp4';
      
      video.appendChild(source);
      mediaContainer.appendChild(video);
    } else if (type === 'image') {
      const img = document.createElement('img');
      img.className = 'lightbox-media';
      img.src = src;
      img.alt = 'Visual Still';
      
      mediaContainer.appendChild(img);
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    // Pause or clear the video inside the lightbox to stop sound
    setTimeout(() => {
      mediaContainer.innerHTML = '';
    }, 400);
  };

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.closest('.lightbox-content') === null) {
      closeLightbox();
    }
  });

  // Handle escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/**
 * Handle contact form submission, routing details to pre-filled WhatsApp.
 */
function setupContactForm() {
  const form = document.getElementById('projectForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value || 'Not provided';
    const pkg = document.getElementById('package').value;
    const message = document.getElementById('message').value;

    // Compose formatted WhatsApp text message
    const waText = `Hello Abhibhav Editz! %0A%0AI would like to start a project.%0A%0A*Name:* ${name}%0A*Email:* ${email}%0A*Phone:* ${phone}%0A*Package Preferred:* ${pkg}%0A*Details & Vision:* ${message}`;
    
    const waUrl = `https://wa.me/918979704266?text=${waText}`;

    // Show a gentle visual confirmation first, then open WhatsApp in a new tab
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Redirecting to WhatsApp...';
    btn.style.backgroundColor = '#25D366'; // WhatsApp Green color
    btn.style.color = '#FFFFFF';

    setTimeout(() => {
      window.open(waUrl, '_blank');
      btn.textContent = originalText;
      btn.style.backgroundColor = '';
      btn.style.color = '';
      form.reset();
    }, 1200);
  });
}

/**
 * Automatically plays the showcase hero video when it is in view, and pauses it when out of view.
 */
function setupShowcaseVideoAutoplay() {
  const video = document.querySelector('.showcase-hero-video');
  const layout = document.querySelector('.showcase-editorial-layout');
  
  if (layout) {
    const layoutObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          layout.classList.add('visible');
          layoutObserver.unobserve(layout); // Trigger once
        }
      });
    }, { threshold: 0.05 });
    layoutObserver.observe(layout);
  }

  if (video) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(err => console.log("Showcase video play blocked: ", err));
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.1 });
    videoObserver.observe(video);
  }
}
