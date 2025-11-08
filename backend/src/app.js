// backend/src/app.js (✨ '더 나은 로깅' 적용)

const express = require('express');
const crypto = require('crypto');
const app = express();
const port = 3000;
const cors = require('cors'); 
const { PRIVATE_KEY } = require('../keys.js');

app.use(cors()); 
app.use(express.json());

/* * 🚀 API 1: '트랙 1' ... (동일) ... */
app.get('/api/qr/:qr_id', (req, res) => {
    // ...
});

/* * 🚀 API 2: '트랙 2' (보안 QR) 생성 API */
app.post('/api/secure-qr/generate', (req, res) => {
    const data = req.body; 
    const dataString = JSON.stringify(data);

    try {
        if (!PRIVATE_KEY || typeof PRIVATE_KEY !== 'string' || PRIVATE_KEY.trim() === '') {
            const msg = 'PRIVATE_KEY가 설정되지 않았습니다. 환경변수 또는 backend/keys.js를 확인하세요.';
            console.error(msg);
            return res.status(500).json({ error: '서명 생성 실패', message: msg });
        }

        let signature;

        // 1) 우선 KeyObject 생성 + Sign 시도 (권장)
        try {
            const privateKeyObject = crypto.createPrivateKey({
                key: PRIVATE_KEY,
                format: 'pem'
            });

            const signer = crypto.createSign('SHA256');
            signer.update(dataString);
            signer.end();

            signature = signer.sign({
                key: privateKeyObject,
                padding: crypto.constants.RSA_PKCS1_PADDING
            }, 'base64');

        } catch (keyErr) {
            // KeyObject 변환에서 실패하면 자세히 로그하고, 문자열 키를 이용한 직접 서명으로 우회 시도
            console.warn('KeyObject 생성/사용 실패 (createPrivateKey/sign). fallback으로 crypto.sign 사용 시도합니다. 원래 에러:', keyErr && keyErr.message);

            // 2) fallback: crypto.sign (문자열 PEM 직접 사용)
            try {
                signature = crypto.sign('sha256', Buffer.from(dataString), {
                    key: PRIVATE_KEY,
                    padding: crypto.constants.RSA_PKCS1_PADDING
                }).toString('base64');
            } catch (fallbackErr) {
                // 둘 다 실패하면 원래 에러와 함께 반환
                console.error('Fallback 서명도 실패했습니다:', fallbackErr && fallbackErr.stack ? fallbackErr.stack : fallbackErr);
                throw fallbackErr; // 상위 catch로 전달
            }
        }

        console.log(`[LOG] '찐큐' 생성됨. 원본: ${dataString}`);
        return res.json({ data: dataString, signature });

    } catch (error) {
        console.error('--- 🚨 서명 생성 중 에러 발생 ---');
        console.error(error && error.stack ? error.stack : error);
        console.error('--------------------------------');
        return res.status(500).json({ error: '서명 생성 실패 (서버 로그 확인)', message: error && error.message ? error.message : String(error) });
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`🧠 '대충가이드' 백엔드 서버가 http://localhost:${port} 에서 실행 중...`);
});