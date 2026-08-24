THAI FASHION LENSES UAE - WEBSITE

FILES
-----
index.html  = main website
styles.css  = website design
script.js   = products, cart, filters, WhatsApp ordering

HOW TO EDIT PRODUCTS
--------------------
Open script.js and find:

const products = [ ... ]

Each product has:
- name
- category
- price
- badge
- color
- description
- powers

Example:
{id:1,name:"Venice Gray",category:"Contact Lenses",price:15,...}

Change the name, price and options as needed.

HOW TO CHANGE WHATSAPP
----------------------
At the top of script.js:

const WHATSAPP_NUMBER = "971544608059";

Use country code without + or spaces.

HOW TO ADD REAL PRODUCT PHOTOS
------------------------------
This starter version uses elegant graphic placeholders so it works immediately.
For a production store, create an /images folder and update each product card/image
to use your actual product photography.

FREE HOSTING OPTIONS
--------------------
You can upload these files to:
- Netlify
- GitHub Pages
- Cloudflare Pages

IMPORTANT
---------
This is an original storefront inspired by the clean browsing pattern of wishlistoftheday.shop,
not a direct copy of its branding or assets.
