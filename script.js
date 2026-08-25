const WHATSAPP_NUMBER = "971544608059";

const products = [
  {id:1,name:"Venice Gray",stockStatus:"instock",colorKey:"gray",category:"Contact Lenses",price:15,badge:"Best Seller",color:"#8f9a9a",desc:"Soft gray fashion lens for a clean everyday look.",powers:["0.00","-1.00","-2.00","-4.50"]},
  {id:2,name:"Taylor Brown",stockStatus:"instock",colorKey:"brown",category:"Contact Lenses",price:15,badge:"In Stock",color:"#9b765f",desc:"Warm brown tone designed for a natural, softly defined finish.",powers:["0.00","-1.00","-2.00","-4.50"]},
  {id:3,name:"Pattaya Green",stockStatus:"preorder",colorKey:"green",category:"Contact Lenses",price:15,badge:"New Arrival",color:"#708979",desc:"Muted green lens with a fashion-forward but wearable tone.",powers:["0.00","-1.00","-2.00","-4.50"]},
  {id:4,name:"Mocha Hazel",stockStatus:"preorder",colorKey:"brown",category:"Contact Lenses",price:20,badge:"Power Lens",color:"#a58662",desc:"Hazel-brown fashion lens with multiple power choices.",powers:["0.00","-1.00","-2.00","-4.50"]},
  {id:5,name:"Daily Clear 10 pcs",stockStatus:"instock",colorKey:"clear",category:"Contact Lenses",price:25,badge:"Daily",color:"#b7c0c4",desc:"Daily disposable clear lenses, packed for convenient everyday use.",powers:["0.00","-1.00","-2.00","-4.50"]},
  {id:6,name:"Lens Travel Case",stockStatus:"instock",colorKey:"pink",category:"Accessories",price:10,badge:"In Stock",color:"#c99d9e",type:"bag",desc:"Compact lens case for your handbag or travel pouch.",powers:null},
  {id:7,name:"Mini Fashion Pouch",stockStatus:"preorder",colorKey:"brown",category:"Accessories",price:20,badge:"New Arrival",color:"#a98d7b",type:"bag",desc:"Small everyday pouch for lenses, makeup or accessories.",powers:null},
  {id:8,name:"Soft Pink Lip Tint",stockStatus:"instock",colorKey:"pink",category:"Beauty",price:18,badge:"Best Seller",color:"#bd7378",type:"beauty",desc:"Easy everyday lip tint with a soft pink finish.",powers:null}
,
  {id:9,name:"Ocean Blue",stockStatus:"preorder",colorKey:"blue",category:"Contact Lenses",price:20,badge:"New Arrival",color:"#6d8fac",desc:"Cool blue fashion lens for a brighter look.",powers:["0.00","-1.00","-2.00","-4.50"]},
  {id:10,name:"Ruby Red",stockStatus:"preorder",colorKey:"red",category:"Contact Lenses",price:20,badge:"New Arrival",color:"#a65353",desc:"Bold red fashion lens for special looks.",powers:["0.00","-1.00","-2.00"]},
  {id:11,name:"Honey Gold",stockStatus:"instock",colorKey:"yellow",category:"Contact Lenses",price:20,badge:"New Arrival",color:"#c5a64f",desc:"Warm golden-yellow lens with a glowing finish.",powers:["0.00","-1.00","-2.00"]},
  {id:12,name:"Violet Dream",stockStatus:"preorder",colorKey:"purple",category:"Contact Lenses",price:20,badge:"New Arrival",color:"#8973a5",desc:"Soft violet fashion lens with a dreamy tone.",powers:["0.00","-1.00","-2.00"]},
  {id:13,name:"Midnight Black",stockStatus:"instock",colorKey:"black",category:"Contact Lenses",price:20,badge:"Best Seller",color:"#333333",desc:"Deep black lens for stronger eye definition.",powers:["0.00","-1.00","-2.00"]},
  {id:14,name:"Blush Pink",stockStatus:"preorder",colorKey:"pink",category:"Contact Lenses",price:20,badge:"New Arrival",color:"#c990a0",desc:"Soft pink fashion lens for a playful look.",powers:["0.00","-1.00","-2.00"]},
  {id:15,name:"Icy Gray",colorKey:"gray",stockStatus:"preorder",category:"Contact Lenses",price:20,badge:"Pre-order",color:"#a8adb2",image:"images/icy-gray.jpg",desc:"Natural grey lens for everyday wear.",powers:null}];

let currentCategory = "All";
let currentColor = "all";
let currentStock = "all";
let cart = JSON.parse(localStorage.getItem("tfl_cart") || "[]");
let selectedProduct = null;

const $ = (s) => document.querySelector(s);
const productGrid = $("#productGrid");
const categoryFilters = $("#categoryFilters");
const searchInput = $("#searchInput");
const sortSelect = $("#sortSelect");

function money(n){ return `AED ${Number(n).toFixed(0)}`; }
function categories(){ return ["All", ...new Set(products.map(p=>p.category))]; }

function renderCategories(){
  categoryFilters.innerHTML = categories().map(c => `<button class="category-chip ${c===currentCategory?"active":""}" data-category="${c}">${c}</button>`).join("");
  categoryFilters.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
    currentCategory=b.dataset.category; 
renderCategories(); renderProducts();
  }));
}

function filteredProducts(){
  const q = searchInput.value.trim().toLowerCase();
  let list = products.filter(p => (currentCategory==="All" || p.category===currentCategory) && (currentColor==="all" || p.colorKey===currentColor) && (currentStock==="all" || p.stockStatus===currentStock) && p.name.toLowerCase().includes(q));
  const s=sortSelect.value;
  if(s==="low") list.sort((a,b)=>a.price-b.price);
  if(s==="high") list.sort((a,b)=>b.price-a.price);
  if(s==="name") list.sort((a,b)=>a.name.localeCompare(b.name));
  return list;
}

function renderProducts(){
  const list=filteredProducts();
  $("#resultCount").textContent=list.length;
  $("#emptyState").classList.toggle("hidden", list.length>0);
  productGrid.innerHTML=list.map(p=>`
    <article class="product-card" data-id="${p.id}">
      <div class="product-image ${p.type||""} ${p.image?"has-real-image":""}" style="--iris:${p.color}">
        ${p.image ? `<img src="${p.image}" alt="${p.name}" class="real-product-image" loading="lazy">` : ""}
        <span class="badge">${localizedBadge(p.badge)}</span>
        <span class="stock-status ${p.stockStatus==="preorder"?"preorder":""}">${p.stockStatus==="preorder"?tr().stockPre:tr().stockIn}</span>
        <button class="quick-add" aria-label="View ${p.name}" data-id="${p.id}">+</button>
      </div>
      <div class="product-info">
        <div class="product-category">${localizedCategory(p.category)}</div>
        <div class="product-title">${p.name}</div>
        <div class="product-price">${money(p.price)}</div>
        ${p.stockStatus==="preorder"?`<div class="preorder-note">${tr().waitTwoWeeks}</div>`:""}
      </div>
    </article>`).join("");
  productGrid.querySelectorAll(".product-card").forEach(card=>card.addEventListener("click",()=>openProduct(Number(card.dataset.id))));
}

function openProduct(id){
  selectedProduct=products.find(p=>p.id===id);
  $("#modalName").textContent=selectedProduct.name;
  $("#modalCategory").textContent=localizedCategory(selectedProduct.category);
  $("#modalPrice").textContent=money(selectedProduct.price);
  const stockText = selectedProduct.stockStatus==="preorder" ? tr().stockPre : tr().stockIn;
  const waitText = selectedProduct.stockStatus==="preorder" ? `<span class="modal-waiting">${tr().waitTwoWeeks}</span>` : "";
  $("#modalStockInfo").innerHTML = `<span class="modal-stock-pill ${selectedProduct.stockStatus==="preorder"?"preorder":""}">${stockText}</span>${waitText}`;
  $("#modalDescription").textContent=selectedProduct.desc;
  $("#modalImage").style.setProperty("--iris",selectedProduct.color);
  $("#modalImage").classList.toggle("has-real-image", !!selectedProduct.image);
  $("#modalImage").innerHTML = selectedProduct.image
    ? `<img src="${selectedProduct.image}" alt="${selectedProduct.name}" class="modal-real-image">`
    : "";
  $("#powerWrap").classList.toggle("hidden", !selectedProduct.powers);
  if(selectedProduct.powers) $("#powerSelect").innerHTML=selectedProduct.powers.map(x=>`<option value="${x}">${x}</option>`).join("");
  $("#qtyInput").value=1;
  $("#productModal").classList.remove("hidden");
  document.body.style.overflow="hidden";
}

function closeModal(){
  $("#productModal").classList.add("hidden");
  document.body.style.overflow="";
}

function addToCart(){
  const qty=Math.max(1, parseInt($("#qtyInput").value)||1);
  const power=selectedProduct.powers ? $("#powerSelect").value : null;
  const key=`${selectedProduct.id}-${power||"na"}`;
  const existing=cart.find(x=>x.key===key);
  if(existing) existing.qty+=qty;
  else cart.push({key,id:selectedProduct.id,name:selectedProduct.name,price:selectedProduct.price,qty,power,color:selectedProduct.color});
  saveCart();
  closeModal();
  showToast(tr().added);
}

function saveCart(){ localStorage.setItem("tfl_cart",JSON.stringify(cart)); renderCart(); }
function renderCart(){
  $("#cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);
  $("#cartEmpty").classList.toggle("hidden",cart.length>0);
  $("#cartSummary").classList.toggle("hidden",cart.length===0);

  const itemCount=cart.reduce((a,x)=>a+x.qty,0);
  $("#cartItems").innerHTML=(cart.length ? `<div class="bag-items-label">${tr().bagItems(itemCount)}</div>` : "") + cart.map((x,i)=>`
    <div class="cart-item">
      <div class="cart-thumb" style="--iris:${x.color}"></div>
      <div class="cart-item-main">
        <h4>${x.name}</h4>
        <div class="cart-meta">
          ${x.power ? `<span>Power ${x.power}</span>` : ""}
          <span>${siteLang==="mm"?"အရေအတွက်":"Qty"} ${x.qty}</span>
        </div>
        <div class="cart-item-bottom">
          <strong>${money(x.price*x.qty)}</strong>
          <button class="remove-item" data-i="${i}">${siteLang==="mm"?"ဖယ်မည်":"Remove"}</button>
        </div>
      </div>
    </div>`).join("");

  $("#cartItems").querySelectorAll(".remove-item").forEach(b=>b.addEventListener("click",()=>{
    cart.splice(Number(b.dataset.i),1); saveCart();
  }));
  $("#cartSubtotal").textContent=money(cart.reduce((a,x)=>a+x.price*x.qty,0));
}

function openCart(){ $("#cartDrawer").classList.add("open"); $("#drawerBackdrop").classList.remove("hidden"); $("#cartDrawer").setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; }
function closeCart(){ $("#cartDrawer").classList.remove("open"); $("#drawerBackdrop").classList.add("hidden"); $("#cartDrawer").setAttribute("aria-hidden","true"); document.body.style.overflow=""; }
function showToast(message="Added to bag"){
  $("#toast").textContent=message;
  $("#toast").classList.remove("hidden");
  setTimeout(()=>$("#toast").classList.add("hidden"),1800);
}

function orderWhatsApp(){
  if(!cart.length) return;

  const name = $("#customerName").value.trim();
  const phone = $("#customerPhone").value.trim();
  const emirate = $("#customerEmirate").value.trim();
  const area = $("#customerArea").value.trim();
  const building = $("#customerBuilding").value.trim();
  const street = $("#customerStreet").value.trim();
  const landmark = $("#customerLandmark").value.trim();
  const notes = $("#customerNotes").value.trim();

  const requiredMissing = !name || !phone || !emirate || !area || !building;
  $("#addressError").classList.toggle("hidden", !requiredMissing);

  if(requiredMissing){
    const firstMissing = !name ? $("#customerName")
      : !phone ? $("#customerPhone")
      : !emirate ? $("#customerEmirate")
      : !area ? $("#customerArea")
      : $("#customerBuilding");
    firstMissing.focus();
    return;
  }

  const lines = cart.map((x,i) =>
    `${i+1}. ${x.name}${x.power ? ` | Power ${x.power}` : ""} | Qty ${x.qty} | ${money(x.price*x.qty)}`
  );
  const total = money(cart.reduce((a,x)=>a+x.price*x.qty,0));

  const addressLines = [
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Emirate: ${emirate}`,
    `Area / Community: ${area}`,
    `Building / Villa: ${building}`,
    street ? `Street / Apartment: ${street}` : "",
    landmark ? `Landmark: ${landmark}` : "",
    notes ? `Delivery Notes: ${notes}` : ""
  ].filter(Boolean);

  const message = `Hi Thai Fashion Lenses UAE! I would like to order:\n\n${lines.join("\n")}\n\nSubtotal: ${total}\n\nDELIVERY DETAILS\n${addressLines.join("\n")}\n\nPlease confirm delivery fee and final total.`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

searchInput.addEventListener("input",renderProducts);
sortSelect.addEventListener("change",renderProducts);
$("#searchFocusBtn").addEventListener("click",()=>{ location.hash="shop"; setTimeout(()=>searchInput.focus(),300); });
$("#openCartBtn").addEventListener("click",openCart);
$("#closeCartBtn").addEventListener("click",closeCart);
$("#drawerBackdrop").addEventListener("click",closeCart);
$("#continueShoppingBtn").addEventListener("click",closeCart);
$("#whatsappOrderBtn").addEventListener("click",orderWhatsApp);
$("#addToCartBtn").addEventListener("click",addToCart);
$("#qtyMinus").addEventListener("click",()=>$("#qtyInput").value=Math.max(1,(parseInt($("#qtyInput").value)||1)-1));
$("#qtyPlus").addEventListener("click",()=>$("#qtyInput").value=(parseInt($("#qtyInput").value)||1)+1);
document.querySelectorAll("[data-close='productModal']").forEach(x=>x.addEventListener("click",closeModal));
$("#productModal").addEventListener("click",e=>{ if(e.target===$("#productModal")) closeModal(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){closeModal();closeCart();} });
$("#year").textContent=new Date().getFullYear();


/* ===== V9 FULL EN / MYANMAR TRANSLATION + COLOR FILTERS ===== */
const colorDefs = [
  {key:"all", en:"All colors", mm:"အရောင်အားလုံး"},
  {key:"green", en:"Green", mm:"စိမ်း"},
  {key:"blue", en:"Blue", mm:"ပြာ"},
  {key:"red", en:"Red", mm:"နီ"},
  {key:"brown", en:"Brown", mm:"ညို"},
  {key:"yellow", en:"Yellow", mm:"ဝါ"},
  {key:"clear", en:"Clear", mm:"အကြည်"},
  {key:"gray", en:"Gray", mm:"မီးခိုး"},
  {key:"purple", en:"Purple", mm:"ခရမ်း"},
  {key:"black", en:"Black", mm:"အနက်"},
  {key:"pink", en:"Pink", mm:"ပန်းရောင်"}
];

const i18n = {
  en:{
    annDelivery:"UAE Delivery",
    annCod:"Cash on Delivery",
    annWhatsapp:"Order via WhatsApp",
    heroEyebrow:"EVERYDAY BEAUTY, MADE EASY",
    heroTitle:"Your look.<br>Your lenses.",
    heroText:"Fashion contact lenses selected for effortless everyday style. Shop by color, power and collection.",
    shopLatest:"Shop latest",
    benefit1Title:"Fast UAE delivery",
    benefit1Text:"Simple ordering through WhatsApp",
    benefit2Title:"Power options",
    benefit2Text:"Choose your lens power before adding",
    benefit3Title:"Easy support",
    benefit3Text:"Chat with us before you order",
    shopEyebrow:"SHOP",
    latestProductsTitle:"Latest products",
    productsWord:"products",
    stockFilterTitle:"Availability",
    clearStockBtn:"Clear",
    stockAll:"All",
    stockIn:"In Stock",
    stockPre:"Pre-order",
    waitTwoWeeks:"Waiting period: 2 weeks",
    colorFilterTitle:"Shop by color",
    clearColorBtn:"Clear",
    categoryFilterTitle:"Categories",
    howEyebrow:"HOW TO ORDER",
    howTitle:"Three easy steps",
    step1Title:"Choose",
    step1Text:"Select product, power and quantity.",
    step2Title:"Add to bag",
    step2Text:"Review your order and total.",
    step3Title:"WhatsApp us",
    step3Text:"Send the prepared order message instantly.",
    emptyTitle:"No products found",
    emptyText:"Try another search, color or category.",
    yourOrderLabel:"YOUR ORDER",
    shoppingBagTitle:"Shopping bag",
    subtotalLabel:"Subtotal",
    deliveryInstruction:"Please add your delivery details before ordering.",
    fullNameLabel:"Full Name *",
    phoneLabel:"Phone Number *",
    emirateLabel:"Emirate *",
    areaLabel:"Area / Community *",
    buildingLabel:"Building / Villa *",
    streetLabel:"Street / Apartment",
    landmarkLabel:"Landmark",
    notesLabel:"Delivery Notes",
    whatsappBtnText:"Order via WhatsApp",
    continueShoppingText:"Continue shopping",
    powerLabel:"Power",
    quantityLabel:"Quantity",
    addToCartText:"Add to bag",
    footerTagline:"Fashion lenses & beauty finds.",
    selectEmirateOption:"Select emirate",
    addressError:"Please complete all required (*) delivery fields.",
    searchPlaceholder:"Search products…",
    namePlaceholder:"Your full name",
    phonePlaceholder:"05X XXX XXXX",
    areaPlaceholder:"e.g. Muwaileh, Al Nahda",
    buildingPlaceholder:"Building name / Villa no.",
    streetPlaceholder:"Street, apartment or room no.",
    landmarkPlaceholder:"Nearby landmark",
    notesPlaceholder:"Any special delivery instructions",
    sortFeatured:"Featured",
    sortLow:"Price: low to high",
    sortHigh:"Price: high to low",
    sortName:"Name: A–Z",
    categoryAll:"All",
    categoryLenses:"Contact Lenses",
    categoryAccessories:"Lens Accessories",
    categoryBeauty:"Beauty",
    bagItems:n=>`Items in your bag (${n})`,
    cartEmpty:"Your bag is empty.",
    added:"Added to bag — tap Bag to review",
    badgeBest:"Best Seller",
    badgeStock:"In Stock",
    badgeNew:"New Arrival",
    badgePower:"Power Lens",
    badgeDaily:"Daily"
  },
  mm:{
    annDelivery:"UAE အတွင်း ပို့ဆောင်ပေးသည်",
    annCod:"ပစ္စည်းရောက်ငွေချေ",
    annWhatsapp:"WhatsApp မှ မှာယူနိုင်သည်",
    heroEyebrow:"နေ့စဉ်အလှအပအတွက် လွယ်ကူစွာရွေးချယ်ပါ",
    heroTitle:"Thai Fashion Lens မှ<br>နွေးထွေးစွာ ကြိုဆိုပါ၏",
    heroText:"နေ့စဉ်လှပတဲ့စတိုင်အတွက် Fashion Contact Lenses များကို အရောင်၊ Power နဲ့ Collection အလိုက် လွယ်ကူစွာရွေးချယ်နိုင်ပါတယ်။",
    shopLatest:"အသစ်ရောက်ပစ္စည်းများ ကြည့်ရန်",
    benefit1Title:"UAE အတွင်း မြန်ဆန်စွာ ပို့ဆောင်ပေးသည်",
    benefit1Text:"WhatsApp ကနေ လွယ်ကူစွာ မှာယူနိုင်ပါတယ်",
    benefit2Title:"Power ရွေးချယ်နိုင်သည်",
    benefit2Text:"Bag ထဲမထည့်ခင် လိုအပ်တဲ့ Power ကို ရွေးနိုင်ပါတယ်",
    benefit3Title:"လွယ်ကူတဲ့ အကူအညီ",
    benefit3Text:"မမှာယူခင် WhatsApp ကနေ မေးမြန်းနိုင်ပါတယ်",
    shopEyebrow:"ဆိုင်",
    latestProductsTitle:"နောက်ဆုံးရောက် ပစ္စည်းများ",
    productsWord:"ပစ္စည်း",
    stockFilterTitle:"ပစ္စည်းအခြေအနေ",
    clearStockBtn:"ရှင်းမည်",
    stockAll:"အားလုံး",
    stockIn:"ပစ္စည်းအသင့်ရှိ",
    stockPre:"ကြိုတင်မှာယူ",
    waitTwoWeeks:"စောင့်ဆိုင်းချိန် ၂ ပတ်",
    colorFilterTitle:"အရောင်အလိုက် ရွေးရန်",
    clearColorBtn:"ရှင်းမည်",
    categoryFilterTitle:"အမျိုးအစားများ",
    howEyebrow:"မှာယူနည်း",
    howTitle:"လွယ်ကူတဲ့ အဆင့် ၃ ဆင့်",
    step1Title:"ရွေးချယ်ပါ",
    step1Text:"ပစ္စည်း၊ Power နဲ့ အရေအတွက်ကို ရွေးပါ။",
    step2Title:"Bag ထဲထည့်ပါ",
    step2Text:"သင့်အော်ဒါနဲ့ စုစုပေါင်းကို စစ်ဆေးပါ။",
    step3Title:"WhatsApp မှ မှာယူပါ",
    step3Text:"ပြင်ဆင်ပြီးသား Order Message ကို ချက်ချင်းပို့နိုင်ပါတယ်။",
    emptyTitle:"ပစ္စည်း မတွေ့ပါ",
    emptyText:"အခြားအရောင်၊ အမျိုးအစား သို့မဟုတ် Search စာသားနဲ့ ပြန်ရှာကြည့်ပါ။",
    yourOrderLabel:"သင့်အော်ဒါ",
    shoppingBagTitle:"ဈေးဝယ်အိတ်",
    subtotalLabel:"ပစ္စည်းစုစုပေါင်း",
    deliveryInstruction:"မှာယူရန်အတွက် ပို့ဆောင်ရမည့်လိပ်စာကို ဖြည့်ပေးပါ။",
    fullNameLabel:"အမည်အပြည့်အစုံ *",
    phoneLabel:"ဖုန်းနံပါတ် *",
    emirateLabel:"Emirate *",
    areaLabel:"Area / Community *",
    buildingLabel:"Building / Villa *",
    streetLabel:"Street / Apartment",
    landmarkLabel:"အနီးအနား Landmark",
    notesLabel:"ပို့ဆောင်မှု မှတ်ချက်",
    whatsappBtnText:"WhatsApp မှ မှာယူမည်",
    continueShoppingText:"ပစ္စည်းဆက်ရွေးမည်",
    powerLabel:"Power",
    quantityLabel:"အရေအတွက်",
    addToCartText:"Bag ထဲထည့်မည်",
    footerTagline:"Fashion lenses နဲ့ Beauty ပစ္စည်းများ",
    selectEmirateOption:"Emirate ရွေးပါ",
    addressError:"လိုအပ်သော (*) လိပ်စာအချက်အလက်များကို အပြည့်အစုံဖြည့်ပါ။",
    searchPlaceholder:"ပစ္စည်းရှာရန်…",
    namePlaceholder:"အမည်အပြည့်အစုံ",
    phonePlaceholder:"05X XXX XXXX",
    areaPlaceholder:"ဥပမာ - Muwaileh, Al Nahda",
    buildingPlaceholder:"Building name / Villa no.",
    streetPlaceholder:"Street, apartment or room no.",
    landmarkPlaceholder:"အနီးအနား Landmark",
    notesPlaceholder:"ပို့ဆောင်မှုအတွက် မှတ်ချက်ရှိပါက ရေးပါ",
    sortFeatured:"အထူးရွေးချယ်ထားသော",
    sortLow:"ဈေးနည်းမှ များသို့",
    sortHigh:"ဈေးများမှ နည်းသို့",
    sortName:"အမည် A–Z",
    categoryAll:"အားလုံး",
    categoryLenses:"မျက်ကပ်မှန်များ",
    categoryAccessories:"မျက်ကပ်မှန် အပိုပစ္စည်းများ",
    categoryBeauty:"အလှကုန်",
    bagItems:n=>`Bag ထဲရှိ ပစ္စည်း (${n})`,
    cartEmpty:"သင့် Bag ထဲမှာ ပစ္စည်းမရှိသေးပါ။",
    added:"Bag ထဲထည့်ပြီးပါပြီ — Bag ကိုနှိပ်ပြီး စစ်နိုင်ပါတယ်",
    badgeBest:"အရောင်းရဆုံး",
    badgeStock:"ပစ္စည်းရှိ",
    badgeNew:"အသစ်ရောက်",
    badgePower:"Power Lens",
    badgeDaily:"နေ့စဉ်သုံး"
  }
};

let siteLang = localStorage.getItem("tfl_language") || "en";

function tr(){ return i18n[siteLang] || i18n.en; }

function localizedCategory(raw){
  const t=tr();
  if(raw==="All") return t.categoryAll;
  if(raw==="Contact Lenses") return t.categoryLenses;
  if(raw==="Accessories") return t.categoryAccessories;
  if(raw==="Beauty") return t.categoryBeauty;
  return raw;
}

function localizedBadge(raw){
  const t=tr();
  const map={
    "Best Seller":t.badgeBest,
    "In Stock":t.badgeStock,
    "New Arrival":t.badgeNew,
    "Power Lens":t.badgePower,
    "Daily":t.badgeDaily,
    "Pre-order":t.stockPre
  };
  return map[raw] || raw;
}


function renderStockFilters(){
  const t=tr();
  const defs=[
    {key:"all",label:t.stockAll},
    {key:"instock",label:t.stockIn},
    {key:"preorder",label:t.stockPre}
  ];
  const wrap=document.getElementById("stockFilters");
  if(!wrap) return;
  wrap.innerHTML=defs.map(s=>`
    <button type="button" class="stock-chip ${currentStock===s.key?"active":""}" data-stock="${s.key}">
      ${s.label}
    </button>`).join("");
  wrap.querySelectorAll(".stock-chip").forEach(btn=>{
    btn.addEventListener("click",()=>{
      currentStock=btn.dataset.stock;
      renderStockFilters();
      renderProducts();
    });
  });
}

function renderColorFilters(){
  const labels = siteLang==="mm" ? "mm" : "en";
  const wrap=document.getElementById("colorFilters");
  if(!wrap) return;
  wrap.innerHTML=colorDefs.map(c=>`
    <button type="button" class="color-chip ${currentColor===c.key?"active":""}" data-color="${c.key}">
      <span class="color-dot"></span>
      <span>${c[labels]}</span>
    </button>
  `).join("");
  wrap.querySelectorAll(".color-chip").forEach(btn=>{
    btn.addEventListener("click",()=>{
      currentColor=btn.dataset.color;
      renderColorFilters();
      renderProducts();
    });
  });
}

function renderCategories(){
  const cats=categories();
  categoryFilters.innerHTML=cats.map(c=>`
    <button class="category-chip ${c===currentCategory?"active":""}" data-category="${c}">
      ${localizedCategory(c)}
    </button>`).join("");
  categoryFilters.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
    currentCategory=b.dataset.category;
    renderCategories();
    renderProducts();
  }));
}

function setSiteLanguage(lang){
  siteLang = lang==="mm" ? "mm" : "en";
  localStorage.setItem("tfl_language",siteLang);
  document.documentElement.lang = siteLang==="mm" ? "my" : "en";
  const t=tr();

  const ids=[
    "annDelivery","annCod","annWhatsapp","heroEyebrow","heroTitle","heroText","shopLatest",
    "benefit1Title","benefit1Text","benefit2Title","benefit2Text","benefit3Title","benefit3Text",
    "shopEyebrow","latestProductsTitle","productsWord","stockFilterTitle","clearStockBtn","colorFilterTitle","clearColorBtn","categoryFilterTitle",
    "howEyebrow","howTitle","step1Title","step1Text","step2Title","step2Text","step3Title","step3Text",
    "emptyTitle","emptyText","yourOrderLabel","shoppingBagTitle","subtotalLabel","deliveryInstruction",
    "fullNameLabel","phoneLabel","emirateLabel","areaLabel","buildingLabel","streetLabel","landmarkLabel",
    "notesLabel","whatsappBtnText","continueShoppingText","powerLabel","quantityLabel","addToCartText",
    "footerTagline","selectEmirateOption","addressError","sortFeatured","sortLow","sortHigh","sortName"
  ];

  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el && t[id]!==undefined) el.innerHTML=t[id];
  });

  const ph={
    searchInput:t.searchPlaceholder,
    customerName:t.namePlaceholder,
    customerPhone:t.phonePlaceholder,
    customerArea:t.areaPlaceholder,
    customerBuilding:t.buildingPlaceholder,
    customerStreet:t.streetPlaceholder,
    customerLandmark:t.landmarkPlaceholder,
    customerNotes:t.notesPlaceholder
  };
  Object.entries(ph).forEach(([id,val])=>{
    const el=document.getElementById(id);
    if(el) el.placeholder=val;
  });

  const ce=document.getElementById("cartEmpty");
  if(ce){
    const p=ce.querySelector("p");
    if(p) p.textContent=t.cartEmpty;
  }

  document.querySelectorAll(".lang-btn").forEach(btn=>{
    btn.classList.toggle("active",btn.dataset.lang===siteLang);
  });

  renderStockFilters();
  renderColorFilters();
  renderCategories();
  renderProducts();
  renderCart();
}

document.querySelectorAll(".lang-btn").forEach(btn=>{
  btn.addEventListener("click",()=>setSiteLanguage(btn.dataset.lang));
});


const clearStockBtn=document.getElementById("clearStockBtn");
if(clearStockBtn){
  clearStockBtn.addEventListener("click",()=>{
    currentStock="all";
    renderStockFilters();
    renderProducts();
  });
}

const clearColorBtn=document.getElementById("clearColorBtn");
if(clearColorBtn){
  clearColorBtn.addEventListener("click",()=>{
    currentColor="all";
    renderColorFilters();
    renderProducts();
  });
}




setSiteLanguage(siteLang);
