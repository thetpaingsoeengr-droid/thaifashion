import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
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


/* =========================================
   SETTINGS
========================================= */

const PAGE_SIZE = 10;

let lastVisible = null;
let loadedProducts = [];

let hasMore = true;
let loading = false;


/* =========================================
   ACTIVE FIRESTORE FILTERS
========================================= */

let activeFilters = {
  category: "All",
  color: "all",
  stock: "all"
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


  if (
    Array.isArray(powers) &&
    powers.length === 0
  ) {
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

    name:
      d.name ||
      "Unnamed Product",

    nameMM:
      d.nameMM ||
      "",

    price:
      Number(d.price || 0),

    category:
      d.category ||
      "Contact Lenses",

    colorKey:
      d.colorKey ||
      d.colour ||
      d.color ||
      "clear",

    stockStatus,

    waitingPeriod:
      stockStatus === "preorder"
        ? (
            d.waitingPeriod ||
            "2 weeks"
          )
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

    type:
      d.type ||
      "",

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
   SEND DATA TO WEBSITE
========================================= */

function updateWebsite() {

  if (
    typeof window.setProductsFromFirebase ===
    "function"
  ) {

    window.setProductsFromFirebase(
      loadedProducts
    );
  }


  if (
    typeof window.setFirebaseHasMore ===
    "function"
  ) {

    window.setFirebaseHasMore(
      hasMore
    );
  }
}


/* =========================================
   BUILD FIRESTORE QUERY
========================================= */

function buildQuery() {

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


  /* STOCK */

  if (
    activeFilters.stock &&
    activeFilters.stock !== "all"
  ) {

    constraints.push(
      where(
        "stockStatus",
        "==",
        activeFilters.stock
      )
    );
  }


  /*
    Keep newest products first.
  */

  constraints.push(
    orderBy(
      "createdAt",
      "desc"
    )
  );


  /*
    Pagination cursor.
  */

  if (lastVisible) {

    constraints.push(
      startAfter(
        lastVisible
      )
    );
  }


  /*
    Fetch 11 so we can know whether
    another page exists.
  */

  constraints.push(
    limit(
      PAGE_SIZE + 1
    )
  );


  return query(
    collection(
      db,
      "products"
    ),
    ...constraints
  );
}


/* =========================================
   LOAD PAGE
========================================= */

async function loadProducts() {

  if (
    loading ||
    !hasMore
  ) {
    return;
  }


  loading = true;


  if (
    typeof window.setFirebaseLoading ===
    "function"
  ) {

    window.setFirebaseLoading(
      true
    );
  }


  try {

    const q =
      buildQuery();


    const snapshot =
      await getDocs(q);


    const docs =
      snapshot.docs;


    hasMore =
      docs.length >
      PAGE_SIZE;


    const pageDocs =
      docs.slice(
        0,
        PAGE_SIZE
      );


    if (
      pageDocs.length > 0
    ) {

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
            product =>
              String(product.id)
          )
        );


      newProducts.forEach(
        product => {

          if (
            !existingIds.has(
              String(product.id)
            )
          ) {

            loadedProducts.push(
              product
            );
          }

        }
      );

    } else {

      hasMore = false;
    }


    console.log(
      "Firestore filters:",
      activeFilters
    );


    console.log(
      "Products loaded:",
      loadedProducts.length
    );


    updateWebsite();

  }

  catch (error) {

    console.error(
      "Firestore query failed:",
      error
    );


    /*
      Very important:
      Firestore may require a
      composite index when several
      filters are combined.

      Check browser console for the
      Firebase index creation link.
    */

  }

  finally {

    loading = false;


    if (
      typeof window.setFirebaseLoading ===
      "function"
    ) {

      window.setFirebaseLoading(
        false
      );
    }
  }
}


/* =========================================
   RESET + APPLY FILTERS
========================================= */

async function applyFilters(filters = {}) {

  activeFilters = {

    category:
      filters.category ??
      activeFilters.category,

    color:
      filters.color ??
      activeFilters.color,

    stock:
      filters.stock ??
      activeFilters.stock

  };


  /*
    Reset pagination because this is
    a completely new Firestore query.
  */

  lastVisible = null;

  loadedProducts = [];

  hasMore = true;


  /*
    Immediately clear old products
    from the screen.
  */

  updateWebsite();


  /*
    Fetch first 10 matching products.
  */

  await loadProducts();
}


/* =========================================
   PUBLIC BRIDGE FOR SCRIPT.JS
========================================= */


/*
  Load next 10 matching products.
*/

window.loadMoreFirebaseProducts =
  function() {

    return loadProducts();
  };


/*
  Change server-side filters.

  Example:

  window.setFirebaseProductFilters({
    category: "Contact Lenses",
    color: "gray",
    stock: "instock"
  });
*/

window.setFirebaseProductFilters =
  function(filters) {

    return applyFilters(
      filters || {}
    );
  };


/*
  Optional reset helper.
*/

window.resetFirebaseProductFilters =
  function() {

    return applyFilters({

      category: "All",

      color: "all",

      stock: "all"

    });
  };


/* =========================================
   INITIAL LOAD
========================================= */

loadProducts();
