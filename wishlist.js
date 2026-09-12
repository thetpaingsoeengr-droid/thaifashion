const $ = s => document.querySelector(s);

let lang = localStorage.getItem("tfl_language") || "en";

const copy = {
  en:{
    eyebrow:"SAVED FOR LATER",
    title:"My Wishlist",
    emptyTitle:"Your wishlist is empty",
    emptyText:"Save products you love and find them here anytime.",
    shop:"Shop Products",
    view:"View Product",
    remove:"Remove",
    item:"item",
    items:"items"
  },
  mm:{
    eyebrow:"သိမ်းထားသောပစ္စည်းများ",
    title:"My Wishlist",
    emptyTitle:"Wishlist ထဲမှာ ပစ္စည်းမရှိသေးပါ",
    emptyText:"ကြိုက်တဲ့ product တွေကို Wishlist ထဲသိမ်းပြီး နောက်မှ ဒီနေရာမှာ ပြန်ကြည့်နိုင်ပါတယ်။",
    shop:"Products ကြည့်မည်",
    view:"Product ကြည့်မည်",
    remove:"ဖယ်မည်",
    item:"ခု",
    items:"ခု"
  }
};

function t(){ return copy[lang] || copy.en; }

function getWishlist(){
  try{
    const data = JSON.parse(localStorage.getItem("tfl_wishlist") || "[]");
    return Array.isArray(data) ? data : [];
  }catch(e){
    return [];
  }
}

function saveWishlist(list){
  localStorage.setItem("tfl_wishlist", JSON.stringify(list));
}

function money(value){
  return `AED ${Number(value || 0).toFixed(0)}`;
}

function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function displayName(item){
  if(lang === "mm" && item.nameMM){
    return item.nameMM;
  }
  return item.name || "Product";
}

function render(){
  const list = getWishlist();
  const grid = $("#wlGrid");
  const empty = $("#wlEmpty");

  $("#wlEyebrow").textContent = t().eyebrow;
  $("#wlTitle").textContent = t().title;
  $("#wlEmptyTitle").textContent = t().emptyTitle;
  $("#wlEmptyText").textContent = t().emptyText;
  $("#wlShopBtn").textContent = t().shop;
  $("#wlLangBtn").textContent = lang === "en" ? "က" : "A";

  $("#wlTotal").textContent =
    `${list.length} ${list.length === 1 ? t().item : t().items}`;

  empty.classList.toggle("hidden", list.length > 0);
  grid.classList.toggle("hidden", list.length === 0);

  grid.innerHTML = list.map(item=>{
    const id = encodeURIComponent(item.id || "");
    const image = item.image
      ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(displayName(item))}" loading="lazy" decoding="async">`
      : "";

    return `
      <article class="wl-card" data-id="${escapeHtml(item.id || "")}">
        <a class="wl-image-link" href="product.html?id=${id}">
          ${image}
        </a>
        <div class="wl-card-body">
          <div class="wl-brand-name">${escapeHtml(item.brand || "")}</div>
          <a class="wl-name" href="product.html?id=${id}">
            ${escapeHtml(displayName(item))}
          </a>
          <div class="wl-price">${money(item.price)}</div>
          <div class="wl-card-actions">
            <a class="wl-view" href="product.html?id=${id}">
              ${escapeHtml(t().view)}
            </a>
            <button
              class="wl-remove"
              type="button"
              data-remove-id="${escapeHtml(item.id || "")}"
              aria-label="${escapeHtml(t().remove)}"
              title="${escapeHtml(t().remove)}"
            >×</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll("[data-remove-id]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id = btn.dataset.removeId;
      const next = getWishlist().filter(item=>item.id !== id);
      saveWishlist(next);
      render();
    });
  });
}

$("#wlLangBtn").addEventListener("click",()=>{
  lang = lang === "en" ? "mm" : "en";
  localStorage.setItem("tfl_language", lang);
  render();
});

window.addEventListener("storage", event=>{
  if(event.key === "tfl_wishlist" || event.key === "tfl_language"){
    lang = localStorage.getItem("tfl_language") || "en";
    render();
  }
});

window.addEventListener("pageshow",()=>{
  lang = localStorage.getItem("tfl_language") || "en";
  render();
});

render();
