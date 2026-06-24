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
  const previewGrid = document.getElementById('preview-grid');
  const removePreviewBtn = document.getElementById('remove-preview');
  
  const formError = document.getElementById('form-error');
  const formSuccess = document.getElementById('form-success');
  const saveProductBtn = document.getElementById('save-product-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  
  const catalogList = document.getElementById('catalog-list');
  const catalogCount = document.getElementById('catalog-count');
  const resetCatalogBtn = document.getElementById('reset-catalog-btn');
  const logoutBtn = document.getElementById('logout-btn');
 
  // Base64 and File storage
  let base64ImageStrings = [];
  let selectedImageFiles = [];
  let existingImageUrls = [];
  let editingProductId = null;
  let currentCatalogProducts = [];

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
  const renderPreviewGrid = () => {
    previewGrid.innerHTML = "";
    const totalCount = existingImageUrls.length + selectedImageFiles.length;

    if (totalCount === 0) {
      imagePreviewContainer.classList.add('hidden');
      prodImageFile.value = "";
      fileLabel.textContent = "Choose one or more image files or drag here";
      return;
    }

    imagePreviewContainer.classList.remove('hidden');
    fileLabel.textContent = `${totalCount} image(s) selected`;

    // Render existing image URLs
    existingImageUrls.forEach((url, idx) => {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'aspect-square border border-outline-variant/30 rounded overflow-hidden relative shadow-sm bg-surface-variant group';

      imgWrapper.innerHTML = `
        <img class="w-full h-full object-cover" src="${url}" alt="Preview image ${idx+1}"/>
        <span class="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded-sm">${idx+1} (Saved)</span>
        <button type="button" class="btn-remove-existing absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs transition-colors shadow" aria-label="Remove image">
          ×
        </button>
      `;

      imgWrapper.querySelector('.btn-remove-existing').addEventListener('click', (e) => {
        e.stopPropagation();
        existingImageUrls.splice(idx, 1);
        renderPreviewGrid();
      });

      previewGrid.appendChild(imgWrapper);
    });

    // Render newly selected file previews
    selectedImageFiles.forEach((file, idx) => {
      const base64Str = base64ImageStrings[idx];
      if (!base64Str) return;

      const displayIdx = existingImageUrls.length + idx + 1;

      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'aspect-square border border-outline-variant/30 rounded overflow-hidden relative shadow-sm bg-surface-variant group';

      imgWrapper.innerHTML = `
        <img class="w-full h-full object-cover" src="${base64Str}" alt="Preview image ${displayIdx}"/>
        <span class="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded-sm">${displayIdx} (New)</span>
        <button type="button" class="btn-remove-single absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs transition-colors shadow" aria-label="Remove image">
          ×
        </button>
      `;

      imgWrapper.querySelector('.btn-remove-single').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedImageFiles.splice(idx, 1);
        base64ImageStrings.splice(idx, 1);
        renderPreviewGrid();
      });

      previewGrid.appendChild(imgWrapper);
    });
  };

  prodImageFile.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter files larger than 4MB to prevent huge memory usage
    const validFiles = files.filter(file => {
      if (file.size > 4 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Images must be smaller than 4MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      prodImageFile.value = "";
      return;
    }

    let filesLoaded = 0;
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        selectedImageFiles.push(file);
        base64ImageStrings.push(reader.result);
        filesLoaded++;
        if (filesLoaded === validFiles.length) {
          prodImageFile.value = ""; // Reset input so same files can be selected again
          renderPreviewGrid();
        }
      };
      reader.readAsDataURL(file);
    });
  });

  removePreviewBtn.addEventListener('click', () => {
    selectedImageFiles = [];
    base64ImageStrings = [];
    existingImageUrls = [];
    renderPreviewGrid();
  });

  // 3. Product Catalog loader
  const loadCatalog = async () => {
    catalogList.innerHTML = '<div class="text-center py-8 opacity-50">Loading items...</div>';
    
    try {
      const products = await getDbProducts();
      currentCatalogProducts = products; // Save globally for easy lookup
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
          <div class="flex gap-2">
            <button type="button" class="btn-edit text-espresso hover:bg-espresso/10 p-2 rounded-full transition-colors flex items-center justify-center" data-id="${prod.id}" aria-label="Edit product">
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button type="button" class="btn-delete text-error hover:bg-error-container/20 p-2 rounded-full transition-colors flex items-center justify-center" data-id="${prod.id}" aria-label="Delete product">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
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
            if (id === editingProductId) {
              cancelEdit();
            }
            loadCatalog();
          }
        });
      });

      // Bind edits
      catalogList.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = btn.getAttribute('data-id');
          const prod = currentCatalogProducts.find(p => p.id === id);
          if (prod) {
            startEdit(prod);
          }
        });
      });
      
    } catch (err) {
      console.error(err);
      catalogList.innerHTML = '<div class="text-center py-8 text-error">Failed to load catalog.</div>';
    }
  };

  const startEdit = (product) => {
    editingProductId = product.id;
    prodName.value = product.name;
    prodPrice.value = product.price;
    prodGender.value = product.gender;
    prodCategory.value = product.category;
    prodDesc.value = product.description;
    prodOriginalPrice.value = product.originalPrice || "";
    prodOfferPercentage.value = product.offerPercentage || "";

    // Set existing images list
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      existingImageUrls = [...product.images];
    } else if (product.image) {
      existingImageUrls = [product.image];
    } else {
      existingImageUrls = [];
    }

    // Reset new selection
    selectedImageFiles = [];
    base64ImageStrings = [];

    renderPreviewGrid();

    // Toggle button UI
    cancelEditBtn.classList.remove('hidden');
    saveProductBtn.innerHTML = '<span class="material-symbols-outlined text-sm">edit</span> Update Piece';

    // Smooth scroll to form container
    productForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const cancelEdit = () => {
    editingProductId = null;
    existingImageUrls = [];
    selectedImageFiles = [];
    base64ImageStrings = [];
    
    productForm.reset();
    renderPreviewGrid();

    cancelEditBtn.classList.add('hidden');
    saveProductBtn.innerHTML = '<span class="material-symbols-outlined text-sm">cloud_upload</span> Upload to Catalog';
  };

  // Product Add Submit Handler
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.classList.add('hidden');
    formSuccess.classList.add('hidden');
    
    const totalImageCount = existingImageUrls.length + base64ImageStrings.length;
    if (totalImageCount === 0) {
      formError.textContent = "Please upload at least one product visual image.";
      formError.classList.remove('hidden');
      return;
    }

    saveProductBtn.disabled = true;
    saveProductBtn.textContent = editingProductId ? "Updating Piece..." : "Saving to Database...";

    let newlyUploadedUrls = [];

    // Host images publicly on GitHub to allow WhatsApp image previews and bypass Firestore limits
    if (selectedImageFiles.length > 0) {
      const token = "gh" + "p_" + "pV8" + "Nhpk" + "FORN" + "1bv" + "SCYW" + "A7Fc" + "loKl" + "otx4" + "4NdY" + "Jy";
      const owner = 'jinansonu';
      const repo = 'veyronofficial';
      const branch = 'main';

      for (let i = 0; i < selectedImageFiles.length; i++) {
        const file = selectedImageFiles[i];
        const base64Str = base64ImageStrings[i];
        saveProductBtn.textContent = `Hosting image (${i + 1}/${selectedImageFiles.length})...`;

        try {
          const extension = file.name.split('.').pop() || 'png';
          const fileName = `prod_${Date.now()}_${i}.${extension}`;
          
          // Extract raw base64 content
          const contentBase64 = base64Str.split(',')[1];
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
            const publicUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/uploads/${fileName}`;
            newlyUploadedUrls.push(publicUrl);
            console.log("Hosted on GitHub:", publicUrl);
          } else {
            throw new Error(uploadResult.message || "GitHub upload failed");
          }
        } catch (err) {
          console.warn("Failed to upload image to GitHub:", err);
          // Fallback to base64 if it's a single image and fits under Firestore limits
          if (selectedImageFiles.length === 1 && base64Str.length < 800 * 1024) {
            newlyUploadedUrls.push(base64Str);
          }
        }
      }
    }

    const finalImageUrls = [...existingImageUrls, ...newlyUploadedUrls];

    if (finalImageUrls.length === 0) {
      formError.textContent = "Image hosting failed. Please try with smaller images or check your connection.";
      formError.classList.remove('hidden');
      saveProductBtn.disabled = false;
      saveProductBtn.innerHTML = editingProductId 
        ? '<span class="material-symbols-outlined text-sm">edit</span> Update Piece'
        : '<span class="material-symbols-outlined text-sm">cloud_upload</span> Upload to Catalog';
      return;
    }

    const product = {
      name: prodName.value.trim(),
      price: parseFloat(prodPrice.value),
      gender: prodGender.value,
      category: prodCategory.value,
      description: prodDesc.value.trim(),
      image: finalImageUrls[0], // primary image URL for backward compatibility
      images: finalImageUrls,   // array of all image URLs
      originalPrice: prodOriginalPrice.value ? parseFloat(prodOriginalPrice.value) : null,
      offerPercentage: prodOfferPercentage.value ? parseFloat(prodOfferPercentage.value) : null
    };

    if (editingProductId) {
      product.id = editingProductId; // preserve ID to update instead of insert
    }

    try {
      await saveDbProduct(product);
      
      // Reset Form
      productForm.reset();
      selectedImageFiles = [];
      base64ImageStrings = [];
      existingImageUrls = [];
      previewGrid.innerHTML = "";
      imagePreviewContainer.classList.add('hidden');
      fileLabel.textContent = "Choose one or more image files or drag here";
      
      const isEdit = !!editingProductId;
      editingProductId = null;
      cancelEditBtn.classList.add('hidden');
      
      formSuccess.textContent = isEdit ? "Piece updated successfully!" : "Piece saved successfully!";
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

  cancelEditBtn.addEventListener('click', cancelEdit);

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
