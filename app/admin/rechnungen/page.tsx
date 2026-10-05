import prisma from '@/lib/prisma';
import InvoicesClientView from '@/components/admin/InvoicesClientView';

export const dynamic = 'force-dynamic';

async function getData() {
    try {
        const withInvoice = await prisma.invoice.findMany({ select: { rentalId: true } });
        const rentalIdsWithInvoice = withInvoice.map((i) => i.rentalId);

        const [rentalsWithoutInvoice, invoices] = await Promise.all([
            prisma.rental.findMany({
                where: {
                    status: { not: 'Cancelled' },
                    id: { notIn: rentalIdsWithInvoice },
                },
                include: { car: true, customer: true },
                orderBy: { startDate: 'desc' },
            }),
            prisma.invoice.findMany({
                include: { rental: { include: { car: true, customer: true } } },
                orderBy: { issuedAt: 'desc' },
            }),
        ]);

        const serializedRentals = rentalsWithoutInvoice.map((r) => ({
            id: r.id,
            contractNumber: r.contractNumber,
            totalAmount: Number(r.totalAmount || 0),
            startDate: r.startDate.toISOString(),
            endDate: r.endDate.toISOString(),
            customer: r.customer
                ? {
                      firstName: r.customer.firstName,
                      lastName: r.customer.lastName,
                      email: r.customer.email,
                  }
                : null,
            car: r.car
                ? {
                      brand: r.car.brand,
                      model: r.car.model,
                      plate: r.car.plate,
                  }
                : null,
        }));

        const serializedInvoices = invoices.map((inv) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            issuedAt: inv.issuedAt.toISOString(),
            subtotal: Number(inv.subtotal || 0),
            taxRate: Number(inv.taxRate || 20),
            taxAmount: Number(inv.taxAmount || 0),
            total: Number(inv.total || 0),
            status: inv.status,
            registrierkassaExportedAt: inv.registrierkassaExportedAt ? inv.registrierkassaExportedAt.toISOString() : null,
            registrierkassaBelegId: inv.registrierkassaBelegId,
            rental: inv.rental
                ? {
                      id: inv.rental.id,
                      contractNumber: inv.rental.contractNumber,
                      customer: inv.rental.customer
                          ? {
                                firstName: inv.rental.customer.firstName,
                                lastName: inv.rental.customer.lastName,
                                email: inv.rental.customer.email,
                            }
                          : null,
                      car: inv.rental.car
                          ? {
                                brand: inv.rental.car.brand,
                                model: inv.rental.car.model,
                                plate: inv.rental.car.plate,
                            }
                          : null,
                  }
                : null,
        }));

        return { rentalsWithoutInvoice: serializedRentals, invoices: serializedInvoices };
    } catch (error) {
        console.error('Error fetching invoice data:', error);
        return { rentalsWithoutInvoice: [], invoices: [] };
    }
}

export default async function RechnungenPage() {
    const { rentalsWithoutInvoice, invoices } = await getData();

    return (
        <InvoicesClientView
            rentalsWithoutInvoice={rentalsWithoutInvoice}
            invoices={invoices}
        />
    );
}
