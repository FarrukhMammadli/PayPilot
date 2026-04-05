<div align="center">
  <img src="assets/logo.png" alt="PayPilot Logo" width="120" />
</div>

# PayPilot 🚀

> 🏆 **Hackathon Project**: This project was specifically developed in a short timeframe as an **MVP (Minimum Viable Product)** for a Hackathon. It serves as a conceptual demonstration of a practical, real-world technological solution.

**PayPilot** (or *CardAssistant*) is an advanced Artificial Intelligence (AI) powered mobile banking and personal finance assistant specifically designed for the Azerbaijani market. Built with React Native (Expo) and Supabase technologies, the application utilizes Google Gemini 2.5 Flash to understand natural language voice and text commands, providing users with the most profitable payment methods (e.g., suggesting the bank card with the highest cashback).

---

## 👥 Team & Contributors

* **Omar Musazada** (*Mobile & Frontend Development*) - Developed and coded the cross-platform React Native (Expo) mobile application, implemented UI/UX interfaces, and managed complex local states.
* **Sanan Hajiyev** (*Backend & Database Engineering*) - Designed the Supabase (PostgreSQL) database architecture, implemented high-level RLS (Row Level Security), and wrote the core SQL RPC (process_payment) atomic transaction logic.
* **Farrukh Mammadli** (*Designer & AI / Prompt Engineering*) - Integrated the Google Gemini 2.5 Flash model via Edge Functions, engineered the banking-specific AI "System Prompt" for parsing text/audio commands, and created the overall UI/UX design concept.
* **Rauf Jafarov** (*DevOps & Cloud Architecture*) - Set up and managed the serverless cloud infrastructure on Edge Functions, secured environment variables (.env), and configured cloud deployments.
* **Ibrahim Mammadov** (*Project Manager*) - Led the overall project development lifecycle, coordinated team tasks and workflows, and successfully shaped the product's business vision and requirements.

---

## 🌟 Key Features & Interface

### 🤖 AI Assistant
<p align="center">
  <img src="assets/chat.png" width="300" style="border-radius: 10px; margin-bottom: 5px;" />
</p>
The **AI Assistant** screen is the heart of the application. You simply use natural language or voice commands like *"Top up 15 manats to Bakcell"* or *"Buy a ticket for CinemaPlus"*. The assistant remembers local bank campaigns in the background (e.g., Kapital Bank offers 10% cashback on movies), and recommends the most rewarding card to use. With your confirmation, the payment happens instantly and securely as shown above.

### 💳 Digital Wallet (My Wallet)
<p align="center">
  <img src="assets/wallet.png" width="300" style="border-radius: 10px; margin-bottom: 5px;" />
</p>
Manage all your virtual and physical bank cards from a single page! This screen (My Wallet) lists your cards with their respective numbers, balances, and beautiful designs. You can add local cards like ABB, Kapital Bank, or Leobank, mark them as "Favorites", and visually track your active remaining balance in real time.

### 📊 Expense Management & Analytics (Insights)
<p align="center">
  <img src="assets/insights.png" width="300" style="border-radius: 10px; margin-bottom: 5px;" />
</p>
The **Insights** panel is a modern dashboard that not only tracks your expenses but also your earnings. Weekly and monthly spendings are visualized with column charts, helping you see which days you spend the most. Moreover, in the "Bonuses & Offers" section, you can see the exact numerical amounts of savings (Cashback/Bonuses) you accrued by choosing the right cards at merchants like Bravo or Wolt.

### 🔒 Secure Payments & OTP
<p align="center">
  <img src="assets/otp.png" width="300" style="border-radius: 10px; margin-bottom: 5px;" />
</p>
At the final step of the payment, a highly secure **OTP screen** protects your funds. Structured similarly to "Verified by Visa" and Central Bank safety regulations, you enter a 4-digit code sent to you via SMS, reducing the risk of unauthorized transactions to zero. All financial operations are atomically processed and stored via **Supabase RPC**.

---

## 🛠 Tech Stack

| Layer | Technology | Feature / Purpose |
|---------|-------------|------------------|
| **Frontend** | React Native, Expo, TypeScript | Cross-platform (iOS/Android), complex animations |
| **Backend** | Supabase (PostgreSQL) | Database, Auth, SQL Row Level Security (RLS) |
| **AI Core** | Deno (Edge Functions) + Gemini 2.5 Flash | Advanced Natural Language Processing (NLP) & audio parsing |
| **Styling** | React Native StyleSheet / Lucide Icons | Premium, modern, and dynamic UI creation |

## 📁 Project Structure

```text
PayPilot/
├── assets/            # Media files and images for GitHub README
├── backend/           # Database infrastructure
│   └── supabase/
│       ├── migrations/    # Base tables (cards, transactions) and backend functions
│       └── functions/
│           └── ai-chat/   # Gemini AI API - Edge Function scripts
│
├── frontend/          # Mobile application (Expo) codebase
│   ├── src/
│   │   ├── components/    # Reusable UI buttons, cards, etc.
│   │   ├── screens/       # Main app views (Home, Chat, Wallet)
│   │   ├── services/      # AI and Database integrations
│   │   └── context/       # Auth and System state management
│   ├── App.tsx          
│   └── package.json       
│
└── README.md          # Azerbaijani presentation file
└── README_EN.md       # English presentation file (This file)
```

## 🚀 Setup and Installation

### 1. Backend Setup (Supabase)
1. Create a new project corresponding to your profile on the [supabase.com](https://supabase.com) platform.
2. Navigate to the **SQL Editor** section and run the `backend/supabase/migrations/001_initial_schema.sql` script located in the project.
3. Copy your project's *URL* and *Anon Key* from your Supabase dashboard and paste them into a newly created `frontend/.env` file.
4. For **Gemini AI** integration: Go to Supabase Dashboard ➔ Edge Functions ➔ Secrets and add a new secret key named `GEMINI_API_KEY`.

### 2. Frontend Setup (React Native / Expo)
Start the project locally by executing the following commands:

```bash
cd frontend
npm install
npx expo start
```
*Note: For deeper details, you can read the `frontend/README.md` and `backend/README.md` files.*

---

## 📄 License
This project is open-source and protected under the **MIT License**. For more detailed information, you can check the [LICENSE](./LICENSE) file in the root directory.
