# Vue.js CDN 기반 포트폴리오 마이그레이션 가이드

## 📋 프로젝트 개요
기존 정적 HTML 포트폴리오를 Vue.js CDN 기반으로 리팩토링하여 유지보수성과 확장성을 개선

## 🎯 목표
- **데이터 중심 구조**: HTML에서 데이터를 분리하여 JSON 파일로 관리
- **컴포넌트화**: 반복되는 UI 요소를 재사용 가능한 컴포넌트로 변환
- **유지보수 용이성**: 새 콘텐츠 추가 시 데이터 파일만 수정
- **향상된 UX**: 모달, 호버 효과, 부드러운 트랜지션 추가

## 📁 파일 구조
```
portfolio/
├── index.html          # 기존 파일 (백업용)
├── index-vue.html      # Vue.js 버전
├── asset/
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   ├── data/       # 데이터 파일
│   │   │   ├── profile.js
│   │   │   ├── portfolio.js
│   │   │   ├── skills.js
│   │   │   ├── activities.js
│   │   │   └── qualification.js
│   │   ├── components/ # Vue 컴포넌트
│   │   │   ├── PortfolioItem.js
│   │   │   ├── ProjectDetail.js
│   │   │   ├── SkillCard.js
│   │   │   ├── ActivityCard.js
│   │   │   └── QualificationTimeline.js
│   │   ├── app.js      # Vue 앱 인스턴스
│   │   └── header.js   # 기존 헤더 스크립트
│   └── img/           # 이미지 파일
```

## 🚀 사용 방법

### 1. 테스트
```bash
# 브라우저에서 직접 열기
open index-vue.html
```

### 2. 데이터 수정
새로운 프로젝트 추가 예시:
```javascript
// asset/js/data/portfolio.js
portfolioData.projects.push({
    id: 4,
    title: "새 프로젝트",
    category: "web",
    image: "asset/img/new-project.png",
    description: "프로젝트 설명",
    technologies: ["Vue.js", "Node.js"],
    // ...
});
```

### 3. 배포
```bash
# 기존 index.html 백업
cp index.html index-backup.html

# Vue 버전으로 교체
cp index-vue.html index.html
```

## ✨ 주요 개선사항

### 1. 이미지 호버 효과
- 마우스 오버 시 확대 및 그림자 효과
- 부드러운 트랜지션 애니메이션

### 2. 프로젝트 상세 모달
- 체크박스 방식 → 모달 팝업
- ESC 키 및 배경 클릭으로 닫기
- 구조화된 정보 표시

### 3. 데이터 관리
- 모든 콘텐츠를 JSON 형식으로 관리
- 중복 HTML 제거
- 일관된 디자인 패턴

### 4. 반응형 컴포넌트
- 스킬 프로그레스바 애니메이션
- Swiper 슬라이더 통합
- ScrollReveal 효과 유지

## 📝 Phase별 진행 상황

### ✅ Phase 1: 초기 설정
- Vue 3 CDN 추가
- 데이터 구조 설계
- 파일 분리 완료

### ✅ Phase 2: Portfolio 섹션
- PortfolioItem 컴포넌트
- ProjectDetail 모달
- 필터링 기능

### ✅ Phase 3: Skills 섹션
- SkillCard 컴포넌트
- 프로그레스바 애니메이션
- 데이터 바인딩

### ✅ Phase 4: Activities 섹션
- ActivityCard 컴포넌트
- Swiper.js 통합

### ✅ Phase 5: Qualification 섹션
- Timeline 컴포넌트
- 교육/경력 구조화

### 🔄 Phase 6: 최종 통합
- [ ] 전체 테스트
- [ ] 반응형 검증
- [ ] 성능 최적화
- [ ] SEO 개선

## 🔧 추가 작업 필요사항

1. **이미지 최적화**
   - WebP 포맷 변환
   - Lazy loading 구현

2. **SEO 개선**
   - 메타태그 동적 업데이트
   - 구조화된 데이터 추가

3. **성능 최적화**
   - 컴포넌트 lazy loading
   - 이미지 CDN 적용

4. **접근성 개선**
   - ARIA 레이블 추가
   - 키보드 네비게이션

## 💡 팁

### 데이터 추가 시
1. 해당 데이터 파일 수정 (예: `portfolio.js`)
2. 브라우저 새로고침
3. 변경사항 즉시 반영

### 디자인 수정 시
1. `main.css`에서 스타일 수정
2. 컴포넌트별 스타일은 인라인 또는 scoped CSS 사용

### 문제 해결
- 콘솔 에러 확인: F12 → Console
- Vue DevTools 사용 권장
- 데이터 바인딩 문제: `{{ }}` 문법 확인

## 📞 지원
문제 발생 시 GitHub Issues에 등록하거나 이메일로 문의