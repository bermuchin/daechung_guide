const { generateKeyPairSync } = require('crypto');
const { writeFileSync } = require('fs');
const path = require('path');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const outDir = path.join(__dirname, '..');
writeFileSync(path.join(outDir, 'keys.dev.pem'), privateKey);
writeFileSync(path.join(outDir, 'keys.dev.pub.pem'), publicKey);
console.log('Dev key pair generated:');
console.log(' - private:', path.join(outDir, 'keys.dev.pem'));
console.log(' - public :', path.join(outDir, 'keys.dev.pub.pem'));
