export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="space-y-2">
                <div className="h-8 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800"></div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 h-96 rounded-2xl bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="h-96 rounded-2xl bg-zinc-200 dark:bg-zinc-800"></div>
            </div>
        </div>
    );
}
