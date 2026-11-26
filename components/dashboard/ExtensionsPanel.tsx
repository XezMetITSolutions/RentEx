import prisma from '@/lib/prisma';
import ExtensionControls from './ExtensionControls';
export default async function ExtensionsPanel({rentalId,admin=false}:{rentalId:number;admin?:boolean}){
 const rental=await prisma.rental.findUniqueOrThrow({where:{id:rentalId},include:{extensions:{orderBy:{createdAt:'desc'}}}});
 return <ExtensionControls rentalId={rentalId} admin={admin} canRequest={['Confirmed','Active'].includes(rental.status)&&rental.paymentStatus==='Paid'&&rental.endDate>new Date()} rows={rental.extensions.map(e=>({id:e.id,status:e.status,newEnd:e.newEnd.toISOString(),additional:Number(e.additionalAmount),expiresAt:e.expiresAt?.toISOString()||null}))}/>;
}
