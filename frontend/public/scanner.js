// frontend/public/scanner.js (✨ '안정성 강화' 버전)

// 디버그 콘솔에 로그 출력하는 함수
function debugLog(message, isError = false) {
    const debugConsole = document.getElementById('debug-console');
    if (debugConsole) {
        debugConsole.style.display = 'block';
        const logEntry = document.createElement('div');
        logEntry.style.color = isError ? '#ff6b6b' : '#69db7c';
        logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        debugConsole.appendChild(logEntry);
        // 최근 로그가 보이도록 스크롤
        debugConsole.scrollTop = debugConsole.scrollHeight;
    }
    // 기존 console 로그도 유지
    isError ? console.error(message) : console.log(message);
}

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
        debugLog(`QR 스캔 성공! 디코딩된 텍스트:`, false);
        debugLog(decodedText, false);
        debugLog(`디코딩 결과 전체:`, false);
        debugLog(JSON.stringify(decodedResult, null, 2), false);
        
        if (html5QrcodeScanner) {
            html5QrcodeScanner.pause();
        }
        
        avatarMessage.textContent = "서버에서 '찐큐'인지 검증 중... (대충 로딩)";
        avatarImage.src = 'images/avatar-surprised.png';

        try {
            let qrData;
            try {
                debugLog("JSON 파싱 시도...", false);
                qrData = JSON.parse(decodedText);
                debugLog("JSON 파싱 성공:", false);
                debugLog(JSON.stringify(qrData, null, 2), false);
            } catch (parseError) {
                debugLog("JSON 파싱 실패. URL인지 확인...", true);
                // URL인 경우 처리
                if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
                    debugLog("URL QR 코드 감지됨", true);
                    throw new Error("URL QR 코드");
                } else {
                    debugLog("알 수 없는 형식의 QR 코드", true);
                    throw parseError;
                }
            }

            if (qrData.data && qrData.signature) {
                debugLog("서명 검증 시작...", false);
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
            debugLog('카메라 시작 시도...');
            
            // 이전 스캐너가 있다면 정리
            if (html5QrcodeScanner) {
                debugLog('이전 스캐너 정리 중...');
                await html5QrcodeScanner.clear();
            }

            // 먼저 기기의 카메라 접근 가능 여부 확인
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === 'videoinput');
            console.log('사용 가능한 카메라:', cameras.length, '개');
            
            if (cameras.length === 0) {
                throw new Error('사용 가능한 카메라가 없습니다.');
            }

            // 후면 카메라 찾기 (모바일용)
            const rearCamera = cameras.find(camera => 
                camera.label.toLowerCase().includes('back') || 
                camera.label.toLowerCase().includes('rear') ||
                camera.label.toLowerCase().includes('환경') ||
                camera.label.toLowerCase().includes('후면')
            );

            // 스캐너 새로 생성
            const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
            const qrboxSize = Math.floor(smallerDimension * 0.7); // 화면의 70%
            
            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader",
                { 
                    fps: 10,
                    qrbox: { width: qrboxSize, height: qrboxSize },
                    videoConstraints: rearCamera ? {
                        deviceId: rearCamera.deviceId,
                        facingMode: "environment",
                        width: { min: 640, ideal: 1080, max: 1920 },
                        height: { min: 640, ideal: 1080, max: 1920 },
                        aspectRatio: 1
                    } : {
                        facingMode: "environment",
                        width: { min: 640, ideal: 1080, max: 1920 },
                        height: { min: 640, ideal: 1080, max: 1920 },
                        aspectRatio: 1
                    },
                    showTorchButtonIfSupported: true
                },
                false
            );

            debugLog('스캐너 렌더링 시도...');
            await html5QrcodeScanner.render(onScanSuccess, onScanFailure);
            debugLog('카메라 시작 성공!');
            
            // 시작 버튼 숨기기
            const startButton = document.querySelector('.start-button');
            if (startButton) startButton.style.display = 'none';
            
            avatarMessage.textContent = "'찐큐'를 네모 안에 '대충' 맞춰주세요";
            avatarImage.src = 'images/avatar-surprised.png';

        } catch (err) {
            debugLog(`카메라 시작 실패: ${err.name} - ${err.message}`, true);
            debugLog(`전체 에러: ${err.toString()}`, true);
            
            let errorMessage = "카메라를 시작할 수 없어요! ";
            
            if (err.name === 'NotAllowedError') {
                errorMessage = "😢 카메라 권한이 거부되었어요! 브라우저 설정에서 카메라 권한을 허용해주세요.";
            } else if (err.name === 'NotFoundError') {
                errorMessage = "카메라를 찾을 수 없어요! 카메라가 연결되어 있는지 확인해주세요.";
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                errorMessage = "카메라가 다른 앱에서 사용 중이에요! 다른 앱을 종료하고 다시 시도해주세요.";
            } else if (err.name === 'OverconstrainedError') {
                errorMessage = "요청한 카메라 설정을 사용할 수 없어요. 다시 시도할게요.";
                // 후면 카메라 강제 설정을 제거하고 다시 시도
                return startCamera();
            }
            
            avatarMessage.textContent = errorMessage;
            avatarImage.src = 'images/avatar-angry.png';
            showRetryButton();
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