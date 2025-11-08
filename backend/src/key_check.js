const crypto = require('crypto');
const { PRIVATE_KEY } = require('../keys.js');

console.log('PRIVATE_KEY length:', PRIVATE_KEY ? PRIVATE_KEY.length : 0);

try {
  const keyObj = crypto.createPrivateKey({ key: PRIVATE_KEY, format: 'pem' });
  console.log('Key parsed OK. type=', keyObj.type, 'asymmetricKeyType=', keyObj.asymmetricKeyType);
} catch (e) {
  console.error('Key parse error:', e && e.stack ? e.stack : e);
  process.exit(1);
}

console.log('Key check OK.');
