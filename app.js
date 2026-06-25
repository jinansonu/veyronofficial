/* VeyronChain Custom JavaScript Application */

document.addEventListener('DOMContentLoaded', async () => {
  // Init Firebase if config is active
  if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured()) {
    if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
  }

  // Logo link refresh and scroll to top interaction
  const headerLogoLink = document.getElementById('header-logo-link');
  if (headerLogoLink) {
    headerLogoLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo(0, 0);
      setTimeout(() => {
        window.location.reload();
      }, 50);
    });
  }

  // Intro Splash Screen Sequence
  const introSplash = document.getElementById('intro-splash');
  const introLogo = document.getElementById('intro-logo-container');

  if (introSplash && introLogo) {
    // 1. Fade in the logo
    setTimeout(() => {
      introLogo.classList.add('show');
    }, 400);

    // 2. Fade out the logo
    setTimeout(() => {
      introLogo.classList.remove('show');
      introLogo.classList.add('fade-out');
    }, 1800);

    // 3. Fade out the splash screen overlay
    setTimeout(() => {
      introSplash.style.opacity = '0';
      introSplash.style.pointerEvents = 'none';
    }, 2800);

    // 4. Fully hide splash and trigger home page staggered entrance animations
    setTimeout(() => {
      introSplash.style.display = 'none';
      document.body.classList.add('loaded');
    }, 3800);
  } else {
    // Fallback if elements do not exist
    document.body.classList.add('loaded');
  }

  // Theme Toggling (Light / Dark mode)
  initTheme();

  // Header Scroll Blur
  initHeaderScroll();

  // Scroll Animations (Intersection Observer)
  initScrollAnimations();

  // Scroll Reveal for collection titles and descriptions
  initScrollReveal();

  // Parallax Hero Effect
  initHeroParallax();

  // Grid Category Filter
  initCategoryFilter();

  // Inquiry Modal Logic
  initInquiryModal();

  // Product Lightbox Modal Logic
  initProductLightbox();

  // Hero Image Mouse Follow
  initHeroMouseFollow();

  // Timepieces Slider
  initTimepieceSlider();

  // Hero Image Tap Blur/Reveal Interaction
  initHeroImageInteraction();

  // Manifesto scroll & parallax interaction
  initManifestoInteraction();

  // Featured Objects Carousel slider
  await initFeaturedCarousel();

  // Craftsmanship steps interaction
  initCraftsmanshipInteraction();

  // Journal accordion interaction
  initJournalAccordion();

  // Mobile menu hamburger interaction
  initMobileMenu();
});

/**
 * Handles Dark/Light mode initialisation and toggling
 */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  // Check user preference or storage
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.classList.add('dark');
    updateThemeIcon(true);
  } else {
    document.documentElement.classList.remove('dark');
    updateThemeIcon(false);
  }

  toggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
  });
}

function updateThemeIcon(isDark) {
  const icon = document.querySelector('#theme-toggle span');
  if (!icon) return;
  icon.textContent = isDark ? 'light_mode' : 'dark_mode';
}

/**
 * Initialises scroll animation observer
 */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        entry.target.classList.remove('opacity-0', 'translate-y-8');
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-1000');
    observer.observe(el);
  });
}

/**
 * Initialises scroll reveal animation observer for collection headers and text
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-element');
  if (revealElements.length === 0) return;

  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    observer.observe(el);
  });
}

/**
 * Scroll-based parallax effect for the Hero Image
 */
function initHeroParallax() {
  const heroImage = document.querySelector('section:first-of-type img');
  if (!heroImage) return;

  window.addEventListener('scroll', () => {
    if (window.innerWidth >= 768) {
      const scrolled = window.pageYOffset;
      // Smooth subtle translation
      heroImage.style.transform = `translateY(${scrolled * 0.12}px)`;
    } else {
      heroImage.style.transform = 'none';
    }
  }, { passive: true });
}

/**
 * Category filtering for the Collections Grid
 */
function initCategoryFilter() {
  const filterButtons = document.querySelectorAll('.filter-tab');
  const gridItems = document.querySelectorAll('.masonry-grid > div');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Active styling
      filterButtons.forEach(b => {
        b.classList.remove('text-on-surface', 'border-b', 'border-on-surface');
        b.classList.add('text-on-surface-variant');
      });
      btn.classList.add('text-on-surface', 'border-b', 'border-on-surface');
      btn.classList.remove('text-on-surface-variant');

      const category = btn.getAttribute('data-filter');

      // Grid items transition
      gridItems.forEach(item => {
        const itemCategories = item.getAttribute('data-categories') || '';
        
        if (category === 'all' || itemCategories.includes(category)) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 10);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 400); // match transition speed
        }
      });
    });
  });
}

/**
 * Handles the Inquiry Modal dialog
 */
function initInquiryModal() {
  const modal = document.getElementById('inquiry-modal');
  const openButtons = document.querySelectorAll('.btn-inquire');
  const closeButton = document.getElementById('close-inquiry-modal');
  const form = document.getElementById('inquiry-form');
  const successMsg = document.getElementById('inquiry-success');

  if (!modal) return;

  const openModal = (defaultProduct = '') => {
    // If opening for a specific product, preset the selection
    if (defaultProduct) {
      const productSelect = document.getElementById('inquiry-interest');
      if (productSelect) productSelect.value = defaultProduct;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset form states after animation completes
    setTimeout(() => {
      if (form) form.reset();
      if (successMsg) successMsg.classList.add('hidden');
      if (form) form.classList.remove('hidden');
    }, 500);
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = btn.getAttribute('data-product') || '';
      openModal(product);
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  // Close when clicking overlay backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Visual feedback
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'TRANSMITTING...';
      submitBtn.disabled = true;

      // Simulate network request
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        form.classList.add('hidden');
        if (successMsg) {
          successMsg.classList.remove('hidden');
        }

        // Close modal automatically after 2 seconds
        setTimeout(closeModal, 2200);
      }, 1500);
    });
  }

  // Globally expose open function for lightbox button
  window.openInquiryModal = openModal;
}

/**
 * Handles the Product Lightbox details modal
 */
function initProductLightbox() {
  const lightbox = document.getElementById('product-lightbox');
  const cards = document.querySelectorAll('.product-card');
  const closeButton = document.getElementById('close-lightbox');
  
  if (!lightbox) return;

  const openLightbox = (cardData) => {
    const title = lightbox.querySelector('.lightbox-title');
    const price = lightbox.querySelector('.lightbox-price');
    const desc = lightbox.querySelector('.lightbox-desc');
    const img = lightbox.querySelector('.lightbox-img');
    const specs = lightbox.querySelector('.lightbox-specs');
    const inquireBtn = lightbox.querySelector('.lightbox-inquire');

    if (title) title.textContent = cardData.title;
    if (price) price.textContent = cardData.price;
    if (desc) desc.textContent = cardData.description;
    if (img) img.src = cardData.imageSrc;
    
    // Custom mock specifications based on product type
    if (specs) {
      specs.innerHTML = `
        <div class="grid grid-cols-2 gap-4 py-4 border-t border-outline-variant/20">
          <span class="font-label-caps text-label-sm text-on-surface-variant">Origin</span>
          <span class="font-body-md text-body-md text-on-surface text-right">${cardData.specs.origin}</span>
        </div>
        <div class="grid grid-cols-2 gap-4 py-4 border-t border-outline-variant/20">
          <span class="font-label-caps text-label-sm text-on-surface-variant">Material</span>
          <span class="font-body-md text-body-md text-on-surface text-right">${cardData.specs.material}</span>
        </div>
        <div class="grid grid-cols-2 gap-4 py-4 border-t border-b border-outline-variant/20">
          <span class="font-label-caps text-label-sm text-on-surface-variant">Production Time</span>
          <span class="font-body-md text-body-md text-on-surface text-right">${cardData.specs.production}</span>
        </div>
      `;
    }

    if (inquireBtn) {
      inquireBtn.setAttribute('data-product', cardData.title.toLowerCase());
      inquireBtn.onclick = () => {
        closeLightbox();
        // Open inquiry form after lightbox closes
        setTimeout(() => {
          if (window.openInquiryModal) {
            window.openInquiryModal(cardData.title.toLowerCase());
          }
        }, 300);
      };
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger lightbox if clicking the inline button link
      if (e.target.tagName === 'A' || e.target.closest('a')) return;

      const title = card.querySelector('h4').textContent;
      const price = card.querySelector('span.text-secondary').textContent;
      const description = card.querySelector('p').textContent;
      const imageSrc = card.querySelector('img').src;

      // Specifications based on name
      let specs = { origin: 'Kyoto, Japan', material: '925 Sterling Silver', production: '48 Hours' };
      if (title.toLowerCase().includes('chronograph')) {
        specs = { origin: 'Geneva, Switzerland', material: 'Surgical Grade Titanium', production: '120 Hours' };
      } else if (title.toLowerCase().includes('gold') || title.toLowerCase().includes('foundry')) {
        specs = { origin: 'Florence, Italy', material: '18k Solid Yellow Gold', production: '72 Hours' };
      }

      openLightbox({ title, price, description, imageSrc, specs });
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}

/**
 * Hero image 3D tilt and mouse follow (subtle 3-5px and 3D rotation)
 */
function initHeroMouseFollow() {
  const container = document.querySelector('.hero-tilt-wrapper');
  const heroSection = document.querySelector('section:first-of-type');

  if (!container || !heroSection) return;

  heroSection.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 768) return;

    const { width, height, left, top } = heroSection.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    // Subtle 3D tilt and translate
    const rotateX = -y * 8; // Max 4 degrees rotation (8 * 0.5)
    const rotateY = x * 8;
    const moveX = x * 10;  // Max 5px translation (10 * 0.5)
    const moveY = y * 10;

    container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${moveX}px, ${moveY}px, 0)`;
  });

  heroSection.addEventListener('mouseleave', () => {
    // Return to default smoothly
    container.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
  });

  heroSection.addEventListener('mouseenter', () => {
    container.style.transition = 'none';
  });
}

/**
 * Initialises the Timepieces slider
 */
function initTimepieceSlider() {
  const prevBtn = document.getElementById('prev-timepiece');
  const nextBtn = document.getElementById('next-timepiece');
  const slide1 = document.getElementById('timepiece-slide-1');
  const slide2 = document.getElementById('timepiece-slide-2');
  const descEl = document.getElementById('timepiece-desc');

  if (!slide1 || !slide2 || !descEl || !prevBtn || !nextBtn) return;

  const slides = [
    {
      img: slide1,
      desc: "Precision engineered. Built for those who value every second."
    },
    {
      img: slide2,
      desc: "Artisanal calibration meets modern design. A statement of legacy."
    }
  ];

  let currentIndex = 0;

  function updateSlider(newIndex) {
    if (newIndex === currentIndex) return;

    // Fade out current image
    slides[currentIndex].img.classList.remove('opacity-100');
    slides[currentIndex].img.classList.add('opacity-0');

    // Fade out description
    descEl.style.opacity = '0';

    currentIndex = newIndex;

    setTimeout(() => {
      // Fade in new image
      slides[currentIndex].img.classList.remove('opacity-0');
      slides[currentIndex].img.classList.add('opacity-100');

      // Update and fade in description
      descEl.textContent = slides[currentIndex].desc;
      descEl.style.opacity = '1';
    }, 300);
  }

  prevBtn.addEventListener('click', () => {
    const newIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlider(newIndex);
  });

  nextBtn.addEventListener('click', () => {
    const newIndex = (currentIndex + 1) % slides.length;
    updateSlider(newIndex);
  });

  // Make description transition smoothly
  descEl.style.transition = 'opacity 0.3s ease';
}

/**
 * Handles header background blur on scroll
 */
function initHeaderScroll() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  // Call once immediately in case of loaded state page refresh
  handleScroll();
}

/**
 * Tap/click hero image interaction: blurs the image and overlays "Link Your Legacy" text,
 * then fades out after 2 seconds and removes blur.
 */
function initHeroImageInteraction() {
  const trigger = document.getElementById('hero-image-interactive-trigger');
  const image = document.getElementById('hero-interactive-image');
  const overlayText = document.getElementById('hero-image-overlay-text');

  if (!trigger || !image || !overlayText) return;

  let isAnimating = false;

  trigger.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;

    // 1. Blur the image and fade in the text overlay
    image.classList.add('blurred');
    overlayText.classList.remove('opacity-0', 'pointer-events-none');
    overlayText.classList.add('opacity-100');

    // 2. Wait 2 seconds, then fade out the text and remove the blur
    setTimeout(() => {
      overlayText.classList.remove('opacity-100');
      overlayText.classList.add('opacity-0');
      image.classList.remove('blurred');

      // 3. Reset the interaction lock after the fade transition ends (700ms)
      setTimeout(() => {
        overlayText.classList.add('pointer-events-none');
        isAnimating = false;
      }, 700);
    }, 2000);
  });
}

/**
 * Manifesto section scroll effect and entrance animation triggering
 */
function initManifestoInteraction() {
  const manifestoSection = document.getElementById('manifesto');
  const heading = document.querySelector('.manifesto-heading');
  if (!manifestoSection || !heading) return;

  // Intersection Observer for Entrance Animation
  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        manifestoSection.classList.add('manifesto-animate-active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  observer.observe(manifestoSection);

  // Scroll effect (translateY(-40px) and opacity 1 -> 0.85)
  window.addEventListener('scroll', () => {
    const rect = manifestoSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Check if the section is in view
    if (rect.top < windowHeight && rect.bottom > 0) {
      // Calculate how far the section has scrolled through the viewport
      const totalRange = windowHeight + rect.height;
      const currentScroll = windowHeight - rect.top;
      const progress = Math.min(Math.max(currentScroll / totalRange, 0), 1);

      // Perform parallax translation and opacity change as it scrolls past the center
      if (progress > 0.4) {
        const factor = (progress - 0.4) / 0.6; // 0 to 1 as it leaves
        const translateY = -40 * factor;
        const opacity = 1 - (0.15 * factor); // 1 -> 0.85

        heading.style.transform = `translateY(${translateY}px)`;
        heading.style.opacity = opacity;
      } else {
        heading.style.transform = 'translateY(0px)';
        heading.style.opacity = '1';
      }
    }
  }, { passive: true });
}

/**
 * Interactive horizontal carousel for Featured Objects
 */
async function initFeaturedCarousel() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const indicatorsContainer = document.getElementById('carousel-indicators');

  if (!track || !prevBtn || !nextBtn || !indicatorsContainer) return;

  // 1. Fetch products from database
  let products = [];
  try {
    products = await window.getDbProducts();
  } catch (e) {
    console.error("Failed to load products for carousel", e);
  }

  // 2. Filter featured products: any product with featured === true is shown!
  const featuredProducts = products.filter(prod => prod.featured === true);

  // 3. Render cards dynamically
  const featuredSection = document.getElementById('featured');
  if (featuredProducts.length > 0) {
    track.innerHTML = '';
    featuredProducts.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'product-card carousel-card flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex flex-col group cursor-pointer bg-primary-container/40 p-4 border border-white/5 backdrop-blur-sm';
      card.innerHTML = `
        <div class="aspect-[3/4] overflow-hidden mb-6 rounded-[20px] shadow-md relative bg-[#E8DDD0]/10 flex items-center justify-center">
            <img class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" src="${prod.image}" alt="${prod.name}"/>
        </div>
        <div class="space-y-3 px-2 flex-grow flex flex-col justify-between">
            <div class="flex justify-between items-baseline gap-2">
                <h4 class="font-headline-sm text-headline-sm text-[#F8F5F0] leading-tight">${prod.name}</h4>
                <span class="font-body-md text-body-md text-[#E8DDD1] flex-none">₹${prod.price.toLocaleString()}</span>
            </div>
            <p class="font-body-md text-body-sm text-[#E8DDD1]/80 line-clamp-2 leading-relaxed mt-2">${prod.description}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        window.location.href = `collections.html?id=${prod.id}`;
      });

      track.appendChild(card);
    });

    // Ensure section is visible and nav controls are displayed
    if (featuredSection) featuredSection.classList.remove('hidden');
    if (prevBtn) prevBtn.style.display = '';
    if (nextBtn) nextBtn.style.display = '';
    if (indicatorsContainer) indicatorsContainer.style.display = '';
  } else {
    // Show a luxury placeholder if no featured products are available
    if (featuredSection) featuredSection.classList.remove('hidden');
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (indicatorsContainer) indicatorsContainer.style.display = 'none';

    track.innerHTML = `
      <div class="w-full text-center py-16 text-[#F8F5F0]/60 font-body-md">
        <span class="material-symbols-outlined text-4xl block mb-3 opacity-40">auto_awesome</span>
        Featured objects will appear here once selected in the dashboard.
      </div>
    `;
    return;
  }

  const cards = document.querySelectorAll('.carousel-card');
  if (cards.length === 0) {
    return;
  }

  let currentIndex = 0;
  let visibleCardsCount = 1;
  let maxIndex = 0;

  function calculateLayout() {
    const width = window.innerWidth;
    if (width >= 1280) {
      visibleCardsCount = 4;
    } else if (width >= 1024) {
      visibleCardsCount = 3;
    } else if (width >= 640) {
      visibleCardsCount = 2;
    } else {
      visibleCardsCount = 1;
    }

    maxIndex = Math.max(cards.length - visibleCardsCount, 0);
    
    // Safety check for index overflow after resize
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    // Build indicators
    buildIndicators();
    updateCarousel();
  }

  function buildIndicators() {
    indicatorsContainer.innerHTML = '';
    const pageCount = maxIndex + 1;

    if (pageCount <= 1) {
      indicatorsContainer.classList.add('hidden');
      return;
    } else {
      indicatorsContainer.classList.remove('hidden');
    }

    for (let i = 0; i < pageCount; i++) {
      const bar = document.createElement('button');
      bar.className = 'carousel-indicator-bar';
      if (i === currentIndex) bar.classList.add('active');
      bar.setAttribute('aria-label', `Go to slide ${i + 1}`);
      bar.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
      });
      indicatorsContainer.appendChild(bar);
    }
  }

  function updateCarousel() {
    // 1. Calculate offset to slide
    if (cards[currentIndex]) {
      const offset = cards[currentIndex].offsetLeft - cards[0].offsetLeft;
      track.style.transform = `translateX(-${offset}px)`;
    }

    // 2. Enable/disable navigation buttons
    if (currentIndex === 0) {
      prevBtn.style.opacity = '0.3';
      prevBtn.style.pointerEvents = 'none';
    } else {
      prevBtn.style.opacity = '1';
      prevBtn.style.pointerEvents = 'auto';
    }

    if (currentIndex >= maxIndex) {
      nextBtn.style.opacity = '0.3';
      nextBtn.style.pointerEvents = 'none';
    } else {
      nextBtn.style.opacity = '1';
      nextBtn.style.pointerEvents = 'auto';
    }

    // 3. Highlight active indicator
    const bars = indicatorsContainer.querySelectorAll('.carousel-indicator-bar');
    bars.forEach((bar, idx) => {
      if (idx === currentIndex) {
        bar.classList.add('active');
      } else {
        bar.classList.remove('active');
      }
    });
  }

  // Next and Prev click events
  nextBtn.addEventListener('click', () => {
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  // Responsive Resize handler
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(calculateLayout, 100);
  });

  // Touch support for swiping on mobile
  let startX = 0;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;

    // Minimum swipe threshold (50px)
    if (Math.abs(diffX) > 50) {
      if (diffX > 0 && currentIndex < maxIndex) {
        // Swipe left -> next
        currentIndex++;
        updateCarousel();
      } else if (diffX < 0 && currentIndex > 0) {
        // Swipe right -> prev
        currentIndex--;
        updateCarousel();
      }
    }
  }, { passive: true });

  // Run initial calculations
  calculateLayout();
}

/**
 * Interactive steps and cross-fading background images for Craftsmanship
 */
function initCraftsmanshipInteraction() {
  const track = document.getElementById('craft-track');
  const cards = document.querySelectorAll('.craftsmanship-card');
  const prevBtn = document.getElementById('craft-prev');
  const nextBtn = document.getElementById('craft-next');
  const indicatorsContainer = document.getElementById('craft-indicators');
  
  const bgImages = [
    document.getElementById('craft-bg-1'),
    document.getElementById('craft-bg-2'),
    document.getElementById('craft-bg-3')
  ];

  if (!track || cards.length === 0 || !prevBtn || !nextBtn || !indicatorsContainer) return;

  let currentIndex = 0;
  const totalCards = cards.length;

  // 1. Create dots dynamically
  indicatorsContainer.innerHTML = '';
  for (let i = 0; i < totalCards; i++) {
    const dot = document.createElement('button');
    dot.className = `craft-indicator-dot ${i === currentIndex ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => {
      setActiveSlide(i);
    });
    indicatorsContainer.appendChild(dot);
  }

  const dots = indicatorsContainer.querySelectorAll('.craft-indicator-dot');

  // 2. Set active slide function
  function setActiveSlide(index) {
    if (index < 0 || index >= totalCards) return;
    currentIndex = index;
    
    // Update card classes
    cards.forEach((card, idx) => {
      if (idx === currentIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Cross-fade background images
    bgImages.forEach((img, idx) => {
      if (img) {
        if (idx === currentIndex) {
          img.classList.add('active');
        } else {
          img.classList.remove('active');
        }
      }
    });

    // Update indicator dots
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Slide track on mobile/tablet
    updateSlidePosition();
  }

  // Calculate layout and position
  function updateSlidePosition() {
    // If screen is lg (desktop), we show all cards, no translation needed
    if (window.innerWidth >= 1024) {
      track.style.transform = 'none';
      
      // On desktop, arrows are disabled/hidden
      prevBtn.style.opacity = '0.3';
      prevBtn.style.pointerEvents = 'none';
      nextBtn.style.opacity = '0.3';
      nextBtn.style.pointerEvents = 'none';
      return;
    }

    // Enable navigation buttons on mobile/tablet
    prevBtn.style.pointerEvents = 'auto';
    nextBtn.style.pointerEvents = 'auto';
    prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
    nextBtn.style.opacity = currentIndex === totalCards - 1 ? '0.3' : '1';

    // Slide track
    const trackWidth = track.getBoundingClientRect().width;
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 24; // gap-6 (24px) in HTML

    // Center active card
    const containerWidth = track.parentElement.getBoundingClientRect().width;
    const offset = (currentIndex * (cardWidth + gap)) - (containerWidth - cardWidth) / 2;
    
    // Clamp offset between 0 and max translate
    const maxTranslate = (totalCards * cardWidth + (totalCards - 1) * gap) - containerWidth;
    const clampedOffset = Math.max(0, Math.min(offset, maxTranslate));

    track.style.transform = `translateX(-${clampedOffset}px)`;
  }

  // Event Listeners for buttons
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      setActiveSlide(currentIndex - 1);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < totalCards - 1) {
      setActiveSlide(currentIndex + 1);
    }
  });

  // Tap directly on cards to make them active
  cards.forEach((card, index) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Don't trigger if they clicked inside the Read More button
      if (e.target.tagName.toLowerCase() === 'button') return;
      setActiveSlide(index);
    });
  });

  // Swipe support for mobile
  let startX = 0;
  let isSwiping = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0 && currentIndex < totalCards - 1) {
        setActiveSlide(currentIndex + 1);
      } else if (diffX < 0 && currentIndex > 0) {
        setActiveSlide(currentIndex - 1);
      }
    }
    isSwiping = false;
  }, { passive: true });

  // Handle resizing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateSlidePosition, 100);
  });

  // Initialize first state
  setActiveSlide(0);
}

/**
 * Smooth accordion toggle for the Journal section
 */
function initJournalAccordion() {
  const items = document.querySelectorAll('.journal-accordion-item');
  if (items.length === 0) return;

  items.forEach((item) => {
    const header = item.querySelector('.journal-accordion-header');
    const panel = item.querySelector('.journal-accordion-panel');

    if (!header || !panel) return;

    // Check initial state
    if (header.getAttribute('aria-expanded') === 'true') {
      item.classList.add('active');
      panel.classList.add('open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
      panel.style.opacity = '1';
    } else {
      panel.style.maxHeight = '0px';
      panel.style.opacity = '0';
    }

    header.addEventListener('click', () => {
      const isExpanded = header.getAttribute('aria-expanded') === 'true';

      // 1. Collapse all other accordion items
      items.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherHeader = otherItem.querySelector('.journal-accordion-header');
          const otherPanel = otherItem.querySelector('.journal-accordion-panel');
          if (otherHeader && otherPanel) {
            otherHeader.setAttribute('aria-expanded', 'false');
            otherPanel.classList.remove('open');
            otherPanel.style.maxHeight = '0px';
            otherPanel.style.opacity = '0';
          }
        }
      });

      // 2. Toggle this item
      if (isExpanded) {
        header.setAttribute('aria-expanded', 'false');
        item.classList.remove('active');
        panel.classList.remove('open');
        panel.style.maxHeight = '0px';
        panel.style.opacity = '0';
      } else {
        header.setAttribute('aria-expanded', 'true');
        item.classList.add('active');
        panel.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.style.opacity = '1';
      }
    });
  });
}

/**
 * Hamburger Mobile Menu Dropdown Toggle
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuLinks = document.querySelectorAll('.menu-link');

  if (!menuToggle || !mobileMenu) return;

  menuToggle.addEventListener('click', () => {
    const isOpened = mobileMenu.classList.contains('translate-y-0');
    const icon = menuToggle.querySelector('span');

    if (isOpened) {
      mobileMenu.classList.remove('translate-y-0');
      mobileMenu.classList.add('-translate-y-full');
      icon.textContent = 'menu';
    } else {
      mobileMenu.classList.remove('-translate-y-full');
      mobileMenu.classList.add('translate-y-0');
      icon.textContent = 'close';
    }
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('translate-y-0');
      mobileMenu.classList.add('-translate-y-full');
      const icon = menuToggle.querySelector('span');
      if (icon) icon.textContent = 'menu';
    });
  });
}
