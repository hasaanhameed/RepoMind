# RepoMind

RepoMind is a powerful, AI-driven web application that allows developers to understand, explore, and chat with any GitHub repository in minutes. By leveraging advanced Large Language Models (LLMs) and vector embeddings, RepoMind transforms raw codebases into interactive, searchable, and conversational knowledge bases.

## Features

* **Instant Repository Ingestion:** Simply provide a GitHub URL, and RepoMind will clone, parse, and process the entire repository. It intelligently filters out non-essential files (like `node_modules` or `.git`) and extracts the core code.
* **AI-Powered Code Assistant:** Chat directly with your codebase. Powered by Groq and LLaMA-3 through LangGraph, the AI agent can explain complex logic, locate specific functions, or act as an automated code reviewer.
* **Semantic Code Search:** Utilizing Sentence Transformers and PostgreSQL with the `pgvector` extension, RepoMind performs highly accurate semantic searches across thousands of files to find exactly what the AI needs to answer your queries.
* **Real-time Progress Tracking:** Large repositories take time to process. RepoMind uses Redis background tasks to handle heavy ingestion, providing real-time progress updates directly in the user interface.
* **Secure Authentication:** Built-in user authentication with secure JWT (JSON Web Tokens) and bcrypt password hashing. Your chats and imported repositories are kept private to your account.
* **Chat History Management:** Seamlessly resume past conversations. You can rename, delete, and organize your chat sessions through the intuitive sidebar interface.
* **Modern, Responsive UI:** A sleek, dark-themed interface built with React, Vite, Tailwind CSS, and Shadcn UI components ensures a premium user experience across all devices.

## Technology Stack

### Backend
* **Framework:** FastAPI (Python)
* **AI & Orchestration:** LangChain, LangGraph, Groq API (LLaMA-3)
* **Database:** PostgreSQL with `pgvector` (via Supabase), SQLAlchemy (Async)
* **Caching & Background Tasks:** Redis (via Upstash)
* **Authentication:** JWT, Passlib, Bcrypt

### Frontend
* **Framework:** React 18 with TypeScript and Vite
* **Styling:** Tailwind CSS, Shadcn UI
* **State Management & Routing:** TanStack Query (React Query), React Router DOM
* **HTTP Client:** Axios with Interceptors

## Local Development Setup

### Prerequisites
* Python 3.11+
* Node.js 18+ & npm/bun
* PostgreSQL database with `pgvector` enabled
* Redis instance

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd repomind-backend
```

Create a virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `repomind-backend` directory with the following variables:
```env
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname
HF_TOKEN=your_huggingface_token
SECRET_KEY=your_secure_random_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=30
REDIS_URL=redis://localhost:6379
```

Run the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd repomind-frontend
```

Install the dependencies:
```bash
npm install
```

Create a `.env` file in the `repomind-frontend` directory:
```env
VITE_API_URL=http://localhost:8000
```

Start the Vite development server:
```bash
npm run dev
```

The frontend will be available at `http://repomind-lab.vercel.app/`.

## Architecture & Implementation Details

RepoMind's core functionality relies on a carefully orchestrated interaction between the frontend, backend APIs, and several AI infrastructure components.

### 1. Repository Ingestion Workflow
When a user submits a GitHub URL, the process is pushed to a background task using FastAPI's `BackgroundTasks` to prevent HTTP timeouts.
*   **Cloning & Filtering:** The `gitpython` library clones the repository into a temporary directory. The system walks the directory tree, explicitly filtering out non-essential folders (like `.git` and `node_modules`) and files that are not code-related, based on a predefined list of supported extensions.
*   **Chunking & Embedding:** Each supported file is read and passed through LangChain's `RecursiveCharacterTextSplitter` to divide the code into semantically meaningful, overlapping chunks. These chunks are then embedded into high-dimensional vectors using the open-source `sentence-transformers/all-MiniLM-L6-v2` model from Hugging Face.
*   **Storage & Status Tracking:** The vector embeddings are pushed to a PostgreSQL database utilizing the `pgvector` extension for efficient similarity searches. During this entire process, the backend updates an Upstash Redis cache with real-time progress percentages, which the React frontend polls (every 1.5 seconds) to display a live progress bar.

### 2. Semantic Search & Retrieval (RAG)
When the AI agent needs context to answer a user's question, it relies on Retrieval-Augmented Generation (RAG).
*   The user's query is converted into an embedding using the exact same Hugging Face model used during ingestion.
*   A similarity search is executed against the `pgvector` database, comparing the query vector against all code chunk vectors from the specific repository.
*   The top `k` most relevant code snippets are retrieved and injected into the prompt context for the LLM.

### 3. AI Agent Orchestration
The chat interface is powered by an autonomous agent rather than a simple conversational model.
*   **LangGraph Integration:** The application utilizes `langgraph` to create a `create_react_agent`. This agent operates in a continuous loop of reasoning and acting.
*   **Tool Execution:** The agent is equipped with custom tools (like code search capabilities). Before generating a final answer, the agent analyzes the user's prompt, decides if it needs to search the codebase, executes the search tool, reviews the retrieved code, and then synthesizes the final response.
*   **Model:** The core reasoning is handled by the `llama-3.3-70b-versatile` model via the Groq API, chosen for its exceptional speed and reasoning capabilities.

## Deployment

RepoMind is designed to be easily deployed to modern cloud platforms:

* **Backend:** Packaged with a `Dockerfile` and `docker-compose.yml`, optimized for deployment on platforms like Railway or Render.
* **Frontend:** Configured with a `vercel.json` for seamless Single Page Application (SPA) routing and deployment on Vercel.
