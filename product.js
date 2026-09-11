import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

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
    wait:"Waiting period",
    wishlistAdd:"Add to Wishlist",
    wishlistRemove:"Remove from Wishlist",
    share:"Share",
    copied:"Link copied",
    lensCare:"Complete Your Lens Care",
    addQuick:"Add to Bag",
    quoteTitle:"Look Good, Feel Confident",
    quoteText:"Small change, a brighter you ✨",
    originalTitle:"100% Original Products",
    originalText:"Sourced from trusted brands",
    deliveryTitle:"Fast Delivery Across UAE",
    deliveryText:"Cash on Delivery Available",
    secureTitle:"Secure Shopping",
    secureText:"Your data is safe with us",
    trustedTitle:"Trusted by Customers",
    trustedText:"Simple shopping, friendly support"
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
    wait:"စောင့်ဆိုင်းချိန်",
    wishlistAdd:"Wishlist ထဲထည့်မည်",
    wishlistRemove:"Wishlist မှဖယ်မည်",
    share:"Share",
    copied:"Link ကူးပြီးပါပြီ",
    lensCare:"Lens Care ပစ္စည်းများ",
    addQuick:"Bag ထဲထည့်မည်",
    quoteTitle:"လှပမှုနဲ့ ယုံကြည်မှု",
    quoteText:"အသေးစားပြောင်းလဲမှုက ပိုလင်းလက်တဲ့သင် ✨",
    originalTitle:"မူရင်းပစ္စည်းများ",
    originalText:"ယုံကြည်ရသော brand များမှ",
    deliveryTitle:"UAE အတွင်း မြန်ဆန်စွာပို့ဆောင်မှု",
    deliveryText:"Cash on Delivery ရရှိနိုင်",
    secureTitle:"လုံခြုံသော Shopping",
    secureText:"သင့်အချက်အလက်များကို လုံခြုံစွာထိန်းသိမ်းထားသည်",
    trustedTitle:"Customer များယုံကြည်ရွေးချယ်",
    trustedText:"လွယ်ကူသော shopping နှင့် friendly support"
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
    colorKey:d.colorKey || d.colour || d.color || "",
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
  $("#pdShareText").textContent = t().share;
  $("#pdLensCareTitle").textContent = t().lensCare;
  $("#pdQuoteTitle").textContent = t().quoteTitle;
  $("#pdQuoteText").textContent = t().quoteText;
  $("#pdTrustOriginalTitle").textContent = t().originalTitle;
  $("#pdTrustOriginalText").textContent = t().originalText;
  $("#pdTrustDeliveryTitle").textContent = t().deliveryTitle;
  $("#pdTrustDeliveryText").textContent = t().deliveryText;
  $("#pdTrustSecureTitle").textContent = t().secureTitle;
  $("#pdTrustSecureText").textContent = t().secureText;
  $("#pdTrustTrustedTitle").textContent = t().trustedTitle;
  $("#pdTrustTrustedText").textContent = t().trustedText;
  updateWishlistButton();
  if(product){
    renderProduct();
    const recSection = $("#pdRecommendations");
    if(recSection && !recSection.classList.contains("hidden")){
      loadRecommendations();
    }
    const careSection = $("#pdLensCare");
    if(careSection && !careSection.classList.contains("hidden")){
      loadLensCare();
    }
  }
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


function getWishlist(){
  try{
    const data = JSON.parse(localStorage.getItem("tfl_wishlist") || "[]");
    return Array.isArray(data) ? data : [];
  }catch(e){
    return [];
  }
}

function isWishlisted(id){
  return getWishlist().some(x=>x.id === id);
}

function updateWishlistButton(){
  const btn = $("#pdWishlistBtn");
  const icon = $("#pdWishlistIcon");
  const label = $("#pdWishlistText");
  if(!btn || !icon || !label) return;

  const active = !!product && isWishlisted(product.id);
  btn.classList.toggle("active", active);
  icon.textContent = active ? "♥" : "♡";
  label.textContent = active ? t().wishlistRemove : t().wishlistAdd;
}

function toggleWishlist(){
  if(!product) return;
  let list = getWishlist();
  const idx = list.findIndex(x=>x.id === product.id);

  if(idx >= 0){
    list.splice(idx,1);
  }else{
    list.push({
      id:product.id,
      name:product.name,
      nameMM:product.nameMM || "",
      brand:product.brand || "",
      price:product.price,
      image:product.image || ""
    });
  }

  localStorage.setItem("tfl_wishlist", JSON.stringify(list));
  updateWishlistButton();
}

async function shareProduct(){
  if(!product) return;

  const shareData = {
    title: product.name,
    text: `${product.name} - ${money(product.price)}`,
    url: window.location.href
  };

  try{
    if(navigator.share){
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    $("#pdToast").textContent = t().copied;
    $("#pdToast").classList.remove("hidden");
    setTimeout(()=>$("#pdToast").classList.add("hidden"),1600);
  }catch(err){
    if(err && err.name === "AbortError") return;

    try{
      await navigator.clipboard.writeText(window.location.href);
      $("#pdToast").textContent = t().copied;
      $("#pdToast").classList.remove("hidden");
      setTimeout(()=>$("#pdToast").classList.add("hidden"),1600);
    }catch(e){
      console.error("Share failed:", e);
    }
  }
}

function addSimpleProductToBag(p){
  if(!p || p.stockStatus === "outofstock") return;

  const key = `${p.id}-na`;
  let cart = [];
  try{ cart = JSON.parse(localStorage.getItem("tfl_cart") || "[]"); }catch(e){}

  const existing = cart.find(x=>x.key === key);
  if(existing){
    existing.qty += 1;
  }else{
    cart.push({
      key,
      id:p.id,
      name:p.name,
      brand:p.brand || "",
      size:p.size || "",
      price:p.price,
      qty:1,
      power:null,
      image:p.image || null
    });
  }

  localStorage.setItem("tfl_cart", JSON.stringify(cart));
  updateCartCount();

  $("#pdToast").textContent = t().added;
  $("#pdToast").classList.remove("hidden");
  setTimeout(()=>$("#pdToast").classList.add("hidden"),1600);
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


function recommendationTitle(){
  return product && product.category === "Contact Lenses"
    ? (lang === "mm" ? "နောက်ထပ် အရောင်များ" : "Explore More Colours")
    : (lang === "mm" ? "နောက်ထပ် ပစ္စည်းများ" : "Explore More Products");
}

function recommendationCard(p){
  const name = lang === "mm" && p.nameMM ? p.nameMM : p.name;
  const stockText =
    p.stockStatus === "outofstock" ? t().out :
    p.stockStatus === "preorder" ? t().pre :
    t().in;

  return `
    <a class="pd-rec-card" href="product.html?id=${encodeURIComponent(p.id)}">
      <div class="pd-rec-image">
        ${p.image ? `<img src="${p.image}" alt="${name}" loading="lazy" decoding="async">` : ""}
        <span class="pd-rec-stock">${stockText}</span>
      </div>
      <div class="pd-rec-body">
        <div class="pd-rec-brand">${p.brand || "&nbsp;"}</div>
        <div class="pd-rec-name">${name}</div>
        <div class="pd-rec-price">${money(p.price)}</div>
        ${
          product.category === "Contact Lenses" && p.colorKey
            ? `<div class="pd-rec-colour">${p.colorKey}</div>`
            : ""
        }
      </div>
    </a>
  `;
}

async function loadRecommendations(){
  const section = $("#pdRecommendations");
  const track = $("#pdRecommendationsTrack");

  if(!product){
    section.classList.add("hidden");
    return;
  }

  try{
    // Same-category only. Fetch a few extra so current product can be removed
    // and Contact Lenses can prioritize different colours.
    const q = query(
      collection(db,"products"),
      where("category","==",product.category),
      limit(12)
    );

    const snap = await getDocs(q);
    let items = snap.docs
      .map(s=>normalizeProduct(s.id,s.data()))
      .filter(p=>p.id !== product.id);

    if(product.category === "Contact Lenses"){
      // Prioritize products whose colour differs from the current lens.
      items.sort((a,b)=>{
        const aDifferent = a.colorKey && a.colorKey !== product.colorKey ? 0 : 1;
        const bDifferent = b.colorKey && b.colorKey !== product.colorKey ? 0 : 1;
        return aDifferent - bDifferent;
      });
    }

    items = items.slice(0,6);

    if(!items.length){
      section.classList.add("hidden");
      return;
    }

    $("#pdRecommendationsTitle").textContent = recommendationTitle();
    track.innerHTML = items.map(recommendationCard).join("");
    section.classList.remove("hidden");
  }catch(err){
    console.error("Recommendations:",err);
    section.classList.add("hidden");
  }
}


function lensCareCard(p){
  const name = lang === "mm" && p.nameMM ? p.nameMM : p.name;
  const isOut = p.stockStatus === "outofstock";

  return `
    <article class="pd-care-card">
      <a href="product.html?id=${encodeURIComponent(p.id)}" aria-label="${name}">
        <div class="pd-care-image">
          ${p.image ? `<img src="${p.image}" alt="${name}" loading="lazy" decoding="async">` : ""}
        </div>
      </a>
      <div class="pd-care-body">
        <div class="pd-care-name">${name}</div>
        <div class="pd-care-price">${money(p.price)}</div>
        <button class="pd-care-add"
                type="button"
                data-care-id="${p.id}"
                ${isOut ? "disabled" : ""}>
          ${isOut ? t().out : t().addQuick}
        </button>
      </div>
    </article>
  `;
}

async function loadLensCare(){
  const section = $("#pdLensCare");
  const track = $("#pdLensCareTrack");

  try{
    const q = query(
      collection(db,"products"),
      where("category","==","Accessories"),
      limit(8)
    );

    const snap = await getDocs(q);
    const items = snap.docs
      .map(s=>normalizeProduct(s.id,s.data()))
      .filter(p=>p.id !== (product ? product.id : ""))
      .slice(0,6);

    if(!items.length){
      section.classList.add("hidden");
      return;
    }

    track.innerHTML = items.map(lensCareCard).join("");
    section.classList.remove("hidden");

    track.querySelectorAll(".pd-care-add").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const p = items.find(x=>x.id === btn.dataset.careId);
        addSimpleProductToBag(p);
      });
    });
  }catch(err){
    console.error("Lens care:",err);
    section.classList.add("hidden");
  }
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
    updateWishlistButton();
    await loadRecommendations();
    await loadLensCare();
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
$("#pdWishlistBtn").addEventListener("click",toggleWishlist);
$("#pdShareBtn").addEventListener("click",shareProduct);

updateCartCount();
applyLanguage();
loadProduct();
