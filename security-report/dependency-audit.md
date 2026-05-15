# Dependency Audit Report

## Summary
- **Total Dependencies:** 796
- **Vulnerabilities Found:** 16
  - Critical: 1
  - High: 11
  - Moderate: 4

## Key Findings

### 1. `xlsx` (SheetJS)
- **Version:** `^0.18.5`
- **Severity:** High / Critical
- **CVE/GHSA:** GHSA-5pgg-2g8v-p4x9 (ReDoS), GHSA-496j-h883-6xpq (Prototype Pollution)
- **Risk:** Parsing untrusted Excel files can lead to Denial of Service or code execution via prototype pollution.
- **Remediation:** Upgrade to `xlsx` >= 0.20.2 or switch to a more secure alternative if full Excel support is not needed.

### 2. Next.js / React Ecosystem
- **Next.js:** 16.1.4 (Latest, generally secure)
- **React:** 19.2.3 (Latest, generally secure)

### 3. Supply Chain Risk
- The project uses many PDF and image processing libraries (`jspdf`, `pdfjs-dist`, `tesseract.js`). These are common targets for memory corruption or file parsing vulnerabilities.
- Ensure all inputs to these libraries are strictly validated.

## Recommendations
1. Run `npm audit fix` to resolve auto-fixable issues.
2. Manually upgrade `xlsx` to a patched version.
3. Review `tesseract.js` and `pdfjs-dist` usage for secure configuration (e.g., disabling script execution in PDFs).
