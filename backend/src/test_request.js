(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/secure-qr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reward: 'stamp', spot_id: 123 })
    });
    const json = await res.json();
    console.log('status', res.status);
    console.log(JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('request error', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
