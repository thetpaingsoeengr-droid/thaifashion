import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

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
const $ = s => document.querySelector(s);

let product = null;
let selectedPower = null;
let lang = localStorage.getItem("tfl_language") || "en";

const text = {
  en:{
    choosePower:"Choose Power",
    quantity:"Quantity",
    add:"Add to Bag",
    out:"Out of Stock",
    in:"In Stock",
    pre:"Pre-order",
    description:"Description",
    viewBag:"View Bag",
    added:"Added to bag",
    wait:"Waiting period"
  },
  mm:{
    choosePower:"Power ရွေးပါ",
    quantity:"အရေအတွက်",
    add:"Bag ထဲထည့်မည်",
    out:"ပစ္စည်းကုန်",
    in:"ပစ္စည်းရှိ",
    pre:"ကြိုတင်မှာယူ",
    description:"အသေးစိတ်ဖော်ပြချက်",
    viewBag:"Bag ကြည့်မည်",
    added:"Bag ထဲထည့်ပြီးပါပြီ",
    wait:"စောင့်ဆိုင်းချိန်"
  }
};

function t(){ return text[lang] || text.en; }
function money(v){ return `AED ${Number(v || 0).toFixed(0)}`; }

function normalizeProduct(id,d){
  let powers = d.powers ?? null;
  if(typeof powers === "string"){
    powers = powers.trim()
      ? powers.split(",").map(x=>x.trim()).filter(Boolean)
      : null;
  }
  if(Array.isArray(powers) && !powers.length) powers = null;
  if(d.hasPower === false) powers = null;

  return {
    id,
    name:d.name || "Unnamed Product",
    nameMM:d.nameMM || "",
    brand:d.brand || "",
    size:d.size || "",
    price:Number(d.price || 0),
    category:d.category || "Contact Lenses",
    stockStatus:d.stockStatus || "instock",
    waitingPeriod:d.waitingPeriod || "",
    image:String(d.imageUrl || d.imageURL || d.image || "").trim(),
    desc:d.desc || d.description || "",
    descMM:d.descMM || d.descriptionMM || "",
    powers
  };
}

function updateCartCount(){
  let cart = [];
  try{ cart = JSON.parse(localStorage.getItem("tfl_cart") || "[]"); }catch(e){}
  $("#pdCartCount").textContent = cart.reduce((n,x)=>n+(Number(x.qty)||0),0);
}

function applyLanguage(){
  $("#pdLangBtn").textContent = lang === "en" ? "က" : "A";
  $("#pdPowerTitle").textContent = t().choosePower;
  $("#pdQtyLabel").textContent = t().quantity;
  $("#pdViewBag").textContent = t().viewBag;
  $("#pdDescriptionTitle").textContent = t().description;
  if(product) renderProduct();
}

function renderProduct(){
  const isOut = product.stockStatus === "outofstock";
  const isPre = product.stockStatus === "preorder";

  document.title = `${product.name} • Thai Fashion Lenses`;
  $("#pdName").textContent = lang === "mm" && product.nameMM ? product.nameMM : product.name;
  $("#pdCategory").textContent = product.category;
  $("#pdPrice").textContent = money(product.price);

  const img = $("#pdImage");
  if(product.image){
    img.src = product.image;
    img.alt = product.name;
  }else{
    img.removeAttribute("src");
    img.alt = product.name;
  }

  const badge = $("#pdStockBadge");
  badge.textContent = isOut ? t().out : isPre ? t().pre : t().in;
  badge.className = `pd-stock-badge ${isOut ? "outofstock" : isPre ? "preorder" : ""}`;

  $("#pdWait").classList.toggle("hidden", !isPre);
  $("#pdWait").textContent = isPre ? `${t().wait}: ${product.waitingPeriod || "2 weeks"}` : "";

  const specs = [];
  if(product.brand) specs.push(["Brand", product.brand]);
  if(product.size) specs.push([lang === "mm" ? "အရွယ်အစား" : "Size", product.size]);

  const specsEl = $("#pdSpecs");
  specsEl.classList.toggle("hidden", !specs.length);
  specsEl.innerHTML = specs.map(([label,value]) =>
    `<div class="pd-spec"><small>${label}</small><strong>${value}</strong></div>`
  ).join("");

  const hasPowers = Array.isArray(product.powers) && product.powers.length;
  $("#pdPowerSection").classList.toggle("hidden", !hasPowers);

  if(hasPowers){
    if(!selectedPower || !product.powers.includes(selectedPower)){
      selectedPower = product.powers[0];
    }
    $("#pdPowerOptions").innerHTML = product.powers.map(power =>
      `<button type="button" class="pd-power-btn ${power === selectedPower ? "active" : ""}" data-power="${power}">${power}</button>`
    ).join("");

    document.querySelectorAll(".pd-power-btn").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        selectedPower = btn.dataset.power;
        renderProduct();
      });
    });
  }else{
    selectedPower = null;
  }

  const desc = lang === "mm" && product.descMM ? product.descMM : product.desc;
  $("#pdDescriptionSection").classList.toggle("hidden", !desc);
  $("#pdDescription").textContent = desc || "";

  const add = $("#pdAddBtn");
  add.disabled = isOut;
  add.textContent = isOut ? t().out : t().add;
}

function addToBag(){
  if(!product || product.stockStatus === "outofstock") return;

  const qty = Math.max(1, parseInt($("#pdQty").value) || 1);
  const power = selectedPower;
  const key = `${product.id}-${power || "na"}`;

  let cart = [];
  try{ cart = JSON.parse(localStorage.getItem("tfl_cart") || "[]"); }catch(e){}

  const existing = cart.find(x=>x.key === key);
  if(existing){
    existing.qty += qty;
  }else{
    cart.push({
      key,
      id:product.id,
      name:product.name,
      brand:product.brand || "",
      size:product.size || "",
      price:product.price,
      qty,
      power,
      image:product.image || null
    });
  }

  localStorage.setItem("tfl_cart", JSON.stringify(cart));
  updateCartCount();

  $("#pdToast").textContent = t().added;
  $("#pdToast").classList.remove("hidden");
  setTimeout(()=>$("#pdToast").classList.add("hidden"),1800);
}

async function loadProduct(){
  const id = new URLSearchParams(location.search).get("id");
  if(!id){
    $("#pdLoading").classList.add("hidden");
    $("#pdError").classList.remove("hidden");
    return;
  }

  try{
    const snap = await getDoc(doc(db,"products",id));
    if(!snap.exists()) throw new Error("Not found");

    product = normalizeProduct(snap.id,snap.data());
    $("#pdLoading").classList.add("hidden");
    $("#pdProduct").classList.remove("hidden");
    renderProduct();
  }catch(err){
    console.error(err);
    $("#pdLoading").classList.add("hidden");
    $("#pdError").classList.remove("hidden");
  }
}

$("#pdLangBtn").addEventListener("click", ()=>{
  lang = lang === "en" ? "mm" : "en";
  localStorage.setItem("tfl_language",lang);
  applyLanguage();
});
$("#pdMinus").addEventListener("click", ()=>{
  $("#pdQty").value = Math.max(1,(parseInt($("#pdQty").value)||1)-1);
});
$("#pdPlus").addEventListener("click", ()=>{
  $("#pdQty").value = Math.max(1,(parseInt($("#pdQty").value)||1)+1);
});
$("#pdAddBtn").addEventListener("click",addToBag);

updateCartCount();
applyLanguage();
loadProduct();
