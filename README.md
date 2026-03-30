# 🔗 CampusChain

CampusChain is a comprehensive **Blockchain-Powered Campus Fintech Platform** designed to modernize campus transactions. Built with a stunning Cyberpunk Neon aesthetic, it acts as a digital wallet allowing users to seamlessly send and receive money, track financial insights, and execute secure payments using QR codes.

## ✨ Features

- **💰 Smart Wallet**: Instantly send and receive money within the campus ecosystem.
- **📷 QR Code Payments**: Generate and scan QR codes for frictionless, touchless transactions.
- **📊 Financial Insights**: Visualize spending habits and transaction trends through interactive charts.
- **📜 Transaction Histories & Receipts**: Maintain detailed histories of all transfers and generate downloadable PDF receipts.
- **🛡️ Admin Dashboard**: Comprehensive oversight with role-based access for ecosystem administrators.
- **🎨 Premium UI/UX**: High-contrast, glassmorphism Cyberpunk Neon interface powered by Tailwind CSS and Framer Motion.

## 🛠️ Tech Stack

**Frontend**
- React 18 & Vite
- Tailwind CSS (Custom Dark Theme UI)
- Framer Motion (Animations)
- Recharts (Analytics Data Visualization)
- HTML5-QRCode & jsPDF

**Backend & Database**
- Node.js & Express.js
- MongoDB & Mongoose (Schema Modeling)
- JWT (JSON Web Tokens) Authentication
- bcryptjs (Credential Encryption)

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed and a running instance of [MongoDB](https://www.mongodb.com/). 

### Setting up the Environment
1. Create a `.env` file in the `backend` directory.
2. Add your local MongoDB URI, JWT Secret, and server port configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campuschain
JWT_SECRET=your_jwt_secret
```

### Running the Backend

```bash
cd backend
npm install
npm run dev
```
*(Optional)* You can seed the database with initial dummy data by running `npm run seed`.

### Running the Frontend

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a Pull Request.