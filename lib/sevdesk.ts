import prisma from './prisma';

interface SevDeskContact {
    id: string;
    objectName: string;
}

interface SevDeskInvoiceResponse {
    id: string;
    invoiceNumber: string;
}

const SEVDESK_API_URL = 'https://my.sevdesk.de/api/v1';

async function getApiToken(): Promise<string> {
    const setting = await prisma.systemSettings.findUnique({
        where: { key: 'sevdesk_api_token' }
    });
    if (!setting?.value) {
        throw new Error('SevDesk API Token ist nicht konfiguriert in den Einstellungen.');
    }
    return setting.value;
}

/** Contacts API calls */
export async function findOrCreateContact(
    token: string,
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string | null;
        address?: string | null;
        city?: string | null;
        postalCode?: string | null;
        country?: string | null;
    }
): Promise<string> {
    const headers = {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    // 1. Search for existing contact by email
    const searchUrl = `${SEVDESK_API_URL}/Contact?depth=0&email=${encodeURIComponent(customer.email)}`;
    const searchRes = await fetch(searchUrl, { method: 'GET', headers });
    
    if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData?.objects && searchData.objects.length > 0) {
            return searchData.objects[0].id;
        }
    }

    // 2. Not found, create new contact
    const contactBody = {
        name: `${customer.firstName} ${customer.lastName}`,
        familyName: customer.lastName,
        surename: customer.firstName,
        status: 100,
        email: customer.email,
        phone: customer.phone || '',
        category: {
            id: 3, // Standard category
            objectName: 'Category'
        }
    };

    const createRes = await fetch(`${SEVDESK_API_URL}/Contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify(contactBody)
    });

    if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Fehler beim Erstellen des SevDesk-Kontakts: ${errText}`);
    }

    const createData = await createRes.json();
    const contactId = createData.objects?.id || createData.id || createData.objects?.[0]?.id || (createData.objects?.length > 0 ? createData.objects[0].id : null);

    if (!contactId) {
        throw new Error('SevDesk hat keine Kontakt-ID zurückgegeben.');
    }

    // 3. Add address to the contact if provided
    if (customer.address || customer.city) {
        const addressBody = {
            contact: {
                id: contactId,
                objectName: 'Contact'
            },
            street: customer.address || '',
            zip: customer.postalCode || '',
            city: customer.city || '',
            country: {
                id: customer.country?.toLowerCase().includes('deutschland') ? 1 : 2, // 1: DE, 2: AT (standard mapping in sevDesk)
                objectName: 'StaticCountry'
            }
        };

        await fetch(`${SEVDESK_API_URL}/ContactAddress`, {
            method: 'POST',
            headers,
            body: JSON.stringify(addressBody)
        }).catch(err => console.error('Error adding address to SevDesk contact:', err));
    }

    return contactId;
}

/** Unified Factory call to save Invoice with items at once */
export async function createSevDeskInvoice(
    rental: any,
    customer: any,
    options: any[]
): Promise<SevDeskInvoiceResponse> {
    const token = await getApiToken();
    const contactId = await findOrCreateContact(token, customer);

    const headers = {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const invoiceDate = new Date().toISOString().split('T')[0];
    
    // Build line items/positions
    const positions: any[] = [];

    // Add rental base charge position
    const totalDays = rental.totalDays || 1;
    const dailyRate = Number(rental.dailyRate || 0);
    const dateRangeStr = `${new Date(rental.startDate).toLocaleDateString('de-AT')} - ${new Date(rental.endDate).toLocaleDateString('de-AT')}`;
    
    positions.push({
        objectName: 'InvoicePos',
        quantity: totalDays,
        price: dailyRate,
        name: `Fahrzeugmiete: ${rental.car.brand} ${rental.car.model} (${dateRangeStr})`,
        taxRate: 20, // Austrian VAT 20%
        unity: {
            id: 1, // pcs / Tag
            objectName: 'Unity'
        }
    });

    // Add selected extras/options as separate positions
    options.forEach(opt => {
        const price = Number(opt.price || 0);
        if (price > 0) {
            positions.push({
                objectName: 'InvoicePos',
                quantity: opt.isPerDay ? totalDays : 1,
                price: price,
                name: `Zusatzoption: ${opt.name}`,
                taxRate: 20,
                unity: {
                    id: 1,
                    objectName: 'Unity'
                }
            });
        }
    });

    const requestBody = {
        invoice: {
            objectName: 'Invoice',
            invoiceDate: invoiceDate,
            header: `Rechnung zu Mietvertrag #${rental.contractNumber || rental.id}`,
            discountTime: 0,
            taxType: 'default',
            taxRate: 20,
            invoiceType: 'RE', // RE = Rechnung
            status: '100', // 100 = Draft/Entwurf
            contact: {
                id: contactId,
                objectName: 'Contact'
            },
            currency: 'EUR'
        },
        positions: positions
    };

    const res = await fetch(`${SEVDESK_API_URL}/Invoice/Factory/saveInvoice`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Fehler bei SevDesk Rechnungserstellung: ${errText}`);
    }

    const data = await res.json();
    
    // sevDesk saveInvoice returns details inside objects or top level depending on API response
    const invoiceId = data.objects?.invoice?.id || data.invoice?.id || (data.objects?.id) || data.id;
    const invoiceNumber = data.objects?.invoice?.invoiceNumber || data.invoice?.invoiceNumber || data.objects?.invoiceNumber || data.invoiceNumber || `RE-SEV-${invoiceId}`;

    return {
        id: String(invoiceId),
        invoiceNumber: String(invoiceNumber)
    };
}
