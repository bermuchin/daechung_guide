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
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu/oiyW968zQdfKWikH5S
hX8P7PofAfkDeCLLedP0DwdznrogJ628MjgK4RpFVmezYfq7B1yDa1CpiTON3hde
0qZt39DdBjUZWCU0hQE3RJkLVrF02UT0Qdax/uC0Z6HUsCvwUaE2oqJP+Y1RFL7q
ashswM3OW4j5gF7Gs45jvUxOAkXNDp9J06H+IxKhONDjO/Kl/0mA8381VKdU3gSf
YhaCEzPecexeNR77Zx9s3ZicpFVmD05ruKK/uHWFwzyWsnYFEaHJtFuWy8Oc7Gm9
B4CdjOhJKsjqQgw2J7KsdKZWNkX7v25MWIAnvzjpRr2POU4bd190wTT0XXfu4VmN
xQIDAQAB
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
                
                let verificationData = qrData.data;
                debugLog("1. 원본 데이터:", false);
                debugLog(verificationData, false);
                
                // 데이터가 이미 JSON 문자열인지 확인하고 아니면 변환
                if (typeof verificationData !== 'string') {
                    debugLog("데이터를 JSON 문자열로 변환", false);
                    verificationData = JSON.stringify(verificationData);
                }
                
                debugLog("2. 최종 검증 데이터:", false);
                debugLog(verificationData, false);
                
                debugLog("3. 사용할 공개키:", false);
                const formattedKey = PUBLIC_KEY.replace(/\\n/g, '\n');
                debugLog(formattedKey, false);
                
                debugLog("4. 검증할 서명:", false);
                debugLog(qrData.signature, false);
                
                try {
                    debugLog("5. 서명 객체 초기화", false);
                    const sig = new KJUR.crypto.Signature({"alg": "SHA256withRSA"});
                    
                    debugLog("6. 공개키 설정", false);
                    sig.init(formattedKey);
                    
                    debugLog("7. 데이터 업데이트", false);
                    sig.updateString(verificationData);
                    
                    debugLog("8. 서명 검증 시도", false);
                    // jsrsasign의 Signature.verify는 기본적으로 16진수(HEX) 서명을 기대합니다.
                    // 백엔드에서 생성한 서명은 base64이므로 hex로 변환해서 전달합니다.
                    function base64ToHex(b64) {
                        try {
                            const raw = atob(b64);
                            let result = '';
                            for (let i = 0; i < raw.length; i++) {
                                result += raw.charCodeAt(i).toString(16).padStart(2, '0');
                            }
                            return result;
                        } catch (e) {
                            throw new Error('base64->hex 변환 실패: ' + e);
                        }
                    }

                    let sigHex;
                    if (typeof b64tohex === 'function') {
                        sigHex = b64tohex(qrData.signature);
                    } else {
                        sigHex = base64ToHex(qrData.signature);
                    }

                    debugLog('서명(HEX, 앞부분): ' + sigHex.slice(0, 64) + '...', false);
                    const isValid = sig.verify(sigHex);
                    debugLog("9. 서명 검증 결과: " + isValid, false);

                    if (isValid) {
                        avatarImage.src = 'images/avatar-happy.png';
                        avatarMessage.textContent = "🎉 검증 성공! '찐큐'입니다! (대충 행복)";
                        
                        // QR 데이터 내용도 표시
                        try {
                            const prettyData = JSON.stringify(qrData.data, null, 2);
                            debugLog("QR 데이터 내용:", false);
                            debugLog(prettyData, false);
                        } catch (e) {
                            debugLog("데이터 출력 중 오류", true);
                        }
                    } else {
                        avatarImage.src = 'images/avatar-angry.png';
                        avatarMessage.textContent = "🚨 위조 감지! '짭큐'입니다! (대충 화남)";
                    }
                } catch (signError) {
                    debugLog("서명 검증 중 오류 발생", true);
                    debugLog(signError.toString(), true);
                    throw signError;
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
                    fps: 15,  // FPS 낮춤
                    qrbox: { width: qrboxSize, height: qrboxSize },
                    rememberLastUsedCamera: true,
                    videoConstraints: rearCamera ? {
                        deviceId: rearCamera.deviceId,
                        facingMode: "environment",
                        width: { min: 1280, ideal: 3840, max: 4096 },  // UHD(4K) 해상도
                        height: { min: 1280, ideal: 3840, max: 4096 },
                        aspectRatio: 1
                    } : {
                        facingMode: "environment",
                        width: { min: 1280, ideal: 3840, max: 4096 },
                        height: { min: 1280, ideal: 3840, max: 4096 },
                        aspectRatio: 1
                    },
                    showTorchButtonIfSupported: true,
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