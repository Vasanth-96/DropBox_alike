from typing import Any, Dict, List, Optional
from pymongo import AsyncMongoClient
from pymongo.results import InsertOneResult
import os

class MongoDBClientAsync:
    def __init__(self, uri: str, db_name: str):
        self.client = AsyncMongoClient(uri)
        self.db = self.client[db_name]

    def get_collection(self, name: str):
        return self.db[name]

    async def insert_one(
        self,
        collection: str,
        data: Dict[str, Any]
    ) -> InsertOneResult:
        return await self.get_collection(collection).insert_one(data)

    async def find_one(
        self,
        collection: str,
        query: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        return await self.get_collection(collection).find_one(query)

    async def find_many(
        self,
        collection: str,
        query: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        cursor = self.get_collection(collection).find(query)
        return await cursor.to_list(length=None)


mongo_uri = os.getenv("MONGO_URI", "mongodb://mongodb:27017")
mongo_obj = MongoDBClientAsync(
    mongo_uri,
    "file_storage"
)