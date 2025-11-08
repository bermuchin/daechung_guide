// frontend/public/scanner.js (✨ 'DOMContentLoaded' 적용)

// -----------------------------------------------------------
// ✨ 1. 이 이벤트 리스너로 코드 전체를 감싸줍니다.
// "HTML 문서가 완전히 준비되면, { ... } 안의 코드를 실행해라"
// -----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    // 🔐 '보안 QR' 검증을 위한 '공개 키'
    const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKGINJGCdDOQOTuxMJz9yLMl5mJ0
OD/KP8R/pC+smPMg9jjmaSxS6a0JNSbzLe5V6VbvkoNmwozPcOWFZUFAgMBAAE=
-----END PUBLIC KEY-----`;

    // ✨ 2. '병맛' 아바타와 메시지를 제어할 요소들을 미리 찾아둡니다.
    const avatarImage = document.getElementById('avatar-image');
    const avatarMessage = document.getElementById('avatar-message');

    // 3. 스캔 성공 시 실행될 '병맛' 콜백 함수
    function onScanSuccess(decodedText, decodedResult) {
        console.log(`QR 스캔 성공: ${decodedText}`);
        html5QrcodeScanner.pause();
        
        avatarMessage.textContent = "서버에서 '찐큐'인지 검증 중... (대충 로딩)";
        avatarImage.src = 'images/avatar-surprised.png';

        try {
            const qrData = JSON.parse(decodedText);
            if (qrData.data && qrData.signature) {
                const sig = new KJUR.crypto.Signature({"alg": "SHA256withRSA"});
                sig.init(PUBLIC_KEY);
                sig.updateString(qrData.data);
                const isValid = sig.verify(qrData.signature);

                if (isValid) {
                    avatarImage.src = 'images/avatar-happy.png';
                    avatarMessage.textContent = "🎉 검증 성공! '찐큐'입니다! (대충 행복)";
                } else {
                    avatarImage.src = 'images/avatar-angry.png';
                    avatarMessage.textContent = "🚨 위조 감지! '짭큐'입니다! (대충 화남)";
                }
            } else {
                avatarImage.src = 'images/avatar-angry.png';
                avatarMessage.textContent = "🚨 '짭큐' 감지! (이건 공식 QR 아님)";
            }
        } catch (error) {
            avatarImage.src = 'images/avatar-angry.png';
            avatarMessage.textContent = "🚨 '짭큐' 감지! (이상한 QR임)";
        }

        setTimeout(() => {
            avatarMessage.textContent = "'찐큐'를 네모 안에 '대충' 맞춰주세요";
            avatarImage.src = 'images/avatar-surprised.png';
            html5QrcodeScanner.resume();
        }, 4000);
    }

    // 4. 스캔 실패 시 (무시해도 됨)
    function onScanFailure(error) {
        // (QR을 못 찾으면 계속 호출됨 - 무시)
    }

    // 5. QR 스캐너 객체 생성
    const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",  // 스캐너를 삽입할 div의 ID
        { 
            fps: 10, 
            qrbox: { width: 250, height: 250 } 
        },
        /* verbose= */ false
    );

    // 6. 스캐너 렌더링 (카메라 시작!)
    // Vercel/Netlify에 배포된 https:// 주소에서만 작동합니다.
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

// -----------------------------------------------------------
// ✨ 1. (끝) 이벤트 리스너 닫기
// -----------------------------------------------------------
});