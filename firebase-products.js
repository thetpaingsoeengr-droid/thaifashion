import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getFirestore,
  collection,
  query,
  where,
  limit,
  startAfter,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzEoJkHMqML0nWw9GPkCVKQt8cFnaNjYo",
  authDomain: "lens-a7abf.firebaseapp.com",
  projectId: "lens-a7abf",
  storageBucket: "lens-a7abf.firebasestorage.app",
  messagingSenderId: "846421812805",
  appId: "1:846421812805:web:f0865b246f8deff847a52c",
  measurementId: "G-0SQVVLZCEJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PAGE_SIZE = 10;

let lastVisible = null;
let loadedProducts = [];
let loading = false;
let hasMore = true;

let activeFilters = {
  category: "All",
  color: "all"
};


/* =========================================
   NORMALIZE PRODUCT
========================================= */

function normalizeProduct(snap) {

  const d = snap.data() || {};

  let powers = d.powers ?? null;

  if (typeof powers === "string") {
    powers = powers.trim()
      ? powers
          .split(",")
          .map(x => x.trim())
          .filter(Boolean)
      : null;
  }

  if (Array.isArray(powers) && powers.length === 0) {
    powers = null;
  }

  if (d.hasPower === false) {
    powers = null;
  }

  const rawImage = String(
    d.imageUrl ||
    d.imageURL ||
    d.image ||
    ""
  )
    .trim()
    .replace(/^\/+/, "");

  const image = rawImage
    .replace(/\.JPG$/i, ".jpg")
    .replace(/\.JPEG$/i, ".jpeg")
    .replace(/\.PNG$/i, ".png");

  let stockStatus = "instock";

  if (d.stockStatus === "preorder") {
    stockStatus = "preorder";
  }

  if (d.stockStatus === "outofstock") {
    stockStatus = "outofstock";
  }

  return {

    id: snap.id,
    firestoreId: snap.id,

    name: d.name || "Unnamed Product",
    nameMM: d.nameMM || "",

    price: Number(d.price || 0),

    category:
      d.category ||
      "Contact Lenses",

    colorKey: String(
      d.colorKey ||
      d.colour ||
      d.color ||
      "clear"
    )
      .trim()
      .toLowerCase(),

    stockStatus,

    waitingPeriod:
      stockStatus === "preorder"
        ? (d.waitingPeriod || "2 weeks")
        : "",

    badge:
      d.badge ||
      (
        stockStatus === "preorder"
          ? "Pre-order"
          : stockStatus === "outofstock"
            ? "Out of Stock"
            : "In Stock"
      ),

    color:
      d.displayColor ||
      d.colorHex ||
      "#a8adb2",

    type: d.type || "",

    image,

    desc:
      d.description ||
      d.desc ||
      "",

    descMM:
      d.descriptionMM ||
      d.descMM ||
      "",

    powers
  };
}


/* =========================================
   UPDATE WEBSITE
========================================= */

function updateWebsite() {

  if (
    typeof window.setProductsFromFirebase === "function"
  ) {
    window.setProductsFromFirebase(
      loadedProducts
    );
  }

  if (
    typeof window.setFirebaseHasMore === "function"
  ) {
    window.setFirebaseHasMore(
      hasMore
    );
  }
}


/* =========================================
   BUILD QUERY
========================================= */

function buildQuery() {

  const productsRef =
    collection(db, "products");

  const constraints = [];


  /* CATEGORY */

  if (
    activeFilters.category &&
    activeFilters.category !== "All"
  ) {
    constraints.push(
      where(
        "category",
        "==",
        activeFilters.category
      )
    );
  }


  /* COLOR */

  if (
    activeFilters.color &&
    activeFilters.color !== "all"
  ) {
    constraints.push(
      where(
        "colorKey",
        "==",
        activeFilters.color
      )
    );
  }


  /* PAGINATION */

  if (lastVisible) {
    constraints.push(
      startAfter(lastVisible)
    );
  }


  constraints.push(
    limit(PAGE_SIZE + 1)
  );


  return query(
    productsRef,
    ...constraints
  );
}


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

  if (loading || !hasMore) {
    return;
  }

  loading = true;

  if (
    typeof window.setFirebaseLoading === "function"
  ) {
    window.setFirebaseLoading(true);
  }


  try {

    const snapshot =
      await getDocs(
        buildQuery()
      );

    const docs =
      snapshot.docs;

    hasMore =
      docs.length > PAGE_SIZE;

    const pageDocs =
      docs.slice(0, PAGE_SIZE);


    if (pageDocs.length > 0) {

      lastVisible =
        pageDocs[
          pageDocs.length - 1
        ];

      const newProducts =
        pageDocs.map(
          normalizeProduct
        );

      const existingIds =
        new Set(
          loadedProducts.map(
            p => String(p.id)
          )
        );

      newProducts.forEach(product => {

        if (
          !existingIds.has(
            String(product.id)
          )
        ) {
          loadedProducts.push(product);
        }

      });

    } else {

      hasMore = false;
    }


    console.log(
      "Active filters:",
      activeFilters
    );

    console.log(
      "Products loaded:",
      loadedProducts.length
    );

    updateWebsite();

  } catch(error) {

    console.error(
      "Firestore filter query failed:",
      error
    );

    /*
      Important:
      Don't destroy already-loaded
      products if a query fails.
    */

    hasMore = false;
    updateWebsite();

  } finally {

    loading = false;

    if (
      typeof window.setFirebaseLoading === "function"
    ) {
      window.setFirebaseLoading(false);
    }
  }
}


/* =========================================
   APPLY FILTERS
========================================= */

async function applyFilters(filters = {}) {

  activeFilters = {

    category:
      filters.category ??
      activeFilters.category,

    color:
      filters.color ??
      activeFilters.color

  };


  lastVisible = null;
  loadedProducts = [];
  hasMore = true;

  updateWebsite();

  await loadProducts();
}


/* =========================================
   SCRIPT.JS BRIDGE
========================================= */

window.setFirebaseProductFilters =
  function(filters = {}) {

    return applyFilters({

      category:
        filters.category ??
        activeFilters.category,

      color:
        filters.color ??
        activeFilters.color

    });
  };


/* =========================================
   LOAD MORE
========================================= */

window.loadMoreFirebaseProducts =
  function() {

    return loadProducts();
  };


/* =========================================
   RESET
========================================= */

window.resetFirebaseProductFilters =
  function() {

    return applyFilters({
      category: "All",
      color: "all"
    });
  };


/* =========================================
   INITIAL LOAD
========================================= */

loadProducts();
