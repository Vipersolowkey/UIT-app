UIT AI Learning Portal

An AI-powered learning platform designed to help students practice exams, solve coding problems, and interact with an intelligent assistant.

The system integrates Retrieval-Augmented Generation (RAG), exam practice, coding exercises, and daily AI study recommendations into one unified portal.

This project demonstrates how modern AI tools can enhance self-learning, exam preparation, and programming practice.

Live Demo

Frontend
UIT AI Learning Portal

An AI-powered learning platform designed to help students practice exams, solve coding problems, and interact with an intelligent assistant.

The system integrates Retrieval-Augmented Generation (RAG), exam practice, coding exercises, and daily AI study recommendations into one unified portal.

This project demonstrates how modern AI tools can enhance self-learning, exam preparation, and programming practice.

Live Demo

Frontend
https://uit-app-three.vercel.app/

Backend API Docs
https://uit-app.onrender.com/health

Screenshots
Home Page

Dashboard with study suggestions and navigation.

Practice System

Students can choose subject → exam type → start practice.

AI Chatbot

RAG-powered assistant that answers course-related questions.

Coding Practice

LeetCode-style coding interface with editor and test execution.

Key Features
AI Chatbot (RAG)

Students can ask questions related to course materials.

The system retrieves relevant knowledge using vector search and generates answers using an LLM.

Workflow

Student Question
      ↓
Vector Search (Qdrant)
      ↓
Retrieve Context
      ↓
Groq LLM generates answer

Technologies used

Qdrant Vector Database

Groq LLM API

Document ingestion pipeline

Exam Practice System

Students can practice exam questions by selecting

Subject → Midterm / Final → Start Exam

Supported question types

Multiple Choice (MCQ)

Features

Timer

Question navigation

Score calculation

Detailed review of wrong answers

Essay Questions

Students type their answers and receive feedback.

Features

Text answer input

Optional rubric-based grading

Feedback suggestions

Coding Problems

A LeetCode-style coding interface that allows students to practice programming problems.

Features

Code editor

Language selection

Sample input/output

Run / Submit functionality

Currently uses mock execution but designed to integrate with Judge0 for real code execution.

Daily Study Nudges

The system generates daily study suggestions to encourage consistent learning.

Examples

Practice 10 MCQ questions

Solve a coding problem

Review a weak topic

API Endpoints

GET /nudges/today
POST /nudges/accept
Tech Stack
Frontend

React

TypeScript

Vite

TailwindCSS

Backend

FastAPI

Qdrant (Vector Database)

Groq LLM API

Data Layer

JSON Question Bank

Vector embeddings for RAG

System Architecture
Frontend (React + Vite)
        │
        ▼
Backend (FastAPI)
        │
        ├── Question Bank API
        ├── Nudges Recommendation System
        ├── Coding Practice API
        └── RAG Chatbot
                │
                ▼
        Qdrant Vector Database
                │
                ▼
            Groq LLM API
Project Structure
project-root
│
├── backend
│   ├── app
│   │   ├── main.py
│   │
│   │   ├── routes
│   │   │   ├── chat.py
│   │   │   ├── search.py
│   │   │   ├── ingest.py
│   │   │   ├── questions.py
│   │   │   └── nudges.py
│   │
│   │   ├── schemas
│   │   │   ├── questions.py
│   │   │   └── nudges.py
│   │
│   │   ├── services
│   │   │   ├── question_bank.py
│   │   │   ├── nudges_service.py
│   │   │   └── groq_client.py
│   │
│   │   └── core
│   │       └── config.py
│   │
│   ├── data
│   │   └── questions.json
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend
│   ├── src
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │
│   │   ├── api
│   │   │   ├── questions.ts
│   │   │   └── nudges.ts
│   │
│   │   ├── pages
│   │   │   ├── Practice.tsx
│   │   │   ├── Chat.tsx
│   │   │   └── Home.tsx
│   │
│   │   └── components
│   │       └── Nudges
│   │           └── Nudges.tsx
│
└── README.md
Requirements
Backend

Python 3.10+

Optional
Docker (for Qdrant)

Frontend

Node.js 18+

npm

Backend Setup

Create virtual environment

Windows

cd backend
python -m venv .venv
.venv\Scripts\activate

Mac/Linux

cd backend
python3 -m venv .venv
source .venv/bin/activate

Install dependencies

pip install -r requirements.txt
Environment Variables

Create file

backend/.env

Example

GROQ_API_KEY=your_groq_api_key

QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=uit_rag
QDRANT_VECTOR_SIZE=384
Run Qdrant (Optional)

If using RAG vector search

docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
Run Backend
uvicorn app.main:app --reload --port 8000

Open API docs

http://localhost:8000/docs
Frontend Setup

Install dependencies

cd frontend
npm install

Run development server

npm run dev

Frontend runs at

http://localhost:5173
Frontend Environment Variables

Create file

frontend/.env

Example

VITE_API_BASE=http://localhost:8000
Question Bank

All practice questions are stored in

backend/data/questions.json

Supported question types

mcq

essay

coding

Example

{
"id": "oop_mcq_001",
"type": "mcq",
"subject": "oop",
"examTiming": "midterm",
"question": "Which keyword is used for inheritance in Java?",
"options": ["implements","extends","inherit","super"],
"answer": "b"
}
Running the Full System

Step 1 — Run Qdrant

docker run -p 6333:6333 qdrant/qdrant

Step 2 — Run Backend

cd backend
uvicorn app.main:app --reload

Step 3 — Run Frontend

cd frontend
npm run dev
Future Improvements

Planned upgrades

Judge0 code execution integration

Automatic essay grading

Personalized AI study recommendations

User authentication

Learning analytics dashboard

License

This project is developed for educational and experimental purposes.

Backend API Docs
https://your-render-link/docs

Screenshots
Home Page

Dashboard with study suggestions and navigation.

Practice System

Students can choose subject → exam type → start practice.

AI Chatbot

RAG-powered assistant that answers course-related questions.

Coding Practice

LeetCode-style coding interface with editor and test execution.

Key Features
AI Chatbot (RAG)

Students can ask questions related to course materials.

The system retrieves relevant knowledge using vector search and generates answers using an LLM.

Workflow

Student Question
      ↓
Vector Search (Qdrant)
      ↓
Retrieve Context
      ↓
Groq LLM generates answer

Technologies used

Qdrant Vector Database

Groq LLM API

Document ingestion pipeline

Exam Practice System

Students can practice exam questions by selecting

Subject → Midterm / Final → Start Exam

Supported question types

Multiple Choice (MCQ)

Features

Timer

Question navigation

Score calculation

Detailed review of wrong answers

Essay Questions

Students type their answers and receive feedback.

Features

Text answer input

Optional rubric-based grading

Feedback suggestions

Coding Problems

A LeetCode-style coding interface that allows students to practice programming problems.

Features

Code editor

Language selection

Sample input/output

Run / Submit functionality

Currently uses mock execution but designed to integrate with Judge0 for real code execution.

Daily Study Nudges

The system generates daily study suggestions to encourage consistent learning.

Examples

Practice 10 MCQ questions

Solve a coding problem

Review a weak topic

API Endpoints

GET /nudges/today
POST /nudges/accept
Tech Stack
Frontend

React

TypeScript

Vite

TailwindCSS

Backend

FastAPI

Qdrant (Vector Database)

Groq LLM API

Data Layer

JSON Question Bank

Vector embeddings for RAG

System Architecture
Frontend (React + Vite)
        │
        ▼
Backend (FastAPI)
        │
        ├── Question Bank API
        ├── Nudges Recommendation System
        ├── Coding Practice API
        └── RAG Chatbot
                │
                ▼
        Qdrant Vector Database
                │
                ▼
            Groq LLM API
Project Structure
project-root
│
├── backend
│   ├── app
│   │   ├── main.py
│   │
│   │   ├── routes
│   │   │   ├── chat.py
│   │   │   ├── search.py
│   │   │   ├── ingest.py
│   │   │   ├── questions.py
│   │   │   └── nudges.py
│   │
│   │   ├── schemas
│   │   │   ├── questions.py
│   │   │   └── nudges.py
│   │
│   │   ├── services
│   │   │   ├── question_bank.py
│   │   │   ├── nudges_service.py
│   │   │   └── groq_client.py
│   │
│   │   └── core
│   │       └── config.py
│   │
│   ├── data
│   │   └── questions.json
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend
│   ├── src
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │
│   │   ├── api
│   │   │   ├── questions.ts
│   │   │   └── nudges.ts
│   │
│   │   ├── pages
│   │   │   ├── Practice.tsx
│   │   │   ├── Chat.tsx
│   │   │   └── Home.tsx
│   │
│   │   └── components
│   │       └── Nudges
│   │           └── Nudges.tsx
│
└── README.md
Requirements
Backend

Python 3.10+

Optional
Docker (for Qdrant)

Frontend

Node.js 18+

npm

Backend Setup

Create virtual environment

Windows

cd backend
python -m venv .venv
.venv\Scripts\activate

Mac/Linux

cd backend
python3 -m venv .venv
source .venv/bin/activate

Install dependencies

pip install -r requirements.txt
Environment Variables

Create file

backend/.env

Example

GROQ_API_KEY=

QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=uit_rag
QDRANT_VECTOR_SIZE=384
Run Qdrant (Optional)

If using RAG vector search

docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
Run Backend
uvicorn app.main:app --reload --port 8000

Open API docs

http://localhost:8000/docs
Frontend Setup

Install dependencies

cd frontend
npm install

Run development server

npm run dev

Frontend runs at

http://localhost:5173
Frontend Environment Variables

Create file

frontend/.env

Example

VITE_API_BASE=http://localhost:8000
Question Bank

All practice questions are stored in

backend/data/questions.json

Supported question types

mcq

essay

coding

Example

{
"id": "oop_mcq_001",
"type": "mcq",
"subject": "oop",
"examTiming": "midterm",
"question": "Which keyword is used for inheritance in Java?",
"options": ["implements","extends","inherit","super"],
"answer": "b"
}
Running the Full System

Step 1 — Run Qdrant

docker run -p 6333:6333 qdrant/qdrant

Step 2 — Run Backend

cd backend
uvicorn app.main:app --reload

Step 3 — Run Frontend

cd frontend
npm run dev
Future Improvements

Planned upgrades

Judge0 code execution integration

Personalized AI study path recommendations

User authentication

Learning analytics dashboard
AI helps students find jobs

License

This project is developed for educational and experimental purposes.
