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
   SETTINGS
========================================= */

const PAGE_SIZE = 10;

/*
  Filter cache:
  If the customer switches back to a category/color
  already opened during this page visit, show it
  immediately without another Firestore read.

  Cache expires after 10 minutes.
*/
const CACHE_TTL_MS = 10 * 60 * 1000;

const filterCache = new Map();


let lastVisible = null;
let loadedProducts = [];

let loading = false;
let hasMore = true;


/* =========================================
   DEFAULT FILTER
========================================= */

let activeFilters = {
  category: "Contact Lenses",
  color: "all",
  power: ""
};


/* =========================================
   CACHE HELPERS
========================================= */

function getCacheKey(filters = activeFilters){

  return [
    filters.category || "Contact Lenses",
    filters.color || "all",
    filters.power || ""
  ].join("::");
}


function readFilterCache(){

  const key =
    getCacheKey();

  const cached =
    filterCache.get(key);

  if(!cached){
    return null;
  }


  if(
    Date.now() - cached.savedAt >
    CACHE_TTL_MS
  ){
    filterCache.delete(key);
    return null;
  }


  return cached;
}


function saveFilterCache(totalCount){

  const key =
    getCacheKey();

  filterCache.set(
    key,
    {
      savedAt:
        Date.now(),

      products:
        loadedProducts.map(
          product => ({
            ...product
          })
        ),

      hasMore,

      /*
        DocumentSnapshot stays in memory,
        allowing Load More to continue
        immediately from the cached page.
      */
      lastVisible,

      totalCount:
        Number(totalCount || 0)
    }
  );
}


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
            .map(x => x.trim())
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

  const images =
    Array.isArray(d.images)
      ? d.images.map(x=>String(x||"").trim()).filter(Boolean).slice(0,2)
      : [];

  if(!images.length && image){
    images.push(image);
  }


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

    brand:
      d.brand ||
      "",

    size:
      d.size ||
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
      stockStatus === "preorder"
        ? (
            d.waitingPeriod ||
            "2 weeks"
          )
        : "",

    badge:
      d.badge || "",

    color:
      d.displayColor ||
      d.colorHex ||
      "#a8adb2",

    type:
      d.type ||
      "",

    image:images[0] || image,
    images,

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
   WEBSITE BRIDGE
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


function updateWebsiteTotalCount(total){

  if(
    typeof window.setFirebaseTotalCount ===
    "function"
  ){
    window.setFirebaseTotalCount(
      Number(total || 0)
    );
  }
}


/* =========================================
   FILTER CONSTRAINTS
========================================= */

function baseConstraints(){

  const constraints = [];


  constraints.push(
    where(
      "category",
      "==",
      activeFilters.category
    )
  );


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


  if(
    activeFilters.category === "Contact Lenses" &&
    activeFilters.power
  ){

    constraints.push(
      where(
        "powers",
        "array-contains",
        activeFilters.power
      )
    );
  }


  return constraints;
}


/* =========================================
   COUNT QUERY
========================================= */

function buildCountQuery(){

  return query(
    collection(
      db,
      "products"
    ),
    ...baseConstraints()
  );
}


async function fetchTotalCount(){

  const countSnap =
    await getCountFromServer(
      buildCountQuery()
    );


  return Number(
    countSnap.data().count || 0
  );
}


/* =========================================
   PRODUCT QUERY
========================================= */

function buildProductsQuery(){

  const constraints = [
    ...baseConstraints()
  ];


  if(lastVisible){

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


/* =========================================
   LOAD NEXT PAGE
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
        buildProductsQuery()
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


    /*
      Keep the current filter result cached after
      Load More too, so going away and coming back
      restores the already-loaded pages instantly.
    */
    const existingCache =
      readFilterCache();

    saveFilterCache(
      existingCache
        ? existingCache.totalCount
        : loadedProducts.length
    );

  }catch(error){

    console.error(
      "Firestore category/color/power query failed:",
      error
    );


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
   FIRST PAGE
   COUNT + PRODUCTS RUN IN PARALLEL
========================================= */

async function loadFreshFilter(){

  loading =
    true;


  if(
    typeof window.setFirebaseLoading ===
    "function"
  ){
    window.setFirebaseLoading(
      true
    );
  }


  try{

    /*
      Firestore count and first 11 docs are independent,
      so run both requests together instead of one-by-one.
    */
    const [
      totalCount,
      productsSnapshot
    ] =
      await Promise.all([
        fetchTotalCount(),
        getDocs(
          buildProductsQuery()
        )
      ]);


    updateWebsiteTotalCount(
      totalCount
    );


    const docs =
      productsSnapshot.docs;


    hasMore =
      docs.length >
      PAGE_SIZE;


    const pageDocs =
      docs.slice(
        0,
        PAGE_SIZE
      );


    loadedProducts =
      pageDocs.map(
        normalizeProduct
      );


    lastVisible =
      pageDocs.length > 0
        ? pageDocs[
            pageDocs.length - 1
          ]
        : null;


    updateWebsite();


    saveFilterCache(
      totalCount
    );

  }catch(error){

    console.error(
      "Firestore first-page load failed:",
      error
    );


    loadedProducts =
      [];

    lastVisible =
      null;

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
    nextCategory === "Contact Lenses"
      ? (
          filters.color ??
          activeFilters.color ??
          "all"
        )
      : "all";


  const nextPower =
    nextCategory === "Contact Lenses"
      ? String(
          filters.power ??
          activeFilters.power ??
          ""
        ).trim()
      : "";


  activeFilters = {
    category:
      nextCategory,

    color:
      nextColor,

    power:
      nextPower
  };


  /*
    CACHE HIT:
    Restore instantly without Firestore request.
  */
  const cached =
    readFilterCache();


  if(cached){

    loadedProducts =
      cached.products.map(
        product => ({
          ...product
        })
      );

    lastVisible =
      cached.lastVisible;

    hasMore =
      cached.hasMore;


    updateWebsiteTotalCount(
      cached.totalCount
    );


    updateWebsite();

    return;
  }


  /*
    CACHE MISS:
    Reset and fetch fresh data.
  */
  lastVisible =
    null;

  loadedProducts =
    [];

  hasMore =
    true;


  updateWebsite();


  await loadFreshFilter();
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
        activeFilters.color,

      power:
        filters.power ??
        activeFilters.power
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
        "all",

      power:
        ""
    });
  };


/* =========================================
   INITIAL LOAD
========================================= */

loadFreshFilter();
