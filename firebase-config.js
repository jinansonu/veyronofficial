// Firebase Configuration and Database Fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return firebaseConfig.projectId && 
         !firebaseConfig.projectId.includes("PLACEHOLDER") && 
         !firebaseConfig.projectId.includes("YOUR_FIREBASE");
};

// Global helper to load products from Firebase or LocalStorage fallback
const getDbProducts = async () => {
  if (isFirebaseConfigured()) {
    try {
      const db = firebase.firestore();
      const snapshot = await db.collection("products").get();
      const products = [];
      snapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
      });
      return products;
    } catch (e) {
      console.warn("Firebase failed to load, falling back to LocalStorage:", e);
    }
  }

  // Fallback 1: Local Storage (admin changes will persist locally)
  const localProducts = localStorage.getItem("veyron_products");
  if (localProducts) {
    try {
      return JSON.parse(localProducts);
    } catch (e) {
      console.error("Error parsing LocalStorage products:", e);
    }
  }

  // Fallback 2: Curated starter assets (mapped to available visual assets)
  const defaultProducts = [
    {
      id: "mock-1",
      name: "Fancy Cuban Link Chain",
      price: 1200,
      category: "neck chains fancy",
      gender: "all",
      description: "A fancy double-lock Cuban link chain crafted in premium silver, hand-assembled.",
      image: "assets/silver_chain.png"
    },
    {
      id: "mock-2",
      name: "Champagne Stack Rings",
      price: 850,
      category: "finger rings",
      gender: "female",
      description: "Fine yellow gold band set, featuring a micro-pavé finish and tactile ribbed details.",
      image: "assets/gold_rings.png"
    },
    {
      id: "mock-3",
      name: "Talon Hoop Earrings",
      price: 650,
      category: "earrings",
      gender: "all",
      description: "Minimalist hoops with a sharp aesthetic twist. Sold as a pair.",
      image: "assets/earrings.png"
    },
    {
      id: "mock-4",
      name: "Helix Unisex Cuff",
      price: 900,
      category: "bracelet unisex",
      gender: "all",
      description: "Forged steel wire cuff bracelet. Flexible, modern, and built for everyone.",
      image: "assets/continuous_bracelet.png"
    },
    {
      id: "mock-5",
      name: "Signature Teeth Grill",
      price: 1800,
      category: "teeth braces fashion",
      gender: "all",
      description: "Custom gold fashion grill, designed to clip securely onto teeth for editorial styling.",
      image: "assets/teeth_clips.png"
    },
    {
      id: "mock-6",
      name: "Horizon Steel Chrono",
      price: 450,
      category: "watches not luxury",
      gender: "male",
      description: "A durable steel watch featuring a green dial, automatic calendar movements.",
      image: "assets/luxury_watch.png"
    }
  ];

  localStorage.setItem("veyron_products", JSON.stringify(defaultProducts));
  return defaultProducts;
};

// Global helper to save products (adds to Firestore if active, and always LocalStorage)
const saveDbProduct = async (product) => {
  let savedId = product.id || "prod_" + Date.now();
  const productData = { ...product, id: savedId };

  if (isFirebaseConfigured()) {
    try {
      const db = firebase.firestore();
      await db.collection("products").doc(savedId).set(productData);
    } catch (e) {
      console.warn("Firebase failed to save, writing to LocalStorage only:", e);
    }
  }

  // Update Local Storage
  const current = await getDbProducts();
  const index = current.findIndex(p => p.id === savedId);
  if (index >= 0) {
    current[index] = productData;
  } else {
    current.push(productData);
  }
  localStorage.setItem("veyron_products", JSON.stringify(current));
  return savedId;
};

// Global helper to delete products
const deleteDbProduct = async (productId) => {
  if (isFirebaseConfigured()) {
    try {
      const db = firebase.firestore();
      await db.collection("products").doc(productId).delete();
    } catch (e) {
      console.warn("Firebase failed to delete, deleting from LocalStorage only:", e);
    }
  }

  // Update Local Storage
  const current = await getDbProducts();
  const filtered = current.filter(p => p.id !== productId);
  localStorage.setItem("veyron_products", JSON.stringify(filtered));
  return true;
};
