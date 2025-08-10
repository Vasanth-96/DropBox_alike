import boto3
from botocore.exceptions import BotoCoreError, ClientError
import os
from ..utils.constants import (
    AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, AWS_S3_BUCKET_NAME
)


class S3Service:
    def __init__(
        self,
        bucket_name: str,
        region: str,
        aws_access_key: str,
        aws_secret_key: str
    ):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client(
            "s3",
            region_name=region,
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key
        )

    def upload_file(self, file_path: str, object_name: str = None) -> str:
        if object_name is None:
            object_name = os.path.basename(file_path)
        try:
            self.s3_client.upload_file(
                file_path, self.bucket_name, object_name
            )
            return f"s3://{self.bucket_name}/{object_name}"
        except (BotoCoreError, ClientError) as e:
            raise RuntimeError(
                f"Error uploading file to S3: {e}"
            )

    def download_file(self, object_name: str, file_path: str):
        try:
            self.s3_client.download_file(
                self.bucket_name, object_name, file_path
            )
        except (BotoCoreError, ClientError) as e:
            raise RuntimeError(
                f"Error downloading file from S3: {e}"
            )

    def delete_file(self, object_name: str):
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name, Key=object_name
            )
        except (BotoCoreError, ClientError) as e:
            raise RuntimeError(
                f"Error deleting file from S3: {e}"
            )


s3_client = S3Service(
    bucket_name=AWS_S3_BUCKET_NAME,
    region=AWS_REGION,
    aws_access_key=AWS_ACCESS_KEY,
    aws_secret_key=AWS_SECRET_KEY
)