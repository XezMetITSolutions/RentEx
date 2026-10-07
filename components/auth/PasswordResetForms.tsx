"use client";

import { useActionState } from "react";
import { requestPasswordReset, resetPassword } from "@/app/actions/auth";

const inputClass =
    "w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const buttonClass =
    "w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold transition-colors";
const errorClass =
    "mb-4 p-3 rounded-lg bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-300 text-sm";

export function ForgotPasswordForm() {
    const [state, action, pending] = useActionState(requestPasswordReset, null);

    if (state?.message) {
        return (
            <p role="status" className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300">
                {state.message}
            </p>
        );
    }

    return (
        <form action={action} className="space-y-4">
            {state?.error && <div role="alert" className={errorClass}>{state.error}</div>}
            <div>
                <label htmlFor="email" className={labelClass}>E-Mail</label>
                <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="ihre@email.at" />
            </div>
            <button type="submit" disabled={pending} className={buttonClass}>
                {pending ? "Wird gesendet …" : "Link senden"}
            </button>
        </form>
    );
}

export function ResetPasswordForm({ token }: { token: string }) {
    const [state, action, pending] = useActionState(resetPassword, null);

    return (
        <form action={action} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            {state?.error && <div role="alert" className={errorClass}>{state.error}</div>}
            <div>
                <label htmlFor="password" className={labelClass}>Neues Passwort</label>
                <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Mindestens 8 Zeichen.</p>
            </div>
            <div>
                <label htmlFor="passwordRepeat" className={labelClass}>Passwort wiederholen</label>
                <input id="passwordRepeat" name="passwordRepeat" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
            </div>
            <button type="submit" disabled={pending} className={buttonClass}>
                {pending ? "Wird gespeichert …" : "Passwort speichern"}
            </button>
        </form>
    );
}
