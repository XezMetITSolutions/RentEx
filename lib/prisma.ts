import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { getCloudflareContext } from '@opennextjs/cloudflare'

const isWorkers =
    typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers'

// The OpenNext bundle resolves `@prisma/client` to its Node entry, which reads
// the query compiler .wasm from disk — impossible on Workers. The wasm entry
// imports it as a module instead. It has to be require()d: its "import" export
// points at a wasm.mjs that Prisma doesn't generate.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const loadWasmClient = (): typeof PrismaClient => require('@prisma/client/wasm').PrismaClient

const createClient = (): PrismaClient => {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
    return isWorkers
        ? new (loadWasmClient())({ adapter })
        : new PrismaClient({ adapter })
}

// Cloudflare Workers forbid reusing a socket opened by another request, so on
// Workers each request gets its own client, keyed by its ExecutionContext.
const requestClients = new WeakMap<object, PrismaClient>()

declare const globalThis: {
    prismaGlobal?: PrismaClient;
} & typeof global;

function getClient(): PrismaClient {
    let ctx: object | undefined
    if (isWorkers) {
        try {
            ctx = getCloudflareContext().ctx
        } catch {
            // Outside a request (module init): fall through to the shared client.
        }
    }

    if (ctx) {
        let client = requestClients.get(ctx)
        if (!client) {
            client = createClient()
            requestClients.set(ctx, client)
        }
        return client
    }

    globalThis.prismaGlobal ??= createClient()
    return globalThis.prismaGlobal
}

const prisma = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        const client = getClient()
        const value = Reflect.get(client, prop, client)
        return typeof value === 'function' ? value.bind(client) : value
    },
})

export default prisma
