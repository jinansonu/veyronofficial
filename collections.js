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

  // Inquiry Modal Elements
  const inquiryModal = document.getElementById('inquiry-modal');
  const closeInquiryModal = document.getElementById('close-inquiry-modal');
  const inquiryForm = document.getElementById('inquiry-form');
  const inquiryInterest = document.getElementById('inquiry-interest');
  const inquirySuccess = document.getElementById('inquiry-success');

  // Hamburger Menu Elements
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuLinks = document.querySelectorAll('.menu-link');

  // Theme Toggle Elements
  const themeToggle = document.getElementById('theme-toggle');

  // State Variables
  let activeCategory = "";
  let activeGender = "all";
  let cachedProducts = [];

  // Theme Initialization
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

  // Hamburger toggle logic
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

  // Load and Render Products
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
        productsEmptyState.classList.remove('hidden');
        return;
      }

      productsResultGrid.innerHTML = '';
      
      filtered.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card bg-primary-container/40 p-4 border border-outline-variant/10 rounded-[20px] flex flex-col justify-between group cursor-pointer hover:bg-slate-50/5 transition-colors';
        
        card.innerHTML = `
          <div class="space-y-4">
            <div class="aspect-[3/4] overflow-hidden rounded-[16px] shadow-sm relative">
              <img class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" src="${prod.image}" alt="${prod.name}"/>
            </div>
            <div class="space-y-2 px-1">
              <div class="flex justify-between items-baseline gap-2">
                <h4 class="font-display-md text-sm uppercase text-on-surface font-semibold leading-tight">${prod.name}</h4>
                <span class="font-label-caps text-xs text-espresso font-bold flex-none">₹${prod.price.toLocaleString()}</span>
              </div>
              <p class="font-body-md text-xs text-on-surface-variant line-clamp-3 leading-relaxed">${prod.description}</p>
            </div>
          </div>
        `;
        
        card.addEventListener('click', () => {
          window.location.href = `product.html?id=${prod.id}`;
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderFilteredProducts();
  };

  const showAllCategoriesView = () => {
    // URL cleanup without reload
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: cleanUrl }, '', cleanUrl);

    categoriesGridView.classList.remove('hidden');
    productDetailView.classList.add('hidden');
    activeCategory = "";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bind Grid Cards Click
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      showCategoryView(cat);
    });
  });

  // Bind Back Button
  backToCategoriesBtn.addEventListener('click', showAllCategoriesView);

  // Bind Selector dropdown
  categoryQuickSelect.addEventListener('change', (e) => {
    showCategoryView(e.target.value);
  });

  // Bind Gender filter clicks
  genderFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      genderFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeGender = btn.getAttribute('data-gender');
      renderFilteredProducts();
    });
  });

  // 4. INQUIRY MODAL FUNCTIONALITY
  const openInquiry = (pieceName) => {
    inquiryInterest.value = pieceName;
    inquiryForm.classList.remove('hidden');
    inquirySuccess.classList.add('hidden');
    inquiryModal.classList.remove('hidden');
    inquiryModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  };

  const closeInquiry = () => {
    inquiryModal.classList.add('hidden');
    inquiryModal.classList.remove('flex');
    document.body.style.overflow = '';
  };

  closeInquiryModal.addEventListener('click', closeInquiry);
  
  inquiryModal.addEventListener('click', (e) => {
    if (e.target === inquiryModal) closeInquiry();
  });

  inquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    inquiryForm.classList.add('hidden');
    inquirySuccess.classList.remove('hidden');
    setTimeout(() => {
      closeInquiry();
    }, 2500);
  });

  // 5. QUERY DEEP LINK CHECK
  const checkUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    
    // Map URL shorthand parameters
    const validCategories = [
      "neck chains fancy",
      "finger rings",
      "earrings",
      "bracelet unisex",
      "teeth braces fashion",
      "watches not luxury"
    ];

    if (catParam) {
      // Direct exact match
      if (validCategories.includes(catParam)) {
        showCategoryView(catParam);
        return;
      }
      
      // Shorthand mapping
      const shorthandMap = {
        "chains": "neck chains fancy",
        "rings": "finger rings",
        "earrings": "earrings",
        "bracelets": "bracelet unisex",
        "braces": "teeth braces fashion",
        "teeth": "teeth braces fashion",
        "watches": "watches not luxury"
      };

      const mappedCat = shorthandMap[catParam.toLowerCase()];
      if (mappedCat) {
        showCategoryView(mappedCat);
      }
    }
  };

  // Run initial triggers
  initTheme();
  checkUrlParams();
});
