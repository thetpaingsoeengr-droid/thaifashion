const WHATSAPP_NUMBER = "971544608059";

let products = [];
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

function categories(){
  return ["All", ...new Set(products.map(p=>p.category))];
}

function renderCategories(){
  const cats=categories();

  categoryFilters.innerHTML=cats.map(c=>`
    <button
      class="category-chip ${c===currentCategory?"active":""}"
      data-category="${c}">
      ${localizedCategory(c)}
    </button>
  `).join("");

  categoryFilters.querySelectorAll("button").forEach(b=>{
    b.addEventListener("click",()=>{
      currentCategory=b.dataset.category;
      renderCategories();
      renderProducts();
    });
  });
}

function filteredProducts(){
  const q=searchInput.value.trim().toLowerCase();

  let list=products.filter(p=>
    (currentCategory==="All" || p.category===currentCategory) &&
    (currentColor==="all" || p.colorKey===currentColor) &&
    (currentStock==="all" || p.stockStatus===currentStock) &&
    p.name.toLowerCase().includes(q)
  );

  const s=sortSelect.value;

  if(s==="low") list.sort((a,b)=>a.price-b.price);
  if(s==="high") list.sort((a,b)=>b.price-a.price);
  if(s==="name") list.sort((a,b)=>a.name.localeCompare(b.name));

  return list;
}

function stockLabel(product){
  if(product.stockStatus==="preorder") return tr().stockPre;
  if(product.stockStatus==="outofstock") return tr().stockOut;
  return tr().stockIn;
}

function stockClass(product){
  if(product.stockStatus==="preorder") return "preorder";
  if(product.stockStatus==="outofstock") return "outofstock";
  return "";
}

function renderProducts(){
  const list=filteredProducts();

  $("#resultCount").textContent=list.length;
  $("#emptyState").classList.toggle("hidden",list.length>0);

  productGrid.innerHTML=list.map(p=>`
    <article
      class="product-card ${p.stockStatus==="outofstock"?"product-outofstock":""}"
      data-id="${p.id}">

      <div
        class="product-image ${p.type||""} ${p.image?"has-real-image":""}"
        style="--iris:${p.color}">

        ${p.image
          ? `<img
              src="${p.image}"
              alt="${p.name}"
              class="real-product-image"
              loading="lazy">`
          : ""
        }

        <span class="badge">
          ${localizedBadge(p.badge)}
        </span>

        <span class="stock-status ${stockClass(p)}">
          ${stockLabel(p)}
        </span>

        <button
          class="quick-add"
          aria-label="View ${p.name}"
          data-id="${p.id}">
          +
        </button>

      </div>

      <div class="product-info">

        <div class="product-category">
          ${localizedCategory(p.category)}
        </div>

        <div class="product-title">
          ${siteLang==="mm" && p.nameMM ? p.nameMM : p.name}
        </div>

        <div class="product-price">
          ${money(p.price)}
        </div>

        ${
          p.stockStatus==="preorder"
          ? `<div class="preorder-note">
              ${
                siteLang==="mm"
                  ? tr().waitTwoWeeks
                  : `Waiting period: ${p.waitingPeriod || "2 weeks"}`
              }
            </div>`
          : ""
        }

        ${
          p.stockStatus==="outofstock"
          ? `<div class="outofstock-note">
              ${tr().currentlyUnavailable}
            </div>`
          : ""
        }

      </div>
    </article>
  `).join("");

  productGrid.querySelectorAll(".product-card").forEach(card=>{
    card.addEventListener("click",()=>{
      openProduct(card.dataset.id);
    });
  });
}

function openProduct(id){
  selectedProduct=products.find(
    p=>String(p.id)===String(id)
  );

  if(!selectedProduct) return;

  $("#modalName").textContent=
    siteLang==="mm" && selectedProduct.nameMM
      ? selectedProduct.nameMM
      : selectedProduct.name;

  $("#modalCategory").textContent=
    localizedCategory(selectedProduct.category);

  $("#modalPrice").textContent=
    money(selectedProduct.price);

  const stockText=stockLabel(selectedProduct);

  const waitLabel=
    siteLang==="mm"
      ? tr().waitTwoWeeks
      : `Waiting period: ${selectedProduct.waitingPeriod || "2 weeks"}`;

  const waitText=
    selectedProduct.stockStatus==="preorder"
      ? `<span class="modal-waiting">${waitLabel}</span>`
      : "";

  $("#modalStockInfo").innerHTML=`
    <span class="modal-stock-pill ${stockClass(selectedProduct)}">
      ${stockText}
    </span>
    ${waitText}
  `;

  $("#modalDescription").textContent=
    siteLang==="mm" && selectedProduct.descMM
      ? selectedProduct.descMM
      : selectedProduct.desc;

  $("#modalImage").style.setProperty(
    "--iris",
    selectedProduct.color
  );

  $("#modalImage").classList.toggle(
    "has-real-image",
    !!selectedProduct.image
  );

  $("#modalImage").innerHTML=
    selectedProduct.image
      ? `<img
          src="${selectedProduct.image}"
          alt="${selectedProduct.name}"
          class="modal-real-image">`
      : "";

  $("#powerWrap").classList.toggle(
    "hidden",
    !selectedProduct.powers
  );

  if(selectedProduct.powers){
    $("#powerSelect").innerHTML=
      selectedProduct.powers
        .map(x=>`<option value="${x}">${x}</option>`)
        .join("");
  }

  $("#qtyInput").value=1;

  const isOut=
    selectedProduct.stockStatus==="outofstock";

  $("#qtyMinus").disabled=isOut;
  $("#qtyPlus").disabled=isOut;
  $("#qtyInput").disabled=isOut;
  $("#powerSelect").disabled=isOut;

  const addBtn=$("#addToCartBtn");

  addBtn.disabled=isOut;
  addBtn.classList.toggle("disabled",isOut);

  $("#addToCartText").textContent=
    isOut
      ? tr().stockOut
      : tr().addToCartText;

  $("#productModal").classList.remove("hidden");

  document.body.style.overflow="hidden";
}

function closeModal(){
  $("#productModal").classList.add("hidden");
  document.body.style.overflow="";
}

function addToCart(){
  if(
    !selectedProduct ||
    selectedProduct.stockStatus==="outofstock"
  ){
    return;
  }

  const qty=
    Math.max(
      1,
      parseInt($("#qtyInput").value)||1
    );

  const power=
    selectedProduct.powers
      ? $("#powerSelect").value
      : null;

  const key=
    `${selectedProduct.id}-${power||"na"}`;

  const existing=
    cart.find(x=>x.key===key);

  if(existing){
    existing.qty+=qty;
  }else{
    cart.push({
      key,
      id:selectedProduct.id,
      name:selectedProduct.name,
      price:selectedProduct.price,
      qty,
      power,
      color:selectedProduct.color,
      image:selectedProduct.image||null
    });
  }

  saveCart();
  closeModal();
  showToast(tr().added);
}

function saveCart(){
  localStorage.setItem(
    "tfl_cart",
    JSON.stringify(cart)
  );

  renderCart();
}

function renderCart(){
  $("#cartCount").textContent=
    cart.reduce((a,x)=>a+x.qty,0);

  $("#cartEmpty").classList.toggle(
    "hidden",
    cart.length>0
  );

  $("#cartSummary").classList.toggle(
    "hidden",
    cart.length===0
  );

  const itemCount=
    cart.reduce((a,x)=>a+x.qty,0);

  $("#cartItems").innerHTML=
    (
      cart.length
        ? `<div class="bag-items-label">
            ${tr().bagItems(itemCount)}
          </div>`
        : ""
    )
    +
    cart.map((x,i)=>{

      const product=
        products.find(
          p=>String(p.id)===String(x.id)
        );

      const cartImage=
        x.image ||
        (product && product.image) ||
        null;

      return `
        <div class="cart-item">

          <div
            class="cart-thumb ${cartImage?"has-cart-image":""}"
            style="--iris:${x.color}">

            ${
              cartImage
                ? `<img
                    src="${cartImage}"
                    alt="${x.name}"
                    class="cart-real-image">`
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
                ${siteLang==="mm"?"အရေအတွက်":"Qty"} ${x.qty}
              </span>

            </div>

            <div class="cart-item-bottom">

              <strong>
                ${money(x.price*x.qty)}
              </strong>

              <button
                class="remove-item"
                data-i="${i}">
                ${siteLang==="mm"?"ဖယ်မည်":"Remove"}
              </button>

            </div>

          </div>

        </div>
      `;
    }).join("");

  $("#cartItems")
    .querySelectorAll(".remove-item")
    .forEach(b=>{
      b.addEventListener("click",()=>{
        cart.splice(
          Number(b.dataset.i),
          1
        );

        saveCart();
      });
    });

  $("#cartSubtotal").textContent=
    money(
      cart.reduce(
        (a,x)=>a+x.price*x.qty,
        0
      )
    );
}

function openCart(){
  $("#cartDrawer").classList.add("open");

  $("#drawerBackdrop")
    .classList.remove("hidden");

  $("#cartDrawer")
    .setAttribute(
      "aria-hidden",
      "false"
    );

  document.body.style.overflow="hidden";
}

function closeCart(){
  $("#cartDrawer").classList.remove("open");

  $("#drawerBackdrop")
    .classList.add("hidden");

  $("#cartDrawer")
    .setAttribute(
      "aria-hidden",
      "true"
    );

  document.body.style.overflow="";
}

function showToast(message="Added to bag"){
  $("#toast").textContent=message;

  $("#toast").classList.remove("hidden");

  setTimeout(
    ()=>$("#toast").classList.add("hidden"),
    1800
  );
}

function orderWhatsApp(){
  if(!cart.length) return;

  const name=$("#customerName").value.trim();
  const phone=$("#customerPhone").value.trim();
  const emirate=$("#customerEmirate").value.trim();
  const area=$("#customerArea").value.trim();
  const building=$("#customerBuilding").value.trim();
  const street=$("#customerStreet").value.trim();
  const landmark=$("#customerLandmark").value.trim();
  const notes=$("#customerNotes").value.trim();

  const requiredMissing=
    !name ||
    !phone ||
    !emirate ||
    !area ||
    !building;

  $("#addressError")
    .classList.toggle(
      "hidden",
      !requiredMissing
    );

  if(requiredMissing){

    const firstMissing=
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

  const lines=
    cart.map(
      (x,i)=>
        `${i+1}. ${x.name}${x.power ? ` | Power ${x.power}` : ""} | Qty ${x.qty} | ${money(x.price*x.qty)}`
    );

  const total=
    money(
      cart.reduce(
        (a,x)=>a+x.price*x.qty,
        0
      )
    );

  const addressLines=[
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

  const message=
`Hi Thai Fashion Lenses UAE! I would like to order:

${lines.join("\n")}

Subtotal: ${total}

DELIVERY DETAILS
${addressLines.join("\n")}

Please confirm delivery fee and final total.`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}


/* ===== LANGUAGE + FILTERS ===== */

const colorDefs=[
  {key:"all",en:"All colors",mm:"အရောင်အားလုံး"},
  {key:"green",en:"Green",mm:"စိမ်း"},
  {key:"blue",en:"Blue",mm:"ပြာ"},
  {key:"red",en:"Red",mm:"နီ"},
  {key:"brown",en:"Brown",mm:"ညို"},
  {key:"yellow",en:"Yellow",mm:"ဝါ"},
  {key:"clear",en:"Clear",mm:"အကြည်"},
  {key:"gray",en:"Gray",mm:"မီးခိုး"},
  {key:"purple",en:"Purple",mm:"ခရမ်း"},
  {key:"black",en:"Black",mm:"အနက်"},
  {key:"pink",en:"Pink",mm:"ပန်းရောင်"}
];

const i18n={
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
    stockOut:"Out of Stock",

    waitTwoWeeks:"Waiting period: 2 weeks",
    currentlyUnavailable:"Currently unavailable",

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

    deliveryInstruction:
      "Please add your delivery details before ordering.",

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

    addressError:
      "Please complete all required (*) delivery fields.",

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

    heroTitle:
      "Thai Fashion Lens မှ<br>နွေးထွေးစွာ ကြိုဆိုပါ၏",

    heroText:
      "နေ့စဉ်လှပတဲ့စတိုင်အတွက် Fashion Contact Lenses များကို အရောင်၊ Power နဲ့ Collection အလိုက် လွယ်ကူစွာရွေးချယ်နိုင်ပါတယ်။",

    shopLatest:"အသစ်ရောက်ပစ္စည်းများ ကြည့်ရန်",

    benefit1Title:
      "UAE အတွင်း မြန်ဆန်စွာ ပို့ဆောင်ပေးသည်",

    benefit1Text:
      "WhatsApp ကနေ လွယ်ကူစွာ မှာယူနိုင်ပါတယ်",

    benefit2Title:"Power ရွေးချယ်နိုင်သည်",

    benefit2Text:
      "Bag ထဲမထည့်ခင် လိုအပ်တဲ့ Power ကို ရွေးနိုင်ပါတယ်",

    benefit3Title:"လွယ်ကူတဲ့ အကူအညီ",

    benefit3Text:
      "မမှာယူခင် WhatsApp ကနေ မေးမြန်းနိုင်ပါတယ်",

    shopEyebrow:"ဆိုင်",

    latestProductsTitle:"နောက်ဆုံးရောက် ပစ္စည်းများ",

    productsWord:"ပစ္စည်း",

    stockFilterTitle:"ပစ္စ
