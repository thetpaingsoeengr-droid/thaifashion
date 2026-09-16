import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  serverTimestamp
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
const auth = getAuth(app);
const db = getFirestore(app);


const oldProducts = [
  {
    id:1,
    name:"Venice Gray",
    stockStatus:"instock",
    colorKey:"gray",
    category:"Contact Lenses",
    price:15,
    badge:"Best Seller",
    color:"#8f9a9a",
    desc:"Soft gray fashion lens for a clean everyday look.",
    powers:["0.00","-1.00","-2.00","-4.50"]
  },
  {
    id:2,
    name:"Taylor Brown",
    stockStatus:"instock",
    colorKey:"brown",
    category:"Contact Lenses",
    price:15,
    badge:"In Stock",
    color:"#9b765f",
    desc:"Warm brown tone designed for a natural, softly defined finish.",
    powers:["0.00","-1.00","-2.00","-4.50"]
  },
  {
    id:3,
    name:"Pattaya Green",
    stockStatus:"preorder",
    colorKey:"green",
    category:"Contact Lenses",
    price:15,
    badge:"New Arrival",
    color:"#708979",
    desc:"Muted green lens with a fashion-forward but wearable tone.",
    powers:["0.00","-1.00","-2.00","-4.50"]
  },
  {
    id:4,
    name:"Mocha Hazel",
    stockStatus:"preorder",
    colorKey:"brown",
    category:"Contact Lenses",
    price:20,
    badge:"Power Lens",
    color:"#a58662",
    desc:"Hazel-brown fashion lens with multiple power choices.",
    powers:["0.00","-1.00","-2.00","-4.50"]
  },
  {
    id:5,
    name:"Daily Clear 10 pcs",
    stockStatus:"instock",
    colorKey:"clear",
    category:"Contact Lenses",
    price:25,
    badge:"Daily",
    color:"#b7c0c4",
    desc:"Daily disposable clear lenses, packed for convenient everyday use.",
    powers:["0.00","-1.00","-2.00","-4.50"]
  },
  {
    id:6,
    name:"Lens Travel Case",
    stockStatus:"instock",
    colorKey:"pink",
    category:"Accessories",
    price:10,
    badge:"In Stock",
    color:"#c99d9e",
    type:"bag",
    desc:"Compact lens case for your handbag or travel pouch.",
    powers:null
  },
  {
    id:7,
    name:"Mini Fashion Pouch",
    stockStatus:"preorder",
    colorKey:"brown",
    category:"Accessories",
    price:20,
    badge:"New Arrival",
    color:"#a98d7b",
    type:"bag",
    desc:"Small everyday pouch for lenses, makeup or accessories.",
    powers:null
  },
  {
    id:8,
    name:"Soft Pink Lip Tint",
    stockStatus:"instock",
    colorKey:"pink",
    category:"Beauty",
    price:18,
    badge:"Best Seller",
    color:"#bd7378",
    type:"beauty",
    desc:"Easy everyday lip tint with a soft pink finish.",
    powers:null
  },
  {
    id:9,
    name:"Ocean Blue",
    stockStatus:"preorder",
    colorKey:"blue",
    category:"Contact Lenses",
    price:20,
    badge:"New Arrival",
    color:"#6d8fac",
    desc:"Cool blue fashion lens for a brighter look.",
    powers:["0.00","-1.00","-2.00","-4.50"]
  },
  {
    id:10,
    name:"Ruby Red",
    stockStatus:"preorder",
    colorKey:"red",
    category:"Contact Lenses",
    price:20,
    badge:"New Arrival",
    color:"#a65353",
    desc:"Bold red fashion lens for special looks.",
    powers:["0.00","-1.00","-2.00"]
  },
  {
    id:11,
    name:"Honey Gold",
    stockStatus:"instock",
    colorKey:"yellow",
    category:"Contact Lenses",
    price:20,
    badge:"New Arrival",
    color:"#c5a64f",
    desc:"Warm golden-yellow lens with a glowing finish.",
    powers:["0.00","-1.00","-2.00"]
  },
  {
    id:12,
    name:"Violet Dream",
    stockStatus:"preorder",
    colorKey:"purple",
    category:"Contact Lenses",
    price:20,
    badge:"New Arrival",
    color:"#8973a5",
    desc:"Soft violet fashion lens with a dreamy tone.",
    powers:["0.00","-1.00","-2.00"]
  },
  {
    id:13,
    name:"Midnight Black",
    stockStatus:"instock",
    colorKey:"black",
    category:"Contact Lenses",
    price:20,
    badge:"Best Seller",
    color:"#333333",
    desc:"Deep black lens for stronger eye definition.",
    powers:["0.00","-1.00","-2.00"]
  },
  {
    id:14,
    name:"Blush Pink",
    stockStatus:"preorder",
    colorKey:"pink",
    category:"Contact Lenses",
    price:20,
    badge:"New Arrival",
    color:"#c990a0",
    desc:"Soft pink fashion lens for a playful look.",
    powers:["0.00","-1.00","-2.00"]
  },
  {
    id:15,
    name:"Icy Gray",
    colorKey:"gray",
    stockStatus:"preorder",
    category:"Contact Lenses",
    price:20,
    badge:"Pre-order",
    color:"#a8adb2",
    image:"images/icy-gray.jpg",
    desc:"Natural grey lens for everyday wear.",
    powers:null
  }
];


const $ = s => document.querySelector(s);

const CLOUDINARY_SIGNER_URL =
  "https://thai-fashion-upload-signer.thetpaingsoe-engr97.workers.dev/";

const ADMIN_UID = "FRsokJmwbeSgrUnuiF3hMPSgrST2";

let selectedImageObjectUrl = "";

function showImagePreview(src){
  const img = $("#pImagePreview");
  const removeBtn = $("#removeImageBtn");

  if(selectedImageObjectUrl){
    URL.revokeObjectURL(selectedImageObjectUrl);
    selectedImageObjectUrl = "";
  }

  if(src){
    img.src = src;
    img.classList.remove("hidden");
    removeBtn.classList.remove("hidden");
  }else{
    img.removeAttribute("src");
    img.classList.add("hidden");
    removeBtn.classList.add("hidden");
  }
}


async function compressProductImage(file){
  const allowedTypes = ["image/jpeg","image/png","image/webp"];
  if(!allowedTypes.includes(file.type)){
    throw new Error("Please choose a JPG, PNG or WebP image.");
  }

  const maxBytes = 10 * 1024 * 1024;
  if(file.size > maxBytes){
    throw new Error("Image is too large. Please use an image under 10 MB.");
  }

  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", {alpha:false});
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0,0,width,height);
  ctx.drawImage(bitmap,0,0,width,height);
  if(bitmap.close) bitmap.close();

  const blob = await new Promise((resolve,reject)=>{
    canvas.toBlob(
      b => b ? resolve(b) : reject(new Error("Image compression failed.")),
      "image/jpeg",
      0.84
    );
  });

  const baseName = (file.name || "product")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]+/gi, "-");

  return new File(
    [blob],
    `${baseName}.jpg`,
    {type:"image/jpeg", lastModified:Date.now()}
  );
}

async function getCloudinarySignature(){
  const user = auth.currentUser;

  if(!user){
    throw new Error("Admin login expired. Please sign in again.");
  }

  if(user.uid !== ADMIN_UID){
    throw new Error("This account is not authorized to upload images.");
  }

  const idToken = await user.getIdToken(true);

  const response = await fetch(CLOUDINARY_SIGNER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });

  let data = {};
  try{
    data = await response.json();
  }catch{}

  if(!response.ok){
    throw new Error(
      data?.error ||
      "Secure image authorization failed."
    );
  }

  const timestamp = Number(data.timestamp);
  const signature = String(data.signature || "").trim();
  const apiKey = String(data.apiKey || "").trim();
  const cloudName = String(data.cloudName || "").trim();
  const folder = String(data.folder || "").trim();

  if(!timestamp || !signature || !apiKey || !cloudName){
    throw new Error("Secure upload configuration is incomplete.");
  }

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder
  };
}


async function uploadSignedCloudinary(file, statusElement){
  if(!file){
    throw new Error("No image selected.");
  }

  if(statusElement){
    statusElement.textContent = "Optimizing image…";
  }

  const optimizedFile = await compressProductImage(file);

  if(statusElement){
    statusElement.textContent = "Authorizing secure upload…";
  }

  const signed = await getCloudinarySignature();

  const formData = new FormData();
  formData.append("file", optimizedFile);
  formData.append("api_key", signed.apiKey);
  formData.append("timestamp", String(signed.timestamp));
  formData.append("signature", signed.signature);

  if(signed.folder){
    formData.append("folder", signed.folder);
  }

  if(statusElement){
    statusElement.textContent = "Uploading image securely…";
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();

  if(!response.ok){
    throw new Error(
      data?.error?.message ||
      "Cloudinary secure image upload failed."
    );
  }

  const secureUrl = String(data.secure_url || "").trim();

  if(!secureUrl){
    throw new Error("Cloudinary did not return an image URL.");
  }

  return secureUrl;
}


async function uploadProductImage(file){
  if(!file){
    return $("#pImage").value.trim();
  }

  const secureUrl = await uploadSignedCloudinary(
    file,
    $("#uploadStatus")
  );

  $("#pImage").value = secureUrl;
  showImagePreview(secureUrl);
  $("#uploadStatus").textContent = "Image uploaded securely.";

  return secureUrl;
}

$("#pImageFile").addEventListener("change",()=>{
  const file = $("#pImageFile").files?.[0];

  if(!file){
    const current = $("#pImage").value.trim();
    showImagePreview(current);
    $("#uploadStatus").textContent = current
      ? "Current product image."
      : "No new image selected.";
    return;
  }

  if(selectedImageObjectUrl){
    URL.revokeObjectURL(selectedImageObjectUrl);
  }

  selectedImageObjectUrl = URL.createObjectURL(file);

  const img = $("#pImagePreview");
  img.src = selectedImageObjectUrl;
  img.classList.remove("hidden");
  $("#removeImageBtn").classList.remove("hidden");

  $("#uploadStatus").textContent =
    `Selected: ${file.name}. It will upload securely when you save.`;
});

$("#removeImageBtn").addEventListener("click",()=>{
  $("#pImageFile").value = "";
  $("#pImage").value = "";

  if(selectedImageObjectUrl){
    URL.revokeObjectURL(selectedImageObjectUrl);
    selectedImageObjectUrl = "";
  }

  showImagePreview("");
  $("#uploadStatus").textContent = "Image removed. Save product to apply.";
});


let selectedImageObjectUrl2 = "";

function showImagePreview2(url){
  const img = $("#pImagePreview2");
  const removeBtn = $("#removeImageBtn2");
  if(!img || !removeBtn) return;

  if(url){
    img.src = url;
    img.classList.remove("hidden");
    removeBtn.classList.remove("hidden");
  }else{
    img.removeAttribute("src");
    img.classList.add("hidden");
    removeBtn.classList.add("hidden");
  }
}

$("#pImageFile2").addEventListener("change",()=>{
  const file = $("#pImageFile2").files?.[0];

  if(!file){
    showImagePreview2($("#pImage2").value.trim());
    return;
  }

  if(selectedImageObjectUrl2){
    URL.revokeObjectURL(selectedImageObjectUrl2);
  }

  selectedImageObjectUrl2 = URL.createObjectURL(file);
  showImagePreview2(selectedImageObjectUrl2);
  $("#uploadStatus2").textContent =
    `Selected: ${file.name}. It will be optimized and uploaded securely when you save.`;
});

$("#removeImageBtn2").addEventListener("click",()=>{
  $("#pImageFile2").value = "";
  $("#pImage2").value = "";

  if(selectedImageObjectUrl2){
    URL.revokeObjectURL(selectedImageObjectUrl2);
    selectedImageObjectUrl2 = "";
  }

  showImagePreview2("");
  $("#uploadStatus2").textContent = "Image 2 removed. Save product to apply.";
});


function msg(el,text,ok=false){
  el.textContent=text;
  el.classList.toggle("ok",ok);
}


/* =========================
   LOGIN
========================= */

$("#loginForm").addEventListener("submit",async e=>{
  e.preventDefault();

  msg($("#loginMessage"),"Signing in…");

  try{
    await signInWithEmailAndPassword(
      auth,
      $("#adminEmail").value.trim(),
      $("#adminPassword").value
    );

    msg($("#loginMessage"),"");
  }
  catch(err){
    msg(
      $("#loginMessage"),
      "Login failed: "+(err.message||err.code)
    );
  }
});


$("#logoutBtn").addEventListener("click",()=>{
  signOut(auth);
});


onAuthStateChanged(auth,async user=>{
  const isAdmin = !!user && user.uid === ADMIN_UID;

  $("#loginView").classList.toggle("hidden",isAdmin);
  $("#dashboard").classList.toggle("hidden",!isAdmin);

  if(isAdmin){
    $("#adminIdentity").textContent =
      user.email || "Authenticated admin";
    msg($("#loginMessage"),"");
    return;
  }

  if(user && !isAdmin){
    msg(
      $("#loginMessage"),
      "This account is not authorized for this admin panel."
    );
    await signOut(auth);
  }
});


/* =========================
   POWER OPTIONS
========================= */

function powersInput(){

  const s=$("#pPowers").value.trim();

  return s
    ? s.split(",")
        .map(x=>x.trim())
        .filter(Boolean)
    : null;
}


/* =========================
   PRODUCT VARIANTS v67
========================= */

function variantRowTemplate(v={}){
  const images = Array.isArray(v.images) ? v.images.filter(Boolean).slice(0,2) : [];
  const stock = v.stockStatus || "instock";
  return `
    <div class="variant-row" data-image1="${esc(images[0]||"")}" data-image2="${esc(images[1]||"")}">
      <label>Colour<input class="v-color" placeholder="e.g. Rose Pink" value="${esc(v.color||"")}"></label>
      <label>Size<input class="v-size" placeholder="e.g. 5 ml / Small" value="${esc(v.size||"")}"></label>
      <label>Regular Price (AED)<input class="v-price" type="number" min="0" step="1" placeholder="35" value="${v.price ?? ""}"></label>
      <label>Discount Price<input class="v-discount" type="number" min="0" step="1" placeholder="Optional" value="${v.discountPrice ?? ""}"></label>
      <label>Stock<select class="v-stock"><option value="instock" ${stock==="instock"?"selected":""}>In Stock</option><option value="preorder" ${stock==="preorder"?"selected":""}>Pre-order</option><option value="outofstock" ${stock==="outofstock"?"selected":""}>Out of Stock</option></select></label>
      <label>Waiting period<input class="v-waiting" placeholder="2 weeks" value="${esc(v.waitingPeriod||"")}"></label>
      <label>Variant photo 1<input class="v-file1" type="file" accept="image/jpeg,image/png,image/webp"><span class="variant-image-note">${images[0]?"Current photo saved":"Optional"}</span></label>
      <label>Variant photo 2<input class="v-file2" type="file" accept="image/jpeg,image/png,image/webp"><span class="variant-image-note">${images[1]?"Current photo saved":"Optional"}</span></label>
      <div class="variant-row-actions"><button type="button" class="secondary variant-remove">Remove Variant</button></div>
    </div>`;
}

function addVariantRow(v={}){
  const wrap = $("#variantRows");
  wrap.insertAdjacentHTML("beforeend", variantRowTemplate(v));
}

function readVariants(){
  return [...document.querySelectorAll(".variant-row")].map((row,index)=>{
    const priceRaw=row.querySelector(".v-price").value.trim();
    const discountRaw=row.querySelector(".v-discount").value.trim();
    return {
      color:row.querySelector(".v-color").value.trim(),
      size:row.querySelector(".v-size").value.trim(),
      price:priceRaw ? Number(priceRaw) : Number($("#pPrice").value||0),
      discountPrice:discountRaw ? Number(discountRaw) : null,
      stockStatus:row.querySelector(".v-stock").value,
      waitingPeriod:row.querySelector(".v-stock").value === "preorder" ? (row.querySelector(".v-waiting").value.trim()||"2 weeks") : "",
      images:[row.dataset.image1||"",row.dataset.image2||""].filter(Boolean),
      _row:row,
      _index:index
    };
  }).filter(v=>v.color || v.size);
}

async function uploadVariantImages(variants){
  for(const v of variants){
    const f1=v._row.querySelector(".v-file1").files?.[0];
    const f2=v._row.querySelector(".v-file2").files?.[0];
    if(f1){ v.images[0]=await uploadSignedCloudinary(f1); }
    if(f2){ v.images[1]=await uploadSignedCloudinary(f2); }
    v.images=v.images.filter(Boolean).slice(0,2);
    delete v._row; delete v._index;
  }
  return variants;
}

$("#addVariantBtn")?.addEventListener("click",()=>addVariantRow());
$("#variantRows")?.addEventListener("click",e=>{
  const btn=e.target.closest(".variant-remove");
  if(btn) btn.closest(".variant-row")?.remove();
});

/* =========================
   PRODUCT DATA
========================= */

function updateColorFieldVisibility(){

  const isContactLens = $("#pCategory").value === "Contact Lenses";
  const field = $("#colorField");

  if(field){
    field.style.display = isContactLens ? "" : "none";
  }

  $("#pColorKey").disabled = !isContactLens;
}

function payload(){

  const stock=$("#pStock").value;
  const category=$("#pCategory").value;

  return {

    name:$("#pName").value.trim(),

    nameMM:$("#pNameMM").value.trim(),

    brand:$("#pBrand").value.trim(),

    size:$("#pSize").value.trim(),

    price:Number($("#pPrice").value||0),

    discountPrice: $("#pDiscountPrice").value.trim()
      ? Number($("#pDiscountPrice").value)
      : null,

    category,

    colorKey:
      category === "Contact Lenses"
        ? $("#pColorKey").value
        : null,

    stockStatus:stock,

    waitingPeriod:
      stock==="preorder"
        ? ($("#pWaiting").value.trim() || "2 weeks")
        : "",

    badge:
      $("#pBadge").value ||
      (
        stock==="preorder"
          ? "Pre-order"
          : stock==="outofstock"
            ? "Out of Stock"
            : "In Stock"
      ),

    powers:powersInput(),

    variants:readVariants().map(v=>{ const x={...v}; delete x._row; delete x._index; return x; }),

    imageUrl:$("#pImage").value.trim(),

    images:[
      $("#pImage").value.trim(),
      $("#pImage2").value.trim()
    ].filter(Boolean),

    description:$("#pDescription").value.trim(),

    descriptionMM:$("#pDescriptionMM").value.trim(),

    updatedAt:serverTimestamp()
  };
}


/* =========================
   RESET FORM
========================= */

function resetForm(){

  $("#productForm").reset();

  $("#editId").value="";

  $("#formTitle").textContent="Add product";

  $("#saveBtn").textContent="Save product";

  $("#pStock").value="instock";

  $("#pBadge").value="In Stock";

  $("#pWaiting").value="2 weeks";

  updateColorFieldVisibility();

  $("#variantRows").innerHTML="";

  $("#pImage").value="";
  $("#pImage2").value="";
  $("#pImageFile").value="";
  $("#pImageFile2").value="";
  showImagePreview("");
  showImagePreview2("");
  $("#uploadStatus").textContent="No new image selected.";
  $("#uploadStatus2").textContent="No second image selected.";

  msg($("#formMessage"),"");
}


$("#resetBtn").addEventListener(
  "click",
  resetForm
);


/* =========================
   CATEGORY-SPECIFIC FIELDS
========================= */

$("#pCategory").addEventListener("change",()=>{
  updateColorFieldVisibility();
});


/* =========================
   STOCK STATUS
========================= */

$("#pStock").addEventListener("change",()=>{

  const stock=$("#pStock").value;

  if(stock==="preorder"){

    $("#pBadge").value="Pre-order";

    if(!$("#pWaiting").value){
      $("#pWaiting").value="2 weeks";
    }

  }
  else if(stock==="outofstock"){

    $("#pBadge").value="Out of Stock";

    $("#pWaiting").value="";

  }
  else{

    if(
      $("#pBadge").value==="Pre-order" ||
      $("#pBadge").value==="Out of Stock"
    ){
      $("#pBadge").value="In Stock";
    }
  }
});


/* =========================
   SAVE PRODUCT
========================= */

$("#productForm").addEventListener(
  "submit",
  async e=>{

    e.preventDefault();

    let p=payload();

    if(!p.name){
      return msg(
        $("#formMessage"),
        "Product name is required."
      );
    }

    if(p.discountPrice !== null && (p.discountPrice <= 0 || p.discountPrice >= p.price)){
      return msg(
        $("#formMessage"),
        "Discount price must be greater than 0 and lower than the regular price."
      );
    }

    for(const v of readVariants()){
      if(!v.color && !v.size){
        return msg($("#formMessage"), "Each variant needs a colour or size.");
      }
      if(v.discountPrice !== null && (v.discountPrice <= 0 || v.discountPrice >= v.price)){
        return msg($("#formMessage"), `Variant ${v._index+1}: discount price must be lower than regular price.`);
      }
    }

    $("#saveBtn").disabled=true;

    msg($("#formMessage"),"Saving…");

    try{

      p.variants = await uploadVariantImages(readVariants());

      const imageFile=$("#pImageFile").files?.[0];
      if(imageFile){
        p.imageUrl = await uploadProductImage(imageFile);
      }

      const imageFile2=$("#pImageFile2").files?.[0];
      if(imageFile2){
        const secureUrl2 = await uploadSignedCloudinary(
          imageFile2,
          $("#uploadStatus2")
        );

        $("#pImage2").value = secureUrl2;
        showImagePreview2(secureUrl2);
        $("#uploadStatus2").textContent = "Image 2 uploaded securely.";
      }

      p.images = [
        p.imageUrl || $("#pImage").value.trim(),
        $("#pImage2").value.trim()
      ].filter(Boolean);
      p.imageUrl = p.images[0] || "";

      const id=$("#editId").value;

      if(id){

        await updateDoc(
          doc(db,"products",id),
          p
        );

        msg(
          $("#formMessage"),
          "Product updated.",
          true
        );

      }
      else{

        await addDoc(
          collection(db,"products"),
          {
            ...p,
            createdAt:serverTimestamp()
          }
        );

        msg(
          $("#formMessage"),
          "Product added.",
          true
        );
      }

      setTimeout(
        resetForm,
        700
      );

    }
    catch(err){

      msg(
        $("#formMessage"),
        "Save failed: "+
        (err.message||err.code)
      );

    }
    finally{

      $("#saveBtn").disabled=false;

    }
  }
);


/* =========================
   ESCAPE HTML
========================= */

function esc(s){

  return String(s??"")
    .replace(
      /[&<>"']/g,
      c=>({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#039;"
      }[c])
    );
}


/* =========================
   PRODUCT LIST
========================= */

onSnapshot(
  collection(db,"products"),

  snap=>{

    const box=$("#productList");

    if(snap.empty){

      box.innerHTML=
        '<p class="muted">No Firebase products yet.</p>';

      return;
    }

    const rows=snap.docs
      .map(d=>({
        id:d.id,
        ...d.data()
      }))
      .sort(
        (a,b)=>
          (a.name||"")
            .localeCompare(b.name||"")
      );


    box.innerHTML=rows.map(p=>{

      let stockText="In Stock";

      if(p.stockStatus==="preorder"){
        stockText="Pre-order";
      }

      if(p.stockStatus==="outofstock"){
        stockText="Out of Stock";
      }

      return `
        <article class="admin-product">

          <div class="admin-thumb">

            ${
              p.imageUrl
                ? `<img src="${esc(p.imageUrl)}" alt="">`
                : `<span>${esc((p.name||"?")[0])}</span>`
            }

          </div>

          <div class="admin-product-info">

            <strong>${esc(p.name)}</strong>

            <span>
              ${Number(p.discountPrice||0) > 0 && Number(p.discountPrice) < Number(p.price||0)
                ? `<s>AED ${Number(p.price||0).toFixed(0)}</s> <strong>AED ${Number(p.discountPrice).toFixed(0)}</strong> • ${Math.round((1 - Number(p.discountPrice)/Number(p.price||0))*100)}% OFF`
                : `AED ${Number(p.price||0).toFixed(0)}`}
              • ${stockText}
              • ${esc(p.colorKey||"")}
              ${p.brand ? ` • ${esc(p.brand)}` : ""}
              ${p.size ? ` • ${esc(p.size)}` : ""}
            </span>

            <small>
              ${esc(p.category||"")}
            </small>

          </div>

          <div class="admin-actions">

            <button
              class="edit-btn"
              data-id="${p.id}">
              Edit
            </button>

            <button
              class="delete-btn"
              data-id="${p.id}">
              Delete
            </button>

          </div>

        </article>
      `;

    }).join("");


    box.querySelectorAll(".edit-btn")
      .forEach(
        b=>b.addEventListener(
          "click",
          ()=>editProduct(b.dataset.id)
        )
      );


    box.querySelectorAll(".delete-btn")
      .forEach(
        b=>b.addEventListener(
          "click",
          ()=>removeProduct(b.dataset.id)
        )
      );

  },

  err=>{

    $("#productList").innerHTML=
      '<p class="message">Could not read Firestore: '+
      esc(err.message)+
      '</p>';

  }
);


/* =========================
   EDIT PRODUCT
========================= */

async function editProduct(id){

  const s=
    await getDoc(
      doc(db,"products",id)
    );

  if(!s.exists()) return;

  const p=s.data();


  $("#editId").value=id;

  $("#pName").value=p.name||"";

  $("#pNameMM").value=p.nameMM||"";

  $("#pBrand").value=p.brand||"";

  $("#pSize").value=p.size||"";

  $("#pPrice").value=p.price??0;

  $("#pDiscountPrice").value=
    Number(p.discountPrice||0) > 0 ? p.discountPrice : "";

  $("#pCategory").value=
    p.category||"Contact Lenses";

  updateColorFieldVisibility();

  if($("#pCategory").value === "Contact Lenses"){
    $("#pColorKey").value=
      p.colorKey||"gray";
  }


  $("#pStock").value =
    p.stockStatus==="preorder"
      ? "preorder"
      : p.stockStatus==="outofstock"
        ? "outofstock"
        : "instock";


  $("#pWaiting").value=
    p.waitingPeriod||
    (
      p.stockStatus==="preorder"
        ? "2 weeks"
        : ""
    );


  $("#pBadge").value =
    p.badge ||
    (
      $("#pStock").value==="preorder"
        ? "Pre-order"
        : $("#pStock").value==="outofstock"
          ? "Out of Stock"
          : "In Stock"
    );


  $("#pPowers").value=
    Array.isArray(p.powers)
      ? p.powers.join(", ")
      : (p.powers||"");


  const savedImages = Array.isArray(p.images) ? p.images.filter(Boolean) : [];

  $("#pImage").value=
    savedImages[0] ||
    p.imageUrl||
    p.image||
    "";

  $("#pImage2").value=
    savedImages[1] ||
    "";

  $("#pImageFile").value="";
  $("#pImageFile2").value="";
  showImagePreview($("#pImage").value);
  showImagePreview2($("#pImage2").value);
  $("#uploadStatus").textContent = $("#pImage").value
    ? "Current product image 1. Choose a new file to replace it."
    : "No image 1 saved for this product.";

  $("#uploadStatus2").textContent = $("#pImage2").value
    ? "Current product image 2. Choose a new file to replace it."
    : "No image 2 saved for this product.";


  $("#variantRows").innerHTML="";
  if(Array.isArray(p.variants)){
    p.variants.forEach(v=>addVariantRow(v));
  }

  $("#pDescription").value=
    p.description||
    p.desc||
    "";


  $("#pDescriptionMM").value=
    p.descriptionMM||
    p.descMM||
    "";


  $("#formTitle").textContent=
    "Edit product";

  $("#saveBtn").textContent=
    "Update product";


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}


/* =========================
   DELETE PRODUCT
========================= */

async function removeProduct(id){

  if(!confirm("Delete this product?")){
    return;
  }

  try{

    await deleteDoc(
      doc(db,"products",id)
    );

  }
  catch(err){

    alert(
      "Delete failed: "+
      (err.message||err.code)
    );

  }
}


/* =========================
   IMPORT OLD PRODUCTS
========================= */

$("#importBtn").addEventListener(
  "click",
  async()=>{

    if(
      !confirm(
        "Import the 15 products from your current website into Firestore?"
      )
    ){
      return;
    }


    const btn=$("#importBtn");

    btn.disabled=true;

    btn.textContent="Importing…";

    let added=0;

    let skipped=0;


    try{

      for(const p of oldProducts){

        const id=
          "legacy-"+String(p.id);

        const ref=
          doc(db,"products",id);

        const existing=
          await getDoc(ref);


        if(existing.exists()){

          skipped++;

          continue;
        }


        await setDoc(
          ref,
          {

            name:p.name||"",

            nameMM:p.nameMM||"",

            brand:p.brand||"",

            size:p.size||"",

            price:Number(p.price||0),

            discountPrice:
              Number(p.discountPrice||0) > 0 && Number(p.discountPrice) < Number(p.price||0)
                ? Number(p.discountPrice)
                : null,

            category:
              p.category||
              "Contact Lenses",

            colorKey:
              (p.category||"Contact Lenses") === "Contact Lenses"
                ? (p.colorKey||"clear")
                : null,

            stockStatus:
              p.stockStatus==="preorder"
                ? "preorder"
                : p.stockStatus==="outofstock"
                  ? "outofstock"
                  : "instock",

            waitingPeriod:
              p.stockStatus==="preorder"
                ? "2 weeks"
                : "",

            badge:
              p.badge||
              (
                p.stockStatus==="preorder"
                  ? "Pre-order"
                  : p.stockStatus==="outofstock"
                    ? "Out of Stock"
                    : "In Stock"
              ),

            powers:
              p.powers??null,

            imageUrl:
              p.image||"",

            description:
              p.desc||"",

            descriptionMM:
              p.descMM||"",

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()
          }
        );

        added++;
      }


      alert(
        `Import finished. Added ${added}, skipped ${skipped}.`
      );

    }
    catch(err){

      alert(
        "Import failed: "+
        (err.message||err.code)
      );

    }
    finally{

      btn.disabled=false;

      btn.textContent=
        "Import current 15 products";

    }
  }
);


resetForm();
