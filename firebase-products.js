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


const PAGE_SIZE = 10;

let lastVisible = null;
let loadedProducts = [];

let loading = false;
let hasMore = true;

let activeColor = "all";


function normalizeProduct(snap) {

  const d = snap.data() || {};

  let powers = d.powers ?? null;

  if (typeof powers === "string") {
    powers = powers.trim()
      ? powers.split(",").map(x => x.trim()).filter(Boolean)
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


  const stockStatus =
    d.stockStatus === "preorder"
      ? "preorder"
      : d.stockStatus === "outofstock"
        ? "outofstock"
        : "instock";


  return {

    id: snap.id,
    firestoreId: snap.id,

    name: d.name || "Unnamed Product",
    nameMM: d.nameMM || "",

    price: Number(d.price || 0),

    category: d.category || "Contact Lenses",

    colorKey:
      d.colorKey ||
      d.colour ||
      d.color ||
      "clear",

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


function buildQuery() {

  const constraints = [];


  if (
    activeColor &&
    activeColor !== "all"
  ) {

    constraints.push(
      where(
        "colorKey",
        "==",
        activeColor
      )
    );
  }


  constraints.push(
    orderBy(
      "createdAt",
      "desc"
    )
  );


  if (lastVisible) {

    constraints.push(
      startAfter(
        lastVisible
      )
    );
  }


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

    const snapshot =
      await getDocs(
        buildQuery()
      );


    const docs =
      snapshot.docs;


    hasMore =
      docs.length > PAGE_SIZE;


    const pageDocs =
      docs.slice(
        0,
        PAGE_SIZE
      );


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


      newProducts.forEach(p => {

        if (
          !existingIds.has(
            String(p.id)
          )
        ) {

          loadedProducts.push(p);
        }
      });

    } else {

      hasMore = false;
    }


    console.log(
      "Active color:",
      activeColor
    );


    console.log(
      "Loaded:",
      loadedProducts.length
    );


    updateWebsite();

  }

  catch(error) {

    console.error(
      "Firestore color query failed:",
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


async function applyColor(color) {

  activeColor =
    color || "all";


  lastVisible = null;

  loadedProducts = [];

  hasMore = true;


  updateWebsite();


  await loadProducts();
}


window.loadMoreFirebaseProducts =
  function() {

    return loadProducts();
  };


window.setFirebaseProductFilters =
  function(filters = {}) {

    return applyColor(
      filters.color || "all"
    );
  };


window.resetFirebaseProductFilters =
  function() {

    return applyColor("all");
  };


loadProducts();
