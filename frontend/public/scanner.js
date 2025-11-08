// frontend/public/scanner.js (✨ "Ver. 4" 키 - 최종본)

// 🔐 '보안 QR' 검증을 위한 '공개 키' (✨ 'Ver. 5' 새 키로 교체!)
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKGINJGCdDOQOTuxMJz9yLMl5mJ0OD/KP8R/pC+smPMg9jjmaSxS6a0JNSbzLe5V6VbvkoNmwozPcOWFZUFAgMBAAE=
-----END PUBLIC KEY-----`;

// ... (이하 나머지 코드는 모두 동일) ...

// ✨ 1. '병맛' 아바타와 메시지를 제어할 요소들을 미리 찾아둡니다.
const avatarImage = document.getElementById('avatar-image');
const avatarMessage = document.getElementById('avatar-message');


// 2. 스캔 성공 시 실행될 '병맛' 콜백 함수
function onScanSuccess(decodedText, decodedResult) {
    // decodedText: 스캔된 QR의 텍스트 데이터
    console.log(`QR 스캔 성공: ${decodedText}`);

    // 스캐너를 잠시 멈춥니다.
    html5QrcodeScanner.pause();
    
    // ✨ 아바타와 메시지를 '검증 중...' 상태로 변경
    avatarMessage.textContent = "서버에서 '찐큐'인지 검증 중... (대충 로딩)";
    avatarImage.src = 'images/avatar-surprised.png'; // 3번 (놀란/검증) 표정

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
                avatarImage.src = 'images/avatar-happy.png'; // ✨ 1번 (행복) 표정
                avatarMessage.textContent = "🎉 검증 성공! '찐큐'입니다! (대충 행복)";
            } else {
                // 🚨 검증 실패! (서명은 있지만, 위조됨)
                avatarImage.src = 'images/avatar-angry.png'; // ✨ 2번 (화남) 표정
                avatarMessage.textContent = "🚨 위조 감지! '짭큐'입니다! (대충 화남)";
            }

        } else {
            // 🚨 그냥 일반 QR (예: http://google.com)
            avatarImage.src = 'images/avatar-angry.png'; // ✨ 2번 (화남) 표정
            avatarMessage.textContent = "🚨 '짭큐' 감지! (이건 공식 QR 아님)";
        }
    } catch (error) {
        // 🚨 JSON 파싱 실패 (그냥 텍스트 QR)
        avatarImage.src = 'images/avatar-angry.png'; // ✨ 2번 (화남) 표정
        avatarMessage.textContent = "🚨 '짭큐' 감지! (이상한 QR임)";
    }

    // ✨ 4초 후에 다시 스캔 시작 및 아바타/메시지 초기화
    setTimeout(() => {
        avatarMessage.textContent = "'찐큐'를 네모 안에 '대충' 맞춰주세요";
        avatarImage.src = 'images/avatar-surprised.png'; // 3번 (놀란) 표정으로 복귀
        html5QrcodeScanner.resume();
    }, 4000); // 4초간 결과를 보여줌
}

// 3. 스캔 실패 시 (무시해도 됨)
function onScanFailure(error) {
    // (QR을 못 찾으면 계속 호출됨 - 무시)
}

// 4. QR 스캐너 객체 생성
const html5QrcodeScanner = new Html5QrcodeScanner(
    "qr-reader",  // 스캐너를 삽입할 div의 ID
    { 
        fps: 10, // 초당 스캔 프레임
        qrbox: { width: 250, height: 250 } // 스캔 박스 크기
    },
    /* verbose= */ false
);

// 5. 스캐너 렌더링 (카메라 시작!)
// Vercel/Netlify에 배포된 https:// 주소에서만 작동합니다.
html5QrcodeScanner.render(onScanSuccess, onScanFailure);