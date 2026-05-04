# 🎬 ContentForge: YouTube Content Repurposer

ContentForge is a powerful, **100% privacy-focused** tool that transforms any YouTube video into high-quality, multi-platform social media content using **local AI (Ollama)**. 

No OpenAI API keys. No YouTube API keys. Just your machine and your creativity.

![Project Preview](https://via.placeholder.com/1200x600?text=ContentForge+YouTube+Repurposer)

## ✨ Key Features

-   **🦙 Local AI Processing**: Powered by [Ollama](https://ollama.com/). Use models like Llama 3, Mistral, or Gemma entirely on your hardware.
-   **🔑 Zero YouTube API Key**: Uses intelligent scraping to fetch video metadata and transcripts without official Google API credentials.
-   **📱 Multi-Format Generation**:
    -   **Twitter/X**: Viral-style tweets and educational threads.
    -   **LinkedIn**: Professional posts with hooks.
    -   **Articles**: SEO-friendly blog posts in Markdown/HTML.
    -   **Visuals**: Auto-generated **Instagram/LinkedIn Carousels** and Infographics.
    -   **Newsletters**: Drafted email editions ready to send.
-   **🎨 Premium UI**: Modern dark-mode interface built with React, Tailwind CSS, and Framer Motion.
-   **📦 One-Click Start**: Includes a batch script to launch the full stack instantly.

## 🛠️ Tech Stack

-   **Frontend**: React.js, Tailwind CSS, Framer Motion, Lucide Icons, Axios.
-   **Backend**: Node.js, Express.
-   **AI Engine**: Ollama (Local API).
-   **Media Engines**: Sharp, Canvas (for image generation).
-   **Data Fetching**: `@distube/ytdl-core`, `youtube-transcript`.

## 🚀 Quick Start

### 1. Prerequisites
-   [Node.js](https://nodejs.org/) (v18+)
-   [Ollama](https://ollama.com/) installed and running.

### 2. Setup Ollama
Pull your preferred model:
```bash
ollama pull llama3
```

### 3. Installation
Clone the repository and install dependencies:
```bash
# Install root (if any)
npm install

# Install Backend
cd backend && npm install

# Install Frontend
cd ../frontend && npm install
```

### 4. Configuration
The project is pre-configured to work out of the box with Ollama on `localhost:11434`. You can adjust settings in `backend/.env`:
```env
OLLAMA_MODEL=llama3
PORT=5000
```

### 5. Running the App
From the root directory, simply run:
```powershell
.\run.bat
```
This will start both the backend (Port 5000) and the frontend (Port 3000).

## 📁 Project Structure

```text
├── backend/
│   ├── services/       # YouTube, Transcript, AI, and Image logic
│   ├── controllers/    # API Request handling
│   └── server.js       # Express entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # UI Cards and Inputs
│   │   ├── hooks/      # State management logic
│   │   └── services/   # API communication
└── run.bat             # Unified startup script
```

## 🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.

---

Built with ❤️ for content creators who value privacy and local compute.
