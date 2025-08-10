from ..models.file import FileResponse, FileList
from fastapi import UploadFile, HTTPException
from ..db.mongo import mongo_obj
from datetime import datetime
from bson import ObjectId
from ..utils.constants import STORAGE_TYPE
import tempfile
from ..db.s3 import s3_client


class FileService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(FileService, cls).__new__(cls)
        return cls._instance

    async def save_file(self, file: UploadFile) -> FileResponse:
        file_data = {
            "filename": file.filename,
            "content_type": file.content_type,
            "file_path": f"files/{file.filename}",
            "upload_date": datetime.now()
        }
        if STORAGE_TYPE == "local":
            import os
            os.makedirs("files", exist_ok=True)
            file_location = f"files/{file.filename}"
            with open(file_location, "wb") as f:
                content = await file.read()
                f.write(content)
            file_data["file_path"] = file_location

        elif STORAGE_TYPE == "s3":
            with tempfile.NamedTemporaryFile(delete=False) as tmp:
                content = await file.read()
                tmp.write(content)
                tmp_path = tmp.name
            s3_path = s3_client.upload_file(tmp_path, file.filename)
            file_data["file_path"] = s3_path
        res = await mongo_obj.insert_one("files", file_data)
        file_data["id"] = str(res.inserted_id)
        return FileResponse(**file_data)

    async def get_files(self, skip: int, limit: int) -> FileList:
        cursor = mongo_obj.get_collection("files").find(
            {},
            sort=[("upload_date", -1)]
        ).skip(skip).limit(limit)

        files = await cursor.to_list(length=limit)
        total = await mongo_obj.get_collection("files").count_documents({})

        file_responses = [
            FileResponse(**{**file, "id": str(file["_id"])})
            for file in files
        ]
        return FileList(total=total, files=file_responses)

    async def get_file_by_id(self, file_id: str) -> FileResponse:
        file = await mongo_obj.find_one("files", {"_id": ObjectId(file_id)})
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        file["id"] = str(file["_id"])
        return FileResponse(**file)

    async def get_file_content(self, file_id: str) -> tuple[bytes, dict]:
        file = await mongo_obj.find_one("files", {"_id": ObjectId(file_id)})
        if not file:
            raise HTTPException(status_code=404, detail="File not found")

        if STORAGE_TYPE == "local":
            with open(file["file_path"], "rb") as f:
                content = f.read()
        elif STORAGE_TYPE == "s3":
            content = s3_client.get_file_content(file["file_path"])
        else:
            raise HTTPException(status_code=500, detail="Unsupported storage")

        return content, file
