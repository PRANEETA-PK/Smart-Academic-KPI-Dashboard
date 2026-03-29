# 🚀 Go-Live Deployment Guide: Academic Compass

Follow these steps carefully to move your project from your local machine to a live domain.

## 📦 Step 0: Git Push
Make sure all your latest changes (including my fixes) are pushed to your GitHub repository.
```bash
git add .
git commit -m "Deployment preparation"
git push origin your-branch-name
```

---

## 🛠️ Step 1: MongoDB Atlas (The Cloud Database)
Since your local MongoDB won't be accessible on the web, you need a cloud database.
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2.  Create a **Free Tier Cluster**.
3.  In **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere** (0.0.0.0/0).
4.  In **Database Access**, create a user with a username and password.
5.  Click **Connect** -> **Connect your application** and copy the **Connection String** (The MONGO_URI).
    - *Replace `<password>` in the string with your actual password.*

---

## 🖥️ Step 2: Render Deployment (The Backend Server)
1.  Log in to [Render.com](https://render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    - **Name**: `academic-compass-api`
    - **Root Directory**: `server` (⚠️ IMPORTANT)
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
5.  Go to **Environment Variables** and add:
    - `MONGO_URI`: (The connection string from Step 1)
    - `JWT_SECRET`: (Any long random string, like `your_secret_key_123`)
    - `NODE_ENV`: `production`
6.  Click **Deploy Web Service**.
7.  **Copy your Service URL** (e.g., `https://academic-compass-api.onrender.com`).

---

## 🌐 Step 3: Vercel Deployment (The Frontend UI)
1.  Log in to [Vercel.com](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    - **Root Directory**: Select the `client` folder (⚠️ IMPORTANT).
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
5.  Add **Environment Variables**:
    - `VITE_API_URL`: (The Render URL from Step 2, e.g., `https://academic-compass-api.onrender.com`)
    - `VITE_GOOGLE_CLIENT_ID`: (Your Google Client ID from Phase 1)
6.  Click **Deploy**.
7.  **Copy your Vercel URL** (e.g., `https://academic-compass.vercel.app`).

---

## 🔑 Step 4: Final Authentication Update
Your Google Login will **NOT** work on the live site until you white-list your new Vercel URL.
1.  Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Open your **OAuth 2.0 Client ID**.
3.  Add your Vercel URL (e.g., `https://academic-compass.vercel.app`) to:
    - **Authorized JavaScript origins**
    - **Authorized redirect URIs**
4.  **Save** (It may take 5–10 minutes to take effect).

---

## 🎉 Verification
1.  Visit your Vercel URL.
2.  Log in as any user.
3.  Check if Dashboard KPIs and Charts load correctly.
4.  Try generating a PDF report.

**Congratulations! Your institutional intelligence system is now live.**
