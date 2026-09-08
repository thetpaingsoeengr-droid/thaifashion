import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getFirestore,
  collection,
  query,
  where,
  limit,
  startAfter,
  getDocs,
  getCountFromServer
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
   PAGINATION
========================================= */

const PAGE_SIZE = 10;

let lastVisible = null;
let loadedProducts = [];

let loading = false;
let hasMore = true;


/* =========================================
   DEFAULT FILTER
   Website opens on Contact Lenses.
========================================= */

let activeFilters = {
  category: "Contact Lenses",
  color: "all"
};


/* =========================================
   NORMALIZE PRODUCT
========================================= */

function normalizeProduct(snap){

  const d =
    snap.data() || {};

  let powers =
    d.powers ?? null;


  if(typeof powers === "string"){
    powers =
      powers.trim()
        ? powers
            .split(",")
            .map(x=>x.trim())
            .filter(Boolean)
        : null;
  }


  if(
    Array.isArray(powers) &&
    powers.length === 0
  ){
    powers = null;
  }


  if(d.hasPower === false){
    powers = null;
  }


  const rawImage =
    String(
      d.imageUrl ||
      d.imageURL ||
      d.image ||
      ""
    )
      .trim()
      .replace(/^\/+/, "");


  const image =
    rawImage
      .replace(/\.JPG$/i, ".jpg")
      .replace(/\.JPEG$/i, ".jpeg")
      .replace(/\.PNG$/i, ".png");


  let stockStatus =
    "instock";


  if(
    d.stockStatus ===
    "preorder"
  ){
    stockStatus =
      "preorder";
  }


  if(
    d.stockStatus ===
    "outofstock"
  ){
    stockStatus =
      "outofstock";
  }


  return {

    id:
      snap.id,

    firestoreId:
      snap.id,

    name:
      d.name ||
      "Unnamed Product",

    nameMM:
      d.nameMM ||
      "",

    price:
      Number(
        d.price || 0
      ),

    category:
      d.category ||
      "Contact Lenses",

    colorKey:
      String(
        d.colorKey ||
        d.colour ||
        d.color ||
        "clear"
      )
        .trim()
        .toLowerCase(),

    stockStatus,

    waitingPeriod:
      stockStatus ===
      "preorder"
        ? (
            d.waitingPeriod ||
            "2 weeks"
          )
        : "",

    /*
      badge remains in Firestore/Admin
      for future use, but the customer
      product card no longer renders it.
    */
    badge:
      d.badge || "",

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

function updateWebsite(){

  if(
    typeof window.setProductsFromFirebase ===
    "function"
  ){
    window.setProductsFromFirebase(
      loadedProducts
    );
  }


  if(
    typeof window.setFirebaseHasMore ===
    "function"
  ){
    window.setFirebaseHasMore(
      hasMore
    );
  }
}


/* =========================================
   FIRESTORE QUERY
   CATEGORY IS ALWAYS SELECTED.
   COLOR IS OPTIONAL FOR CONTACT LENSES.
========================================= */

function buildCountQuery(){
  const productsRef = collection(db, "products");
  const constraints = [];

  constraints.push(
    where("category", "==", activeFilters.category)
  );

  if(
    activeFilters.category === "Contact Lenses" &&
    activeFilters.color !== "all"
  ){
    constraints.push(
      where("colorKey", "==", activeFilters.color)
    );
  }

  return query(productsRef, ...constraints);
}

async function updateTotalCount(){
  try{
    const countSnap = await getCountFromServer(
      buildCountQuery()
    );

    const total = Number(countSnap.data().count || 0);

    if(typeof window.setFirebaseTotalCount === "function"){
      window.setFirebaseTotalCount(total);
    }
  }catch(error){
    console.error("Could not count Firestore products:", error);
    if(typeof window.setFirebaseTotalCount === "function"){
      window.setFirebaseTotalCount(0);
    }
  }
}

function buildQuery(){

  const productsRef =
    collection(
      db,
      "products"
    );


  const constraints = [];


  /*
    CATEGORY
  */
  constraints.push(
    where(
      "category",
      "==",
      activeFilters.category
    )
  );


  /*
    COLOR
    Only used for Contact Lenses.
  */
  if(
    activeFilters.category === "Contact Lenses" &&
    activeFilters.color !== "all"
  ){
    constraints.push(
      where(
        "colorKey",
        "==",
        activeFilters.color
      )
    );
  }


  /*
    PAGINATION
  */
  if(lastVisible){
    constraints.push(
      startAfter(
        lastVisible
      )
    );
  }


  /*
    Fetch 11:
    show 10,
    use #11 only to know if more exists.
  */
  constraints.push(
    limit(
      PAGE_SIZE + 1
    )
  );


  return query(
    productsRef,
    ...constraints
  );
}


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts(){

  if(
    loading ||
    !hasMore
  ){
    return;
  }


  loading = true;


  if(
    typeof window.setFirebaseLoading ===
    "function"
  ){
    window.setFirebaseLoading(
      true
    );
  }


  try{

    const snapshot =
      await getDocs(
        buildQuery()
      );


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


    if(
      pageDocs.length > 0
    ){

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
              String(
                product.id
              )
          )
        );


      newProducts.forEach(
        product => {

          if(
            !existingIds.has(
              String(
                product.id
              )
            )
          ){
            loadedProducts.push(
              product
            );
          }

        }
      );

    }else{

      hasMore =
        false;
    }


    updateWebsite();

  }catch(error){

    console.error(
      "Firestore category/color query failed:",
      error
    );


    /*
      Do not bring back old/unfiltered data
      if a query fails.
    */
    hasMore =
      false;

    updateWebsite();

  }finally{

    loading =
      false;


    if(
      typeof window.setFirebaseLoading ===
      "function"
    ){
      window.setFirebaseLoading(
        false
      );
    }
  }
}


/* =========================================
   APPLY CATEGORY + COLOR
========================================= */

async function applyFilters(
  filters = {}
){

  const nextCategory =
    filters.category ||
    activeFilters.category ||
    "Contact Lenses";


  const nextColor =
    nextCategory ===
    "Contact Lenses"
      ? (
          filters.color ??
          activeFilters.color ??
          "all"
        )
      : "all";


  activeFilters = {
    category:
      nextCategory,

    color:
      nextColor
  };


  /*
    New query:
    reset 10-product pagination.
  */
  lastVisible =
    null;

  loadedProducts =
    [];

  hasMore =
    true;


  updateWebsite();

  await updateTotalCount();

  await loadProducts();
}


/* =========================================
   PUBLIC BRIDGE
========================================= */

window.setFirebaseProductFilters =
  function(filters = {}){

    return applyFilters({
      category:
        filters.category ||
        activeFilters.category,

      color:
        filters.color ??
        activeFilters.color
    });
  };


window.loadMoreFirebaseProducts =
  function(){

    return loadProducts();
  };


window.resetFirebaseProductFilters =
  function(){

    return applyFilters({
      category:
        "Contact Lenses",

      color:
        "all"
    });
  };


/* =========================================
   INITIAL LOAD
========================================= */

updateTotalCount();
loadProducts();
