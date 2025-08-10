from datetime import datetime
from pydantic import BaseModel


class FileResponse(BaseModel):
    id: str
    filename: str
    content_type: str
    file_path: str
    upload_date: datetime


class FileList(BaseModel):
    total: int
    files: list[FileResponse]
