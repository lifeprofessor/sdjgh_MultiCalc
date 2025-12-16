// 교원 평가 점수 계산기 - 메인 로직

// ========== 전역 상태 ==========
let state = {
  teaching: {
    hoursBand: '18+',
    hoursPenalty: false,
    hoursDifferent: false,
    multiSubject: {
      sem1: [],  // {name, detailLength, hasExam} - detailLength: '500', '250', or ''
      sem2: []
    },
    classOpen: 0
  },
  life: {
    morning: 'none',  // none, full, half
    night: 'none'     // none, full, half
  },
  dev: {
    training: '45+',  // 45+, 30-45, 30-
    leader: false,
    member: false,
    award: '0'        // 0, 1, 2+
  },
  duty: {
    workMonths: '12',  // 12, 12-
    dutyType: 'homeroom',  // homeroom, nonHomeroom
    homeroomPeriod: '12',  // 12, 6-12, 2-6
    nonHomeroomTrack: 'senior',  // senior, general
    seniorPeriod: '12',    // 12, 6-12, 2-6
    generalPeriod: '12',   // 12, 6-12, 2-6
    difficult: 'none',     // none, level1, level2
    club: 'none',          // none, regular, regularHalf, autonomous
    mutual: 'none'         // none, 6+, 6-
  }
};

// ========== 유틸리티 함수 ==========

/**
 * 과목명 정규화
 * - 앞뒤 공백 제거
 * - 연속 공백을 1칸으로
 * - 영문은 소문자 처리
 */
function normalizeSubjectName(name) {
  if (!name) return '';
  
  // 앞뒤 공백 제거, 연속 공백을 1칸으로
  let normalized = name.trim().replace(/\s+/g, ' ');
  
  // 영문은 소문자로 변환 (한글은 그대로)
  normalized = normalized.replace(/[a-zA-Z]+/g, function(match) {
    return match.toLowerCase();
  });
  
  return normalized;
}

// ========== 계산 함수 ==========

/**
 * 다과목 지도 계산
 */
function computeMultiSubject(multiSubjectData) {
  const result = {
    score: 0,
    breakdown: [],
    warnings: [],
    details: {
      sem1Subjects: [],
      sem2Subjects: [],
      sem1Count: 0,
      sem2Count: 0
    }
  };

  // 1학기 유효 과목 추출 (과목명이 있는 것만)
  const sem1Valid = [];
  for (const subject of multiSubjectData.sem1) {
    const normalized = normalizeSubjectName(subject.name);
    if (normalized) {
      sem1Valid.push({
        name: normalized,
        detailLength: subject.detailLength || '',
        hasExam: subject.hasExam || false
      });
    }
  }

  // 2학기 유효 과목 추출
  const sem2Valid = [];
  for (const subject of multiSubjectData.sem2) {
    const normalized = normalizeSubjectName(subject.name);
    if (normalized) {
      sem2Valid.push({
        name: normalized,
        detailLength: subject.detailLength || '',
        hasExam: subject.hasExam || false
      });
    }
  }

  result.details.sem1Subjects = sem1Valid.map(s => s.name);
  result.details.sem2Subjects = sem2Valid.map(s => s.name);
  result.details.sem1Count = sem1Valid.length;
  result.details.sem2Count = sem2Valid.length;

  // 학기별 점수 계산
  let totalScore = 0;

  // 1학기 점수 계산
  if (sem1Valid.length > 0) {
    const subjectCount = sem1Valid.length;
    let sem1Score = 1.0; // 기본점수 1점 (과목이 1개라도 있으면)
    
    // 과목별 추가점수 계산
    // 1개: 0.4점, 2개: 0.7점, 3개: 1.0점
    // 기본 1점 + 추가점수로 계산
    let additionalScore = 0;
    if (subjectCount === 1) {
      additionalScore = 0.4;
    } else if (subjectCount === 2) {
      additionalScore = 0.7;
    } else if (subjectCount >= 3) {
      additionalScore = 1.0;
    }
    
    // 기본점수 1점 + 추가점수
    sem1Score = 1.0 + additionalScore;
    
    // 세특 및 시험 감점 계산
    let penalty = 0;
    for (const subject of sem1Valid) {
      // 세특 감점: 500자 선택시 감점 없음, 250자 선택시 -0.1점, 선택 안 하면 -0.1점
      if (subject.detailLength === '250' || subject.detailLength === '') {
        penalty += 0.1;
      }
      
      // 시험 없으면 -0.1점
      if (!subject.hasExam) {
        penalty += 0.1;
      }
    }
    
    sem1Score = Math.max(0, sem1Score - penalty);
    totalScore += sem1Score;
    
    result.breakdown.push({
      section: '학습지도',
      item: '다과목지도 (1학기)',
      selected: `${subjectCount}과목`,
      formula: `기본 1점 + 추가 ${additionalScore}점${penalty > 0 ? ` - 감점 ${penalty.toFixed(1)}점` : ''}`,
      points: sem1Score,
      note: ''
    });
  }

  // 2학기 점수 계산
  if (sem2Valid.length > 0) {
    const subjectCount = sem2Valid.length;
    let sem2Score = 1.0; // 기본점수 1점 (과목이 1개라도 있으면)
    
    // 과목별 추가점수 계산
    // 1개: 0.4점, 2개: 0.7점, 3개: 1.0점
    // 기본 1점 + 추가점수로 계산
    let additionalScore = 0;
    if (subjectCount === 1) {
      additionalScore = 0.4;
    } else if (subjectCount === 2) {
      additionalScore = 0.7;
    } else if (subjectCount >= 3) {
      additionalScore = 1.0;
    }
    
    // 기본점수 1점 + 추가점수
    sem2Score = 1.0 + additionalScore;
    
    // 세특 및 시험 감점 계산
    let penalty = 0;
    for (const subject of sem2Valid) {
      // 세특 감점: 500자 선택시 감점 없음, 250자 선택시 -0.1점, 선택 안 하면 -0.1점
      if (subject.detailLength === '250' || subject.detailLength === '') {
        penalty += 0.1;
      }
      
      // 시험 없으면 -0.1점
      if (!subject.hasExam) {
        penalty += 0.1;
      }
    }
    
    sem2Score = Math.max(0, sem2Score - penalty);
    totalScore += sem2Score;
    
    result.breakdown.push({
      section: '학습지도',
      item: '다과목지도 (2학기)',
      selected: `${subjectCount}과목`,
      formula: `기본 1점 + 추가 ${additionalScore}점${penalty > 0 ? ` - 감점 ${penalty.toFixed(1)}점` : ''}`,
      points: sem2Score,
      note: ''
    });
  }

  // 최대 4점 제한
  if (totalScore > RUBRIC.teaching.multiSubject.maxScore) {
    result.warnings.push(`다과목지도 점수가 최대값 ${RUBRIC.teaching.multiSubject.maxScore}점으로 제한되었습니다.`);
    totalScore = RUBRIC.teaching.multiSubject.maxScore;
  }

  result.score = totalScore;
  return result;
}

/**
 * 학습지도 계산
 */
function computeTeaching(state) {
  const result = {
    score: 0,
    breakdown: [],
    warnings: []
  };

  const rubric = RUBRIC.teaching;

  // 1) 수업시수
  const hoursBand = state.teaching.hoursBand;
  let hoursScore = rubric.hours.bands[hoursBand] || 0;
  
  result.breakdown.push({
    section: '학습지도',
    item: '수업시수',
    selected: hoursBand,
    formula: `${hoursScore}점`,
    points: hoursScore,
    note: ''
  });

  // 감점
  if (state.teaching.hoursPenalty) {
    const penalty = rubric.hours.penalty['2to6months'];
    hoursScore += penalty;
    result.breakdown.push({
      section: '학습지도',
      item: '수업시수 감점',
      selected: '2~6개월 미만',
      formula: `${penalty}점`,
      points: penalty,
      note: ''
    });
  }

  // 참고사항
  if (state.teaching.hoursDifferent) {
    result.breakdown.push({
      section: '학습지도',
      item: '수업시수 참고',
      selected: '1,2학기 시수 상이',
      formula: '-',
      points: 0,
      note: '참고용 (점수 미반영)'
    });
  }

  // 2) 다과목 지도
  const multiResult = computeMultiSubject(state.teaching.multiSubject);
  result.breakdown.push(...multiResult.breakdown);
  result.warnings.push(...multiResult.warnings);

  // 3) 수업공개
  const classOpenCount = state.teaching.classOpen || 0;
  const classOpenScore = Math.min(classOpenCount * rubric.classOpen.pointPerSession, rubric.classOpen.maxScore);
  
  result.breakdown.push({
    section: '학습지도',
    item: '수업공개',
    selected: `${classOpenCount}회`,
    formula: `min(${classOpenCount} × 0.5, 1.0)`,
    points: classOpenScore,
    note: ''
  });

  // 학습지도 총점
  let totalScore = hoursScore + multiResult.score + classOpenScore;
  
  // 30점 cap
  if (totalScore > rubric.maxScore) {
    result.warnings.push(`학습지도 영역 점수가 최대값 ${rubric.maxScore}점으로 제한되었습니다.`);
    totalScore = rubric.maxScore;
  }

  result.score = totalScore;
  result.multiSubjectDetails = multiResult.details;

  return result;
}

/**
 * 생활지도 계산
 */
function computeLife(state) {
  const result = {
    score: 0,
    breakdown: [],
    warnings: []
  };

  const rubric = RUBRIC.life;
  let score = rubric.baseScore;

  result.breakdown.push({
    section: '생활지도',
    item: '기본점수',
    selected: '-',
    formula: `${rubric.baseScore}점`,
    points: rubric.baseScore,
    note: ''
  });

  // 등교지도
  if (state.life.morning === 'full') {
    score += rubric.morning.full;
    result.breakdown.push({
      section: '생활지도',
      item: '등교지도',
      selected: '전체',
      formula: `+${rubric.morning.full}점`,
      points: rubric.morning.full,
      note: ''
    });
  } else if (state.life.morning === 'half') {
    score += rubric.morning.half;
    result.breakdown.push({
      section: '생활지도',
      item: '등교지도',
      selected: '한학기만',
      formula: `+${rubric.morning.half}점`,
      points: rubric.morning.half,
      note: ''
    });
  }

  // 야간자율학습
  if (state.life.night === 'full') {
    score += rubric.night.full;
    result.breakdown.push({
      section: '생활지도',
      item: '야간자율학습',
      selected: '전체',
      formula: `+${rubric.night.full}점`,
      points: rubric.night.full,
      note: ''
    });
  } else if (state.life.night === 'half') {
    score += rubric.night.half;
    result.breakdown.push({
      section: '생활지도',
      item: '야간자율학습',
      selected: '한학기만',
      formula: `+${rubric.night.half}점`,
      points: rubric.night.half,
      note: ''
    });
  }

  // 30점 cap
  if (score > rubric.maxScore) {
    result.warnings.push(`생활지도 영역 점수가 최대값 ${rubric.maxScore}점으로 제한되었습니다.`);
    score = rubric.maxScore;
  }

  result.score = score;
  return result;
}

/**
 * 전문성개발 계산
 */
function computeDev(state) {
  const result = {
    score: 0,
    breakdown: [],
    warnings: []
  };

  const rubric = RUBRIC.development;
  let score = 0;

  // 1) 연수시간
  const trainingScore = rubric.training[state.dev.training] || 0;
  score += trainingScore;
  
  result.breakdown.push({
    section: '전문성개발',
    item: '연수시간',
    selected: state.dev.training,
    formula: `${trainingScore}점`,
    points: trainingScore,
    note: ''
  });

  // 2) 가산
  if (state.dev.leader) {
    score += rubric.bonus.leader;
    result.breakdown.push({
      section: '전문성개발',
      item: '연구대회/교과연구/다락방 팀장',
      selected: '체크',
      formula: `+${rubric.bonus.leader}점`,
      points: rubric.bonus.leader,
      note: ''
    });
  }

  if (state.dev.member) {
    score += rubric.bonus.member;
    result.breakdown.push({
      section: '전문성개발',
      item: '다락방 팀원',
      selected: '체크',
      formula: `+${rubric.bonus.member}점`,
      points: rubric.bonus.member,
      note: ''
    });
  }

  // 3) 포상
  const awardScore = rubric.award[state.dev.award] || 0;
  if (awardScore > 0) {
    score += awardScore;
    result.breakdown.push({
      section: '전문성개발',
      item: '포상',
      selected: state.dev.award + '회',
      formula: `+${awardScore}점`,
      points: awardScore,
      note: ''
    });
  }

  // 10점 cap
  if (score > rubric.maxScore) {
    result.warnings.push(`전문성개발 영역 점수가 최대값 ${rubric.maxScore}점으로 제한되었습니다.`);
    score = rubric.maxScore;
  }

  result.score = score;
  return result;
}

/**
 * 담당업무 계산
 */
function computeDuty(state) {
  const result = {
    score: 0,
    breakdown: [],
    warnings: []
  };

  const rubric = RUBRIC.duty;
  let score = 0;

  // 1) 근무개월수
  const workMonthsScore = rubric.workMonths[state.duty.workMonths] || 0;
  score += workMonthsScore;
  
  result.breakdown.push({
    section: '담당업무',
    item: '근무개월수',
    selected: state.duty.workMonths === '12' ? '12개월' : '12개월 미만',
    formula: `${workMonthsScore}점`,
    points: workMonthsScore,
    note: ''
  });

  // 2) 담임 vs 비담임
  if (state.duty.dutyType === 'homeroom') {
    // 담임
    const period = state.duty.homeroomPeriod;
    const homeroomScore = rubric.homeroom[period] || 0;
    score += homeroomScore;
    
    result.breakdown.push({
      section: '담당업무',
      item: '담임',
      selected: period,
      formula: `${homeroomScore}점`,
      points: homeroomScore,
      note: ''
    });
  } else {
    // 비담임
    const track = state.duty.nonHomeroomTrack;
    let nonHomeroomScore = 0;
    let period = '';
    
    if (track === 'senior') {
      period = state.duty.seniorPeriod;
      nonHomeroomScore = rubric.nonHomeroom.seniorTrack[period] || 0;
      result.breakdown.push({
        section: '담당업무',
        item: '비담임 (부장/정년)',
        selected: period,
        formula: `${nonHomeroomScore}점`,
        points: nonHomeroomScore,
        note: ''
      });
    } else {
      period = state.duty.generalPeriod;
      nonHomeroomScore = rubric.nonHomeroom.generalTrack[period] || 0;
      result.breakdown.push({
        section: '담당업무',
        item: '비담임 (기획/계원/진로/보건/명퇴)',
        selected: period,
        formula: `${nonHomeroomScore}점`,
        points: nonHomeroomScore,
        note: ''
      });
    }
    
    score += nonHomeroomScore;
  }

  // 3) 곤란/이중업무
  if (state.duty.difficult !== 'none') {
    const difficultScore = rubric.difficult[state.duty.difficult] || 0;
    score += difficultScore;
    
    const difficultLabel = state.duty.difficult === 'level1' 
      ? '방송/교과부장/담당+추가행정' 
      : '교무부장/학년부장+담임/교무기획';
    
    result.breakdown.push({
      section: '담당업무',
      item: '곤란/이중업무',
      selected: difficultLabel,
      formula: `+${difficultScore}점`,
      points: difficultScore,
      note: ''
    });
  }

  // 4) 동아리
  if (state.duty.club !== 'none') {
    let clubScore = 0;
    let clubLabel = '';
    
    if (state.duty.club === 'regular') {
      clubScore = rubric.club.regular.full;
      clubLabel = '정규 동아리 12개월';
    } else if (state.duty.club === 'regularHalf') {
      clubScore = rubric.club.regular.half;
      clubLabel = '정규 동아리 한학기만';
    } else if (state.duty.club === 'autonomous') {
      clubScore = rubric.club.autonomous;
      clubLabel = '자율 동아리 12개월';
    }
    
    score += clubScore;
    result.breakdown.push({
      section: '담당업무',
      item: '동아리',
      selected: clubLabel,
      formula: `+${clubScore}점`,
      points: clubScore,
      note: ''
    });
  }

  // 5) 상조회
  if (state.duty.mutual !== 'none') {
    const mutualScore = rubric.mutual[state.duty.mutual] || 0;
    score += mutualScore;
    
    const mutualLabel = state.duty.mutual === '6+' ? '6개월 이상' : '6개월 미만';
    
    result.breakdown.push({
      section: '담당업무',
      item: '상조회',
      selected: mutualLabel,
      formula: `+${mutualScore}점`,
      points: mutualScore,
      note: ''
    });
  }

  // 30점 cap
  if (score > rubric.maxScore) {
    result.warnings.push(`담당업무 영역 점수가 최대값 ${rubric.maxScore}점으로 제한되었습니다.`);
    score = rubric.maxScore;
  }

  result.score = score;
  return result;
}

/**
 * 전체 점수 계산
 */
function computeTotal(teachingResult, lifeResult, devResult, dutyResult) {
  const totalScore = teachingResult.score + lifeResult.score + devResult.score + dutyResult.score;
  
  const allBreakdown = [
    ...teachingResult.breakdown,
    ...lifeResult.breakdown,
    ...devResult.breakdown,
    ...dutyResult.breakdown
  ];
  
  const allWarnings = [
    ...teachingResult.warnings,
    ...lifeResult.warnings,
    ...devResult.warnings,
    ...dutyResult.warnings
  ];
  
  return {
    total: totalScore,
    teaching: teachingResult.score,
    life: lifeResult.score,
    dev: devResult.score,
    duty: dutyResult.score,
    breakdown: allBreakdown,
    warnings: allWarnings,
    multiSubjectDetails: teachingResult.multiSubjectDetails
  };
}

/**
 * 재계산 및 렌더링
 */
function recalc() {
  const teachingResult = computeTeaching(state);
  const lifeResult = computeLife(state);
  const devResult = computeDev(state);
  const dutyResult = computeDuty(state);
  
  const result = computeTotal(teachingResult, lifeResult, devResult, dutyResult);
  
  renderResults(result);
}

// ========== 렌더링 함수 ==========

/**
 * 결과 렌더링
 */
function renderResults(result) {
  // 상단 총점 및 영역별 점수
  document.getElementById('totalScore').textContent = result.total.toFixed(1);
  document.getElementById('totalScoreDetail').textContent = result.total.toFixed(1);
  document.getElementById('teachingScore').textContent = result.teaching.toFixed(1);
  document.getElementById('lifeScore').textContent = result.life.toFixed(1);
  document.getElementById('devScore').textContent = result.dev.toFixed(1);
  document.getElementById('dutyScore').textContent = result.duty.toFixed(1);

  // 다과목 지도 상세 정보
  renderMultiSubjectDetails(result.multiSubjectDetails);

  // Breakdown 테이블
  const tbody = document.getElementById('breakdownBody');
  tbody.innerHTML = '';
  
  if (result.breakdown.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">항목을 입력하면 계산 내역이 표시됩니다</td></tr>';
  } else {
    for (const item of result.breakdown) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.section}</td>
        <td>${item.item}</td>
        <td>${item.selected}</td>
        <td>${item.formula}</td>
        <td><strong>${item.points.toFixed(1)}</strong></td>
        <td>${item.note}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  // 경고 메시지
  const warningsDiv = document.getElementById('warnings');
  warningsDiv.innerHTML = '';
  
  for (const warning of result.warnings) {
    const div = document.createElement('div');
    div.className = 'warning-item';
    div.textContent = warning;
    warningsDiv.appendChild(div);
  }
}

/**
 * 다과목 지도 상세 정보 렌더링
 */
function renderMultiSubjectDetails(details) {
  const container = document.getElementById('multiSubjectDetails');
  
  if (!details || (details.sem1Count === 0 && details.sem2Count === 0)) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  
  let html = '<h3>다과목 지도 상세 정보</h3>';
  
  html += '<div class="detail-row">';
  html += `<strong>1학기 과목 (${details.sem1Count}개):</strong> `;
  html += details.sem1Subjects.length > 0 ? details.sem1Subjects.join(', ') : '없음';
  html += '</div>';
  
  html += '<div class="detail-row">';
  html += `<strong>2학기 과목 (${details.sem2Count}개):</strong> `;
  html += details.sem2Subjects.length > 0 ? details.sem2Subjects.join(', ') : '없음';
  html += '</div>';
  
  container.innerHTML = html;
}

// ========== UI 인터랙션 ==========

/**
 * 다과목 지도 테이블 행 추가
 */
function addSubjectRow(semester) {
  const subject = {
    name: '',
    detailLength: '',  // '500', '250', or ''
    hasExam: false
  };
  
  state.teaching.multiSubject[semester].push(subject);
  renderSubjectTables();
  recalc();
}

/**
 * 다과목 지도 테이블 행 삭제
 */
function deleteSubjectRow(semester, index) {
  state.teaching.multiSubject[semester].splice(index, 1);
  renderSubjectTables();
  recalc();
}

/**
 * 과목 테이블 렌더링
 */
function renderSubjectTables() {
  renderSubjectTable('sem1', state.teaching.multiSubject.sem1);
  renderSubjectTable('sem2', state.teaching.multiSubject.sem2);
}

function renderSubjectTable(semester, subjects) {
  const tbody = document.getElementById(semester + 'Body');
  tbody.innerHTML = '';
  
  subjects.forEach((subject, index) => {
    const tr = document.createElement('tr');
    const detailName = `detail-${semester}-${index}`;
    const detail500Checked = subject.detailLength === '500' ? 'checked' : '';
    const detail250Checked = subject.detailLength === '250' ? 'checked' : '';
    
    tr.innerHTML = `
      <td><input type="text" class="subject-name" value="${subject.name || ''}" data-semester="${semester}" data-index="${index}" placeholder="과목명"></td>
      <td>
        <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
          <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
            <input type="radio" name="${detailName}" class="subject-detail" value="500" ${detail500Checked} data-semester="${semester}" data-index="${index}">
            <span>500자</span>
          </label>
          <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
            <input type="radio" name="${detailName}" class="subject-detail" value="250" ${detail250Checked} data-semester="${semester}" data-index="${index}">
            <span>250자</span>
          </label>
        </div>
      </td>
      <td><input type="checkbox" class="subject-exam" ${subject.hasExam ? 'checked' : ''} data-semester="${semester}" data-index="${index}"></td>
      <td><button type="button" class="btn-delete" data-semester="${semester}" data-index="${index}">삭제</button></td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * 담임/비담임 UI 토글
 */
function toggleDutyTypeUI() {
  const dutyType = state.duty.dutyType;
  const homeroomOptions = document.getElementById('homeroomOptions');
  const nonHomeroomOptions = document.getElementById('nonHomeroomOptions');
  
  if (dutyType === 'homeroom') {
    homeroomOptions.style.display = 'block';
    nonHomeroomOptions.style.display = 'none';
  } else {
    homeroomOptions.style.display = 'none';
    nonHomeroomOptions.style.display = 'block';
    
    // 비담임 트랙에 따라 하위 옵션 표시
    toggleNonHomeroomTrackUI();
  }
}

/**
 * 비담임 트랙 UI 토글
 */
function toggleNonHomeroomTrackUI() {
  const track = state.duty.nonHomeroomTrack;
  const seniorOptions = document.getElementById('seniorTrackOptions');
  const generalOptions = document.getElementById('generalTrackOptions');
  
  if (track === 'senior') {
    seniorOptions.style.display = 'block';
    generalOptions.style.display = 'none';
  } else {
    seniorOptions.style.display = 'none';
    generalOptions.style.display = 'block';
  }
}

// ========== 로컬 저장/불러오기 ==========

const STORAGE_KEY = 'teacher_eval_calc_v1';

function saveToLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    alert('데이터가 로컬에 저장되었습니다.');
  } catch (e) {
    alert('저장 중 오류가 발생했습니다: ' + e.message);
  }
}

function loadFromLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      alert('저장된 데이터가 없습니다.');
      return;
    }
    
    state = JSON.parse(saved);
    loadStateToUI();
    recalc();
    alert('데이터를 불러왔습니다.');
  } catch (e) {
    alert('불러오기 중 오류가 발생했습니다: ' + e.message);
  }
}

function resetState() {
  if (!confirm('모든 입력을 초기화하시겠습니까?')) {
    return;
  }
  
  // 초기 상태로 리셋
  state = {
    teaching: {
      hoursBand: '18+',
      hoursPenalty: false,
      hoursDifferent: false,
      multiSubject: {
        sem1: [],
        sem2: []
      },
      classOpen: 0
    },
    life: {
      morning: 'none',
      night: 'none'
    },
    dev: {
      training: '45+',
      leader: false,
      member: false,
      award: '0'
    },
    duty: {
      workMonths: '12',
      dutyType: 'homeroom',
      homeroomPeriod: '12',
      nonHomeroomTrack: 'senior',
      seniorPeriod: '12',
      generalPeriod: '12',
      difficult: 'none',
      club: 'none',
      mutual: 'none'
    }
  };
  
  loadStateToUI();
  recalc();
}

function loadStateToUI() {
  // 학습지도
  const hoursInput = document.querySelector(`input[name="hours"][value="${state.teaching.hoursBand}"]`);
  if (hoursInput) {
    hoursInput.checked = true;
  }
  document.getElementById('hoursPenalty').checked = state.teaching.hoursPenalty;
  document.getElementById('hoursDifferent').checked = state.teaching.hoursDifferent;
  renderSubjectTables();
  document.getElementById('classOpen').value = state.teaching.classOpen;
  
  // 생활지도
  document.querySelector(`input[name="morning"][value="${state.life.morning}"]`).checked = true;
  document.querySelector(`input[name="night"][value="${state.life.night}"]`).checked = true;
  
  // 전문성개발
  document.querySelector(`input[name="training"][value="${state.dev.training}"]`).checked = true;
  document.getElementById('devLeader').checked = state.dev.leader;
  document.getElementById('devMember').checked = state.dev.member;
  document.querySelector(`input[name="award"][value="${state.dev.award}"]`).checked = true;
  
  // 담당업무
  document.querySelector(`input[name="workMonths"][value="${state.duty.workMonths}"]`).checked = true;
  document.querySelector(`input[name="dutyType"][value="${state.duty.dutyType}"]`).checked = true;
  toggleDutyTypeUI();
  document.querySelector(`input[name="homeroomPeriod"][value="${state.duty.homeroomPeriod}"]`).checked = true;
  document.querySelector(`input[name="nonHomeroomTrack"][value="${state.duty.nonHomeroomTrack}"]`).checked = true;
  toggleNonHomeroomTrackUI();
  document.querySelector(`input[name="seniorPeriod"][value="${state.duty.seniorPeriod}"]`).checked = true;
  document.querySelector(`input[name="generalPeriod"][value="${state.duty.generalPeriod}"]`).checked = true;
  document.querySelector(`input[name="difficult"][value="${state.duty.difficult}"]`).checked = true;
  document.querySelector(`input[name="club"][value="${state.duty.club}"]`).checked = true;
  document.querySelector(`input[name="mutual"][value="${state.duty.mutual}"]`).checked = true;
}

// ========== 이벤트 리스너 등록 ==========

function initEventListeners() {
  // 학습지도
  document.querySelectorAll('input[name="hours"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.teaching.hoursBand = e.target.value;
      recalc();
    });
  });
  
  document.getElementById('hoursPenalty').addEventListener('change', (e) => {
    state.teaching.hoursPenalty = e.target.checked;
    recalc();
  });
  
  document.getElementById('hoursDifferent').addEventListener('change', (e) => {
    state.teaching.hoursDifferent = e.target.checked;
    recalc();
  });
  
  document.getElementById('classOpen').addEventListener('input', (e) => {
    state.teaching.classOpen = parseInt(e.target.value) || 0;
    recalc();
  });
  
  // 다과목 테이블 버튼
  document.getElementById('addSem1').addEventListener('click', () => addSubjectRow('sem1'));
  document.getElementById('addSem2').addEventListener('click', () => addSubjectRow('sem2'));
  
  // 다과목 테이블 입력 (이벤트 위임)
  document.getElementById('sem1Body').addEventListener('input', handleSubjectInput);
  document.getElementById('sem1Body').addEventListener('change', handleSubjectInput);
  document.getElementById('sem1Body').addEventListener('click', handleSubjectDelete);
  
  document.getElementById('sem2Body').addEventListener('input', handleSubjectInput);
  document.getElementById('sem2Body').addEventListener('change', handleSubjectInput);
  document.getElementById('sem2Body').addEventListener('click', handleSubjectDelete);
  
  // 생활지도
  document.querySelectorAll('input[name="morning"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.life.morning = e.target.value;
      recalc();
    });
  });
  
  document.querySelectorAll('input[name="night"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.life.night = e.target.value;
      recalc();
    });
  });
  
  // 전문성개발
  document.querySelectorAll('input[name="training"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.dev.training = e.target.value;
      recalc();
    });
  });
  
  document.getElementById('devLeader').addEventListener('change', (e) => {
    state.dev.leader = e.target.checked;
    recalc();
  });
  
  document.getElementById('devMember').addEventListener('change', (e) => {
    state.dev.member = e.target.checked;
    recalc();
  });
  
  document.querySelectorAll('input[name="award"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.dev.award = e.target.value;
      recalc();
    });
  });
  
  // 담당업무
  document.querySelectorAll('input[name="workMonths"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.duty.workMonths = e.target.value;
      recalc();
    });
  });
  
  document.querySelectorAll('input[name="dutyType"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.duty.dutyType = e.target.value;
      toggleDutyTypeUI();
      recalc();
    });
  });
  
  document.querySelectorAll('input[name="homeroomPeriod"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.duty.homeroomPeriod = e.target.value;
      recalc();
    });
  });
  
  document.querySelectorAll('input[name="nonHomeroomTrack"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.duty.nonHomeroomTrack = e.target.value;
      toggleNonHomeroomTrackUI();
      recalc();
    });
  });
  
  document.querySelectorAll('input[name="seniorPeriod"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.duty.seniorPeriod = e.target.value;
      recalc();
    });
  });
  
  document.querySelectorAll('input[name="generalPeriod"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.duty.generalPeriod = e.target.value;
      recalc();
    });
  });
  
  document.querySelectorAll('input[name="difficult"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.duty.difficult = e.target.value;
      recalc();
    });
  });
  
  document.querySelectorAll('input[name="club"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.duty.club = e.target.value;
      recalc();
    });
  });
  
  document.querySelectorAll('input[name="mutual"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.duty.mutual = e.target.value;
      recalc();
    });
  });
  
  // 버튼
  document.getElementById('btnReset').addEventListener('click', resetState);
  document.getElementById('btnSave').addEventListener('click', saveToLocal);
  document.getElementById('btnLoad').addEventListener('click', loadFromLocal);
  document.getElementById('btnPrint').addEventListener('click', () => window.print());
}

function handleSubjectInput(e) {
  const target = e.target;
  if (!target.dataset.semester) return;
  
  const semester = target.dataset.semester;
  const index = parseInt(target.dataset.index);
  const subject = state.teaching.multiSubject[semester][index];
  
  if (target.classList.contains('subject-name')) {
    subject.name = target.value;
  } else if (target.classList.contains('subject-detail')) {
    if (target.type === 'radio' && target.checked) {
      subject.detailLength = target.value;
    }
  } else if (target.classList.contains('subject-exam')) {
    subject.hasExam = target.checked;
  }
  
  recalc();
}

function handleSubjectDelete(e) {
  if (e.target.classList.contains('btn-delete')) {
    const semester = e.target.dataset.semester;
    const index = parseInt(e.target.dataset.index);
    deleteSubjectRow(semester, index);
  }
}

// ========== 초기화 ==========

document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  toggleDutyTypeUI();
  recalc();
});

