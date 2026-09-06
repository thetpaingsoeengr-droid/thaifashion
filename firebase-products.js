import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getFirestore,
  collection,
  query,
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
   PAGINATION SETTINGS
========================================= */

const PAGE_SIZE = 10;

let lastVisible = null;
let allLoadedProducts = [];
let loading = false;
let hasMore = true;


/* =========================================
   NORMALIZE FIREBASE PRODUCT
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


  const stockStatus =
    d.stockStatus === "preorder"
      ? "preorder"
      : d.stockStatus === "outofstock"
        ? "outofstock"
        : "instock";


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
   UPDATE WEBSITE
========================================= */

function updateWebsite() {

  if (
    typeof window.setProductsFromFirebase ===
    "function"
  ) {

    window.setProductsFromFirebase(
      allLoadedProducts
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
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

  if (loading || !hasMore) {
    return;
  }


  loading = true;


  if (
    typeof window.setFirebaseLoading ===
    "function"
  ) {

    window.setFirebaseLoading(true);
  }


  try {

    /*
      We fetch PAGE_SIZE + 1.

      Example:
      Need to display 10 products.
      Firebase fetches maximum 11.

      If product #11 exists,
      we know there is another page.
    */

    let q;


    if (lastVisible) {

      q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(PAGE_SIZE + 1)
      );

    } else {

      q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE + 1)
      );

    }


    const snapshot =
      await getDocs(q);


    const docs =
      snapshot.docs;


    /*
      More than 10 means another
      page exists.
    */

    hasMore =
      docs.length > PAGE_SIZE;


    /*
      Only display first 10.
    */

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


      /*
        Prevent duplicate products
        just in case.
      */

      const existingIds =
        new Set(
          allLoadedProducts.map(
            p => String(p.id)
          )
        );


      newProducts.forEach(p => {

        if (
          !existingIds.has(
            String(p.id)
          )
        ) {

          allLoadedProducts.push(p);
        }

      });

    } else {

      hasMore = false;
    }


    console.log(
      "Loaded products:",
      allLoadedProducts.length
    );


    updateWebsite();

  }

  catch(error) {

    console.error(
      "Could not load Firestore products:",
      error
    );

  }

  finally {

    loading = false;


    if (
      typeof window.setFirebaseLoading ===
      "function"
    ) {

      window.setFirebaseLoading(false);
    }

  }
}


/* =========================================
   LOAD MORE BRIDGE
========================================= */

window.loadMoreFirebaseProducts =
  function() {

    loadProducts();

  };


/* =========================================
   INITIAL LOAD
========================================= */

loadProducts();
