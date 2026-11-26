'use server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { requireAdminModule } from '@/lib/adminAccess';
import { extensionQuote, extensionNotice } from '@/lib/extensions';
import { lockCarForBooking } from '@/lib/availability';
import { parseBookingDateTime } from '@/lib/bookingUtils';
import { stripe } from '@/lib/stripe';
import { SITE_URL } from '@/lib/config';
import { revalidatePath } from 'next/cache';

function refresh(id: number) {
    for (const p of ['/dashboard', '/dashboard/reservations', `/dashboard/rentals/${id}`, `/admin/reservations/${id}`]) revalidatePath(p);
}
export async function previewExtension(rentalId: number, date: string, time: string) {
    try {
        const customerId = await getSession();
        if (!customerId) throw new Error('Bitte anmelden.');
        const {data} = await prisma.$transaction(tx => extensionQuote(tx, rentalId, parseBookingDateTime(date,time), customerId));
        return { quote: { additional: data.additionalAmount, total: data.totalAmount, days: data.totalDays, km: data.includedKm } };
    } catch(e) { return { error: e instanceof Error ? e.message : 'Prüfung fehlgeschlagen.' }; }
}
export async function requestExtension(rentalId: number, date: string, time: string, expectedAmount: number) {
    try {
        const customerId = await getSession();
        if (!customerId) throw new Error('Bitte anmelden.');
        const target = await prisma.rental.findFirstOrThrow({ where: { id: rentalId, customerId } });
        const ext = await prisma.$transaction(async tx => {
            await lockCarForBooking(tx,target.carId);
            await tx.$queryRaw`SELECT id FROM "Rental" WHERE id = ${rentalId} FOR UPDATE`;
            const {data} = await extensionQuote(tx,rentalId,parseBookingDateTime(date,time),customerId);
            if (Math.abs(data.additionalAmount - expectedAmount) > 0.001) throw new Error('Der Preis hat sich geändert. Bitte neu prüfen.');
            const pending = await tx.rentalExtension.findFirst({ where: { rentalId, OR: [{status:'Requested'},{status:'Approved',expiresAt:{gt:new Date()}}] } });
            if (pending) throw new Error('Es gibt bereits eine offene Verlängerungsanfrage.');
            const created = await tx.rentalExtension.create({ data: { rentalId, ...data } });
            await tx.notification.create({ data: { type:'System', recipient:'Admin', status:'Pending', subject:'Verlängerung angefragt', message:`Buchung ${target.contractNumber || rentalId}: Verlängerungsanfrage #${created.id}. Bitte in der Buchung prüfen.`, relatedType:'Rental', relatedId:rentalId } });
            return created;
        });
        await extensionNotice(ext.id,'Ihre Verlängerungsanfrage ist eingegangen. Das bisherige Mietende bleibt bis zur Genehmigung und Vorauszahlung verbindlich.');
        refresh(rentalId); return { success: true };
    } catch(e) { return { error: e instanceof Error ? e.message : 'Anfrage fehlgeschlagen.' }; }
}
export async function decideExtension(id:number, approve:boolean) {
    await requireAdminModule('Reservierungen');
    try {
        const target = await prisma.rentalExtension.findUniqueOrThrow({where:{id},include:{rental:true}});
        await prisma.$transaction(async tx => {
            await lockCarForBooking(tx,target.rental.carId);
            await tx.$queryRaw`SELECT id FROM "Rental" WHERE id = ${target.rentalId} FOR UPDATE`;
            const ext = await tx.rentalExtension.findUniqueOrThrow({where:{id}});
            if(ext.status !== 'Requested') throw new Error('Diese Anfrage wurde bereits bearbeitet.');
            if(!approve) { await tx.rentalExtension.update({where:{id},data:{status:'Rejected'}}); return; }
            const {data,rental} = await extensionQuote(tx,ext.rentalId,ext.newEnd);
            if(data.previousEnd.getTime()!==ext.previousEnd.getTime() || data.totalAmount!==Number(ext.totalAmount) || data.previousTotal!==Number(ext.previousTotal)) throw new Error('Mietdaten oder Preis geändert. Bitte Anfrage ablehnen und neu anfragen lassen.');
            if(data.additionalAmount===0) {
                await tx.rental.update({where:{id:rental.id},data:{endDate:ext.newEnd,totalDays:data.totalDays,includedKm:data.includedKm,extrasCost:data.extrasCost,insuranceCost:data.insuranceCost}});
                await tx.rentalExtension.update({where:{id},data:{status:'Completed'}});return;
            }
            if(data.additionalAmount<0.5) throw new Error('Zusatzbetrag ist zu niedrig für eine Kartenzahlung. Bitte manuell bearbeiten.');
            const expiresAt=new Date(Math.floor(Date.now()/1000)*1000+31*60*1000);
            const session=await stripe.checkout.sessions.create({ mode:'payment',payment_method_types:['card'],customer_email:rental.customer.email,
                line_items:[{price_data:{currency:'eur',unit_amount:Math.round(data.additionalAmount*100),product_data:{name:`Verlängerung ${rental.contractNumber || rental.id}`}},quantity:1}],
                metadata:{extensionId:String(id)},expires_at:Math.floor(expiresAt.getTime()/1000),
                success_url:`${SITE_URL}/dashboard/rentals/${rental.id}?extension=payment`,cancel_url:`${SITE_URL}/dashboard/rentals/${rental.id}`,
            },{idempotencyKey:`extension-checkout-${id}`});
            await tx.rentalExtension.update({where:{id},data:{status:'Approved',expiresAt,stripeSessionId:session.id}});
        },{timeout:60000});
        const completed=await prisma.rentalExtension.findUniqueOrThrow({where:{id}});
        await extensionNotice(id,completed.status==='Completed'?'Die Verlängerung ohne zusätzliche Kosten wurde bestätigt.':approve?'Ihre Verlängerung wurde genehmigt. Bitte bezahlen Sie den Zusatzbetrag innerhalb der angezeigten Zahlungsfrist in Ihrem Kundenkonto. Erst danach gilt das neue Mietende.':'Ihre Verlängerungsanfrage wurde abgelehnt. Das bisherige Mietende bleibt bestehen.');
        refresh(target.rentalId);return {success:true};
    }catch(e){return {error:e instanceof Error?e.message:'Bearbeitung fehlgeschlagen.'};}
}
export async function payExtension(id:number) {
    try {
        const customerId=await getSession();if(!customerId)throw new Error('Bitte anmelden.');
        const ext=await prisma.rentalExtension.findFirst({where:{id,rental:{customerId}},include:{rental:true}});
        if(!ext || ext.status!=='Approved' || !ext.stripeSessionId || !ext.expiresAt || ext.expiresAt<=new Date() || !['Active','Confirmed'].includes(ext.rental.status))throw new Error('Diese Zahlungsfreigabe ist nicht mehr gültig. Bitte neu anfragen.');
        const session=await stripe.checkout.sessions.retrieve(ext.stripeSessionId);
        if(session.status!=='open'||!session.url)throw new Error('Zahlung wird verarbeitet oder ist abgelaufen. Bitte Seite aktualisieren.');
        return {url:session.url};
    }catch(e){return {error:e instanceof Error?e.message:'Zahlung konnte nicht geöffnet werden.'};}
}
