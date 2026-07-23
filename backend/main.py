from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import fitz

from openai import OpenAI
from config import OPENROUTER_API_KEY

# -----------------------------
# Configure OpenRouter
# -----------------------------
client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI()

# -----------------------------
# Enable CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -----------------------------
# Home
# -----------------------------
@app.get("/")
def home():
    return {"message": "Welcome to AI Resume Analyzer 🚀"}

# -----------------------------
# Upload Resume
# -----------------------------
@app.post("/upload")
def upload_resume(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": file.filename,
        "message": "Resume uploaded successfully!"
    }

# -----------------------------
# Read Resume
# -----------------------------
@app.get("/read/{filename}")
def read_resume(filename: str):

    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(file_path):
        return {"error": "File not found"}

    doc = fitz.open(file_path)

    text = ""

    for page in doc:
        text += page.get_text()

    doc.close()

    return {
        "filename": filename,
        "text": text
    }

# -----------------------------
# Analyze Resume
# -----------------------------
@app.get("/analyze/{filename}")
def analyze_resume(filename: str):

    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(file_path):
        return {"error": "File not found"}

    doc = fitz.open(file_path)

    resume = ""

    for page in doc:
        resume += page.get_text()

    doc.close()

    # Prevent very large PDFs from exceeding the model context window
    resume = resume[:30000]

    prompt = f"""
You are a professional ATS (Applicant Tracking System) Resume Analyzer.

Analyze the following resume and respond EXACTLY in this format.

ATS Score: <number between 0 and 100>

## Summary
(2-3 lines)

## Strengths
- Point 1
- Point 2
- Point 3

## Weaknesses
- Point 1
- Point 2
- Point 3

## Missing Skills
- Skill 1
- Skill 2
- Skill 3

## Suggestions
- Suggestion 1
- Suggestion 2
- Suggestion 3

## Suitable Job Roles
- Role 1
- Role 2
- Role 3

## Final Verdict
(2-3 lines)

IMPORTANT RULES:
- ATS Score MUST be the first line.
- Return ONLY one ATS score.
- ATS Score must be an integer (for example: ATS Score: 84).
- Do not use markdown tables.
- Do not explain your formatting.

Resume:

{resume}
"""

    response = client.chat.completions.create(
        model="deepseek/deepseek-chat",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    analysis = response.choices[0].message.content

    return {
        "analysis": analysis
    }