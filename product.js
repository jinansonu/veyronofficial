// Product Details Page Logic

document.addEventListener('DOMContentLoaded', async () => {
  // Init Firebase if config is active
  if (isFirebaseConfigured()) {
    firebase.initializeApp(firebaseConfig);
  }

  // DOM Elements
  const mainHeader = document.getElementById('main-header');
  const mainProductImage = document.getElementById('main-product-image');
  const imageOverlay = document.getElementById('image-overlay');
  const thumbnailGallery = document.getElementById('thumbnail-gallery');
  const productCategory = document.getElementById('product-category');
  const productTitle = document.getElementById('product-title');
  const productPrice = document.getElementById('product-price');
  const productDescription = document.getElementById('product-description');
  
  // Specs
  const specComposition = document.getElementById('spec-composition');

  // Menu Elements
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuLinks = document.querySelectorAll('.menu-link');

  // Theme Toggle Elements
  const themeToggle = document.getElementById('theme-toggle');

  // 1. Theme Configuration
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      updateThemeIcon(true);
    } else {
      document.documentElement.classList.remove('dark');
      updateThemeIcon(false);
    }

    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      updateThemeIcon(isDark);
    });
  };

  const updateThemeIcon = (isDark) => {
    const icon = themeToggle.querySelector('span');
    if (icon) {
      icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    }
  };

  // Hamburger Menu toggle
  if (menuToggle && mobileMenu) {
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

  // 2. Load Product Details
  const loadProduct = async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      window.location.href = 'collections.html';
      return;
    }

    try {
      const products = await getDbProducts();
      const product = products.find(p => p.id === id);

      if (!product) {
        console.error("Product not found:", id);
        window.location.href = 'collections.html';
        return;
      }

      // Populate Texts
      productTitle.textContent = product.name;
      productCategory.textContent = product.category.replace(/ un-?sex| not luxury/gi, '');
      productPrice.textContent = `₹${product.price.toLocaleString()}`;
      productDescription.textContent = product.description;

      // Update Spec table with realistic category data
      if (product.category.includes('ring')) {
        specComposition.textContent = "18k Solid Yellow Gold, Hand-Finished Satin";
      } else if (product.category.includes('chain')) {
        specComposition.textContent = "Sterling Silver 925, Anti-Tarnish Finish";
      } else if (product.category.includes('watch')) {
        specComposition.textContent = "Surgical Grade Steel, Sapphire Crystal Glass";
      } else {
        specComposition.textContent = "Premium Forged Alloy, Architectural Design";
      }

      // Set Main Image
      mainProductImage.src = product.image;

      // Generate 4 vertical thumbnails (Crops/Angles of the main image)
      const thumbnailSpecs = [
        { name: "Signature", transform: "scale(1) rotate(0deg)" },
        { name: "Detail", transform: "scale(1.4) rotate(0deg)" },
        { name: "Profile", transform: "scale(1.25) rotate(4deg)" },
        { name: "Tactile", transform: "scale(1.8) rotate(-2deg)" }
      ];

      thumbnailGallery.innerHTML = '';
      
      thumbnailSpecs.forEach((spec, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.className = `w-16 h-20 sm:w-full aspect-[3/4] bg-luxurySecondary/20 rounded-lg overflow-hidden border-2 border-transparent transition-all duration-300 opacity-60 hover:opacity-90 flex-none relative ${idx === 0 ? 'thumbnail-active' : ''}`;
        thumbBtn.setAttribute('aria-label', `View ${spec.name} aspect`);

        thumbBtn.innerHTML = `
          <img class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" src="${product.image}" alt="${spec.name} View" style="transform: ${spec.transform};">
        `;

        thumbBtn.addEventListener('click', () => {
          // Update active styling
          thumbnailGallery.querySelectorAll('button').forEach(btn => btn.classList.remove('thumbnail-active'));
          thumbBtn.classList.add('thumbnail-active');

          // Fade out -> change transform -> fade in main image stage
          mainProductImage.style.opacity = '0.3';
          setTimeout(() => {
            mainProductImage.style.transform = spec.transform;
            mainProductImage.style.opacity = '1';
          }, 150);
        });

        thumbnailGallery.appendChild(thumbBtn);
      });

      // Page Load Reveal Animation
      setTimeout(() => {
        if (imageOverlay) {
          imageOverlay.style.width = '0';
        }
        mainProductImage.style.transform = 'scale(1)';
      }, 300);

    } catch (err) {
      console.error("Error loading product detail page:", err);
    }
  };

  // Button Action Bindings
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  const buyNowBtn = document.getElementById('buy-now-btn');

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      addToCartBtn.innerHTML = '<span class="animate-pulse">Adding...</span>';
      setTimeout(() => {
        alert(`${productTitle.textContent} added to your cart.`);
        addToCartBtn.innerHTML = 'Add to Cart';
      }, 1000);
    });
  }

  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      alert(`Proceeding to luxury checkout for ${productTitle.textContent}.`);
    });
  }

  initTheme();
  await loadProduct();
});
