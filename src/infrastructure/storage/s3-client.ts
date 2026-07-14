import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
    endpoint: process.env.SEAWEEDFS_S3_ENDPOINT,
    region: process.env.SEAWEEDFS_S3_REGION ?? "us-east-1",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.SEAWEEDFS_S3_ACCESS_KEY!,
        secretAccessKey: process.env.SEAWEEDFS_S3_SECRET_KEY!,
    },
});

export const S3_BUCKET = process.env.SEAWEEDFS_S3_BUCKET!;
