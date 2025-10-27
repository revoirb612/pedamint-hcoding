// 게임 상태 관리
class ClickSpeedGame {
    constructor() {
        this.isGameActive = false;
        this.clickCount = 0;
        this.timeLeft = 0;
        this.gameDuration = 10;
        this.timer = null;
        this.startTime = 0;
        this.currentSchoolCode = null;
        this.currentSchoolName = null;
        this.currentUsername = null;
        
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
            clearRankingBtn: document.getElementById('clearRankingBtn'),
        // 급식 관련 요소들
        apiKey: document.getElementById('apiKey'),
        setApiKeyBtn: document.getElementById('setApiKeyBtn'),
        regionSelect: document.getElementById('regionSelect'),
        schoolCode: document.getElementById('schoolCode'),
        fetchMealBtn: document.getElementById('fetchMealBtn'),
        schoolInfo: document.getElementById('schoolInfo'),
            schoolName: document.getElementById('schoolName'),
            changeSchoolBtn: document.getElementById('changeSchoolBtn'),
            mealDisplay: document.getElementById('mealDisplay'),
            // 랭킹 관련 요소들
            username: document.getElementById('username'),
            setUsernameBtn: document.getElementById('setUsernameBtn'),
            usernameInfo: document.getElementById('usernameInfo'),
            currentUsername: document.getElementById('currentUsername'),
            changeUsernameBtn: document.getElementById('changeUsernameBtn'),
            onlineRankingList: document.getElementById('onlineRankingList'),
            refreshOnlineRankingBtn: document.getElementById('refreshOnlineRankingBtn')
        };
        
        this.initializeEventListeners();
        this.loadRanking();
        this.loadSchoolData();
        this.loadUsername();
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
        
        // 급식 관련 이벤트
        this.elements.setApiKeyBtn.addEventListener('click', () => this.setApiKey());
        this.elements.fetchMealBtn.addEventListener('click', () => this.fetchMealData());
        this.elements.changeSchoolBtn.addEventListener('click', () => this.changeSchool());
        this.elements.schoolCode.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.fetchMealData();
            }
        });
        this.elements.apiKey.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setApiKey();
            }
        });
        
        // 랭킹 관련 이벤트
        this.elements.setUsernameBtn.addEventListener('click', () => this.setUsername());
        this.elements.changeUsernameBtn.addEventListener('click', () => this.changeUsername());
        this.elements.username.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setUsername();
            }
        });
        this.elements.refreshOnlineRankingBtn.addEventListener('click', () => this.loadOnlineRanking());
        
        // 탭 전환 이벤트
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
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
        
        // 온라인 랭킹 제출
        this.submitOnlineRanking(this.clickCount);
        
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
    
    // 학교 데이터 로드
    loadSchoolData() {
        const savedApiKey = localStorage.getItem('neisApiKey');
        const savedSchoolCode = localStorage.getItem('savedSchoolCode');
        const savedSchoolName = localStorage.getItem('savedSchoolName');
        const savedRegion = localStorage.getItem('savedRegion');
        
        // API 키 로드
        if (savedApiKey) {
            this.elements.apiKey.value = savedApiKey;
            setApiKey(savedApiKey);
        }
        
        // 학교 정보 로드
        if (savedSchoolCode && savedSchoolName && savedRegion) {
            this.currentSchoolCode = savedSchoolCode;
            this.currentSchoolName = savedSchoolName;
            this.currentRegion = savedRegion;
            
            this.elements.regionSelect.value = savedRegion;
            this.elements.schoolCode.value = savedSchoolCode;
            this.elements.schoolName.textContent = savedSchoolName;
            this.elements.schoolInfo.style.display = 'flex';
            this.elements.regionSelect.style.display = 'none';
            this.elements.schoolCode.style.display = 'none';
            this.elements.fetchMealBtn.style.display = 'none';
            this.fetchMealData();
        }
    }
    
    // 급식 데이터 조회
    async fetchMealData() {
        const region = this.elements.regionSelect.value;
        const schoolCode = this.elements.schoolCode.value.trim();
        
        if (!region) {
            alert('지역을 선택해주세요.');
            return;
        }
        
        if (!schoolCode) {
            alert('학교 코드를 입력해주세요.');
            return;
        }
        
        // 로딩 상태 표시
        this.showLoadingState();
        
        try {
            // 날짜 범위 설정 (오늘부터 5일간)
            const today = new Date();
            const startDate = this.formatDate(today);
            const endDate = this.formatDate(new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000));
            
            let mealData;
            
            try {
                // 실제 NEIS API 호출
                const apiData = await this.fetchNeisApi(region, schoolCode, startDate, endDate);
                mealData = this.parseMealData(apiData);
                
                if (mealData.error) {
                    throw new Error(mealData.message);
                }
            } catch (apiError) {
                console.warn('API 호출 실패, 샘플 데이터 사용:', apiError);
                // API 실패 시 샘플 데이터 사용
                mealData = await this.getMockMealData(schoolCode);
            }
            
            // 학교 정보 저장
            this.currentSchoolCode = schoolCode;
            this.currentSchoolName = mealData.schoolName;
            this.currentRegion = region;
            this.saveSchoolData();
            
            // UI 업데이트
            this.updateSchoolUI();
            this.displayMealData(mealData.meals);
            
        } catch (error) {
            console.error('급식 데이터 조회 실패:', error);
            this.showErrorState(error.message || '급식 데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }
    
    // 날짜 포맷팅 (YYYYMMDD)
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
    
    // API 키 설정
    setApiKey() {
        const apiKey = this.elements.apiKey.value.trim();
        if (apiKey) {
            setApiKey(apiKey);
            localStorage.setItem('neisApiKey', apiKey);
            alert('API 키가 설정되었습니다!');
        } else {
            alert('API 키를 입력해주세요.');
        }
    }
    
    // 실제 NEIS API 호출
    async fetchNeisApi(region, schoolCode, startDate, endDate) {
        const educationOfficeCode = API_CONFIG.EDUCATION_OFFICE_CODES[region];
        if (!educationOfficeCode) {
            throw new Error('지역을 선택해주세요.');
        }
        
        if (!schoolCode || schoolCode.length < 7) {
            throw new Error('올바른 학교 코드를 입력해주세요. (7자리 이상)');
        }
        
        const params = new URLSearchParams({
            KEY: API_CONFIG.API_KEY,
            Type: API_CONFIG.DEFAULT_PARAMS.Type,
            pIndex: API_CONFIG.DEFAULT_PARAMS.pIndex,
            pSize: API_CONFIG.DEFAULT_PARAMS.pSize,
            ATPT_OFCDC_SC_CODE: educationOfficeCode,
            SD_SCHUL_CODE: schoolCode,
            MLSV_FROM_YMD: startDate,
            MLSV_TO_YMD: endDate
        });
        
        const url = `${API_CONFIG.BASE_URL}?${params}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.RESULT && data.RESULT.CODE !== 'INFO-000') {
                throw new Error(data.RESULT.MESSAGE || 'API 호출 중 오류가 발생했습니다.');
            }
            
            return data;
        } catch (error) {
            console.error('API 호출 실패:', error);
            throw error;
        }
    }
    
    // API 응답 데이터 파싱
    parseMealData(apiData) {
        if (!apiData.mealServiceDietInfo || !apiData.mealServiceDietInfo[1] || !apiData.mealServiceDietInfo[1].row) {
            return {
                error: true,
                message: '급식 정보를 찾을 수 없습니다. 학교 코드와 지역을 확인해주세요.'
            };
        }
        
        const mealRows = apiData.mealServiceDietInfo[1].row;
        const schoolName = mealRows[0]?.SCHUL_NM || '알 수 없는 학교';
        
        // 날짜별로 그룹화
        const mealsByDate = {};
        
        mealRows.forEach(row => {
            const date = row.MLSV_YMD;
            const mealType = row.MMEAL_SC_NM;
            const dishes = row.DDISH_NM.split('<br/>').filter(dish => dish.trim());
            
            if (!mealsByDate[date]) {
                mealsByDate[date] = {};
            }
            
            mealsByDate[date][mealType] = dishes;
        });
        
        // 날짜별 메뉴 배열로 변환
        const meals = Object.keys(mealsByDate)
            .sort()
            .map(date => {
                const dateObj = new Date(
                    date.substring(0, 4),
                    date.substring(4, 6) - 1,
                    date.substring(6, 8)
                );
                
                const formattedDate = dateObj.toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                });
                
                const dailyMeals = Object.keys(mealsByDate[date]).map(mealType => ({
                    type: mealType,
                    dishes: mealsByDate[date][mealType]
                }));
                
                return {
                    date: formattedDate,
                    meals: dailyMeals
                };
            });
        
        return {
            schoolName: schoolName,
            meals: meals
        };
    }
    
    // 모의 급식 데이터 생성 (API 실패 시 백업)
    async getMockMealData(schoolCode) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const today = new Date();
                const meals = [];
                
                for (let i = 0; i < 5; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    
                    const mealTypes = ['조식', '중식', '석식'];
                    const menuItems = [
                        ['김치찌개', '불고기', '밥', '국'],
                        ['된장찌개', '제육볶음', '밥', '국'],
                        ['순두부찌개', '닭볶음탕', '밥', '국'],
                        ['부대찌개', '돈까스', '밥', '국'],
                        ['해물탕', '치킨', '밥', '국']
                    ];
                    
                    const dailyMeals = mealTypes.map(type => ({
                        type: type,
                        dishes: menuItems[i % menuItems.length]
                    }));
                    
                    meals.push({
                        date: date.toLocaleDateString('ko-KR', { 
                            month: 'long', 
                            day: 'numeric', 
                            weekday: 'long' 
                        }),
                        meals: dailyMeals
                    });
                }
                
                resolve({
                    schoolName: `학교 ${schoolCode.slice(-4)} (샘플 데이터)`,
                    meals: meals
                });
            }, 1000);
        });
    }
    
    // 로딩 상태 표시
    showLoadingState() {
        this.elements.mealDisplay.innerHTML = `
            <div class="meal-loading">
                <div class="loading-spinner"></div>
                급식 메뉴를 불러오는 중...
            </div>
        `;
        this.elements.fetchMealBtn.disabled = true;
    }
    
    // 에러 상태 표시
    showErrorState(message) {
        this.elements.mealDisplay.innerHTML = `
            <div class="meal-error">
                ${message}
            </div>
        `;
        this.elements.fetchMealBtn.disabled = false;
    }
    
    // 급식 데이터 표시
    displayMealData(meals) {
        const mealHtml = meals.map(day => `
            <div class="meal-data">
                <div class="meal-date">${day.date}</div>
                <div class="meal-menu">
                    ${day.meals.map(meal => `
                        <div class="meal-item">
                            <div class="meal-type">${meal.type}</div>
                            <div class="meal-dishes">${meal.dishes.join(', ')}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        this.elements.mealDisplay.innerHTML = mealHtml;
        this.elements.fetchMealBtn.disabled = false;
    }
    
    // 학교 UI 업데이트
    updateSchoolUI() {
        this.elements.schoolName.textContent = this.currentSchoolName;
        this.elements.schoolInfo.style.display = 'flex';
        this.elements.regionSelect.style.display = 'none';
        this.elements.schoolCode.style.display = 'none';
        this.elements.fetchMealBtn.style.display = 'none';
    }
    
    // 학교 변경
    changeSchool() {
        this.elements.schoolInfo.style.display = 'none';
        this.elements.regionSelect.style.display = 'block';
        this.elements.schoolCode.style.display = 'block';
        this.elements.fetchMealBtn.style.display = 'inline-block';
        this.elements.regionSelect.value = '';
        this.elements.schoolCode.value = '';
        this.elements.mealDisplay.innerHTML = '<div class="no-meal-data">지역과 학교 코드를 입력하고 급식 메뉴를 조회해보세요!</div>';
        
        // 저장된 데이터 삭제
        localStorage.removeItem('savedSchoolCode');
        localStorage.removeItem('savedSchoolName');
        localStorage.removeItem('savedRegion');
        this.currentSchoolCode = null;
        this.currentSchoolName = null;
        this.currentRegion = null;
    }
    
    // 학교 데이터 저장
    saveSchoolData() {
        localStorage.setItem('savedSchoolCode', this.currentSchoolCode);
        localStorage.setItem('savedSchoolName', this.currentSchoolName);
        localStorage.setItem('savedRegion', this.currentRegion);
    }
    
    // 사용자명 설정
    setUsername() {
        const username = this.elements.username.value.trim();
        if (username) {
            this.currentUsername = username;
            localStorage.setItem('username', username);
            this.updateUsernameUI();
            alert('사용자명이 설정되었습니다!');
        } else {
            alert('사용자명을 입력해주세요.');
        }
    }
    
    // 사용자명 변경
    changeUsername() {
        this.elements.usernameInfo.style.display = 'none';
        this.elements.username.style.display = 'block';
        this.elements.setUsernameBtn.style.display = 'inline-block';
        this.elements.username.value = '';
    }
    
    // 사용자명 UI 업데이트
    updateUsernameUI() {
        this.elements.currentUsername.textContent = this.currentUsername;
        this.elements.usernameInfo.style.display = 'flex';
        this.elements.username.style.display = 'none';
        this.elements.setUsernameBtn.style.display = 'none';
    }
    
    // 사용자명 로드
    loadUsername() {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            this.currentUsername = savedUsername;
            this.elements.username.value = savedUsername;
            this.updateUsernameUI();
        }
    }
    
    // 탭 전환
    switchTab(tabName) {
        // 탭 버튼 활성화 상태 변경
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // 콘텐츠 표시/숨김
        document.getElementById('localRanking').style.display = tabName === 'local' ? 'block' : 'none';
        document.getElementById('onlineRanking').style.display = tabName === 'online' ? 'block' : 'none';
        
        // 온라인 랭킹 탭 선택 시 자동 로드
        if (tabName === 'online') {
            this.loadOnlineRanking();
        }
    }
    
    // 온라인 랭킹 제출
    async submitOnlineRanking(score) {
        if (!this.currentUsername) {
            alert('온라인 랭킹 제출을 위해 사용자명을 먼저 설정해주세요.');
            return;
        }
        
        try {
            const response = await fetch(`${API_CONFIG.RANK_API.BASE_URL}${API_CONFIG.RANK_API.ENDPOINTS.SUBMIT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    program_key: API_CONFIG.RANK_API.PROGRAM_KEY,
                    score: score,
                    username: this.currentUsername
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log('온라인 랭킹 제출 성공:', result);
                // 온라인 랭킹 새로고침
                this.loadOnlineRanking();
            } else {
                console.error('온라인 랭킹 제출 실패:', result);
            }
        } catch (error) {
            console.error('온라인 랭킹 제출 중 오류:', error);
        }
    }
    
    // 온라인 랭킹 조회
    async loadOnlineRanking() {
        this.elements.onlineRankingList.innerHTML = '<div class="no-records">온라인 랭킹을 불러오는 중...</div>';
        
        try {
            const response = await fetch(`${API_CONFIG.RANK_API.BASE_URL}${API_CONFIG.RANK_API.ENDPOINTS.GET_RANKS}/${API_CONFIG.RANK_API.PROGRAM_KEY}`);
            const data = await response.json();
            
            if (response.ok && Array.isArray(data)) {
                this.displayOnlineRanking(data);
            } else {
                this.elements.onlineRankingList.innerHTML = '<div class="no-records">온라인 랭킹을 불러올 수 없습니다.</div>';
            }
        } catch (error) {
            console.error('온라인 랭킹 조회 실패:', error);
            this.elements.onlineRankingList.innerHTML = '<div class="no-records">온라인 랭킹을 불러올 수 없습니다.</div>';
        }
    }
    
    // 온라인 랭킹 표시
    displayOnlineRanking(rankings) {
        if (rankings.length === 0) {
            this.elements.onlineRankingList.innerHTML = '<div class="no-records">아직 온라인 기록이 없습니다.</div>';
            return;
        }
        
        this.elements.onlineRankingList.innerHTML = rankings.map((record, index) => {
            const date = new Date(record.timestamp);
            const formattedDate = date.toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div class="ranking-item">
                    <div class="rank-number">#${index + 1}</div>
                    <div class="rank-info">
                        <div class="rank-clicks">${record.username}</div>
                        <div class="rank-cps">${record.score}회 클릭</div>
                        <div class="rank-date">${formattedDate}</div>
                    </div>
                </div>
            `;
        }).join('');
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
