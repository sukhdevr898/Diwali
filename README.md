# Mahabumper Lucky Draw — ₹49 Lottery Platform

A production-ready lottery web application with instant online UPI payments, real-time ticket serialization, a viral "Share with 10 Friends" loop, and an admin management console for payment verification and manual winner selection.

---

## 🚀 Quick Deploy on Render (Free Tier)

This application is ready for deployment on **Render's Free Web Service Tier**.

### Method 1: Web Service Setup (Step-by-Step)

1. **Sign in to Render**:
   - Go to [render.com](https://render.com) and log in (or sign up with GitHub/GitLab).

2. **Create New Web Service**:
   - Click **New +** in the top navigation and select **Web Service**.
   - Connect your GitHub repository containing this project.

3. **Configure Service Settings**:
   - **Name**: `mahabumper-lottery` (or any name you choose)
   - **Language / Environment**: `Node`
   - **Region**: Singapore (`southeast-asia`) or Frankfurt (`europe-central`) (choose closest to India)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave blank (default `./`)
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```
   - **Instance Type / Plan**: Select **Free** ($0 / month)

4. **Environment Variables**:
   Under the **Environment Variables** section, add the following:

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production mode and static serving |
   | `PORT` | `10000` | (Render automatically injects this; app handles `process.env.PORT`) |
   | `RUPAYEX_API_TOKEN` | `6e9066fd1f930cf88521377ee677d8aa` | Your payment gateway API token |
   | `RUPAYEX_BASE_URL` | `https://rupayex.net/api` | Gateway base endpoint |

5. **Deploy**:
   - Click **Create Web Service**.
   - Render will run `npm install && npm run build` and then start the server with `npm start`.
   - Once completed, your live URL will be: `https://<your-service-name>.onrender.com`.

---

## 🛠️ Local Development & Build Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
Starts the full-stack Express server with Vite middleware on port 3000:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
Compiles TypeScript and bundles client assets into `/dist`:
```bash
npm run build
```

### 4. Run Production Server Locally
```bash
npm start
```

### 5. Type Check & Linting
```bash
npm run lint
```

---

## 🔐 Admin Panel Access

The Admin Panel allows verifying payments, checking gateway statuses, and choosing lottery winners.

- **Authorized Admin Email**: `sukhdevr898@gmail.com`
- **How to Access**:
  1. Click **Sign In** in the top navbar and log in with `sukhdevr898@gmail.com`.
  2. The **Admin** tab will appear in the navbar.
  3. Or click **Admin Access** in the footer of the website.
  4. Or visit directly: `https://<your-app-url>/?tab=admin`

### Admin Features:
- **Payment Orders**: Query payment gateway status directly (`⚡ Check Gateway Status`) or manually approve/reject orders.
- **All Tickets**: View all serialized tickets with buyer details. Use **"Choose as Winner"** shortcut on any ticket.
- **Choose Winner Console**: Pick any candidate ticket, assign the prize tier (1st, 2nd, 3rd, Consolation, or custom), and declare the official winner in real time.

---

## 💳 Payment Gateway Integration Details

- **Create Order Endpoint**: `POST /api/rupayex/create-order`
  - Body: `{ amount, order_id, redirect_url, customer_mobile }`
- **Status Check Endpoint**: `GET /api/rupayex/order-status/:orderId`
  - Validates `payment_status === 'SUCCESS'` before issuing tickets.
- **Auto Status Polling**: The frontend automatically queries payment status every 4 seconds after opening the payment page.

---

## 💡 Render Free Tier Notes
- **Cold Starts**: Render free tier instances spin down after 15 minutes of inactivity. The first request after sleep may take ~30–50 seconds to boot up.
- **Custom Domains**: You can attach your custom domain (e.g., `www.yourlottery.com`) for free in Render under **Settings > Custom Domains**.
- **SSL / HTTPS**: Automatic free TLS/SSL certificates are provided by Render.
