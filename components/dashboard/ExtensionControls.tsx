'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { previewExtension, requestExtension, decideExtension, payExtension } from '@/app/actions/customer-extension';
type Quote={additional:number;total:number;days:number;km:number};
export type ExtensionRow={id:number;status:string;newEnd:string;additional:number;expiresAt:string|null};
const money=(n:number)=>new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR'}).format(n);
const when=(s:string)=>new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Vienna'}).format(new Date(s));
export default function ExtensionControls({rentalId,rows,canRequest,admin=false}:{rentalId:number;rows:ExtensionRow[];canRequest:boolean;admin?:boolean}){
 const router=useRouter();const [date,setDate]=useState('');const [time,setTime]=useState('10:00');const [quote,setQuote]=useState<Quote|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [sent,setSent]=useState(false);
 useEffect(()=>{
  if (!window.location.search.includes('extension=payment') || !rows.some(r=>r.status==='Approved')) return;
  const timer=setInterval(()=>router.refresh(),3000);
  return ()=>clearInterval(timer);
 },[rows,router]);
 const open=rows.some(r=>r.status==='Requested'||(r.status==='Approved'&&!!r.expiresAt&&new Date(r.expiresAt)>new Date()));
 async function run(fn:()=>Promise<{error?:string;url?:string}>,success?:()=>void){setBusy(true);setError('');try{const r=await fn();if(r.error)setError(r.error);else if(r.url)window.location.assign(r.url);else{success?.();router.refresh();}}catch{setError('Vorgang fehlgeschlagen. Bitte erneut versuchen.');}finally{setBusy(false);}}
 return <section id="extension" className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
 <h2 className="text-xl font-semibold">Miete verlängern</h2>
 <p className="text-sm text-zinc-600 dark:text-zinc-400">Gemäß AGB §7 vor dem bisherigen Mietende anfragen. Eine Verlängerung gilt erst nach unserer Genehmigung und Vorauszahlung. Bis dahin bleibt die bisherige Rückgabe verbindlich.</p>
 {error&&<p role="alert" className="text-red-600">{error}</p>}
 {rows.map(r=>{const expired=r.status==='Approved'&&(!r.expiresAt||new Date(r.expiresAt)<=new Date());const label=expired?'Zahlungsfrist abgelaufen':({Requested:'Wartet auf Genehmigung',Approved:'Genehmigt · Vorauszahlung ausstehend',Completed:'Bezahlt und verlängert',Rejected:'Abgelehnt',Refunded:'Nicht verlängert · Zahlung erstattet'}[r.status]||r.status);return <div key={r.id} className="rounded-xl bg-zinc-100 dark:bg-zinc-900 p-4 space-y-2"><p className="font-medium">Neue Rückgabe: {when(r.newEnd)}</p><p>Zusatzbetrag: {money(r.additional)} · {label}</p>
 {admin&&r.status==='Requested'&&<div className="flex flex-wrap gap-3"><button disabled={busy} onClick={()=>run(()=>decideExtension(r.id,true))} className="rounded-lg bg-red-600 text-white px-4 py-2">Genehmigen</button><button disabled={busy} onClick={()=>run(()=>decideExtension(r.id,false))} className="rounded-lg border px-4 py-2">Ablehnen</button></div>}
 {!admin&&r.status==='Approved'&&!expired&&<><p className="text-sm">Zahlbar bis {when(r.expiresAt!)}. Das neue Mietende gilt erst nach erfolgreicher Zahlung.</p><button disabled={busy} onClick={()=>run(()=>payExtension(r.id))} className="rounded-lg bg-red-600 text-white px-4 py-2">Zusatzbetrag online bezahlen</button></>}
 </div>})}
 {!admin&&canRequest&&!open&&!sent&&<form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const r=await previewExtension(rentalId,date,time);if(r.error){setError(r.error);setQuote(null);}else setQuote(r.quote!);}catch{setError('Prüfung fehlgeschlagen.');}finally{setBusy(false);}}} className="space-y-4">
 <div className="flex flex-wrap gap-4"><label className="grid gap-1">Neues Rückgabedatum<input required type="date" value={date} onChange={e=>{setDate(e.target.value);setQuote(null);}} className="rounded-lg border p-2 bg-transparent"/></label><label className="grid gap-1">Uhrzeit<input required type="time" value={time} onChange={e=>{setTime(e.target.value);setQuote(null);}} className="rounded-lg border p-2 bg-transparent"/></label></div>
 <button disabled={busy} className="rounded-lg border px-4 py-2">{busy?'Wird geprüft …':'Verfügbarkeit & Preis prüfen'}</button>
 {quote&&<div className="rounded-xl border p-4 space-y-3"><p>Zusatzbetrag inkl. MwSt.: <strong>{money(quote.additional)}</strong></p><p>Neuer Gesamtpreis: {money(quote.total)} · {quote.days} Miettage · {quote.km} km inklusive</p><button type="button" disabled={busy} onClick={()=>run(()=>requestExtension(rentalId,date,time,quote.additional),()=>setSent(true))} className="rounded-lg bg-red-600 text-white px-4 py-2">Verlängerung zu diesem Preis anfragen</button></div>}
 </form>}
 {sent&&<p role="status">Anfrage gesendet. Sie erhalten nach unserer Prüfung eine E-Mail.</p>}
 {!admin&&!canRequest&&<p className="text-sm text-zinc-500">Für eine Verlängerung benötigen Sie eine vollständig bezahlte, bestätigte oder laufende Miete, deren vereinbartes Ende noch nicht erreicht ist.</p>}
 </section>;
}
