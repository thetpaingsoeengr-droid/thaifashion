THAI FASHION LENSES — FIREBASE PRODUCT MANAGEMENT

1) Upload these files to your GitHub repository:
   index.html
   styles.css
   script.js
   firebase-products.js
   admin.html
   admin.css
   admin.js
   Keep your existing images/ folder.

2) FIRESTORE RULES
Firebase Console > Firestore Database > Rules
Replace the rules with firestore.rules and click Publish.

The rules allow:
- everyone to read products (needed by the shop)
- only authenticated Firebase users to add/edit/delete products

3) ADMIN PAGE
Open:
https://YOUR-GITHUB-PAGES-URL/admin.html

Login with the Email/Password user you created in Firebase Authentication.

4) PHOTOS
Firebase Storage is not used.
Upload a photo to GitHub images/ and enter the path in Admin:
images/icy-gray.jpg

5) FIRST MIGRATION
Your old 15 products are still built into script.js as a fallback.
The Admin page has "Import current 15 products".
Click it once to copy them into Firestore.

You manually created Icy Gray already, so importing may create a second Icy Gray.
Delete one duplicate from the Admin page if that happens.

6) AFTER FIRESTORE HAS PRODUCTS
The public shop listens to Firestore live.
Add/Edit/Delete in admin.html and the shop updates from Firestore.

7) PRODUCT FIELDS
name, nameMM, price, category, colorKey, stockStatus,
waitingPeriod, badge, powers, imageUrl, description, descriptionMM
