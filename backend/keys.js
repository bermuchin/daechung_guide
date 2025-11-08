// backend/keys.js
// - 개발 편의: backend/keys.dev.pem 파일이 있으면 그것을 우선 사용합니다.
// - 운영/CI: 환경변수 DAECHUNG_PRIVATE_KEY 를 사용하세요. (더 안전)

const fs = require('fs');
const path = require('path');

const privateKeyFromEnv = process.env.DAECHUNG_PRIVATE_KEY;
const devKeyPath = path.join(__dirname, 'keys.dev.pem');

let fallbackPrivateKey = '';
if (fs.existsSync(devKeyPath)) {
    try {
        fallbackPrivateKey = fs.readFileSync(devKeyPath, 'utf8');
    } catch (e) {
        // 파일 읽기 실패 시 빈값 유지
        fallbackPrivateKey = '';
    }
}

// 예전 하드코딩 값은 제거했습니다. 운영 환경에서는 반드시 환경변수를 사용하세요.
module.exports = {
    PRIVATE_KEY: privateKeyFromEnv || fallbackPrivateKey
};