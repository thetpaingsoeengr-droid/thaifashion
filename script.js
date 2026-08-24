const WHATSAPP_NUMBER = "971544608059";

const products = [
  {id:1,name:"Venice Gray",category:"Contact Lenses",price:15,badge:"Best Seller",color:"#8f9a9a",desc:"Soft gray fashion lens for a clean everyday look.",powers:["0.00","-1.00","-2.00","-4.50"]},
  {id:2,name:"Taylor Brown",category:"Contact Lenses",price:15,badge:"In Stock",color:"#9b765f",desc:"Warm brown tone designed for a natural, softly defined finish.",powers:["0.00","-1.00","-2.00","-4.50"]},
  {id:3,name:"Pattaya Green",category:"Contact Lenses",price:15,badge:"New Arrival",color:"#708979",desc:"Muted green lens with a fashion-forward but wearable tone.",powers:["0.00","-1.00","-2.00","-4.50"]},
  {id:4,name:"Mocha Hazel",category:"Contact Lenses",price:20,badge:"Power Lens",color:"#a58662",desc:"Hazel-brown fashion lens with multiple power choices.",powers:["0.00","-1.00","-2.00","-4.50"]},
  {id:5,name:"Daily Clear 10 pcs",category:"Contact Lenses",price:25,badge:"Daily",color:"#b7c0c4",desc:"Daily disposable clear lenses, packed for convenient everyday use.",powers:["0.00","-1.00","-2.00","-4.50"]},
  {id:6,name:"Lens Travel Case",category:"Accessories",price:10,badge:"In Stock",color:"#c99d9e",type:"bag",desc:"Compact lens case for your handbag or travel pouch.",powers:null},
  {id:7,name:"Mini Fashion Pouch",category:"Accessories",price:20,badge:"New Arrival",color:"#a98d7b",type:"bag",desc:"Small everyday pouch for lenses, makeup or accessories.",powers:null},
  {id:8,name:"Soft Pink Lip Tint",category:"Beauty",price:18,badge:"Best Seller",color:"#bd7378",type:"beauty",desc:"Easy everyday lip tint with a soft pink finish.",powers:null}
];

let currentCategory = "All";
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
    currentCategory=b.dataset.category; renderCategories(); renderProducts();
  }));
}

function filteredProducts(){
  const q = searchInput.value.trim().toLowerCase();
  let list = products.filter(p => (currentCategory==="All" || p.category===currentCategory) && p.name.toLowerCase().includes(q));
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
      <div class="product-image ${p.type||""}" style="--iris:${p.color}">
        <span class="badge">${p.badge}</span>
        <button class="quick-add" aria-label="View ${p.name}" data-id="${p.id}">+</button>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-title">${p.name}</div>
        <div class="product-price">${money(p.price)}</div>
      </div>
    </article>`).join("");
  productGrid.querySelectorAll(".product-card").forEach(card=>card.addEventListener("click",()=>openProduct(Number(card.dataset.id))));
}

function openProduct(id){
  selectedProduct=products.find(p=>p.id===id);
  $("#modalName").textContent=selectedProduct.name;
  $("#modalCategory").textContent=selectedProduct.category;
  $("#modalPrice").textContent=money(selectedProduct.price);
  $("#modalDescription").textContent=selectedProduct.desc;
  $("#modalImage").style.setProperty("--iris",selectedProduct.color);
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
  showToast("Added to bag — tap Bag to review");
}

function saveCart(){ localStorage.setItem("tfl_cart",JSON.stringify(cart)); renderCart(); }
function renderCart(){
  $("#cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);
  $("#cartEmpty").classList.toggle("hidden",cart.length>0);
  $("#cartSummary").classList.toggle("hidden",cart.length===0);
  $("#cartItems").innerHTML=cart.map((x,i)=>`
    <div class="cart-item">
      <div class="cart-thumb" style="--iris:${x.color}"></div>
      <div class="cart-item-main">
        <h4>${x.name}</h4>
        <div class="cart-meta">
          ${x.power ? `<span>Power ${x.power}</span>` : ""}
          <span>Qty ${x.qty}</span>
        </div>
        <div class="cart-item-bottom">
          <strong>${money(x.price*x.qty)}</strong>
          <button class="remove-item" data-i="${i}">Remove</button>
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

renderCategories();
renderProducts();
renderCart();
