// 교원 평가 점수 규칙 (Rubric)
// 점수를 변경하려면 이 파일의 값만 수정하면 됩니다.

const RUBRIC = {
  // ① 학습지도 (최대 30점)
  teaching: {
    maxScore: 30,
    
    // 1) 수업시수 (최대 25점)
    hours: {
      maxScore: 25,
      bands: {
        '18+': 25,
        '17': 24,
        '16': 23,
        '15': 22,
        '14-': 21
      },
      penalty: {
        '2to6months': -0.5  // 2개월 이상 6개월 미만 감점
      }
    },
    
    // 2) 다과목 지도 (최대 4점 + 한학기 가산)
    multiSubject: {
      maxScore: 4.0,
      // 1년 지도 과목수 기준 점수 매핑
      yearLongMapping: {
        0: 0.0,
        1: 3.0,
        2: 3.5,
        3: 4.0  // 3개 이상도 4.0
      },
      // 한학기 가산
      oneSemesterBonus: 0.2,
      bonusMax: 4.0  // 가산 적용 후 최대값
    },
    
    // 3) 수업공개 (가산, 최대 1점)
    classOpen: {
      maxScore: 1.0,
      pointPerSession: 0.5
    }
  },
  
  // ② 생활지도 (최대 30점)
  life: {
    maxScore: 30,
    baseScore: 27,
    morning: {
      full: 1.5,      // 등교지도 전체
      half: 0.75      // 한학기만
    },
    night: {
      full: 1.5,      // 야간자율학습 전체
      half: 0.75      // 한학기만
    }
  },
  
  // ③ 전문성개발 (최대 10점)
  development: {
    maxScore: 10,
    
    // 1) 연수시간
    training: {
      '45+': 6.5,
      '30-45': 5.5,
      '30-': 4.5
    },
    
    // 2) 가산
    bonus: {
      leader: 2.0,     // 연구대회/교과연구/다락방 팀장
      member: 0.5      // 다락방 팀원
    },
    
    // 3) 포상
    award: {
      0: 0,
      1: 1.0,
      '2+': 1.5
    }
  },
  
  // ④ 담당업무 (최대 30점)
  duty: {
    maxScore: 30,
    
    // 1) 근무개월수
    workMonths: {
      '12': 2.0,
      '12-': 1.0
    },
    
    // 2) 담임
    homeroom: {
      '12': 24,
      '6-12': 22,
      '2-6': 20
    },
    
    // 3) 비담임
    nonHomeroom: {
      // (부장/정년) 트랙
      seniorTrack: {
        '12': 24,      // 12개월 부장
        '6-12': 23,    // 6~12미만 보직
        '2-6': 22      // 2~6미만 보직/정년
      },
      // (기획/계원/진로/보건/명퇴) 트랙
      generalTrack: {
        '12': 23,      // 12개월 보직
        '6-12': 21,    // 6~12미만 업무
        '2-6': 19      // 2~6미만 업무/명퇴
      }
    },
    
    // 4) 곤란/이중업무 가산
    difficult: {
      'none': 0,
      'level1': 0.5,   // 방송/교과부장/담당+추가행정
      'level2': 1.0    // 교무부장/학년부장+담임/교무기획
    },
    
    // 5) 동아리
    club: {
      regular: {
        full: 2.0,     // 정규 동아리 12개월
        half: 1.0      // 정규 동아리 한학기만
      },
      autonomous: 0.5, // 자율 동아리 12개월
      none: 0
    },
    
    // 6) 상조회
    mutual: {
      'none': 0,
      '6+': 1.0,       // 6개월 이상
      '6-': 0.5        // 6개월 미만
    }
  }
};

// 전역에서 접근 가능하도록 export (ES5 방식)
if (typeof window !== 'undefined') {
  window.RUBRIC = RUBRIC;
}

