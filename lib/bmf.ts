import prisma from './prisma';

/**
 * Austrian BMF Registrierkassen-Webservice (RKDB) Integration
 * 
 * This service handles communication with FinanzOnline for:
 * 1. Session Login/Logout
 * 2. Cash Register (Registrierkasse) registration
 * 3. Signing Unit (Signaturerstellungseinheit) registration
 * 4. Receipt verification
 */

const SESSION_WSDL = 'https://finanzonline.bmf.gv.at/fonws/ws/sessionService.wsdl';
const RKDB_WSDL = 'https://finanzonline.bmf.gv.at/fonws/ws/regKasseService.wsdl';

export interface BMFSettings {
    tid: string;
    benid: string;
    pin: string;
    mode: 'T' | 'P'; // T = Test, P = Production
}

/**
 * Fetches BMF settings from the database
 */
async function getBMFSettings(): Promise<BMFSettings> {
    const settings = await prisma.systemSettings.findMany({
        where: { key: { in: ['bmf_tid', 'bmf_benid', 'bmf_pin', 'bmf_mode'] } }
    });

    const bmf: Partial<BMFSettings> = { mode: 'T' };
    settings.forEach(s => {
        if (s.key === 'bmf_tid') bmf.tid = s.value;
        if (s.key === 'bmf_benid') bmf.benid = s.value;
        if (s.key === 'bmf_pin') bmf.pin = s.value;
        if (s.key === 'bmf_mode') bmf.mode = s.value as 'T' | 'P';
    });

    if (!bmf.tid || !bmf.benid || !bmf.pin) {
        throw new Error('BMF FinanzOnline credentials are not fully configured.');
    }

    return bmf as BMFSettings;
}

/**
 * Standard FinanzOnline Session Login
 */
export async function loginToFinanzOnline(): Promise<string> {
    const credentials = await getBMFSettings();

    const soapBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ses="https://finanzonline.bmf.gv.at/fon/ws/session">
            <soapenv:Header/>
            <soapenv:Body>
                <ses:loginRequest>
                    <ses:tid>${credentials.tid}</ses:tid>
                    <ses:benid>${credentials.benid}</ses:benid>
                    <ses:pin>${credentials.pin}</ses:pin>
                </ses:loginRequest>
            </soapenv:Body>
        </soapenv:Envelope>
    `;

    const response = await fetch('https://finanzonline.bmf.gv.at/fonws/ws/sessionService', {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': 'login' },
        body: soapBody
    });

    const text = await response.text();
    const match = text.match(/<id>([^<]+)<\/id>/);

    if (!match) {
        const rcMatch = text.match(/<rc>([^<]+)<\/rc>/);
        const msgMatch = text.match(/<msg>([^<]+)<\/msg>/);
        throw new Error(`FinanzOnline Login Failed: ${msgMatch?.[1] || 'Unknown error'} (Code: ${rcMatch?.[1] || '-1'})`);
    }

    return match[1];
}

/**
 * RKDB Registration for a Cash Register
 */
export async function registerCashRegister(kassenId: string, aesKey: string) {
    const sessionId = await loginToFinanzOnline();
    const credentials = await getBMFSettings();

    const soapBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rkdb="https://finanzonline.bmf.gv.at/fonws/ws/regKasseService">
            <soapenv:Header/>
            <soapenv:Body>
                <rkdb:rkdbRequest>
                    <rkdb:tid>${credentials.tid}</rkdb:tid>
                    <rkdb:benid>${credentials.benid}</rkdb:benid>
                    <rkdb:id>${sessionId}</rkdb:id>
                    <rkdb:art_uebermittlung>${credentials.mode}</rkdb:art_uebermittlung>
                    <rkdb:registrierung_kasse>
                        <rkdb:satznr>1</rkdb:satznr>
                        <rkdb:kassenidentifikationsnummer>${kassenId}</rkdb:kassenidentifikationsnummer>
                        <rkdb:benutzerschluessel>${aesKey}</rkdb:benutzerschluessel>
                    </rkdb:registrierung_kasse>
                </rkdb:rkdbRequest>
            </soapenv:Body>
        </soapenv:Envelope>
    `;

    try {
        const response = await fetch('https://finanzonline.bmf.gv.at/fonws/ws/regKasseService', {
            method: 'POST',
            headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': 'rkdb' },
            body: soapBody
        });

        const text = await response.text();
        // Check for success code (0 = OK)
        if (text.includes('<rc>0</rc>')) {
            return { success: true };
        } else {
            const msg = text.match(/<msg>([^<]+)<\/msg>/)?.[1] || 'BMF Registration Error';
            return { success: false, message: msg };
        }
    } finally {
        await logoutFromFinanzOnline(sessionId);
    }
}

/**
 * Logout from session
 */
export async function logoutFromFinanzOnline(sessionId: string) {
    const credentials = await getBMFSettings();
    const soapBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ses="https://finanzonline.bmf.gv.at/fon/ws/session">
            <soapenv:Header/>
            <soapenv:Body>
                <ses:logoutRequest>
                    <ses:tid>${credentials.tid}</ses:tid>
                    <ses:benid>${credentials.benid}</ses:benid>
                    <ses:id>${sessionId}</ses:id>
                </ses:logoutRequest>
            </soapenv:Body>
        </soapenv:Envelope>
    `;

    await fetch('https://finanzonline.bmf.gv.at/fonws/ws/sessionService', {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': 'logout' },
        body: soapBody
    });
}
