'use server';
import { rateLimit, getClientIpFromHeaders } from '@/lib/rateLimit';
import { sendEmail, COMPANY_EMAIL } from '@/lib/notificationTemplates';
import { renderEmail } from '@/lib/email/layout';
import prisma from '@/lib/prisma';
export async function sendContact(_prev: {error?:string;success?:string}, form: FormData): Promise<{error?:string;success?:string}> {
 const text=(key:string)=>String(form.get(key)||'').trim();
 const first=text('firstName'),last=text('lastName'),email=text('email'),subject=text('subject'),message=text('message');
 if(!first||!last||!subject||!message||!/^\S+@\S+\.\S+$/.test(email))return {error:'Bitte alle Pflichtfelder und eine gültige E-Mail-Adresse eingeben.'};
 if(first.length>100||last.length>100||email.length>254||subject.length>200||message.length>5000)return {error:'Ihre Nachricht ist zu lang (maximal 5.000 Zeichen).'};
 const ip=await getClientIpFromHeaders();if(!rateLimit(`contact:${ip}`,{limit:5,windowSeconds:600}).allowed)return {error:'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'};
 try {
  await prisma.notification.create({data:{type:'System',recipient:'Admin',status:'Pending',subject:`Kontakt: ${subject}`,message:`${first} ${last} <${email}>\n${message}`}});
  const rendered=renderEmail({preheader:subject,heading:`Kontakt: ${subject}`,blocks:[{kind:'p',text:`Von: ${first} ${last}\nE-Mail: ${email}`},{kind:'p',text:message}],signoff:false});
  const sent=await sendEmail(COMPANY_EMAIL,{subject:`Kontakt: ${subject}`,body:rendered.text,html:rendered.html});
  return {success:sent?'Ihre Nachricht wurde gesendet. Wir melden uns bei Ihnen.':'Ihre Anfrage wurde gespeichert und wird von unserem Team bearbeitet.'};
 }catch(e){console.error('[contact]',e);return {error:'Nachricht konnte nicht gespeichert werden. Bitte erneut versuchen oder anrufen.'};}
}
