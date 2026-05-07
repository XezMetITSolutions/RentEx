/**
 * schemas.ts — Zod schemas for critical user-input boundaries.
 *
 * Used by both web server actions and mobile API routes so the same
 * validation runs no matter how the data arrives. Keep schemas focused on
 * the actual fields each handler reads — over-validating fields the route
 * doesn't even use leaks coupling.
 */
import { z } from 'zod';

const trim = (s: string) => s.trim();

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export const registerWebSchema = z.object({
    firstName: z.string().min(1, 'Vorname erforderlich').max(100).transform(trim),
    lastName: z.string().min(1, 'Nachname erforderlich').max(100).transform(trim),
    email: z.string().email('Ungültige E-Mail-Adresse').max(200).transform((s) => s.trim().toLowerCase()),
    password: z.string().min(6, 'Passwort mindestens 6 Zeichen').max(200),
    phone: z.string().max(50).optional().nullable().transform((s) => (s?.trim() ? s.trim() : null)),
});
export type RegisterWebInput = z.infer<typeof registerWebSchema>;

export const registerMobileSchema = registerWebSchema.extend({
    password: z
        .string()
        .min(12, 'Passwort mindestens 12 Zeichen')
        .max(200)
        .regex(/[A-Z]/, 'Passwort muss einen Großbuchstaben enthalten')
        .regex(/[a-z]/, 'Passwort muss einen Kleinbuchstaben enthalten')
        .regex(/[0-9]/, 'Passwort muss eine Zahl enthalten'),
});
export type RegisterMobileInput = z.infer<typeof registerMobileSchema>;

export const loginSchema = z.object({
    email: z.string().email('Ungültige E-Mail-Adresse').transform((s) => s.trim().toLowerCase()),
    password: z.string().min(1, 'Passwort erforderlich'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Aktuelles Passwort erforderlich'),
    newPassword: z.string().min(6, 'Neues Passwort mindestens 6 Zeichen').max(200),
    confirmPassword: z.string().optional(),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ─────────────────────────────────────────────
// Customers (admin-side CRUD)
// ─────────────────────────────────────────────

const optionalDate = z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
        if (!v) return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    });

const optionalString = (max = 500) =>
    z
        .union([z.string(), z.null(), z.undefined()])
        .transform((v) => {
            const s = (v ?? '').trim();
            return s.length === 0 ? null : s.slice(0, max);
        });

export const customerSchema = z.object({
    firstName: z.string().min(1, 'Vorname erforderlich').max(100).transform(trim),
    lastName: z.string().min(1, 'Nachname erforderlich').max(100).transform(trim),
    email: z.string().email('Ungültige E-Mail-Adresse').max(200).transform((s) => s.trim().toLowerCase()),
    phone: optionalString(50),
    address: optionalString(200),
    city: optionalString(100),
    postalCode: optionalString(20),
    country: optionalString(100),
    licenseNumber: optionalString(50),
    licenseIssueDate: optionalDate,
    licenseExpiryDate: optionalDate,
    dateOfBirth: optionalDate,
    notes: optionalString(2000),
    licensePhotoUrl: optionalString(500),
    idPhotoUrl: optionalString(500),
});
export type CustomerInput = z.infer<typeof customerSchema>;

// ─────────────────────────────────────────────
// Rental creation (admin)
// ─────────────────────────────────────────────

const positiveInt = z.coerce.number().int().positive();

export const rentalSchema = z
    .object({
        carId: positiveInt,
        customerId: positiveInt,
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        paymentMethod: z.string().max(50).optional().default('Cash'),
        driverName: optionalString(200),
        driverLicense: optionalString(100),
        pickupLocationId: z.coerce.number().int().positive().optional().nullable(),
        returnLocationId: z.coerce.number().int().positive().optional().nullable(),
        depositPaid: z.coerce.number().nonnegative().optional().nullable(),
        notes: optionalString(2000),
        options: z.array(positiveInt).default([]),
    })
    .refine((v) => v.endDate.getTime() > v.startDate.getTime(), {
        message: 'Endedatum muss nach Startdatum liegen',
        path: ['endDate'],
    });
export type RentalInput = z.infer<typeof rentalSchema>;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Run a schema and return a flat error message + the validated data.
 * Designed for server actions: short-circuit early on validation failure.
 */
export function safeValidate<T extends z.ZodTypeAny>(
    schema: T,
    input: unknown
): { ok: true; data: z.infer<T> } | { ok: false; error: string } {
    const result = schema.safeParse(input);
    if (result.success) return { ok: true, data: result.data };
    const first = result.error.issues[0];
    return { ok: false, error: first?.message ?? 'Ungültige Eingabe' };
}

/** Coerce a FormData into a plain object suitable for `safeValidate` */
export function formDataToObject(fd: FormData): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [key, value] of fd.entries()) {
        if (key in obj) {
            const existing = obj[key];
            obj[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
        } else {
            obj[key] = value;
        }
    }
    return obj;
}
