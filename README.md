# Voice Invoice - AI-Powered Voice Invoicing Application

An intelligent, real-time voice-driven invoice generator that converts spoken words into structured digital invoices seamlessly. Built with React, TypeScript, AssemblyAI, Express, and Tailwind CSS.

---

## 🌟 Key Features

- 🎙️ **Real-Time Voice Recognition**: Live voice transcription powered by AssemblyAI Real-Time WebSocket streaming.
- 🧠 **Smart Invoice Parsing**: Automatically extracts client details, line items, quantities, rates, tax percentages, and discount values from natural speech.
- 🌐 **Multilingual Support**: Supports multiple languages and regional accents for hands-free invoicing.
- 📄 **Interactive Invoice Preview**: Real-time editable invoice layout with calculation of subtotal, tax, discounts, and total amount.
- 💾 **Offline Resilience**: Offline caching and state persistence to ensure invoice data is never lost.
- 🎨 **Modern & Responsive UI**: Clean interface built with Tailwind CSS and Lucide React icons.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Processing**: Web Audio API / AudioWorklet & AssemblyAI WebSocket Client

### Backend
- **Runtime**: Node.js
- **Server**: Express.js
- **API Services**: AssemblyAI Realtime Token Generation endpoint (`/api/token`)
- **Utilities**: CORS, Node-Fetch, Dotenv

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)
- [AssemblyAI API Key](https://www.assemblyai.com/) (free tier available)

---

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ASWINKUMAR-AE/voice-invoice.git
   cd voice-invoice
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure Environment Variables**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
   ```

---

## 💻 Running the Application

### 1. Start the Backend Server
From the `backend/` directory:
```bash
node server.mjs
```
The token server will run on `http://localhost:5000`.

### 2. Start the Frontend
From the root directory:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## 📁 Project Structure

```text
voice-invoice/
├── backend/                  # Express server for temporary auth tokens
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Backend dependencies
│   └── server.mjs            # Token generation API
├── src/
│   ├── components/           # UI components
│   │   ├── InvoiceForm.tsx          # Manual edit form
│   │   ├── InvoicePreview.tsx       # Live invoice preview & printable view
│   │   ├── LanguageSelector.tsx     # Language switch component
│   │   ├── TranscriptionDisplay.tsx # Real-time voice text display
│   │   └── VoiceRecorder.tsx        # Microphone capture & WebSocket handler
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Audio recorders, parsers & offline store
│   ├── App.tsx               # Main application container
│   ├── main.tsx              # Application entry point
│   └── index.css             # Tailwind base styles
├── index.html                # HTML entry
├── package.json              # Frontend dependencies and scripts
├── tailwind.config.js        # Tailwind styling configuration
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite configuration
```

---

## 📄 License

This project is maintained by [ASWINKUMAR-AE](https://github.com/ASWINKUMAR-AE).
