// 게임 상태 관리
class ClickSpeedGame {
    constructor() {
        this.isGameActive = false;
        this.clickCount = 0;
        this.timeLeft = 0;
        this.gameDuration = 10;
        this.timer = null;
        this.startTime = 0;
        
        // DOM 요소들
        this.elements = {
            startBtn: document.getElementById('startBtn'),
            timeSelect: document.getElementById('timeSelect'),
            gameArea: document.getElementById('gameArea'),
            resultArea: document.getElementById('resultArea'),
            clickZone: document.getElementById('clickZone'),
            timer: document.getElementById('timer'),
            clickCount: document.getElementById('clickCount'),
            cps: document.getElementById('cps'),
            finalClicks: document.getElementById('finalClicks'),
            finalCps: document.getElementById('finalCps'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            rankingList: document.getElementById('rankingList'),
            clearRankingBtn: document.getElementById('clearRankingBtn')
        };
        
        this.initializeEventListeners();
        this.loadRanking();
    }
    
    // 이벤트 리스너 초기화
    initializeEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.clickZone.addEventListener('click', () => this.handleClick());
        this.elements.playAgainBtn.addEventListener('click', () => this.resetGame());
        this.elements.clearRankingBtn.addEventListener('click', () => this.clearRanking());
        this.elements.timeSelect.addEventListener('change', (e) => {
            this.gameDuration = parseInt(e.target.value);
        });
        
        // 키보드 이벤트 (스페이스바로 클릭)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isGameActive) {
                e.preventDefault();
                this.handleClick();
            }
        });
    }
    
    // 게임 시작
    startGame() {
        if (this.isGameActive) return;
        
        this.isGameActive = true;
        this.clickCount = 0;
        this.timeLeft = this.gameDuration;
        this.startTime = Date.now();
        
        // UI 업데이트
        this.elements.startBtn.textContent = '게임 중...';
        this.elements.startBtn.disabled = true;
        this.elements.gameArea.classList.add('game-active');
        this.elements.resultArea.style.display = 'none';
        
        this.updateDisplay();
        this.startTimer();
    }
    
    // 타이머 시작
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            // 경고 상태 (마지막 3초)
            if (this.timeLeft <= 3) {
                this.elements.timer.classList.add('warning');
            }
            
            // 게임 종료
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    // 클릭 처리
    handleClick() {
        if (!this.isGameActive) return;
        
        this.clickCount++;
        this.updateDisplay();
        
        // 클릭 애니메이션
        this.elements.clickZone.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.elements.clickZone.style.transform = 'scale(1)';
        }, 100);
    }
    
    // 화면 업데이트
    updateDisplay() {
        this.elements.timer.textContent = this.timeLeft;
        this.elements.clickCount.textContent = this.clickCount;
        
        // CPS 계산 (초당 클릭 수)
        const elapsedTime = (this.gameDuration - this.timeLeft) || 1;
        const currentCps = (this.clickCount / elapsedTime).toFixed(1);
        this.elements.cps.textContent = currentCps;
    }
    
    // 게임 종료
    endGame() {
        this.isGameActive = false;
        clearInterval(this.timer);
        
        const finalCps = (this.clickCount / this.gameDuration).toFixed(1);
        const gameResult = {
            clicks: this.clickCount,
            cps: parseFloat(finalCps),
            date: new Date().toLocaleDateString('ko-KR'),
            time: new Date().toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
        
        // 결과 표시
        this.elements.finalClicks.textContent = this.clickCount;
        this.elements.finalCps.textContent = finalCps;
        this.elements.resultArea.style.display = 'block';
        
        // 랭킹 업데이트
        this.updateRanking(gameResult);
        
        // UI 리셋
        this.elements.startBtn.textContent = '게임 시작';
        this.elements.startBtn.disabled = false;
        this.elements.gameArea.classList.remove('game-active');
        this.elements.timer.classList.remove('warning');
    }
    
    // 게임 리셋
    resetGame() {
        this.elements.resultArea.style.display = 'none';
        this.elements.gameArea.classList.remove('game-active');
        this.elements.timer.classList.remove('warning');
        this.updateDisplay();
    }
    
    // 랭킹 업데이트
    updateRanking(gameResult) {
        let ranking = this.getRanking();
        ranking.push(gameResult);
        
        // 클릭 수 기준으로 정렬 (내림차순)
        ranking.sort((a, b) => b.clicks - a.clicks);
        
        // 상위 10개만 유지
        ranking = ranking.slice(0, 10);
        
        // 로컬 스토리지에 저장
        localStorage.setItem('clickSpeedRanking', JSON.stringify(ranking));
        
        // 화면 업데이트
        this.displayRanking(ranking);
        
        // 새 기록인지 확인
        const isNewRecord = ranking[0].clicks === gameResult.clicks && 
                           ranking[0].date === gameResult.date;
        
        if (isNewRecord) {
            this.showNewRecordMessage();
        }
    }
    
    // 랭킹 표시
    displayRanking(ranking) {
        if (ranking.length === 0) {
            this.elements.rankingList.innerHTML = '<div class="no-records">아직 기록이 없습니다.</div>';
            return;
        }
        
        this.elements.rankingList.innerHTML = ranking.map((record, index) => {
            const isNewRecord = index === 0 && 
                               record.date === new Date().toLocaleDateString('ko-KR');
            
            return `
                <div class="ranking-item ${isNewRecord ? 'new-record' : ''}">
                    <div class="rank-number">#${index + 1}</div>
                    <div class="rank-info">
                        <div class="rank-clicks">${record.clicks}회</div>
                        <div class="rank-cps">CPS: ${record.cps}</div>
                        <div class="rank-date">${record.date} ${record.time}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 로컬 스토리지에서 랭킹 로드
    loadRanking() {
        const ranking = this.getRanking();
        this.displayRanking(ranking);
    }
    
    // 랭킹 데이터 가져오기
    getRanking() {
        const stored = localStorage.getItem('clickSpeedRanking');
        return stored ? JSON.parse(stored) : [];
    }
    
    // 랭킹 초기화
    clearRanking() {
        if (confirm('모든 기록을 삭제하시겠습니까?')) {
            localStorage.removeItem('clickSpeedRanking');
            this.displayRanking([]);
        }
    }
    
    // 새 기록 메시지 표시
    showNewRecordMessage() {
        const message = document.createElement('div');
        message.textContent = '🎉 새로운 최고 기록!';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #28a745, #20c997);
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 1.5rem;
            font-weight: bold;
            z-index: 1000;
            animation: newRecordAnimation 2s ease;
        `;
        
        // CSS 애니메이션 추가
        const style = document.createElement('style');
        style.textContent = `
            @keyframes newRecordAnimation {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
            document.head.removeChild(style);
        }, 2000);
    }
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    new ClickSpeedGame();
});

// 페이지 로드 시 환영 메시지
window.addEventListener('load', () => {
    console.log('🚀 클릭 속도 테스트 게임이 로드되었습니다!');
    console.log('💡 팁: 스페이스바를 눌러서도 클릭할 수 있습니다.');
});
