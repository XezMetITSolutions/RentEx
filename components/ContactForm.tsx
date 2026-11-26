'use client';
import {useActionState} from 'react';
import {sendContact} from '@/app/actions/contact';
export default function ContactForm({subject='',firstName='',lastName='',email=''}:{subject?:string;firstName?:string;lastName?:string;email?:string}){
 const [state,action,pending]=useActionState(sendContact,{});
 const field='w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3';
 return <form action={action} className="space-y-4">
 {state.error&&<p role="alert" className="text-red-600">{state.error}</p>}
 {state.success?<p role="status" className="text-green-700 dark:text-green-400">{state.success}</p>:<>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="grid gap-1">Vorname<input required maxLength={100} name="firstName" defaultValue={firstName} autoComplete="given-name" className={field}/></label><label className="grid gap-1">Nachname<input required maxLength={100} name="lastName" defaultValue={lastName} autoComplete="family-name" className={field}/></label></div>
 <label className="grid gap-1">E-Mail-Adresse<input required type="email" maxLength={254} name="email" defaultValue={email} autoComplete="email" className={field}/></label>
 <label className="grid gap-1">Betreff<input required maxLength={200} name="subject" defaultValue={subject} className={field}/></label>
 <label className="grid gap-1">Nachricht<textarea required maxLength={5000} name="message" rows={5} className={field}/></label>
 <button disabled={pending} className="rounded-xl bg-red-600 text-white px-6 py-3 disabled:opacity-50">{pending?'Wird gesendet …':'Nachricht senden'}</button>
 </>}
 </form>;
}
