/**
 * nameValidation.ts
 * Sahte / ciddi olmayan isim tespiti (fake name detection)
 */

const FAKE_NAMES_BLACKLIST = [
    "test", "asdf", "qwerty", "admin", "user", "dummy", "fake", "demo",
    "sample", "example", "nobody", "noname", "anonymous", "null", "undefined",
    "max mustermann", "john doe", "jane doe", "erika mustermann",
    "hans muster", "anna muster", "mustermann", "muster",
];

const SUSPICIOUS_PATTERNS = [
    /^(.)\1+$/i,           // All same characters: aaaa, bbbb
    /^\d+$/,               // Only numbers
    /^[^a-zäöüß\s'-]+$/i, // No letters at all
    /(.)\1{3,}/i,          // Same character repeated 4+ times: aaaa
    /^[a-z]{1,2}$/i,       // Too short (1-2 chars)
    /^(\w+)\s+\1$/i,       // Same word twice: "test test"
];

export interface NameValidationResult {
    isValid: boolean;
    riskScore: number;   // 0-100, higher = more suspicious
    reasons: string[];
}

export function validateName(firstName: string, lastName: string): NameValidationResult {
    const reasons: string[] = [];
    let riskScore = 0;

    const fullName = `${firstName} ${lastName}`.toLowerCase().trim();
    const firstNorm = firstName.toLowerCase().trim();
    const lastNorm = lastName.toLowerCase().trim();

    // 1. Minimum length check
    if (firstNorm.length < 2) {
        reasons.push("Vorname zu kurz (min. 2 Zeichen)");
        riskScore += 40;
    }
    if (lastNorm.length < 2) {
        reasons.push("Nachname zu kurz (min. 2 Zeichen)");
        riskScore += 40;
    }

    // 2. Blacklist check
    for (const fake of FAKE_NAMES_BLACKLIST) {
        if (fullName.includes(fake) || firstNorm === fake || lastNorm === fake) {
            reasons.push(`Verdächtiger Name erkannt: "${fake}"`);
            riskScore += 80;
            break;
        }
    }

    // 3. Pattern checks
    for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(firstNorm) || pattern.test(lastNorm)) {
            reasons.push("Name entspricht einem verdächtigen Muster");
            riskScore += 30;
            break;
        }
    }

    // 4. No vowels check
    const vowels = /[aeiouäöü]/i;
    if (firstNorm.length > 3 && !vowels.test(firstNorm)) {
        reasons.push("Vorname enthält keine Vokale");
        riskScore += 20;
    }
    if (lastNorm.length > 3 && !vowels.test(lastNorm)) {
        reasons.push("Nachname enthält keine Vokale");
        riskScore += 20;
    }

    // 5. First = Last name
    if (firstNorm === lastNorm) {
        reasons.push("Vor- und Nachname sind identisch");
        riskScore += 50;
    }

    // 6. Only digits in parts
    if (/^\d+$/.test(firstNorm) || /^\d+$/.test(lastNorm)) {
        reasons.push("Name enthält nur Zahlen");
        riskScore += 60;
    }

    // Cap at 100
    riskScore = Math.min(100, riskScore);

    return {
        isValid: riskScore < 60,
        riskScore,
        reasons,
    };
}

/**
 * Quick boolean check — for form validation
 */
export function isNameSuspicious(firstName: string, lastName: string): boolean {
    return !validateName(firstName, lastName).isValid;
}
