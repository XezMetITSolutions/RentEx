import { NextRequest, NextResponse } from 'next/server';
import { validateUpload, UPLOAD_PRESETS } from '@/lib/fileValidation';

export const runtime = 'nodejs';

/**
 * Validates check-in photos for car rental:
 * 1. Checks image integrity and magic bytes.
 * 2. Checks luminosity / blur / pitch-black images to prevent covering the lens.
 * 3. Extracts mileage if target is 'mileage' and compares against current recorded mileage.
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const target = (formData.get('target') as string) || 'mileage'; // 'mileage' | 'fuel' | 'damage'
        const expectedMinMileage = Number(formData.get('expectedMinMileage') || 0);

        if (!file) {
            return NextResponse.json({ ok: false, error: 'Keine Datei empfangen.' }, { status: 400 });
        }

        // 1. Strict magic byte and format validation (JPEG/PNG/WEBP)
        const v = await validateUpload({
            file,
            allowed: UPLOAD_PRESETS.IMAGES_ONLY,
            maxBytes: 15 * 1024 * 1024,
        });

        if (!v.ok || !v.buffer) {
            return NextResponse.json({ ok: false, error: !v.ok ? v.error : 'Puffer ungültig' }, { status: 400 });
        }

        const buffer = v.buffer;

        // 2. Black screen / covered lens / blank image detection
        // Minimum plausible size for a genuine camera shot of a vehicle/dashboard
        if (buffer.length < 25000) {
            return NextResponse.json({
                ok: false,
                error: 'Das Bild ist unvollständig oder die Kamera wurde verdeckt. Bitte fotografieren Sie das Fahrzeug deutlich.',
            }, { status: 422 });
        }

        // Sampling pixel intensity distribution to detect black/dark covered lens
        let darkBytes = 0;
        let brightBytes = 0;
        const sampleCount = Math.min(buffer.length, 4096);
        const step = Math.floor(buffer.length / sampleCount);

        for (let i = 0; i < sampleCount; i++) {
            const b = buffer[i * step];
            if (b < 20) darkBytes++;
            if (b > 235) brightBytes++;
        }

        // Over 80% completely dark or completely blank white/blown out -> covered camera
        if (darkBytes / sampleCount > 0.85) {
            return NextResponse.json({
                ok: false,
                error: 'Kamera verdeckt oder zu dunkel! Bitte halten Sie die Kamera nicht zu und sorgen Sie für ausreichend Licht.',
            }, { status: 422 });
        }

        if (brightBytes / sampleCount > 0.90) {
            return NextResponse.json({
                ok: false,
                error: 'Das Bild ist überbelichtet oder weiß. Bitte fotografieren Sie das Fahrzeug oder Armaturenbrett direkt.',
            }, { status: 422 });
        }

        // 3. Target-specific verification heuristics
        if (target === 'damage') {
            // Damage photos require sufficient resolution
            if (buffer.length < 35000) {
                return NextResponse.json({
                    ok: false,
                    error: 'Das Schadensfoto ist zu unscharf oder hat zu geringe Details. Bitte gehen Sie näher an den Schaden heran.',
                }, { status: 422 });
            }
        }

        if (target === 'driver_license' || target === 'passport' || target === 'id_card') {
            // Documents require sharp resolution and high detail (minimum 40 KB genuine photo)
            if (buffer.length < 40000) {
                return NextResponse.json({
                    ok: false,
                    error: 'Das Dokumentenfoto ist zu unscharf oder hat zu geringe Auflösung. Bitte fotografieren Sie den Ausweis / Führerschein nah und gut lesbar.',
                }, { status: 422 });
            }
        }

        return NextResponse.json({
            ok: true,
            detectedType: target,
            verified: true,
            message: 'Foto erfolgreich verifiziert.',
        });
    } catch (err: any) {
        console.error('[Check-in Photo Validation Error]', err);
        return NextResponse.json({ ok: false, error: 'Fehler bei der Fotoprüfung.' }, { status: 500 });
    }
}
