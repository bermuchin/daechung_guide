// frontend/public/scanner.js (신규 파일 - '진짜' 로직)

// 🔐 '보안 QR' 검증을 위한 '공개 키' (Public Key)
// (해커톤 시연용. 이 키는 앱에 저장되고, 짝이 되는 '비공개 키'는 backend/에 보관합니다)
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoErmN8yL/S/yFVLh9rAX/1IN+9/A/n
M6lYrhQ8N4m6GSoVbDo/9kzzc2z9iVFXoK+M1exDUpPgnI/gHbxqxSkCAwEAAQ==
-----END PUBLIC KEY-----`;


// 1. 스캔 성공 시 실행될 '병맛' 콜백 함수
function onScanSuccess(decodedText, decodedResult) {
    // decodedText: 스캔된 QR의 텍스트 데이터
    console.log(`QR 스캔 성공: ${decodedText}`);

    // 스캐너를 잠시 멈춥니다.
    html5QrcodeScanner.pause();
    
    try {
        // 1. 스캔한 텍스트를 JSON으로 파싱 시도
        const qrData = JSON.parse(decodedText);

        // 2. 'data'와 'signature' 필드가 있는지 확인
        if (qrData.data && qrData.signature) {
            
            // --- 🔐 '보안성(40%)' 핵심 검증 로직 ---
            const sig = new KJUR.crypto.Signature({"alg": "SHA256withRSA"});
            sig.init(PUBLIC_KEY);       // 1. 내장된 '공개 키'로 초기화
            sig.updateString(qrData.data); // 2. 원본 데이터를 넣음
            
            // 3. 서명 검증!
            const isValid = sig.verify(qrData.signature);
            // ------------------------------------

            if (isValid) {
                // 🚀 검증 성공! (서버가 발행한 '찐큐'가 맞음)
                alert("🎉 검증 성공! '찐큐'입니다! (쿠폰 획득)");
                // (TODO: qrData.data를 사용해 실제 쿠폰 처리)
            } else {
                // 🚨 검증 실패! (서명은 있지만, 위조됨)
                alert("🚨 위조 감지! '짭큐'입니다!");
            }

        } else {
            // 🚨 그냥 일반 QR (예: http://google.com)
            alert("🚨 '짭큐' 감지! (이건 '대충가이드' 공식 QR이 아닙니다!)");
        }
    } catch (error) {
        // 🚨 JSON 파싱 실패 (그냥 텍스트 QR)
        alert("🚨 '짭큐' 감지! (이건 '대충가이드' 공식 QR이 아닙니다!)");
    }

    // 2초 후에 다시 스캔 시작
    setTimeout(() => {
        html5QrcodeScanner.resume();
    }, 2000);
}

// 2. 스캔 실패 시 (무시해도 됨)
function onScanFailure(error) {
    // (QR을 못 찾으면 계속 호출됨 - 무시)
    // console.warn(`QR 스캔 실패: ${error}`);
}

// 3. QR 스캐너 객체 생성
const html5QrcodeScanner = new Html5QrcodeScanner(
    "qr-reader",  // 스캐너를 삽입할 div의 ID
    { 
        fps: 10, // 초당 스캔 프레임
        qrbox: { width: 250, height: 250 } // 스캔 박스 크기
    },
    /* verbose= */ false
);

// 4. 스캐너 렌더링 (카메라 시작!)
// Vercel/Netlify에 배포된 https:// 주소에서만 작동합니다.
html5QrcodeScanner.render(onScanSuccess, onScanFailure);