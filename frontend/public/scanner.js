// frontend/public/scanner.js (✨ '안정성 강화' 버전)

document.addEventListener("DOMContentLoaded", () => {
    // 🔐 '보안 QR' 검증을 위한 '공개 키'
    const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKGINJGCdDOQOTuxMJz9yLMl5mJ0
OD/KP8R/pC+smPMg9jjmaSxS6a0JNSbzLe5V6VbvkoNmwozPcOWFZUFAgMBAAE=
-----END PUBLIC KEY-----`;

    const avatarImage = document.getElementById('avatar-image');
    const avatarMessage = document.getElementById('avatar-message');
    const qrContainer = document.getElementById('qr-reader-container');
    
    let html5QrcodeScanner = null;

    // QR 스캔 성공 시 실행될 콜백
    function onScanSuccess(decodedText, decodedResult) {
        console.log(`QR 스캔 성공:`, decodedText);
        if (html5QrcodeScanner) {
            html5QrcodeScanner.pause();
        }
        
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
            console.error('QR 파싱 에러:', error);
            avatarImage.src = 'images/avatar-angry.png';
            avatarMessage.textContent = "🚨 '짭큐' 감지! (이상한 QR임)";
        }

        setTimeout(() => {
            avatarMessage.textContent = "'찐큐'를 네모 안에 '대충' 맞춰주세요";
            avatarImage.src = 'images/avatar-surprised.png';
            if (html5QrcodeScanner) {
                html5QrcodeScanner.resume();
            }
        }, 4000);
    }

    // QR 스캔 실패 시
    function onScanFailure(error) {
        // 일반적인 스캔 실패는 무시 (프레임마다 호출됨)
        // console.debug('QR 스캔 실패:', error);
    }

    // 카메라 시작 함수
    async function startCamera() {
        try {
            avatarMessage.textContent = "카메라 권한을 허용해주세요!";
            
            // 이전 스캐너가 있다면 정리
            if (html5QrcodeScanner) {
                await html5QrcodeScanner.clear();
            }

            // 스캐너 새로 생성
            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader",
                { 
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    // 모바일 최적화 설정
                    formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true
                },
                false
            );

            await html5QrcodeScanner.render(onScanSuccess, onScanFailure);
            console.log('카메라 시작됨');
            
            // 시작 버튼 숨기기
            const startButton = document.querySelector('.start-button');
            if (startButton) startButton.style.display = 'none';
            
            avatarMessage.textContent = "'찐큐'를 네모 안에 '대충' 맞춰주세요";
            avatarImage.src = 'images/avatar-surprised.png';

        } catch (err) {
            console.error('카메라 시작 실패:', err);
            
            if (err.name === 'NotAllowedError') {
                avatarMessage.textContent = "😢 카메라 권한이 거부되었어요!";
                avatarImage.src = 'images/avatar-angry.png';
                showRetryButton();
            } else {
                avatarMessage.textContent = "카메라를 시작할 수 없어요! 다시 시도해주세요.";
                avatarImage.src = 'images/avatar-angry.png';
                showRetryButton();
            }
        }
    }

    // 재시도 버튼 표시
    function showRetryButton() {
        // 이전 버튼들 제거
        const oldButtons = qrContainer.querySelectorAll('.retry-button, .start-button');
        oldButtons.forEach(btn => btn.remove());

        const retryBtn = document.createElement('button');
        retryBtn.textContent = "카메라 다시 시작하기";
        retryBtn.className = "retry-button";
        retryBtn.onclick = startCamera;
        qrContainer.appendChild(retryBtn);
    }

    // 시작 버튼 생성 및 표시
    const startBtn = document.createElement('button');
    startBtn.textContent = "QR 스캔 시작하기";
    startBtn.className = "start-button";
    startBtn.onclick = startCamera;
    qrContainer.appendChild(startBtn);

    // 시작 안내 메시지
    avatarMessage.textContent = "아래 버튼을 눌러서 시작하세요!";
});