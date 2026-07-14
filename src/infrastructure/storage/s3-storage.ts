import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET } from "./s3-client";

export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
    await s3Client.send(
        new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
            ACL: "public-read",
        }),
    );
    return `${process.env.UPLOAD_PUBLIC_BASE_URL}/${key}`;
}
