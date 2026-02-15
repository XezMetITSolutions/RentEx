import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import InvoiceView from '@/components/admin/InvoiceView';

export const dynamic = 'force-dynamic';

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const invoiceId = parseInt(resolvedParams.id);

    if (isNaN(invoiceId)) {
        notFound();
    }

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            rental: {
                include: {
                    car: true,
                    customer: true
                }
            }
        }
    });

    if (!invoice) {
        notFound();
    }

    // Serialize for safety and to match expected props types
    const serializedInvoice = JSON.parse(JSON.stringify(invoice));

    return <InvoiceView invoice={serializedInvoice} />;
}
