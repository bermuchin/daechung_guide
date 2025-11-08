const crypto = require('crypto');
const { PRIVATE_KEY } = require('../keys.js');

const data = JSON.stringify({ reward: 'stamp', spot_id: 123 });

try {
  const signature = crypto.sign('sha256', Buffer.from(data), { key: PRIVATE_KEY, padding: crypto.constants.RSA_PKCS1_PADDING }).toString('base64');
  console.log('Signature OK. len=', signature.length);
  console.log(signature);
} catch (e) {
  console.error('Signature error:', e && e.stack ? e.stack : e);
  process.exit(1);
}
