😫 대충가이드 (Daechung Guide)
"계획은 '대충', 여행은 '대충(대전/충청)'!"

2025 보안성 해커톤 출품작

1. 🎯 프로젝트 소개
'대충가이드'는 계획이 망가져 '어디 갈지 모르는' 즉흥 여행객을 위한 '병맛' 컨셉의 관광 추천 앱입니다.

타겟 문제: 대전/충청 여행 중 맛집 웨이팅, 교통 문제 등으로 시간이 붕 뜰 때, "어디 가지?"라고 검색하는 '주관식' 문제의 피로감과 귀찮음.

핵심 솔루션: 사용자의 '검색 노동'을 **'객관식 선택'**으로 바꿔줍니다.

'병맛' UX: '귀차니즘' 아바타가 등장해 사용자의 귀찮은 마음에 공감하고, "검색은 '대충' 저에게 맡기세요"라며 대안을 제시합니다.

2. 🔐 핵심 보안 기능 (보안성 40%)
이 앱은 단순한 관광 추천을 넘어, 'QR코드 위조(QRLjacking)' 문제를 해결하는 '투-트랙(Two-Track) 보안 QR' 전략을 핵심으로 합니다.

1) 트랙 1: 범용 QR (웹 / https://)
기능: 정보 제공 (관광지 추천)

동작: 버스 정류장, 관광지 입구의 QR을 스캔하면 Vercel로 배포된 https:// 보안 웹페이지(index.html, map.html 등)로 연결됩니다.

2) 트랙 2: 보안 QR (앱 / https:// + Camera)
기능: 쿠폰, 스탬프 등 '가치'가 있는 기능 제공.

동작: https:// 주소에서 휴대폰 카메라(html5-qrcode) 접근 권한을 받아, **'찐큐/짭큐 감별기'**가 작동합니다.

핵심 기술: 비대칭 키 서명 (Asymmetric Key Cryptography)

찐큐 (서명된 QR): 백엔드 서버가 **'비공개 키'**로 서명한 QR.

짭큐 (위조된 QR): 해커가 만든 일반 QR.

검증: 앱(프론트엔드)은 내장된 '공개 키'(jsrsasign 라이브러리 사용)로 스캔된 QR의 서명을 검증, '찐큐'일 때만 쿠폰을 발급하고 '짭큐'는 즉시 차단합니다.

3. ✨ 주요 기능 (4개의 탭)
🏠 홈 (index.html)

QR 스캔 시 처음 만나는 '병맛' 공감 페이지.

귀찮아하는 아바타가 "어디 가지..."라며 사용자의 마음에 공감합니다.

📍 지금 여기 대전 (map.html)

'주관식' 검색 대신, QR 위치 기반으로 카카오 지도 API에 주변 스팟(A, B, C)을 '객관식'으로 보여줍니다.

🔑 키워드 추천 (keyword.html)

누구와?, 뭘?, 성향? ('힘들어, 쉬고싶어...' 등) 키워드를 '대충' 선택하면 장소를 추천해 줍니다.

📷 QR 찍기 (scanner.html)

'보안성' 핵심 기능. https 환경에서 실제 카메라를 실행합니다.

html5-qrcode로 QR을 스캔하고 jsrsasign로 '찐/짭' 여부를 실시간으로 감별합니다.

4. 🛠️ 기술 스택
Frontend: HTML, CSS, JavaScript (ES6+)

API & Libraries:

Kakao Maps API (지도)

html5-qrcode (QR 스캐너)

jsrsasign (보안 QR 서명 검증)

Deployment: Vercel (https:// 자동 발급)

Local Server: Python http.server (테스트용)

5. 🚀 실행 방법
카카오 API 키 발급

카카오 개발자사이트에서 앱 생성

플랫폼 ▷ Web 플랫폼 등록 ▷ http://localhost:8080 (또는 Vercel 주소) 등록

**'JavaScript 키'**를 복사하여 map.html의 appkey= 부분에 붙여넣기

로컬 서버로 실행

Bash

# /frontend/public 폴더로 이동
cd daechung-guide/frontend/public

# 8080 포트로 '대충' 서버 실행
python -m http.server 8080

# 브라우저에서 http://localhost:8080 접속
Vercel 배포 (권장)

본인의 Vercel 계정에 이 깃허브 저장소를 연결합니다.

Root Directory를 frontend/public으로 설정하고 배포합니다.

발급된 https:// 주소로 접속하면 **'QR 찍기'**의 실제 카메라 기능을 테스트할 수 있습니다