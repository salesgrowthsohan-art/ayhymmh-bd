# Chabi Guccha Shop

Create a sleek, ultra-minimalist, mobile-first e-commerce web application for a Keychain Store in Bangladesh named "চাবির গোছা".



### Design Aesthetic

- Modern, brutalist but cute pinky style

- Soft pink accents (#FF85A2, #FFB6C1, #FFF0F5)

- Subtle glassmorphism, rounded corners, clean typography

- Fast, quick-loading animations

- Mobile-first responsive design



### Technical Requirements

- Pure React + Tailwind CSS (or Next.js if preferred)

- All data persisted in localStorage (products, cart, delivery fee, settings, admin password)

- Primary currency: BDT (৳)

- WhatsApp number: 01630871105

- Default Admin Password: 1240928



### 1. Public Storefront

- Header: Store name "চাবির গোছা", search bar, sticky cart icon with item count badge

- Hero section: Minimal high-converting banner for keychain collection

- Two main categories/options:

  1. Flag option

  2. Keychain stuff option

- Product Grid: 2 columns on mobile, 4 on desktop

  - Each card shows: Product image, Title, SKU (e.g. KC-01), Price (৳), "Add to Cart" button

- Clicking a product opens a Product Detail Page with:

  - Large product image

  - “Swipe the pics” instruction

  - Product name, price, stock status

  - Product description

  - Free delivery badge

  - bKash or Cash on Delivery info

  - “Order Now” button



### 2. Cart & Checkout

- Cart Drawer/Modal:

  - Item list with thumbnail, title, SKU, unit price, quantity controls (+/-), remove button

  - Subtotal

  - Flat Delivery Charge (loaded from settings, default ৳60)

  - Grand Total = Subtotal + Delivery Charge

- Checkout form inside cart:

  - Customer Name (required)

  - Phone Number (required)

  - Delivery Address (required)

- “Confirm Order via WhatsApp” button:

  - Validates form

  - Generates nicely formatted WhatsApp message:

    🛍️ New Order from Website

    Itemized list (Title, SKU, Qty, Price)

    Subtotal + Delivery Fee + Grand Total

    Customer Name, Phone, Address

  - Opens: https://wa.me/8801630871105?text=[URL_ENCODED_MESSAGE]



### 3. Direct WhatsApp Order (No Cart Option)

- “Order Now” on product detail page directly opens WhatsApp with pre-filled message

- Also add a floating WhatsApp contact button

- Homepage has “Follow up on my order” button that opens WhatsApp with a pre-written message template for name, phone, and order details



### 4. Password-Protected Admin Panel

- Access via discreet “Admin Login” button in footer or /admin route

- Password modal (default password: 1240928)

- After login, session stays on the same device

- Admin features:

  - Product Manager: Add / Edit / Delete products (Title, SKU, Price, Image URL, Category: Flag or Keychain, Description, Stock status)

  - Store Settings:

    - Update WhatsApp number

    - Update Flat Delivery Charge

    - Change Admin Password

  - Everything controlled from Admin panel



### Initial Mock Data

Populate with 6 sample keychains:

- Unique SKUs: KC-01 to KC-06

- Prices: ৳100 – ৳150

- Dummy images from Unsplash

- Delivery charge: ৳60

- Mix of Flag and Keychain categories



### Extra Details

- Delivery note: Dhaka-তে ১–২ দিনের delivery

- Instagram: “Instagram · soon”

- Payment: bKash or Cash on Delivery

- Design should feel cute + pinky + brutalist minimal



Generate a fully working, clean, modular React application with all features functional and localStorage persistence.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ayhymmh-bd.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5e16d20f-b84c-42ca-a56a-e7eb50c66c57).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
