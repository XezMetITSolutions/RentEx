
import { S3Client } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId || 'placeholder'}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: accessKeyId || 'placeholder',
        secretAccessKey: secretAccessKey || 'placeholder',
    }
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'rent-ex';
/** Private object key of the admin-uploaded accident report PDF template. */
export const DAMAGE_REPORT_TEMPLATE_KEY = 'templates/damage-report-template.pdf';

export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''; // E.g., https://pub-xxx.r2.dev or custom domain
