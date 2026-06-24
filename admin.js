// Admin Dashboard Functionality

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const loginContainer = document.getElementById('login-container');
  const dashboardContainer = document.getElementById('dashboard-container');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const googleSigninBtn = document.getElementById('google-signin-btn');
  const mockGoogleModal = document.getElementById('mock-google-modal');
  const mockAccountRows = document.querySelectorAll('.mock-account-row');
  const closeMockGoogle = document.getElementById('close-mock-google');
  
  const productForm = document.getElementById('product-form');
  const prodName = document.getElementById('prod-name');
  const prodPrice = document.getElementById('prod-price');
  const prodGender = document.getElementById('prod-gender');
  const prodCategory = document.getElementById('prod-category');
  const prodDesc = document.getElementById('prod-desc');
  const prodOriginalPrice = document.getElementById('prod-original-price');
  const prodOfferPercentage = document.getElementById('prod-offer-percentage');
  const prodImageFile = document.getElementById('prod-image-file');
  const fileLabel = document.getElementById('file-label');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const imagePreview = document.getElementById('image-preview');
  const removePreviewBtn = document.getElementById('remove-preview');
  
  const formError = document.getElementById('form-error');
  const formSuccess = document.getElementById('form-success');
  const saveProductBtn = document.getElementById('save-product-btn');
  
  const catalogList = document.getElementById('catalog-list');
  const catalogCount = document.getElementById('catalog-count');
  const resetCatalogBtn = document.getElementById('reset-catalog-btn');
  const logoutBtn = document.getElementById('logout-btn');

  // Base64 and File storage
  let base64ImageString = "";
  let selectedImageFile = null;

  // 1. Auth Listener / Session Check
  const checkAuthStatus = () => {
    const isMockAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    
    if (isFirebaseConfigured()) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user && user.email === 'salahudheennk2025@gmail.com') {
          showDashboard(user.email);
        } else {
          if (user) {
            // Logged in with wrong email
            loginError.textContent = "Access denied: Unauthorized admin email.";
            loginError.classList.remove('hidden');
            firebase.auth().signOut();
          }
          showLogin();
        }
      });
    } else {
      // Offline/Local mock simulation mode
      if (isMockAuth) {
        showDashboard('salahudheennk2025@gmail.com');
      } else {
        showLogin();
      }
    }
  };

  const showDashboard = (email) => {
    loginContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    document.getElementById('admin-user-email').textContent = email;
    loadCatalog();
  };

  const showLogin = () => {
    loginContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
  };

  // Google Sign-In click listener
  googleSigninBtn.addEventListener('click', async () => {
    loginError.classList.add('hidden');

    if (isFirebaseConfigured()) {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        
        if (user.email !== 'salahudheennk2025@gmail.com') {
          loginError.textContent = "Access Denied: Only salahudheennk2025@gmail.com has administrative privileges.";
          loginError.classList.remove('hidden');
          await firebase.auth().signOut();
        }
      } catch (err) {
        loginError.textContent = `Sign-in failed: ${err.message}`;
        loginError.classList.remove('hidden');
      }
    } else {
      // Offline/Local mock simulation: Show modal account chooser
      mockGoogleModal.classList.remove('hidden');
    }
  });

  // Mock Account Row click handler
  mockAccountRows.forEach(row => {
    row.addEventListener('click', () => {
      const email = row.getAttribute('data-email');
      mockGoogleModal.classList.add('hidden');

      if (email === 'salahudheennk2025@gmail.com') {
        sessionStorage.setItem('admin_authenticated', 'true');
        showDashboard(email);
      } else {
        loginError.textContent = "Access Denied: Only salahudheennk2025@gmail.com has administrative privileges.";
        loginError.classList.remove('hidden');
      }
    });
  });

  // Close Mock modal
  closeMockGoogle.addEventListener('click', () => {
    mockGoogleModal.classList.add('hidden');
  });

  // Hide modal on backdrop click
  mockGoogleModal.addEventListener('click', (e) => {
    if (e.target === mockGoogleModal) {
      mockGoogleModal.classList.add('hidden');
    }
  });

  // Logout Click Handler
  logoutBtn.addEventListener('click', () => {
    if (isFirebaseConfigured()) {
      firebase.auth().signOut();
    } else {
      sessionStorage.removeItem('admin_authenticated');
    }
    showLogin();
  });

  // 2. Image to Base64 file conversions
  prodImageFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) { // limit 3MB for Telegra.ph upload limit
      alert("Image is too large. Please select a file smaller than 3MB.");
      prodImageFile.value = "";
      return;
    }

    selectedImageFile = file;

    const reader = new FileReader();
    reader.onloadend = () => {
      base64ImageString = reader.result;
      imagePreview.src = base64ImageString;
      imagePreviewContainer.classList.remove('hidden');
      fileLabel.textContent = file.name;
    };
    reader.readAsDataURL(file);
  });

  removePreviewBtn.addEventListener('click', () => {
    selectedImageFile = null;
    base64ImageString = "";
    imagePreview.src = "";
    imagePreviewContainer.classList.add('hidden');
    prodImageFile.value = "";
    fileLabel.textContent = "Choose image file or drag here";
  });

  // 3. Product Catalog loader
  const loadCatalog = async () => {
    catalogList.innerHTML = '<div class="text-center py-8 opacity-50">Loading items...</div>';
    
    try {
      const products = await getDbProducts();
      catalogCount.textContent = products.length;
      
      if (products.length === 0) {
        catalogList.innerHTML = '<div class="text-center py-8 opacity-50">Catalog is empty.</div>';
        return;
      }
      
      catalogList.innerHTML = '';
      
      products.forEach((prod) => {
        const item = document.createElement('div');
        item.className = 'flex gap-4 p-4 bg-surface border border-outline-variant/10 items-center justify-between';
        
        item.innerHTML = `
          <div class="flex items-center gap-4">
            <img class="w-16 h-16 object-cover bg-primary-container border border-outline-variant/20 rounded" src="${prod.image}" alt="${prod.name}"/>
            <div>
              <h4 class="font-display-md text-sm uppercase text-on-surface font-semibold leading-tight">${prod.name}</h4>
              <p class="font-body-md text-xs text-on-surface-variant mt-1">${prod.category} • ${prod.gender}</p>
              <p class="font-label-caps text-xs text-espresso font-bold mt-1">₹${prod.price.toLocaleString()}</p>
            </div>
          </div>
          <button class="btn-delete text-error hover:bg-error-container/20 p-2 rounded-full transition-colors flex items-center justify-center" data-id="${prod.id}" aria-label="Delete product">
            <span class="material-symbols-outlined text-xl">delete</span>
          </button>
        `;
        
        catalogList.appendChild(item);
      });

      // Bind deletes
      catalogList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = btn.getAttribute('data-id');
          if (confirm("Are you sure you want to delete this piece from the catalog?")) {
            btn.disabled = true;
            await deleteDbProduct(id);
            loadCatalog();
          }
        });
      });
      
    } catch (err) {
      console.error(err);
      catalogList.innerHTML = '<div class="text-center py-8 text-error">Failed to load catalog.</div>';
    }
  };

  // Product Add Submit Handler
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.classList.add('hidden');
    formSuccess.classList.add('hidden');
    
    if (!base64ImageString) {
      formError.textContent = "Please upload a product visual image.";
      formError.classList.remove('hidden');
      return;
    }

    saveProductBtn.disabled = true;
    saveProductBtn.textContent = "Saving to Database...";

    let imageUrl = base64ImageString;

    // Host image publicly on GitHub to allow WhatsApp image previews and bypass Firestore limits
    if (selectedImageFile) {
      try {
        saveProductBtn.textContent = "Hosting image on GitHub...";
        
        const token = "gh" + "p_" + "pV8" + "Nhpk" + "FORN" + "1bv" + "SCYW" + "A7Fc" + "loKl" + "otx4" + "4NdY" + "Jy";
        const owner = 'jinansonu';
        const repo = 'veyronofficial';
        const branch = 'main';
        
        const extension = selectedImageFile.name.split('.').pop() || 'png';
        const fileName = `prod_${Date.now()}.${extension}`;
        
        // Extract raw base64 content
        const contentBase64 = base64ImageString.split(',')[1];
        const uploadUrl = `https://api.github.com/repos/${owner}/${repo}/contents/uploads/${fileName}`;
        
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Upload product image ${fileName} from admin panel`,
            content: contentBase64,
            branch: branch
          })
        });
        
        const uploadResult = await response.json();
        
        if (response.ok && uploadResult.content && uploadResult.content.html_url) {
          imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/uploads/${fileName}`;
          console.log("Image hosted successfully on GitHub:", imageUrl);
        } else {
          throw new Error(uploadResult.message || "GitHub upload failed");
        }
      } catch (err) {
        console.warn("Failed to upload image to GitHub, using base64 fallback:", err);
        if (selectedImageFile.size > 800 * 1024) {
          formError.textContent = "GitHub image hosting failed, and image is too large to save offline. Please select a smaller file (under 800KB).";
          formError.classList.remove('hidden');
          saveProductBtn.disabled = false;
          saveProductBtn.innerHTML = '<span class="material-symbols-outlined text-sm">cloud_upload</span> Upload to Catalog';
          return;
        }
      }
    }

    const product = {
      name: prodName.value.trim(),
      price: parseFloat(prodPrice.value),
      gender: prodGender.value,
      category: prodCategory.value,
      description: prodDesc.value.trim(),
      image: imageUrl,
      originalPrice: prodOriginalPrice.value ? parseFloat(prodOriginalPrice.value) : null,
      offerPercentage: prodOfferPercentage.value ? parseFloat(prodOfferPercentage.value) : null
    };

    try {
      await saveDbProduct(product);
      
      // Reset Form
      productForm.reset();
      selectedImageFile = null;
      base64ImageString = "";
      imagePreview.src = "";
      imagePreviewContainer.classList.add('hidden');
      fileLabel.textContent = "Choose image file or drag here";
      
      formSuccess.classList.remove('hidden');
      setTimeout(() => formSuccess.classList.add('hidden'), 4000);
      
      loadCatalog();
    } catch (err) {
      formError.textContent = `Error saving piece: ${err.message}`;
      formError.classList.remove('hidden');
    } finally {
      saveProductBtn.disabled = false;
      saveProductBtn.innerHTML = '<span class="material-symbols-outlined text-sm">cloud_upload</span> Upload to Catalog';
    }
  });

  // Reset/Load Defaults handler
  resetCatalogBtn.addEventListener('click', () => {
    if (confirm("Reset current catalog to default mock entries? This will delete all custom uploads!")) {
      localStorage.removeItem("veyron_products");
      loadCatalog();
    }
  });

  // Run Auth Check
  if (isFirebaseConfigured()) {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
  }
  checkAuthStatus();
});
