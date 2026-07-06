import os
import shutil
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from . import models, schemas
from .database import engine, get_db

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="FloUV API", version="1.0.0")

from .auth import router as auth_router, verify_token
app.include_router(auth_router)

# Mount static files for images so frontend can access them via URL
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Allow Vite frontend to talk to the backend regardless of which port it runs on
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- FILE UPLOADS ---
@app.post("/api/upload", dependencies=[Depends(verify_token)])
async def upload_image(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Return the URL to access the image
    return {"url": f"http://localhost:8000/uploads/{file.filename}"}

# --- BLOG ENDPOINTS ---

import json

def to_blog_response(db_blog):
    points_list = [p.point_text for p in db_blog.points]
    categories_list = [c.name for c in db_blog.categories]
    legacy_category = categories_list[0] if categories_list else "Uncategorized"
    
    return schemas.BlogResponse(
        id=db_blog.id,
        title=db_blog.title,
        date=db_blog.date,
        category=legacy_category,
        image=db_blog.image,
        content=db_blog.content,
        points=json.dumps(points_list),
        categories=json.dumps(categories_list)
    )

def sync_relations(db, db_blog, blog_schema):
    try:
        points_list = json.loads(blog_schema.points) if blog_schema.points else []
    except:
        points_list = []
        
    try:
        categories_list = json.loads(blog_schema.categories) if blog_schema.categories else []
    except:
        categories_list = []
        
    if blog_schema.category and blog_schema.category not in categories_list:
        categories_list.append(blog_schema.category)
        
    db_blog.points = []
    for pt in points_list:
        db_blog.points.append(models.BlogPoint(point_text=pt))
        
    db_blog.categories = []
    for cat_name in categories_list:
        db_cat = db.query(models.Category).filter(models.Category.name == cat_name).first()
        if not db_cat:
            db_cat = models.Category(name=cat_name)
            db.add(db_cat)
        db_blog.categories.append(db_cat)

@app.get("/api/blogs", response_model=List[schemas.BlogResponse])
def get_blogs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    blogs = db.query(models.Blog).offset(skip).limit(limit).all()
    return [to_blog_response(b) for b in blogs]

@app.get("/api/blogs/{blog_id}", response_model=schemas.BlogResponse)
def get_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return to_blog_response(blog)

@app.post("/api/blogs", response_model=schemas.BlogResponse, dependencies=[Depends(verify_token)])
def create_blog(blog: schemas.BlogCreate, db: Session = Depends(get_db)):
    db_blog = models.Blog(
        title=blog.title,
        date=blog.date,
        image=blog.image,
        content=blog.content
    )
    sync_relations(db, db_blog, blog)
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return to_blog_response(db_blog)

@app.put("/api/blogs/{blog_id}", response_model=schemas.BlogResponse, dependencies=[Depends(verify_token)])
def update_blog(blog_id: int, blog: schemas.BlogCreate, db: Session = Depends(get_db)):
    db_blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if db_blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    db_blog.title = blog.title
    db_blog.date = blog.date
    db_blog.image = blog.image
    db_blog.content = blog.content
    
    sync_relations(db, db_blog, blog)
    
    db.commit()
    db.refresh(db_blog)
    return to_blog_response(db_blog)

@app.delete("/api/blogs/{blog_id}", dependencies=[Depends(verify_token)])
def delete_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    db.delete(blog)
    db.commit()
    return {"ok": True}

from typing import List, Optional
import uuid
import math
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv

# Load env variables from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
CONTEXT_CACHE_FILE = os.path.join(os.path.dirname(__file__), "context_cache.txt")
sessions = {}
vector_store = [] # Will hold dicts: {"text": str, "embedding": list}

# --- RAG CHATBOT ---

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    session_id: str

def cosine_similarity(v1, v2):
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a * a for a in v1))
    magnitude2 = math.sqrt(sum(b * b for b in v2))
    if magnitude1 * magnitude2 == 0:
        return 0
    return dot_product / (magnitude1 * magnitude2)

def build_vector_store():
    global vector_store
    if not os.path.exists(CONTEXT_CACHE_FILE):
        return
    with open(CONTEXT_CACHE_FILE, "r", encoding="utf-8") as f:
        raw_text = f.read()
    
    # Chunking: split by double newlines or chunks
    paragraphs = [p.strip() for p in raw_text.split("\n\n") if len(p.strip()) > 50]
    chunks = paragraphs[:50] # Limit to 50 chunks for safety
    
    if not chunks:
        return
        
    try:
        # Get embeddings for all chunks at once!
        response = client.embeddings.create(input=chunks, model="text-embedding-3-small")
        vector_store = [{"text": chunk, "embedding": data.embedding} for chunk, data in zip(chunks, response.data)]
    except Exception as e:
        print("Failed to build vector store:", e)

from .drive_loader import load_folder_contents

@app.post("/api/ingest-gdrive", dependencies=[Depends(verify_token)])
def ingest_gdrive():
    try:
        files_processed, message = load_folder_contents()
        build_vector_store()
        return {"status": "success", "files_processed": files_processed, "message": message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
def chat_with_flouv(request: ChatRequest):
    session_id = request.session_id
    if not session_id or session_id not in sessions:
        session_id = str(uuid.uuid4())
        sessions[session_id] = {"history": []}

    # Build vector store if empty
    if not vector_store:
        build_vector_store()

    context = "No context available."
    if vector_store:
        try:
            # Embed the user query
            query_res = client.embeddings.create(input=[request.query], model="text-embedding-3-small")
            query_embedding = query_res.data[0].embedding
            
            # Find top 2 chunks
            scored_chunks = []
            for item in vector_store:
                score = cosine_similarity(query_embedding, item["embedding"])
                scored_chunks.append((score, item["text"]))
                
            scored_chunks.sort(key=lambda x: x[0], reverse=True)
            top_chunks = [chunk[1] for chunk in scored_chunks[:2]]
            context = "\n\n".join(top_chunks)
            # Fallback safeguard in case chunks are too long individually
            context = context[:2000]
        except Exception as e:
            print("Embedding error:", e)

    system_prompt = (
        "You are FloUV's highly professional, empathetic customer support agent. "
        "Use the provided context documents to answer the user's questions. "
        "Do not make up information that is not in the context.\n\n"
        "CRITICAL INSTRUCTION: You MUST format your response exactly in two parts separated by '|||'.\n"
        "Part 1: Choose exactly ONE of the following image filenames that best fits the context of your answer: "
        "'dairy.png' (for milk/dairy), 'water.png' (for water/juice/beverage), or 'uv.png' (for general UV technology/science).\n"
        "Part 2: Your detailed textual answer (use formatting, bullet points, and facts).\n"
        "Example Output:\ndairy.png ||| FloUV treats milk by...\n\n"
        f"--- CONTEXT DOCUMENTS ---\n{context}\n--- END CONTEXT ---\n"
    )

    # Only keep the last 4 messages in history to save tokens
    messages = [{"role": "system", "content": system_prompt}]
    for msg in sessions[session_id]["history"][-4:]:
        messages.append(msg)
    messages.append({"role": "user", "content": request.query[:400]}) # Limit user query length

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.3,
            max_tokens=400  # Strict limit on output tokens
        )
        answer = response.choices[0].message.content
        
        sessions[session_id]["history"].append({"role": "user", "content": request.query})
        sessions[session_id]["history"].append({"role": "assistant", "content": answer})
        
        return {"answer": answer, "session_id": session_id}
    except Exception as e:
        return {"answer": f"Sorry, I encountered an error: {str(e)}", "session_id": session_id}

class ReportRequest(BaseModel):
    session_id: str

@app.post("/api/report")
def generate_report(request: ReportRequest):
    session_id = request.session_id
    if session_id not in sessions or not sessions[session_id]["history"]:
        raise HTTPException(status_code=400, detail="No chat history found for this session.")
    
    # Extract the chat history to summarize
    chat_history_str = ""
    for msg in sessions[session_id]["history"]:
        role = "User" if msg["role"] == "user" else "FloUV Agent"
        chat_history_str += f"{role}: {msg['content']}\n\n"

    system_prompt = (
        "You are an expert technical writer for FloUV. Your task is to read the following Q&A chat history "
        "and synthesize a highly professional, cohesive 1-page 'Technology Brief' report. "
        "The report should summarize the key findings, technologies discussed, and the specific answers provided. "
        "Format it beautifully using Markdown (with headers, bullet points, and bold text). "
        "Do NOT include the raw chat transcript. Write it as a standalone executive summary."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Here is the chat history:\n\n{chat_history_str}"}
            ],
            temperature=0.3,
            max_tokens=800
        )
        report = response.choices[0].message.content
        return {"report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- STATIC FRONTEND SERVING ---
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dist')

if os.path.isdir(os.path.join(DIST_DIR, 'assets')):
    app.mount('/assets', StaticFiles(directory=os.path.join(DIST_DIR, 'assets')), name='assets')

@app.get('/{full_path:path}')
async def serve_frontend(full_path: str):
    file_path = os.path.join(DIST_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(DIST_DIR, 'index.html'))

