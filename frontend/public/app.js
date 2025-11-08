// DOM 요소 미리 찾아두기
const avatarImage = document.getElementById('avatar-image');
const gaugeLevel = document.getElementById('gauge-level');
const gaugeText = document.getElementById('gauge-text');
const message = document.getElementById('message');
const choiceContainer = document.getElementById('choice-container');
const resultContainer = document.getElementById('result-container');

// 1. 페이지 로드 후 '객관식' 보여주기 (기존과 동일)
window.onload = () => {
    setTimeout(() => {
        message.textContent = "제가 '객관식' 사지선다로 바꿔드릴게요.";
        setTimeout(() => {
            message.textContent = "이 '객관식' 문제 정도는 풀 수 있죠? '대충' 하나만 찍으세요.";
            choiceContainer.classList.remove('hidden');
        }, 1000);
    }, 1000);
};

// 2. '객관식' 버튼 클릭 이벤트 처리 (✨ 업그레이드된 부분)
const choiceButtons = document.querySelectorAll('.choice-btn');

choiceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // 내가 클릭한 버튼의 텍스트 가져오기 (예: "☕ 커피 (조용히)")
        const choiceText = e.target.textContent; 

        // 1. 선택지 숨기기
        choiceContainer.classList.add('hidden');
        
        // 2. '병맛' 아바타/게이지 상태 변경
        updateAvatarState('safe');
        
        // 3. 선택한 옵션에 따라 다른 결과 보여주기 (핵심!)
        showRecommendation(choiceText);
        
        // 4. 최종 결과 컨테이너 표시
        resultContainer.classList.remove('hidden');
    });
});

// 3. 선택에 따라 다른 추천과 메시지를 보여주는 함수 (✨ 신규)
function showRecommendation(choice) {
    const recommendationCard = resultContainer.querySelector('.recommendation-card');
    
    // (시연용 하드코딩) 어떤 버튼을 눌렀는지에 따라 내용 변경
    if (choice.includes('커피')) {
        message.textContent = "휴... 카페인 수혈은 '노동'이 아니죠. 합격!";
        recommendationCard.innerHTML = `
            <h4>대충 로스터리</h4>
            <p>지금 가면 멍때리기 좋음 (150m)</p>
        `;
    } else if (choice.includes('소품샵')) {
        message.textContent = "돈 쓰는 '노동'은 언제나 환영입니다. 가시죠.";
        recommendationCard.innerHTML = `
            <h4>귀찮아도 귀여워</h4>
            <p>당신의 '귀차니즘'을 채워줄 굿즈 (200m)</p>
        `;
    } else if (choice.includes('공원')) {
        message.textContent = "'멍때리기'라니... '대충'의 달인이시군요.";
        recommendationCard.innerHTML = `
            <h4>대충 공원 벤치 3번</h4>
            <p>아무 생각 하지 않기 딱 좋은 곳 (100m)</p>
        `;
    }
}

// 4. 아바타/게이지 상태 변경 함수 (기존과 동일)
function updateAvatarState(state) {
    if (state === 'safe') {
        // (가정) avatarImage.src = 'images/avatar-safe.png'; 
        gaugeLevel.style.width = '25%';
        gaugeLevel.style.backgroundColor = '#4CAF50';
        gaugeText.textContent = '귀차니즘: 25% (안전)';
        gaugeText.style.color = '#4CAF50';
    }
}