// NEIS API 설정
const API_CONFIG = {
    // NEIS API 기본 설정
    BASE_URL: 'https://open.neis.go.kr/hub/mealServiceDietInfo',
    
    // 인증키 - 실제 사용시에는 공공데이터포털에서 발급받은 키로 교체하세요
    // 발급 방법: https://www.data.go.kr/ 에서 '학교급식' 검색 후 신청
    API_KEY: 'sample', // 기본 샘플 키 (5건 제한)
    
    // API 기본 파라미터
    DEFAULT_PARAMS: {
        Type: 'json',
        pIndex: 1,
        pSize: 100
    },
    
    // 시도교육청코드 매핑 (주요 지역)
    EDUCATION_OFFICE_CODES: {
        '서울': 'B10',
        '부산': 'C10',
        '대구': 'D10',
        '인천': 'E10',
        '광주': 'F10',
        '대전': 'G10',
        '울산': 'H10',
        '세종': 'I10',
        '경기': 'J10',
        '강원': 'K10',
        '충북': 'M10',
        '충남': 'N10',
        '전북': 'P10',
        '전남': 'Q10',
        '경북': 'R10',
        '경남': 'S10',
        '제주': 'T10'
    },
    
    // 식사코드 매핑
    MEAL_CODES: {
        '조식': '1',
        '중식': '2',
        '석식': '3'
    }
};

// API 키 설정 함수 (외부에서 호출 가능)
function setApiKey(key) {
    API_CONFIG.API_KEY = key;
}

// 설정을 외부에서 사용할 수 있도록 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, setApiKey };
}
