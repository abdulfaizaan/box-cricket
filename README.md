# 🏏 PitchPass: Neo-Brutalist Box Cricket Booking

**PitchPass** is a high-energy, fully functional Box Cricket booking platform. Designed with a striking **Neo-Brutalist** aesthetic, it completely ditches the boring, sterile look of standard booking systems. It was 100% "vibe-coded" with an emphasis on bold typography, aggressive high-contrast shadows, neon lime (`#ccff00`) accents, and heavily interactive components.

## ✨ The Vibe
This project was built to feel *alive*. 
- **Tactile Inputs:** Forget native `<input type="date">`. PitchPass uses an interactive, horizontally scrollable row of physical "date cards".
- **Downloadable Tickets:** Upon successful booking, the app generates a jagged-edge "printable" ticket that can be downloaded as a crisp PNG right to your device.
- **Premium Admin Dashboard:** The host portal contrasts the aggressive frontend with a sleek, premium, dark-mode glassmorphic dashboard for managing slots and verifying OTPs.

## 🛠️ Tech Stack

**Frontend (`/frontend`)**
* **Astro:** Blazing fast static site generator and routing.
* **React:** For all the complex, interactive client-side components (like the booking flow).
* **Tailwind CSS v4:** Using the bleeding-edge Tailwind v4 for the heavy brutalist styling, animations, and typography.
* **html-to-image:** For generating high-quality PNG snapshots of the booking tickets.

**Backend (`/backend`)**
* **Express.js:** Lightweight and fast REST API.
* **Prisma:** Modern database ORM for handling slot availability and admin data.
* **JWT & bcrypt:** For secure, token-based authentication on the Host Portal.

## 🚀 Features
* **Dynamic Pricing:** Automatically charges ₹500/hr during the day (08:00 AM - 08:00 PM) and ₹700/hr at night.
* **Advance Booking:** Horizontally scroll through 30 days of advance slots.
* **OTP Verification:** Generates a secure 6-digit OTP for every booking. Players show this OTP at the venue to pay offline and play.
* **Admin Controls:** Secure `/host-xyz-secret` portal to view all bookings, check statuses, and mark OTPs as verified.

## 💻 Running Locally

### 1. Start the Backend
Navigate to the `backend` folder, install dependencies, and start the server.
```bash
cd backend
npm install
npm run dev
```
*(Runs on `http://localhost:5000`)*

### 2. Start the Frontend
In a new terminal, navigate to the `frontend` folder.
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:4322`)*

## 🔑 Default Admin Credentials
To access the Host Portal:
* **Email:** `Arsalan@boxcricket.com`
* **Password:** `8897482687@MA_BOX`

---
*Vibe coded with ⚡ by Antigravity.*
