import os
ALLOWED_CONTENT_TYPES = [
    "text/plain",
    "application/json",
    "image/jpeg",
    "image/png",
    "image/gif"
]

STORAGE_TYPE = os.getenv("STORAGE_TYPE", "local")

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME", "your-bucket-name")
