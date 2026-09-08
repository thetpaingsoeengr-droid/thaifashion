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


onAuthStateChanged(auth,user=>{
  $("#loginView").classList.toggle("hidden",!!user);
  $("#dashboard").classList.toggle("hidden",!user);

  if(user){
    $("#adminIdentity").textContent =
      user.email || "Authenticated admin";
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
   PRODUCT DATA
========================= */

function payload(){

  const stock=$("#pStock").value;

  return {

    name:$("#pName").value.trim(),

    nameMM:$("#pNameMM").value.trim(),

    price:Number($("#pPrice").value||0),

    category:$("#pCategory").value,

    colorKey:$("#pColorKey").value,

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

    imageUrl:$("#pImage").value.trim(),

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

  $("#pImage").value="";
  $("#pImageFile").value="";
  showImagePreview("");
  $("#uploadStatus").textContent="No new image selected.";

  msg($("#formMessage"),"");
}


$("#resetBtn").addEventListener(
  "click",
  resetForm
);


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

    $("#saveBtn").disabled=true;

    msg($("#formMessage"),"Saving…");

    try{

      const imageFile=$("#pImageFile").files?.[0];
      if(imageFile){
        p.imageUrl = await uploadProductImage(imageFile);
      }

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
              AED ${Number(p.price||0).toFixed(0)}
              • ${stockText}
              • ${esc(p.colorKey||"")}
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

  $("#pPrice").value=p.price??0;

  $("#pCategory").value=
    p.category||"Contact Lenses";

  $("#pColorKey").value=
    p.colorKey||"gray";


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


  $("#pImage").value=
    p.imageUrl||
    p.image||
    "";

  $("#pImageFile").value="";
  showImagePreview($("#pImage").value);
  $("#uploadStatus").textContent = $("#pImage").value
    ? "Current product image. Choose a new file to replace it."
    : "No image saved for this product.";


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

            price:Number(p.price||0),

            category:
              p.category||
              "Contact Lenses",

            colorKey:
              p.colorKey||
              "clear",

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
