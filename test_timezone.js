
function testKsaIdDate() {
    const testCases = [
        {
            name: "1 AM KSA on Feb 26 (Feb 25 10 PM UTC)",
            input: "2026-02-25T22:00:00Z",
            expected: "260226"
        },
        {
            name: "11 PM KSA on Feb 25 (Feb 25 8 PM UTC)",
            input: "2026-02-25T20:00:00Z",
            expected: "260225"
        },
        {
            name: "Today 1 AM KSA (Feb 22 10 PM UTC for Feb 23)",
            input: "2026-02-22T22:05:00Z",
            expected: "260223"
        }
    ];

    console.log("Starting Timezone Logic Tests...\n");

    testCases.forEach(tc => {
        const now = new Date(tc.input);
        const ksaOffset = 3 * 60 * 60 * 1000;
        const ksaTime = new Date(now.getTime() + ksaOffset);

        const yy = ksaTime.getUTCFullYear().toString().slice(-2);
        const mm = String(ksaTime.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(ksaTime.getUTCDate()).padStart(2, "0");
        const result = yy + mm + dd;

        if (result === tc.expected) {
            console.log(`✅ PASS: ${tc.name}`);
            console.log(`   UTC: ${now.toISOString()}`);
            console.log(`   KSA: ${ksaTime.toISOString()} -> Result: ${result}\n`);
        } else {
            console.error(`❌ FAIL: ${tc.name}`);
            console.error(`   Expected: ${tc.expected}, Got: ${result}\n`);
        }
    });
}

testKsaIdDate();
