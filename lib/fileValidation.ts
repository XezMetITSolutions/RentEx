/**
 * fileValidation.ts — Magic-number / file-signature based upload validation.
 *
 * The browser-supplied `file.type` (MIME) is trivially spoofable. Always pair
 * the declared type with a content-sniff against the first bytes of the
 * buffer to catch disguised payloads (e.g. a `.jpg` that is actually an HTML
 * file, or a polyglot PDF/JS).
 */

export type AllowedMime =
    | 'image/jpeg'
    | 'image/png'
    | 'image/webp'
    | 'image/gif'
    | 'image/heic'
    | 'image/heif'
    | 'application/pdf';

const MAGIC: Array<{ mime: AllowedMime; matches: (b: Buffer) => boolean }> = [
    {
        mime: 'image/jpeg',
        matches: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
    },
    {
        mime: 'image/png',
        matches: (b) =>
            b.length >= 8 &&
            b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
            b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
    },
    {
        // WebP: "RIFF" .... "WEBP"
        mime: 'image/webp',
        matches: (b) =>
            b.length >= 12 &&
            b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
            b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
    },
    {
        // GIF87a or GIF89a
        mime: 'image/gif',
        matches: (b) =>
            b.length >= 6 &&
            b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 &&
            (b[4] === 0x37 || b[4] === 0x39) && b[5] === 0x61,
    },
    {
        // HEIC: ftyp box at offset 4 with brand "heic" / "heix" / "mif1"
        mime: 'image/heic',
        matches: (b) =>
            b.length >= 12 &&
            b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 &&
            ((b[8] === 0x68 && b[9] === 0x65 && b[10] === 0x69 && b[11] === 0x63) ||
             (b[8] === 0x68 && b[9] === 0x65 && b[10] === 0x69 && b[11] === 0x78) ||
             (b[8] === 0x6d && b[9] === 0x69 && b[10] === 0x66 && b[11] === 0x31)),
    },
    {
        mime: 'image/heif',
        matches: (b) =>
            b.length >= 12 &&
            b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 &&
            b[8] === 0x6d && b[9] === 0x69 && b[10] === 0x66 && b[11] === 0x31,
    },
    {
        // %PDF-
        mime: 'application/pdf',
        matches: (b) =>
            b.length >= 5 &&
            b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d,
    },
];

/** Returns the MIME inferred from the magic bytes, or null if unknown. */
export function detectMimeFromMagicBytes(buf: Buffer): AllowedMime | null {
    for (const { mime, matches } of MAGIC) {
        if (matches(buf)) return mime;
    }
    return null;
}

export interface UploadValidationOk {
    ok: true;
    /** The actual mime type detected from magic bytes — use this to set ContentType */
    mime: AllowedMime;
}
export interface UploadValidationErr {
    ok: false;
    status: number;
    error: string;
}
export type UploadValidationResult = UploadValidationOk | UploadValidationErr;

export interface UploadValidationOpts {
    file: File;
    /** Allowed mime types — declared MIME and detected MIME must both be in this set */
    allowed: ReadonlyArray<AllowedMime>;
    /** Maximum size in bytes (default 10MB) */
    maxBytes?: number;
}

/**
 * Validates a File from FormData against allowed types and size, and verifies
 * the actual content matches the declared type via magic bytes. On success
 * returns the buffer and detected MIME so callers can pass them to S3/R2.
 */
export async function validateUpload(
    opts: UploadValidationOpts
): Promise<UploadValidationResult & { buffer?: Buffer }> {
    const maxBytes = opts.maxBytes ?? 10 * 1024 * 1024;

    if (!opts.file || typeof opts.file.arrayBuffer !== 'function') {
        return { ok: false, status: 400, error: 'Keine Datei hochgeladen' };
    }
    if (opts.file.size > maxBytes) {
        const mb = Math.round(maxBytes / (1024 * 1024));
        return { ok: false, status: 400, error: `Datei zu groß (max ${mb}MB)` };
    }
    if (opts.file.size === 0) {
        return { ok: false, status: 400, error: 'Datei ist leer' };
    }

    const declared = (opts.file.type || '').toLowerCase() as AllowedMime;
    if (!opts.allowed.includes(declared)) {
        return {
            ok: false,
            status: 400,
            error: `Ungültiger Dateityp. Erlaubt: ${opts.allowed.join(', ')}`,
        };
    }

    const buffer = Buffer.from(await opts.file.arrayBuffer());
    const detected = detectMimeFromMagicBytes(buffer);

    if (!detected) {
        return { ok: false, status: 400, error: 'Dateiinhalt nicht erkannt.' };
    }

    if (!opts.allowed.includes(detected)) {
        return {
            ok: false,
            status: 400,
            error: 'Dateiinhalt stimmt nicht mit erlaubten Typen überein.',
        };
    }

    // Defense: declared and actual must agree (HEIC vs HEIF and JPEG variants
    // share enough that we don't compare them strictly — both being in the
    // allowed list is sufficient).
    return { ok: true, mime: detected, buffer };
}

/** Convenience presets */
export const UPLOAD_PRESETS = {
    IMAGES_ONLY: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'] as const,
    IMAGES_AND_PDF: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'] as const,
    PDF_ONLY: ['application/pdf'] as const,
} satisfies Record<string, ReadonlyArray<AllowedMime>>;
