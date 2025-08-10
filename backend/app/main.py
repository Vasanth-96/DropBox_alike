from fastapi import FastAPI, UploadFile, HTTPException, Query, File, Path, status
from fastapi.responses import StreamingResponse
from app.services.file_service import FileService
from app.models.file import FileResponse, FileList
from fastapi.middleware.cors import CORSMiddleware
from app.utils.constants import ALLOWED_CONTENT_TYPES
from dotenv import load_dotenv
import io

load_dotenv()

file_service = FileService()
app = FastAPI(title="File Storage Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    )

@app.post(
    "/files",
    response_model=FileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a file",
    )
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "File type not allowed. Allowed types: "
                f"{', '.join(ALLOWED_CONTENT_TYPES)}"
            )
        )

    try:
        result = await file_service.save_file(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/files",
    response_model=FileList,
    summary="List files",
)
async def list_files(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    try:
        result = await file_service.get_files(skip, limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/files/{file_id}",
    response_model=FileResponse,
    summary="Get file metadata",
)
async def get_file(file_id: str = Path(...)):
    try:
        file = await file_service.get_file_by_id(file_id)
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        return file
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/files/{file_id}/download",
    summary="Download file",
)
async def download_file(file_id: str = Path(...)):
    try:
        content, file = await file_service.get_file_content(file_id)
        if not content or not file:
            raise HTTPException(status_code=404, detail="File not found")

        if isinstance(content, (bytes, bytearray)):
            stream = io.BytesIO(content)
        else:
            stream = content

        return StreamingResponse(
            stream,
            media_type=file["content_type"],
            headers={
                "Content-Disposition": f'attachment; filename="{file["filename"]}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health", summary="Health check")
async def health_check():
    return {"status": "healthy"}
