import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

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
    powers = powers.trim() ? powers.split(",").map(x=>x.trim()).filter(Boolean) : null;
  }
  if (Array.isArray(powers) && powers.length === 0) powers = null;
  if (d.hasPower === false) powers = null;

  return {
    id: snap.id,
    firestoreId: snap.id,
    name: d.name || "Unnamed Product",
    nameMM: d.nameMM || "",
    price: Number(d.price || 0),
    category: d.category || "Contact Lenses",
    colorKey: d.colorKey || d.color || "clear",
    stockStatus: d.stockStatus === "preorder" ? "preorder" : "instock",
    waitingPeriod: d.waitingPeriod || (d.stockStatus === "preorder" ? "2 weeks" : ""),
    badge: d.badge || (d.stockStatus === "preorder" ? "Pre-order" : "In Stock"),
    color: d.displayColor || d.colorHex || "#a8adb2",
    type: d.type || "",
    image: (() => {
  const raw = String(d.imageUrl || d.image || "")
    .trim()
    .replace(/^\/+/, "");

  return raw
    .replace(/\.JPG$/i, ".jpg")
    .replace(/\.JPEG$/i, ".jpeg")
    .replace(/\.PNG$/i, ".png");
})(),,
    desc: d.description || d.desc || "",
    descMM: d.descriptionMM || d.descMM || "",
    powers
  };
}

onSnapshot(collection(db, "products"), snapshot => {
  if (snapshot.empty) {
    console.info("Firestore products collection is empty; built-in products remain visible.");
    return;
  }
  const items = snapshot.docs.map(normalizeProduct);
  if (typeof window.setProductsFromFirebase === "function") {
    window.setProductsFromFirebase(items);
  }
}, error => {
  console.error("Could not load Firestore products. Built-in products remain visible.", error);
});
