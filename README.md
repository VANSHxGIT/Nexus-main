# Nexus
**Intelligent Talent Assembly Platform**

Welcome to **Nexus**! Nexus is an advanced platform designed to streamline and elevate the technical hiring process. By leveraging a team of specialized AI agents, Nexus thoughtfully reviews candidate profiles, conducts engaging technical interviews, and efficiently matches top talent with the right opportunities.

---

## 🏗️ Architecture Overview

The system is built with a clear separation of concerns, pairing a powerful AI-driven backend with a fast, responsive frontend for an optimal user experience.

### Backend (Python / FastAPI)
* **Framework**: [FastAPI](https://fastapi.tiangolo.com/) for lightning-fast, asynchronous API endpoints.
* **Agent Infrastructure**: Powered by AgentField, orchestrating specialized AI nodes (Gateway, Synapse, Cortex, Validator) to handle complex reasoning.
* **Database**: [Neon](https://neon.tech/) (Serverless PostgreSQL) for transactional data and [Supabase](https://supabase.com/) for user authentication and state management.
* **AI Models**: Seamless integration with external LLM APIs (like Groq) for deep architectural analysis and dynamic interview generation.

### Frontend (React / Vite)
* **Framework**: React 19 running on Vite for rapid development and highly optimized production builds.
* **Routing**: React Router DOM for smooth, single-page application (SPA) navigation.
* **UI/UX**: A clean, deliberate design system using vanilla CSS and Framer Motion for premium micro-interactions and elegant layout transitions.

---

## 🛠️ Prerequisites

Before you begin, make sure you have the following installed on your machine:
* **Node.js** (v18 or higher)
* **Python** (v3.10 or higher)
* **npm** or **yarn** (for managing frontend dependencies)

---

## 🔐 Environment Configuration

To connect the backend to your databases and AI services, you'll need to set up a few environment variables. 

Create a `.env` file in the root directory of the project and add the following:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key

# Neon Database Configuration
NEON_DSN=your_neon_postgres_connection_string

# AI Provider Configuration
GROQ_API_KEY=your_groq_api_key
```
*Note: The frontend connects directly to the local backend API, so it doesn't require its own environment variables during local development.*

---

## 🚀 Startup Guide

To get Nexus up and running locally, you'll need to start both the backend API and the frontend client.

### 1. Start the Backend

Open your terminal, navigate to the project root, and run:

```bash
# Install the required Python dependencies
pip install -r requirements.txt

# Start the FastAPI server using Uvicorn
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```
Your backend API should now be humming along at `http://localhost:8000`.

### 2. Start the Frontend

Open a second terminal window, head into the frontend directory, and run:

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```
*(Alternatively, you can run `npm run build` followed by `npm run preview` to test the production bundle).*

Your frontend client will be available at the URL provided in your terminal (usually `http://localhost:5173`).

---

## 📂 Project Structure

Here's a quick look at how the project is organized:

```text
Nexus/
├── api/
│   └── main.py                 # FastAPI application entry point and router
├── ai_backend/
│   ├── core.py                 # Database connections and Agent setup
│   ├── orchestrator.py         # Main AI pipeline logic
│   ├── schemas.py              # Pydantic data validation models
│   ├── reasoners/              # Cognitive agent logic (Cortex, Synapse, Validator)
│   └── skills/                 # Agent tools (e.g., GitHub/LinkedIn scrapers)
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, etc.)
│   │   ├── pages/              # Main route views (Landing, Dashboard, Onboarding)
│   │   ├── App.tsx             # Core routing and transition wrappers
│   │   └── main.tsx            # React application entry point
│   ├── index.css               # Global design tokens and styling
│   └── package.json            # Frontend dependency list
└── requirements.txt            # Python dependency list
```

---

## 🛡️ Security & Best Practices

Nexus processes sensitive candidate data, so security is a priority. Please ensure that your `.env` file (containing your `NEON_DSN`, `SUPABASE_KEY`, and `GROQ_API_KEY`) is **never** committed to version control. 

Additionally, the agent thought-logs use deterministic state updates. If you ever need to alter the `thought_logs` schema, remember to update the corresponding Server-Sent Events (SSE) streaming logic in `api/main.py`.
