import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot
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

    stockStatus: stockStatus,

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

    image: image,

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

onSnapshot(
  collection(db, "products"),

  snapshot => {
    const items = snapshot.docs.map(normalizeProduct);

    console.log("Firebase products loaded:", items);

    if (typeof window.setProductsFromFirebase === "function") {
      window.setProductsFromFirebase(items);
    }
  },

  error => {
    console.error(
      "Could not load Firestore products:",
      error
    );
  }
);
