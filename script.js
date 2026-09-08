const WHATSAPP_NUMBER = "971544608059";

let products = [];

/*
  DEFAULT CATEGORY:
  Website opens directly on Contact Lenses.
*/
let currentCategory = "Contact Lenses";
let currentColor = "all";

let cart = JSON.parse(
  localStorage.getItem("tfl_cart") || "[]"
);

let selectedProduct = null;

let firebaseHasMore = false;
let firebaseLoading = false;

const $ = s => document.querySelector(s);

const productGrid = $("#productGrid");
const categoryFilters = $("#categoryFilters");
const searchInput = $("#searchInput");
const sortSelect = $("#sortSelect");


function money(n){
  return `AED ${Number(n).toFixed(0)}`;
}


/* =========================================
   CATEGORIES
   NO "ALL" CATEGORY
========================================= */

function categories(){
  return [
    "Contact Lenses",
    "Accessories",
    "Beauty"
  ];
}


/* =========================================
   COLOR DEFINITIONS
========================================= */

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


/* =========================================
   LANGUAGE
========================================= */

const i18n = {
  en:{
    annDelivery:"UAE Delivery",
    annCod:"Cash on Delivery",
    annWhatsapp:"Order via WhatsApp",

    heroEyebrow:"EVERYDAY BEAUTY, MADE EASY",
    heroTitle:"Your look.<br>Your lenses.",
    heroText:"Fashion contact lenses selected for effortless everyday style. Shop by color, power and collection.",
    shopLatest:"Shop latest",

    shopEyebrow:"SHOP",
    latestProductsTitle:"Latest products",
    productsWord:"products",

    colorFilterTitle:"Shop by color",
    clearColorBtn:"Clear",
    categoryFilterTitle:"Categories",

    stockIn:"In Stock",
    stockPre:"Pre-order",
    stockOut:"Out of Stock",
    waitTwoWeeks:"Waiting period: 2 weeks",

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

    categoryLenses:"Contact Lenses",
    categoryAccessories:"Lens Accessories",
    categoryBeauty:"Beauty",

    bagItems:n=>`Items in your bag (${n})`,
    cartEmpty:"Your bag is empty.",
    added:"Added to bag — tap Bag to review",

    loadMore:"Load More",
    loading:"Loading..."
  },

  mm:{
    annDelivery:"UAE အတွင်း ပို့ဆောင်ပေးသည်",
    annCod:"ပစ္စည်းရောက်ငွေချေ",
    annWhatsapp:"WhatsApp မှ မှာယူနိုင်သည်",

    heroEyebrow:"နေ့စဉ်အလှအပအတွက် လွယ်ကူစွာရွေးချယ်ပါ",
    heroTitle:"Thai Fashion Lens မှ<br>နွေးထွေးစွာ ကြိုဆိုပါ၏",
    heroText:"နေ့စဉ်လှပတဲ့စတိုင်အတွက် Fashion Contact Lenses များကို အရောင်၊ Power နဲ့ Collection အလိုက် လွယ်ကူစွာရွေးချယ်နိုင်ပါတယ်။",
    shopLatest:"အသစ်ရောက်ပစ္စည်းများ ကြည့်ရန်",

    shopEyebrow:"ဆိုင်",
    latestProductsTitle:"နောက်ဆုံးရောက် ပစ္စည်းများ",
    productsWord:"ပစ္စည်း",

    colorFilterTitle:"အရောင်အလိုက် ရွေးရန်",
    clearColorBtn:"ရှင်းမည်",
    categoryFilterTitle:"အမျိုးအစားများ",

    stockIn:"ပစ္စည်းအသင့်ရှိ",
    stockPre:"ကြိုတင်မှာယူ",
    stockOut:"ပစ္စည်းကုန်",
    waitTwoWeeks:"စောင့်ဆိုင်းချိန် ၂ ပတ်",

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

    categoryLenses:"မျက်ကပ်မှန်များ",
    categoryAccessories:"မျက်ကပ်မှန် အပိုပစ္စည်းများ",
    categoryBeauty:"အလှကုန်",

    bagItems:n=>`Bag ထဲရှိ ပစ္စည်း (${n})`,
    cartEmpty:"သင့် Bag ထဲမှာ ပစ္စည်းမရှိသေးပါ။",
    added:"Bag ထဲထည့်ပြီးပါပြီ — Bag ကိုနှိပ်ပြီး စစ်နိုင်ပါတယ်",

    loadMore:"နောက်ထပ်ကြည့်ရန်",
    loading:"ဖွင့်နေသည်..."
  }
};


let siteLang =
  localStorage.getItem("tfl_language") || "en";


function tr(){
  return i18n[siteLang] || i18n.en;
}


function localizedCategory(raw){
  const t = tr();

  if(raw === "Contact Lenses") return t.categoryLenses;
  if(raw === "Accessories") return t.categoryAccessories;
  if(raw === "Beauty") return t.categoryBeauty;

  return raw;
}


/* =========================================
   SEARCH + SORT
   Search currently works on loaded products.
========================================= */

function filteredProducts(){
  const q =
    searchInput.value
      .trim()
      .toLowerCase();

  let list =
    products.filter(p =>
      (p.name || "")
        .toLowerCase()
        .includes(q)
    );

  const sort =
    sortSelect.value;

  if(sort === "low"){
    list.sort((a,b)=>a.price-b.price);
  }

  if(sort === "high"){
    list.sort((a,b)=>b.price-a.price);
  }

  if(sort === "name"){
    list.sort(
      (a,b)=>
        (a.name || "")
          .localeCompare(b.name || "")
    );
  }

  return list;
}


/* =========================================
   FIRESTORE FILTER BRIDGE
   ONLY CATEGORY + COLOR
========================================= */

function sendFiltersToFirebase(){
  if(
    typeof window.setFirebaseProductFilters !==
    "function"
  ){
    return;
  }

  window.setFirebaseProductFilters({
    category: currentCategory,
    color:
      currentCategory === "Contact Lenses"
        ? currentColor
        : "all"
  });
}


/* =========================================
   CATEGORY FILTER
========================================= */

function renderCategories(){
  categoryFilters.innerHTML =
    categories()
      .map(category => `
        <button
          type="button"
          class="category-chip ${
            currentCategory === category
              ? "active"
              : ""
          }"
          data-category="${category}"
        >
          ${localizedCategory(category)}
        </button>
      `)
      .join("");

  categoryFilters
    .querySelectorAll(".category-chip")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        ()=>{

          currentCategory =
            btn.dataset.category;

          /*
            Colors only belong to Contact Lenses.
            Reset color when user opens another category.
          */
          if(currentCategory !== "Contact Lenses"){
            currentColor = "all";
          }

          renderCategories();
          renderColorArea();
          sendFiltersToFirebase();
        }
      );

    });
}


/* =========================================
   COLOR FILTER
   ONLY VISIBLE FOR CONTACT LENSES
========================================= */

function renderColorFilters(){
  const labels =
    siteLang === "mm"
      ? "mm"
      : "en";

  const wrap =
    $("#colorFilters");

  if(!wrap) return;

  wrap.innerHTML =
    colorDefs
      .map(c => `
        <button
          type="button"
          class="color-chip ${
            currentColor === c.key
              ? "active"
              : ""
          }"
          data-color="${c.key}"
        >
          <span class="color-dot"></span>
          <span>${c[labels]}</span>
        </button>
      `)
      .join("");

  wrap
    .querySelectorAll(".color-chip")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        ()=>{

          currentColor =
            btn.dataset.color;

          renderColorFilters();
          sendFiltersToFirebase();
        }
      );

    });
}


function renderColorArea(){
  const block =
    $("#colorFilterBlock");

  if(!block) return;

  const showColors =
    currentCategory === "Contact Lenses";

  block.classList.toggle(
    "hidden",
    !showColors
  );

  if(showColors){
    renderColorFilters();
  }
}


/* =========================================
   PRODUCT GRID
   ONE STOCK STATUS ONLY:
   TOP-RIGHT CORNER
========================================= */

function renderProducts(){
  const list =
    filteredProducts();

  $("#resultCount").textContent =
    list.length;

  $("#emptyState")
    .classList
    .toggle(
      "hidden",
      list.length > 0 ||
      firebaseLoading
    );

  productGrid.innerHTML =
    list.map(p => {

      const isPreorder =
        p.stockStatus === "preorder";

      const isOut =
        p.stockStatus === "outofstock";

      const stockText =
        isPreorder
          ? tr().stockPre
          : isOut
            ? tr().stockOut
            : tr().stockIn;

      const stockClass =
        isPreorder
          ? "preorder"
          : isOut
            ? "outofstock"
            : "";

      return `
        <article
          class="product-card"
          data-id="${p.id}"
        >

          <div
            class="product-image ${
              p.type || ""
            } ${
              p.image
                ? "has-real-image"
                : ""
            }"
            style="--iris:${p.color}"
          >

            ${
              p.image
                ? `
                  <img
                    src="${p.image}"
                    alt="${p.name}"
                    class="real-product-image"
                    loading="lazy"
                  >
                `
                : ""
            }

            <!-- ONLY ONE STATUS LABEL -->
            <span class="stock-status ${stockClass}">
              ${stockText}
            </span>

            <button
              class="quick-add"
              aria-label="View ${p.name}"
              data-id="${p.id}"
            >
              +
            </button>

          </div>

          <div class="product-info">

            <div class="product-category">
              ${localizedCategory(p.category)}
            </div>

            <div class="product-title">
              ${
                siteLang === "mm" &&
                p.nameMM
                  ? p.nameMM
                  : p.name
              }
            </div>

            <div class="product-price">
              ${money(p.price)}
            </div>

            ${
              isPreorder
                ? `
                  <div class="preorder-note">
                    ${
                      siteLang === "mm"
                        ? tr().waitTwoWeeks
                        : `Waiting period: ${
                            p.waitingPeriod ||
                            "2 weeks"
                          }`
                    }
                  </div>
                `
                : ""
            }

          </div>

        </article>
      `;

    }).join("");

  productGrid
    .querySelectorAll(".product-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        ()=>openProduct(
          card.dataset.id
        )
      );

    });

  updateLoadMoreButton();
}


/* =========================================
   PRODUCT MODAL
========================================= */

function openProduct(id){
  selectedProduct =
    products.find(
      p =>
        String(p.id) ===
        String(id)
    );

  if(!selectedProduct) return;

  const isPreorder =
    selectedProduct.stockStatus === "preorder";

  const isOut =
    selectedProduct.stockStatus === "outofstock";

  $("#modalName").textContent =
    (
      siteLang === "mm" &&
      selectedProduct.nameMM
    )
      ? selectedProduct.nameMM
      : selectedProduct.name;

  $("#modalCategory").textContent =
    localizedCategory(
      selectedProduct.category
    );

  $("#modalPrice").textContent =
    money(
      selectedProduct.price
    );

  const stockText =
    isPreorder
      ? tr().stockPre
      : isOut
        ? tr().stockOut
        : tr().stockIn;

  const stockClass =
    isPreorder
      ? "preorder"
      : isOut
        ? "outofstock"
        : "";

  const waitLabel =
    siteLang === "mm"
      ? tr().waitTwoWeeks
      : `Waiting period: ${
          selectedProduct.waitingPeriod ||
          "2 weeks"
        }`;

  const waitText =
    isPreorder
      ? `
        <span class="modal-waiting">
          ${waitLabel}
        </span>
      `
      : "";

  $("#modalStockInfo").innerHTML = `
    <span class="modal-stock-pill ${stockClass}">
      ${stockText}
    </span>
    ${waitText}
  `;

  $("#modalDescription").textContent =
    (
      siteLang === "mm" &&
      selectedProduct.descMM
    )
      ? selectedProduct.descMM
      : selectedProduct.desc;

  $("#modalImage")
    .style
    .setProperty(
      "--iris",
      selectedProduct.color
    );

  $("#modalImage")
    .classList
    .toggle(
      "has-real-image",
      !!selectedProduct.image
    );

  $("#modalImage").innerHTML =
    selectedProduct.image
      ? `
        <img
          src="${selectedProduct.image}"
          alt="${selectedProduct.name}"
          class="modal-real-image"
        >
      `
      : "";

  $("#powerWrap")
    .classList
    .toggle(
      "hidden",
      !selectedProduct.powers
    );

  if(selectedProduct.powers){
    $("#powerSelect").innerHTML =
      selectedProduct.powers
        .map(
          x =>
            `<option value="${x}">${x}</option>`
        )
        .join("");
  }

  $("#qtyInput").value = 1;

  const addBtn =
    $("#addToCartBtn");

  addBtn.disabled =
    isOut;

  $("#addToCartText").textContent =
    isOut
      ? tr().stockOut
      : tr().addToCartText;

  $("#productModal")
    .classList
    .remove("hidden");

  document.body.style.overflow =
    "hidden";
}


function closeModal(){
  $("#productModal")
    .classList
    .add("hidden");

  document.body.style.overflow =
    "";
}


/* =========================================
   CART
========================================= */

function addToCart(){
  if(
    !selectedProduct ||
    selectedProduct.stockStatus === "outofstock"
  ){
    return;
  }

  const qty =
    Math.max(
      1,
      parseInt(
        $("#qtyInput").value
      ) || 1
    );

  const power =
    selectedProduct.powers
      ? $("#powerSelect").value
      : null;

  const key =
    `${selectedProduct.id}-${power || "na"}`;

  const existing =
    cart.find(
      x => x.key === key
    );

  if(existing){
    existing.qty += qty;
  }else{
    cart.push({
      key,
      id:selectedProduct.id,
      name:selectedProduct.name,
      price:selectedProduct.price,
      qty,
      power,
      color:selectedProduct.color,
      image:selectedProduct.image || null
    });
  }

  saveCart();
  closeModal();
  showToast(
    tr().added
  );
}


function saveCart(){
  localStorage.setItem(
    "tfl_cart",
    JSON.stringify(cart)
  );

  renderCart();
}


function renderCart(){
  $("#cartCount").textContent =
    cart.reduce(
      (a,x)=>a+x.qty,
      0
    );

  $("#cartEmpty")
    .classList
    .toggle(
      "hidden",
      cart.length > 0
    );

  $("#cartSummary")
    .classList
    .toggle(
      "hidden",
      cart.length === 0
    );

  const itemCount =
    cart.reduce(
      (a,x)=>a+x.qty,
      0
    );

  $("#cartItems").innerHTML =
    (
      cart.length
        ? `
          <div class="bag-items-label">
            ${tr().bagItems(itemCount)}
          </div>
        `
        : ""
    )
    +
    cart.map((x,i)=>{

      const product =
        products.find(
          p =>
            String(p.id) ===
            String(x.id)
        );

      const cartImage =
        x.image ||
        (
          product &&
          product.image
        ) ||
        null;

      return `
        <div class="cart-item">

          <div
            class="cart-thumb ${
              cartImage
                ? "has-cart-image"
                : ""
            }"
            style="--iris:${x.color}"
          >

            ${
              cartImage
                ? `
                  <img
                    src="${cartImage}"
                    alt="${x.name}"
                    class="cart-real-image"
                  >
                `
                : ""
            }

          </div>

          <div class="cart-item-main">

            <h4>${x.name}</h4>

            <div class="cart-meta">

              ${
                x.power
                  ? `<span>Power ${x.power}</span>`
                  : ""
              }

              <span>
                ${
                  siteLang === "mm"
                    ? "အရေအတွက်"
                    : "Qty"
                }
                ${x.qty}
              </span>

            </div>

            <div class="cart-item-bottom">

              <strong>
                ${money(x.price*x.qty)}
              </strong>

              <button
                class="remove-item"
                data-i="${i}"
              >
                ${
                  siteLang === "mm"
                    ? "ဖယ်မည်"
                    : "Remove"
                }
              </button>

            </div>

          </div>

        </div>
      `;

    }).join("");

  $("#cartItems")
    .querySelectorAll(".remove-item")
    .forEach(b=>{

      b.addEventListener(
        "click",
        ()=>{

          cart.splice(
            Number(b.dataset.i),
            1
          );

          saveCart();
        }
      );

    });

  $("#cartSubtotal").textContent =
    money(
      cart.reduce(
        (a,x)=>
          a + x.price*x.qty,
        0
      )
    );
}


/* =========================================
   CART DRAWER
========================================= */

function openCart(){
  $("#cartDrawer")
    .classList
    .add("open");

  $("#drawerBackdrop")
    .classList
    .remove("hidden");

  $("#cartDrawer")
    .setAttribute(
      "aria-hidden",
      "false"
    );

  document.body.style.overflow =
    "hidden";
}


function closeCart(){
  $("#cartDrawer")
    .classList
    .remove("open");

  $("#drawerBackdrop")
    .classList
    .add("hidden");

  $("#cartDrawer")
    .setAttribute(
      "aria-hidden",
      "true"
    );

  document.body.style.overflow =
    "";
}


function showToast(
  message="Added to bag"
){
  $("#toast").textContent =
    message;

  $("#toast")
    .classList
    .remove("hidden");

  setTimeout(
    ()=>
      $("#toast")
        .classList
        .add("hidden"),
    1800
  );
}


/* =========================================
   WHATSAPP ORDER
========================================= */

function orderWhatsApp(){
  if(!cart.length) return;

  const name =
    $("#customerName").value.trim();

  const phone =
    $("#customerPhone").value.trim();

  const emirate =
    $("#customerEmirate").value.trim();

  const area =
    $("#customerArea").value.trim();

  const building =
    $("#customerBuilding").value.trim();

  const street =
    $("#customerStreet").value.trim();

  const landmark =
    $("#customerLandmark").value.trim();

  const notes =
    $("#customerNotes").value.trim();

  const requiredMissing =
    !name ||
    !phone ||
    !emirate ||
    !area ||
    !building;

  $("#addressError")
    .classList
    .toggle(
      "hidden",
      !requiredMissing
    );

  if(requiredMissing){

    const firstMissing =
      !name
        ? $("#customerName")
        : !phone
          ? $("#customerPhone")
          : !emirate
            ? $("#customerEmirate")
            : !area
              ? $("#customerArea")
              : $("#customerBuilding");

    firstMissing.focus();

    return;
  }

  const lines =
    cart.map(
      (x,i)=>
        `${i+1}. ${x.name}` +
        `${
          x.power
            ? ` | Power ${x.power}`
            : ""
        }` +
        ` | Qty ${x.qty}` +
        ` | ${money(x.price*x.qty)}`
    );

  const total =
    money(
      cart.reduce(
        (a,x)=>
          a + x.price*x.qty,
        0
      )
    );

  const addressLines = [
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Emirate: ${emirate}`,
    `Area / Community: ${area}`,
    `Building / Villa: ${building}`,
    street
      ? `Street / Apartment: ${street}`
      : "",
    landmark
      ? `Landmark: ${landmark}`
      : "",
    notes
      ? `Delivery Notes: ${notes}`
      : ""
  ].filter(Boolean);

  const message =
    `Hi Thai Fashion Lenses UAE! I would like to order:\n\n` +
    `${lines.join("\n")}` +
    `\n\nSubtotal: ${total}` +
    `\n\nDELIVERY DETAILS\n` +
    `${addressLines.join("\n")}` +
    `\n\nPlease confirm delivery fee and final total.`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}


/* =========================================
   LOAD MORE
========================================= */

function updateLoadMoreButton(){
  const wrap =
    $("#loadMoreWrap");

  const btn =
    $("#loadMoreBtn");

  const text =
    $("#loadMoreText");

  const info =
    $("#loadMoreInfo");

  if(
    !wrap ||
    !btn ||
    !text
  ){
    return;
  }

  if(
    firebaseHasMore ||
    firebaseLoading
  ){
    wrap.classList.remove(
      "hidden"
    );
  }else{
    wrap.classList.add(
      "hidden"
    );
  }

  btn.disabled =
    firebaseLoading;

  text.textContent =
    firebaseLoading
      ? tr().loading
      : tr().loadMore;

  if(info){
    info.textContent =
      `${products.length} ${
        siteLang === "mm"
          ? "ပစ္စည်း ဖွင့်ထားသည်"
          : "products loaded"
      }`;
  }
}


window.setFirebaseHasMore =
  function(hasMore){
    firebaseHasMore =
      Boolean(hasMore);

    updateLoadMoreButton();
  };


window.setFirebaseLoading =
  function(isLoading){
    firebaseLoading =
      Boolean(isLoading);

    renderProducts();
    updateLoadMoreButton();
  };


const loadMoreBtn =
  $("#loadMoreBtn");

if(loadMoreBtn){
  loadMoreBtn.addEventListener(
    "click",
    ()=>{

      if(
        firebaseLoading ||
        !firebaseHasMore
      ){
        return;
      }

      if(
        typeof window.loadMoreFirebaseProducts ===
        "function"
      ){
        window.loadMoreFirebaseProducts();
      }
    }
  );
}


/* =========================================
   LANGUAGE SWITCH
========================================= */

function setSiteLanguage(lang){
  siteLang =
    lang === "mm"
      ? "mm"
      : "en";

  localStorage.setItem(
    "tfl_language",
    siteLang
  );

  document.documentElement.lang =
    siteLang === "mm"
      ? "my"
      : "en";

  const t = tr();

  const ids = [
    "annDelivery",
    "annCod",
    "annWhatsapp",
    "heroEyebrow",
    "heroTitle",
    "heroText",
    "shopLatest",
    "shopEyebrow",
    "latestProductsTitle",
    "productsWord",
    "colorFilterTitle",
    "clearColorBtn",
    "categoryFilterTitle",
    "howEyebrow",
    "howTitle",
    "step1Title",
    "step1Text",
    "step2Title",
    "step2Text",
    "step3Title",
    "step3Text",
    "emptyTitle",
    "emptyText",
    "yourOrderLabel",
    "shoppingBagTitle",
    "subtotalLabel",
    "deliveryInstruction",
    "fullNameLabel",
    "phoneLabel",
    "emirateLabel",
    "areaLabel",
    "buildingLabel",
    "streetLabel",
    "landmarkLabel",
    "notesLabel",
    "whatsappBtnText",
    "continueShoppingText",
    "powerLabel",
    "quantityLabel",
    "addToCartText",
    "footerTagline",
    "selectEmirateOption",
    "addressError",
    "sortFeatured",
    "sortLow",
    "sortHigh",
    "sortName"
  ];

  ids.forEach(id=>{
    const el =
      document.getElementById(id);

    if(
      el &&
      t[id] !== undefined
    ){
      el.innerHTML =
        t[id];
    }
  });

  const placeholders = {
    searchInput:t.searchPlaceholder,
    customerName:t.namePlaceholder,
    customerPhone:t.phonePlaceholder,
    customerArea:t.areaPlaceholder,
    customerBuilding:t.buildingPlaceholder,
    customerStreet:t.streetPlaceholder,
    customerLandmark:t.landmarkPlaceholder,
    customerNotes:t.notesPlaceholder
  };

  Object.entries(placeholders)
    .forEach(([id,value])=>{
      const el =
        document.getElementById(id);

      if(el){
        el.placeholder =
          value;
      }
    });

  document
    .querySelectorAll(".lang-btn")
    .forEach(btn=>{
      btn.classList.toggle(
        "active",
        btn.dataset.lang ===
          siteLang
      );
    });

  renderCategories();
  renderColorArea();
  renderProducts();
  renderCart();
  updateLoadMoreButton();
}


/* =========================================
   EVENTS
========================================= */

document
  .querySelectorAll(".lang-btn")
  .forEach(btn=>{
    btn.addEventListener(
      "click",
      ()=>setSiteLanguage(
        btn.dataset.lang
      )
    );
  });


searchInput.addEventListener(
  "input",
  renderProducts
);


sortSelect.addEventListener(
  "change",
  renderProducts
);


$("#searchFocusBtn")
  .addEventListener(
    "click",
    ()=>{
      location.hash =
        "shop";

      setTimeout(
        ()=>searchInput.focus(),
        300
      );
    }
  );


$("#openCartBtn")
  .addEventListener(
    "click",
    openCart
  );


$("#closeCartBtn")
  .addEventListener(
    "click",
    closeCart
  );


$("#drawerBackdrop")
  .addEventListener(
    "click",
    closeCart
  );


$("#continueShoppingBtn")
  .addEventListener(
    "click",
    closeCart
  );


$("#whatsappOrderBtn")
  .addEventListener(
    "click",
    orderWhatsApp
  );


$("#addToCartBtn")
  .addEventListener(
    "click",
    addToCart
  );


$("#qtyMinus")
  .addEventListener(
    "click",
    ()=>{
      $("#qtyInput").value =
        Math.max(
          1,
          (
            parseInt(
              $("#qtyInput").value
            ) || 1
          ) - 1
        );
    }
  );


$("#qtyPlus")
  .addEventListener(
    "click",
    ()=>{
      $("#qtyInput").value =
        (
          parseInt(
            $("#qtyInput").value
          ) || 1
        ) + 1;
    }
  );


document
  .querySelectorAll(
    "[data-close='productModal']"
  )
  .forEach(x=>{
    x.addEventListener(
      "click",
      closeModal
    );
  });


$("#productModal")
  .addEventListener(
    "click",
    e=>{
      if(
        e.target ===
        $("#productModal")
      ){
        closeModal();
      }
    }
  );


document.addEventListener(
  "keydown",
  e=>{
    if(e.key === "Escape"){
      closeModal();
      closeCart();
    }
  }
);


/* =========================================
   CLEAR COLOR
========================================= */

const clearColorBtn =
  $("#clearColorBtn");

if(clearColorBtn){
  clearColorBtn.addEventListener(
    "click",
    ()=>{
      currentColor =
        "all";

      renderColorFilters();
      sendFiltersToFirebase();
    }
  );
}


/* =========================================
   FIREBASE DATA BRIDGE
========================================= */

window.setProductsFromFirebase =
  function(firebaseProducts){

    if(
      !Array.isArray(
        firebaseProducts
      )
    ){
      return;
    }

    products =
      firebaseProducts;

    renderProducts();
    renderCart();
    updateLoadMoreButton();
  };


$("#year").textContent =
  new Date().getFullYear();


/*
  UI starts immediately as Contact Lenses.
  Firebase file also starts with Contact Lenses,
  so there is no flash of another category.
*/
setSiteLanguage(
  siteLang
);
