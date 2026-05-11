import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DebugRechnungenPage() {
    let status: any = {
        dbConnected: false,
        invoiceCount: 0,
        rentalCount: 0,
        error: null,
        schemaTest: null
    };

    try {
        // Test 1: Simple count
        status.invoiceCount = await prisma.invoice.count();
        status.dbConnected = true;
        
        // Test 2: Fetch one invoice with all relations
        try {
            const testInvoice = await prisma.invoice.findFirst({
                include: { rental: { include: { car: true, customer: true } } }
            });
            status.schemaTest = testInvoice ? 'SUCCESS' : 'NO_DATA';
        } catch (e: any) {
            status.schemaTest = `FAILED: ${e.message}`;
        }

        // Test 3: Rental count
        status.rentalCount = await prisma.rental.count();

    } catch (e: any) {
        status.error = e.message;
    }

    return (
        <div className="p-8 font-mono text-sm space-y-6">
            <h1 className="text-2xl font-bold text-red-600">Rechnungen Debug Page</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h2 className="font-bold border-b pb-2 mb-2 uppercase">Database Status</h2>
                    <p>Connected: <span className={status.dbConnected ? "text-green-500" : "text-red-500"}>{status.dbConnected ? "YES" : "NO"}</span></p>
                    <p>Invoices: {status.invoiceCount}</p>
                    <p>Rentals: {status.rentalCount}</p>
                </div>

                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h2 className="font-bold border-b pb-2 mb-2 uppercase">Schema Check</h2>
                    <p className={status.schemaTest?.startsWith('FAILED') ? "text-red-500" : "text-green-500"}>
                        {status.schemaTest || "Not tested"}
                    </p>
                </div>
            </div>

            {status.error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <h2 className="font-bold mb-2">CRITICAL ERROR:</h2>
                    <pre className="whitespace-pre-wrap">{status.error}</pre>
                </div>
            )}

            <div className="p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                <h2 className="font-bold mb-2">Instructions:</h2>
                <p>If "Schema Check" shows FAILED, the error message will tell us exactly which column is missing or broken.</p>
                <p>Visit this page at: <span className="font-bold">/admin/rechnungen/debug</span></p>
            </div>

            <div className="mt-8 text-gray-500 text-[10px]">
                Timestamp: {new Date().toISOString()}
            </div>
        </div>
    );
}
