'use client';
import {useActionState,useState} from 'react';
import {register} from '@/app/actions/auth';
export default function RegisterForm({email=''}:{email?:string}){
 const [state,action,pending]=useActionState(register,{});const [values,setValues]=useState({firstName:'',lastName:'',email,phone:'',password:''});
 const fields=[['firstName','Vorname *','text','given-name'],['lastName','Nachname *','text','family-name'],['email','E-Mail *','email','email'],['phone','Telefon','tel','tel'],['password','Passwort * (min. 8 Zeichen)','password','new-password']] as const;
 return <form action={action} className="space-y-4">{state.error&&<p role="alert" className="text-red-600">{state.error}</p>}{fields.map(([name,label,type,autoComplete])=><label key={name} className="grid gap-1">{label}<input name={name} type={type} required={name!=='phone'} minLength={name==='password'?8:undefined} autoComplete={autoComplete} value={values[name]} onChange={e=>setValues({...values,[name]:e.target.value})} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent p-3"/></label>)}<button disabled={pending} className="w-full rounded-xl bg-red-600 text-white py-3 disabled:opacity-50">{pending?'Wird erstellt …':'Konto erstellen'}</button></form>;
}
