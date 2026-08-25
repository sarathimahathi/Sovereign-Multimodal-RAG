'''from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import uuid
import shutil

app = FastAPI(title="AI File Server")

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(exist_ok=True)



@app.get("/")
def home():
    return {
        "server": "AI File Server",
        "status": "running"
    }



@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    print("Received:", file.filename)

 
    file_id = str(uuid.uuid4())


    extension = Path(file.filename).suffix


    stored_name = f"{file_id}{extension}"


    file_path = UPLOAD_DIR / stored_name


    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print("Saved:", file_path)

    return {
        "file_id": file_id,
        "filename": file.filename,
        "stored_name": stored_name
    }



@app.get("/files")
def list_files():

    files = []

    for file_path in UPLOAD_DIR.iterdir():

        if file_path.is_file():

            files.append({
                "filename": file_path.name,
                "size": file_path.stat().st_size
            })

    return {
        "count": len(files),
        "files": files
    }



@app.get("/download/{filename}")
def download_file(filename: str):

    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return FileResponse(
        file_path,
        filename=file_path.name
    )'''

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from datetime import datetime
import uuid
import json
import shutil

app = FastAPI(title="AI File Server")

UPLOAD_DIR = Path("uploads")
DATA_DIR = Path("data")
METADATA_FILE = DATA_DIR / "metadata.json"

UPLOAD_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)


# --------------------------------------------------
# METADATA FUNCTIONS
# --------------------------------------------------

def load_metadata():

    if not METADATA_FILE.exists():
        return []

    try:
        with open(METADATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    except json.JSONDecodeError:
        return []


def save_metadata(data):

    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)


# --------------------------------------------------
# SERVER TEST
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "server": "AI File Server",
        "status": "running"
    }


# --------------------------------------------------
# UPLOAD
# --------------------------------------------------

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    print("Received:", file.filename)

    # Generate unique ID
    file_id = str(uuid.uuid4())

    # Get extension
    extension = Path(file.filename).suffix

    # Unique stored filename
    stored_name = f"{file_id}{extension}"

    # Physical path
    file_path = UPLOAD_DIR / stored_name

    # Save actual file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print("Saved:", file_path)

    # -----------------------------
    # CREATE METADATA
    # -----------------------------

    metadata = load_metadata()

    file_info = {

        "file_id": file_id,

        "filename": file.filename,

        "stored_name": stored_name,

        "mime_type": file.content_type,

        "extension": extension,

        "size": file_path.stat().st_size,

        "uploaded_at": datetime.now().isoformat(),

        "status": "UPLOADED"
    }

    metadata.append(file_info)

    save_metadata(metadata)

    return file_info


# --------------------------------------------------
# LIST FILES
# --------------------------------------------------

@app.get("/files")
def list_files():

    metadata = load_metadata()

    return {
        "count": len(metadata),
        "files": metadata
    }


# --------------------------------------------------
# DOWNLOAD FILE
# --------------------------------------------------

@app.get("/download/{file_id}")
def download_file(file_id: str):

    metadata = load_metadata()

    file_info = next(
        (f for f in metadata if f["file_id"] == file_id),
        None
    )

    if not file_info:

        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    file_path = UPLOAD_DIR / file_info["stored_name"]

    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Physical file not found"
        )

    return FileResponse(
        file_path,
        filename=file_info["filename"],
        media_type=file_info["mime_type"]
    )