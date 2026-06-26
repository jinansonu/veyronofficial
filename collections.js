// Collections Page Functionality

document.addEventListener('DOMContentLoaded', () => {
  // Init Firebase if config is active
  if (isFirebaseConfigured()) {
    firebase.initializeApp(firebaseConfig);
  }

  // DOM Elements
  const categoriesGridView = document.getElementById('categories-grid-view');
  const productDetailView = document.getElementById('product-detail-view');
  const activeCategoryTitle = document.getElementById('active-category-title');
  const backToCategoriesBtn = document.getElementById('back-to-categories');
  const productsResultGrid = document.getElementById('products-result-grid');
  const productsEmptyState = document.getElementById('products-empty-state');
  const categoryQuickSelect = document.getElementById('category-quick-select');
  const genderFilterBtns = document.querySelectorAll('.gender-filter-btn');

  // Single Product Detail View Elements
  const singleProductView = document.getElementById('single-product-view');
  const backToProductsBtn = document.getElementById('back-to-products');
  const singleCategoryTag = document.getElementById('single-category-tag');
  const singleThumbnailGallery = document.getElementById('single-thumbnail-gallery');
  const singleMainImg = document.getElementById('single-main-img');
  const singlePrevImgBtn = document.getElementById('single-prev-img');
  const singleNextImgBtn = document.getElementById('single-next-img');
  const singleTitle = document.getElementById('single-title');
  const singlePrice = document.getElementById('single-price');
  const singleDesc = document.getElementById('single-desc');
  const singleAddToCartBtn = document.getElementById('single-add-to-cart');
  const singleBuyNowBtn = document.getElementById('single-buy-now');

  // State Variables
  let activeCategory = "";
  let activeGender = "all";
  let cachedProducts = [];
  let currentProduct = null;
  let activeImgIndex = 0;
  let currentImagesList = [];

  // Load and Render Products Grid List
  const renderFilteredProducts = async () => {
    productsResultGrid.innerHTML = '<div class="col-span-full text-center py-12 opacity-50 text-on-surface">Loading products...</div>';
    productsEmptyState.classList.add('hidden');
    
    try {
      if (cachedProducts.length === 0) {
        cachedProducts = await getDbProducts();
      }

      // Filter catalog
      const filtered = cachedProducts.filter(prod => {
        const matchesCategory = prod.category === activeCategory;
        const matchesGender = activeGender === 'all' || prod.gender === 'all' || prod.gender === activeGender;
        return matchesCategory && matchesGender;
      });

      if (filtered.length === 0) {
        productsResultGrid.innerHTML = '';
        
        const emptyStateText = productsEmptyState.querySelector('p');
        const emptyStateIcon = productsEmptyState.querySelector('span');

        const hasAnyInCategory = cachedProducts.some(prod => prod.category === activeCategory);

        if (!hasAnyInCategory) {
          // Category has no products -> Coming Soon
          if (emptyStateText) {
            emptyStateText.className = 'font-display-lg text-2xl tracking-widest uppercase text-espresso mt-4';
            emptyStateText.innerHTML = `
              <span class="block text-[10px] font-label-caps tracking-[0.25em] text-on-surface-variant/60 mb-2">— Archives Under Curation —</span>
              Coming Soon
            `;
          }
          if (emptyStateIcon) {
            emptyStateIcon.textContent = 'history_toggle_off';
            emptyStateIcon.className = 'material-symbols-outlined text-5xl opacity-30 text-espresso';
          }
        } else {
          // Category has products, but gender filter mismatch
          if (emptyStateText) {
            emptyStateText.className = 'font-body-md text-sm text-on-surface-variant mt-2';
            emptyStateText.innerHTML = 'No pieces found matching the active gender filter in this collection.';
          }
          if (emptyStateIcon) {
            emptyStateIcon.textContent = 'info';
            emptyStateIcon.className = 'material-symbols-outlined text-4xl opacity-30 text-on-surface';
          }
        }

        productsEmptyState.classList.remove('hidden');
        return;
      }

      productsResultGrid.innerHTML = '';
      
      filtered.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card bg-white dark:bg-[#2E211B] p-5 border-2 border-[#E8DDD0] dark:border-[#4A372D] rounded-[24px] flex flex-col justify-between group cursor-pointer hover:border-[#4A372D]/60 dark:hover:border-[#E8DDD0]/60 transition-all duration-300 shadow-md hover:-translate-y-1 mb-4';
        
        let priceSection = `<span class="font-label-caps text-xs text-espresso font-bold flex-none">₹${prod.price.toLocaleString()}</span>`;
        if (prod.originalPrice && prod.offerPercentage) {
          priceSection = `
            <div class="text-right flex flex-col items-end gap-0.5 flex-none">
              <div class="flex items-center gap-1.5">
                <span class="line-through text-[10px] text-on-surface-variant/60 font-medium">₹${prod.originalPrice.toLocaleString()}</span>
                <span class="font-label-caps text-xs text-espresso font-bold">₹${prod.price.toLocaleString()}</span>
              </div>
              <span class="text-[9px] tracking-wider font-semibold text-emerald-700 uppercase bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.5 rounded-sm">${prod.offerPercentage}% OFF</span>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="space-y-4 flex flex-col justify-between h-full w-full">
            <div class="w-[240px] max-w-full aspect-square mx-auto overflow-hidden rounded-[16px] shadow-sm relative border-2 border-[#E8DDD0] dark:border-[#4A372D]/60 bg-[#E8DDD0]/20 flex-none flex items-center justify-center">
              <img class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" src="${prod.image}" alt="${prod.name}"/>
            </div>
            <div class="space-y-2 px-1 flex-grow flex flex-col justify-between mt-4">
              <div>
                <div class="flex justify-between items-baseline gap-2 mb-2">
                  <h4 class="font-display-md text-sm uppercase text-on-surface font-semibold leading-tight">${prod.name}</h4>
                  ${priceSection}
                </div>
                <p class="font-body-md text-xs text-on-surface-variant line-clamp-3 leading-relaxed">${prod.description}</p>
              </div>
              
              <!-- White/Brown divider line inside each card at the bottom -->
              <div class="border-t border-[#E8DDD0] dark:border-[#4A372D]/40 pt-2 mt-4"></div>
            </div>
          </div>
        `;
        
        card.addEventListener('click', () => {
          showSingleProductView(prod);
        });
        
        productsResultGrid.appendChild(card);
      });

    } catch (err) {
      console.error(err);
      productsResultGrid.innerHTML = '<div class="col-span-full text-center py-12 text-error">Failed to load collection.</div>';
    }
  };

  // View Navigation Helpers
  const showCategoryView = (categoryCode) => {
    activeCategory = categoryCode;
    
    // Update Title text
    const titleMap = {
      "neck chains fancy": "Neck Chains Fancy",
      "finger rings": "Finger Rings",
      "earrings": "Earrings",
      "bracelet unisex": "Bracelet Unisex",
      "teeth braces fashion": "Teeth Braces Fashion",
      "watches not luxury": "Watches (Archive)"
    };
    activeCategoryTitle.textContent = titleMap[categoryCode] || categoryCode;
    
    // Set Selector dropdown value
    categoryQuickSelect.value = categoryCode;
    
    // Reset filters
    activeGender = "all";
    genderFilterBtns.forEach(btn => {
      if (btn.getAttribute('data-gender') === 'all') btn.classList.add('active');
      else btn.classList.remove('active');
    });

    // View toggle animation
    categoriesGridView.classList.add('hidden');
    productDetailView.classList.remove('hidden');
    singleProductView.classList.add('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderFilteredProducts();
  };

  const showAllCategoriesView = () => {
    // Keep page=collections parameter in the URL
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?page=collections';
    window.history.pushState({ path: cleanUrl }, '', cleanUrl);

    categoriesGridView.classList.remove('hidden');
    productDetailView.classList.add('hidden');
    singleProductView.classList.add('hidden');
    activeCategory = "";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeActiveImage = (idx) => {
    activeImgIndex = idx;
    
    // Update stage main image
    singleMainImg.style.opacity = '0.3';
    setTimeout(() => {
      singleMainImg.src = currentImagesList[activeImgIndex];
      // Reset transform zoom on transition
      singleMainImg.style.transform = 'scale(1)';
      singleMainImg.style.opacity = '1';
    }, 150);

    // Update active thumbnail borders
    const thumbBtns = singleThumbnailGallery.querySelectorAll('button');
    thumbBtns.forEach((btn, tIdx) => {
      if (tIdx === activeImgIndex) {
        btn.classList.add('border-[#4A372D]', 'opacity-100');
        btn.classList.remove('border-transparent');
      } else {
        btn.classList.remove('border-[#4A372D]', 'opacity-100');
        btn.classList.add('border-transparent');
      }
    });
  };

  // Single Product Detailed Panel View
  const showSingleProductView = (product) => {
    currentProduct = product;
    activeImgIndex = 0;
    
    // Determine image list
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      currentImagesList = product.images;
    } else {
      currentImagesList = [product.image];
    }

    // Toggle navigation arrow visibility and cursor pointers
    if (currentImagesList.length > 1) {
      singlePrevImgBtn.classList.remove('hidden');
      singleNextImgBtn.classList.remove('hidden');
      singleMainImg.classList.add('cursor-pointer');
    } else {
      singlePrevImgBtn.classList.add('hidden');
      singleNextImgBtn.classList.add('hidden');
      singleMainImg.classList.remove('cursor-pointer');
    }

    // View switches
    categoriesGridView.classList.add('hidden');
    productDetailView.classList.add('hidden');
    singleProductView.classList.remove('hidden');

    // Populate contents
    singleTitle.textContent = product.name;
    singleCategoryTag.textContent = product.category.replace(/ un-?sex| not luxury/gi, '');
    
    if (product.originalPrice && product.offerPercentage) {
      singlePrice.innerHTML = `
        <div class="flex items-baseline gap-3 flex-wrap">
          <span class="font-serif text-3xl font-normal text-[#4A372D]">₹${product.price.toLocaleString()}</span>
          <span class="line-through text-lg text-[#4A372D]/50 font-normal">₹${product.originalPrice.toLocaleString()}</span>
          <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-[4px] uppercase tracking-wider">${product.offerPercentage}% OFF</span>
        </div>
      `;
    } else {
      singlePrice.innerHTML = `₹${product.price.toLocaleString()}`;
    }
    
    singleDesc.textContent = product.description;

    // Set stage main image
    singleMainImg.src = currentImagesList[0];
    singleMainImg.style.transform = 'scale(1)';

    singleThumbnailGallery.innerHTML = '';
    
    if (currentImagesList.length > 1) {
      // Load actual multiple images into thumbnail gallery
      currentImagesList.forEach((imgUrl, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.className = `w-16 h-20 sm:w-full aspect-[3/4] bg-[#E8DDD0]/20 rounded-lg overflow-hidden border-2 transition-all duration-300 opacity-60 hover:opacity-90 flex-none relative ${idx === 0 ? 'border-[#4A372D] opacity-100' : 'border-transparent'}`;
        thumbBtn.setAttribute('aria-label', `View image aspect ${idx + 1}`);

        thumbBtn.innerHTML = `
          <img class="w-full h-full object-cover" src="${imgUrl}" alt="View aspect ${idx + 1}">
        `;

        thumbBtn.addEventListener('click', () => {
          changeActiveImage(idx);
        });

        singleThumbnailGallery.appendChild(thumbBtn);
      });
    } else {
      // Fallback signature aspects for single images
      const thumbnailSpecs = [
        { name: "Signature", transform: "scale(1) rotate(0deg)" },
        { name: "Detail", transform: "scale(1.4) rotate(0deg)" },
        { name: "Profile", transform: "scale(1.25) rotate(4deg)" },
        { name: "Tactile", transform: "scale(1.8) rotate(-2deg)" }
      ];

      thumbnailSpecs.forEach((spec, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.className = `w-16 h-20 sm:w-full aspect-[3/4] bg-[#E8DDD0]/20 rounded-lg overflow-hidden border-2 transition-all duration-300 opacity-60 hover:opacity-90 flex-none relative ${idx === 0 ? 'border-[#4A372D] opacity-100' : 'border-transparent'}`;
        thumbBtn.setAttribute('aria-label', `View ${spec.name} aspect`);

        thumbBtn.innerHTML = `
          <img class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" src="${product.image}" alt="${spec.name} View" style="transform: ${spec.transform};">
        `;

        thumbBtn.addEventListener('click', () => {
          // Clear active borders
          singleThumbnailGallery.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('border-[#4A372D]', 'opacity-100');
            btn.classList.add('border-transparent');
          });
          // Add active border
          thumbBtn.classList.remove('border-transparent');
          thumbBtn.classList.add('border-[#4A372D]', 'opacity-100');

          // Stage transition
          singleMainImg.style.opacity = '0.3';
          setTimeout(() => {
            singleMainImg.style.transform = spec.transform;
            singleMainImg.style.opacity = '1';
          }, 150);
        });

        singleThumbnailGallery.appendChild(thumbBtn);
      });
    }

    // Update Query String parameter without reloading
    const detailUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?id=${product.id}`;
    window.history.pushState({ path: detailUrl }, '', detailUrl);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bind Category Grid Cards Click
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      showCategoryView(cat);
    });
  });

  // Bind Back to Categories List Button
  backToCategoriesBtn.addEventListener('click', showAllCategoriesView);

  // Bind Back from Single Product View to Products Grid List
  backToProductsBtn.addEventListener('click', () => {
    if (activeCategory) {
      showCategoryView(activeCategory);
      // Clean query string
      const catUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?category=${activeCategory}`;
      window.history.pushState({ path: catUrl }, '', catUrl);
    } else {
      showAllCategoriesView();
    }
  });

  // Bind Category Quick Selector dropdown
  categoryQuickSelect.addEventListener('change', (e) => {
    showCategoryView(e.target.value);
  });

  // Bind Gender filter buttons
  genderFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      genderFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeGender = btn.getAttribute('data-gender');
      renderFilteredProducts();
    });
  });



  // Bind action buttons inside single product view
  if (singleAddToCartBtn) {
    singleAddToCartBtn.addEventListener('click', () => {
      singleAddToCartBtn.innerHTML = '<span class="animate-pulse">Adding...</span>';
      setTimeout(() => {
        alert(`${singleTitle.textContent} added to your cart.`);
        singleAddToCartBtn.innerHTML = 'Add to Cart';
      }, 1000);
    });
  }

  if (singleBuyNowBtn) {
    singleBuyNowBtn.addEventListener('click', () => {
      if (!currentProduct) return;
      
      let imageUrl = "";
      if (currentProduct.image) {
        if (currentProduct.image.startsWith('http')) {
          imageUrl = currentProduct.image;
        } else if (!currentProduct.image.startsWith('data:')) {
          const baseDomain = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'https://veyronofficial.vercel.app'
            : window.location.origin;
          imageUrl = `${baseDomain}/${currentProduct.image}`;
        }
      }
      
      let message = `Hey I need this '${currentProduct.name}'`;
      if (imageUrl) {
        message += `\n\nProduct Image: ${imageUrl}`;
      } else {
        // Fallback website link for old base64 products
        const baseDomain = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'https://veyronofficial.vercel.app'
          : window.location.origin;
        message += `\n\nLink: ${baseDomain}${window.location.pathname}?id=${currentProduct.id}`;
      }
      
      const encodedMsg = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/919946601662?text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  // Arrow navigation click handlers and main image click cycling
  if (singleMainImg) {
    singleMainImg.addEventListener('click', () => {
      if (currentImagesList.length <= 1) return;
      let newIdx = activeImgIndex + 1;
      if (newIdx >= currentImagesList.length) newIdx = 0;
      changeActiveImage(newIdx);
    });
  }

  if (singlePrevImgBtn) {
    singlePrevImgBtn.addEventListener('click', () => {
      if (currentImagesList.length <= 1) return;
      let newIdx = activeImgIndex - 1;
      if (newIdx < 0) newIdx = currentImagesList.length - 1;
      changeActiveImage(newIdx);
    });
  }

  if (singleNextImgBtn) {
    singleNextImgBtn.addEventListener('click', () => {
      if (currentImagesList.length <= 1) return;
      let newIdx = activeImgIndex + 1;
      if (newIdx >= currentImagesList.length) newIdx = 0;
      changeActiveImage(newIdx);
    });
  }

  // 5. QUERY PARAMETER DEEP LINK CHECK
  const checkUrlParams = async () => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const catParam = params.get('category');

    // 1. Map and transition to category instantly if present in URL
    if (catParam) {
      const validCategories = [
        "neck chains fancy",
        "finger rings",
        "earrings",
        "bracelet unisex",
        "teeth braces fashion",
        "watches not luxury"
      ];

      const shorthandMap = {
        "chains": "neck chains fancy",
        "rings": "finger rings",
        "earrings": "earrings",
        "bracelets": "bracelet unisex",
        "braces": "teeth braces fashion",
        "teeth": "teeth braces fashion",
        "teeth clips": "teeth braces fashion",
        "teeth-clips": "teeth braces fashion",
        "watches": "watches not luxury"
      };

      const mappedCat = validCategories.includes(catParam) ? catParam : shorthandMap[catParam.toLowerCase()];
      if (mappedCat) {
        showCategoryView(mappedCat);
      }
    }

    // 2. Handle deep-linking to single product (needs database products fetched first)
    if (idParam) {
      if (cachedProducts.length === 0) {
        cachedProducts = await getDbProducts();
      }
      const product = cachedProducts.find(p => p.id === idParam);
      if (product) {
        activeCategory = product.category;
        showSingleProductView(product);
      }
    }

    // Remove fast-route style tag so future transitions work correctly
    const fastRouteStyle = document.getElementById('fast-route-style');
    if (fastRouteStyle) {
      fastRouteStyle.remove();
    }
  };

  // 6. SPA ROUTING FUNCTIONALITY
  const homepageView = document.getElementById('homepage-view');
  const collectionsView = document.getElementById('collections-view');

  const veyronRouter = async () => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    const isCollections = (params.get('page') === 'collections') || params.has('category') || params.has('id');

    if (isCollections) {
      if (homepageView) homepageView.classList.add('hidden');
      if (collectionsView) collectionsView.classList.remove('hidden');

      // Close mobile menu if open
      const mobileMenu = document.getElementById('mobile-menu');
      const menuToggle = document.getElementById('menu-toggle');
      if (mobileMenu && mobileMenu.classList.contains('translate-y-0')) {
        mobileMenu.classList.remove('translate-y-0');
        mobileMenu.classList.add('-translate-y-full');
        if (menuToggle) {
          const icon = menuToggle.querySelector('span');
          if (icon) icon.textContent = 'menu';
        }
      }

      await checkUrlParams();
    } else {
      if (collectionsView) collectionsView.classList.add('hidden');
      if (homepageView) homepageView.classList.remove('hidden');

      // Close mobile menu if open
      const mobileMenu = document.getElementById('mobile-menu');
      const menuToggle = document.getElementById('menu-toggle');
      if (mobileMenu && mobileMenu.classList.contains('translate-y-0')) {
        mobileMenu.classList.remove('translate-y-0');
        mobileMenu.classList.add('-translate-y-full');
        if (menuToggle) {
          const icon = menuToggle.querySelector('span');
          if (icon) icon.textContent = 'menu';
        }
      }

      // Scroll to hash target on homepage if any
      if (hash) {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Expose to window for app.js or inline scripts
  window.veyronRouter = veyronRouter;

  // Intercept all link clicks for SPA feel
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Handle clicks that target homepage sections or collections
    const isCollectionsLink = href.startsWith('collections.html');
    const isHomepageSectionLink = href.startsWith('index.html') || href.startsWith('#');

    if (isCollectionsLink || isHomepageSectionLink) {
      e.preventDefault();

      let targetUrl = href;
      if (isCollectionsLink) {
        const queryPart = href.includes('?') ? href.substring(href.indexOf('?')) : '?page=collections';
        const urlParams = new URLSearchParams(queryPart);
        if (!urlParams.has('page')) {
          urlParams.set('page', 'collections');
        }
        targetUrl = window.location.pathname + '?' + urlParams.toString();
      } else if (href.startsWith('index.html')) {
        const hashIndex = href.indexOf('#');
        const hashPart = hashIndex !== -1 ? href.substring(hashIndex) : '';
        const queryIndex = href.indexOf('?');
        const queryPart = (queryIndex !== -1 && queryIndex < hashIndex) ? href.substring(queryIndex, hashIndex) : '';
        targetUrl = window.location.pathname + queryPart + hashPart;
      }

      window.history.pushState(null, '', targetUrl);
      veyronRouter();
    }
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', veyronRouter);

  // Run initial router triggers
  veyronRouter();
});
