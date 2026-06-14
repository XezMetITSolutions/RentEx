
async function main() {
    const url = 'https://rent-ex.vercel.app/api/admin/test-login';
    const body = {
        email: 'admin@rent-ex.at',
        password: 'RentEx2026!'
    };

    console.log(`Sending diagnostic login request to ${url}...`);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        console.log(`Status code: ${res.status}`);
        const data = await res.json();
        console.log('Diagnostic Response:');
        console.log(JSON.stringify(data, null, 2));
    } catch (e: any) {
        console.error('Request failed:', e.message);
    }
}

main();
