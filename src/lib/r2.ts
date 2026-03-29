import { S3Client } from "@aws-sdk/client-s3";

function createR2Client(): S3Client {
  if (
    !process.env.R2_ACCOUNT_ID ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY
  ) {
    throw new Error(
      "R2 environment variables not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.",
    );
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

// Lazy singleton -- only created when first accessed (avoids errors when R2 not configured)
let _r2Client: S3Client | null = null;
export function getR2Client(): S3Client {
  if (!_r2Client) _r2Client = createR2Client();
  return _r2Client;
}

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? "cross-stitch-tracker";
