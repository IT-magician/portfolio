# 포트폴리오 로컬 버전 사용 가이드

## 파일 구조
```
portfolio/
├── index-vue-portfolio.html      # CDN 버전 (인터넷 필요)
├── index-vue-portfolio-local.html # 로컬 버전 (오프라인 가능)
├── portfolio-data.json           # 포트폴리오 데이터
├── qualification-data.json       # 자격/교육 데이터
├── activities-data.json          # 활동 데이터
└── asset/
    ├── css/
    │   └── main.css
    ├── js/
    │   ├── header.js
    │   ├── portfolio-vue-app.js
    │   ├── qualification-vue-app.js
    │   ├── activities-vue-app.js
    │   └── init-plugins.js
    └── vendor/                   # CDN 백업 파일들
        ├── css/
        │   ├── font-awesome-6.2.0.min.css
        │   ├── swiper-bundle-9.min.css
        │   └── tingle-0.16.0.min.css
        ├── js/
        │   ├── vue-3.global.js
        │   ├── swiper-bundle-9.min.js
        │   ├── gsap-3.11.3.min.js
        │   ├── scrollreveal.min.js
        │   └── tingle-0.16.0.min.js
        └── fonts/
            └── webfonts/
                ├── fa-brands-400.woff2
                ├── fa-regular-400.woff2
                ├── fa-solid-900.woff2
                └── (기타 폰트 파일들)
```

## 사용 방법

### 온라인 버전 (CDN 사용)
1. `index-vue-portfolio.html` 파일을 브라우저에서 열기
2. 인터넷 연결 필요

### 오프라인 버전 (로컬 파일 사용)
1. `index-vue-portfolio-local.html` 파일을 브라우저에서 열기
2. 인터넷 연결 불필요
3. 모든 리소스가 로컬에서 로드됨

## 데이터 수정 방법

### 포트폴리오 항목 추가/수정
`portfolio-data.json` 파일 편집

### 자격/교육 정보 수정
`qualification-data.json` 파일 편집

### 활동 내역 수정
`activities-data.json` 파일 편집

## 문제 해결

### Font Awesome 아이콘이 보이지 않을 때
1. `asset/vendor/fonts/webfonts/` 폴더에 폰트 파일이 있는지 확인
2. 없다면 `download-fontawesome-fonts.ps1` 실행

### JavaScript 오류 발생 시
1. 브라우저 콘솔에서 오류 메시지 확인
2. `asset/vendor/js/` 폴더에 모든 JS 파일이 있는지 확인
3. 없다면 `download-cdn-backup.ps1` 실행

## 백업 파일 다운로드

### 전체 CDN 파일 다운로드
```powershell
.\download-cdn-backup.ps1
```

### Font Awesome 폰트만 다운로드
```powershell
.\download-fontawesome-fonts.ps1
```

## 브라우저 호환성
- Chrome (권장)
- Firefox
- Safari
- Edge

## 주의사항
- 로컬 버전은 파일 크기가 더 큽니다 (약 5MB 추가)
- 정기적으로 백업을 만들어 두세요
- GitHub Pages 등에 배포 시 CDN 버전 사용 권장