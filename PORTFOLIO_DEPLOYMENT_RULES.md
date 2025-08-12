# Portfolio Repository 배포 규칙

## 📌 중요: React SPA 배포 제약사항

이 포트폴리오 저장소는 GitHub Pages를 사용하며, **404.html을 통한 SPA 라우팅**을 지원합니다.
따라서 다음과 같은 규칙을 반드시 따라야 합니다:

### ✅ 허용되는 구조

1. **정적 빌드 파일만 서브디렉토리에 배포**
   ```
   portfolio/
   ├── 404.html (SPA 라우팅 처리용)
   ├── index.html (포트폴리오 메인)
   ├── v2x-security-career/ (정적 빌드 결과물)
   ├── project1.html (단일 정적 페이지)
   └── project2/ (정적 사이트)
   ```

2. **React SPA는 별도 저장소 사용**
   - 각 React 프로젝트를 독립 저장소로 분리
   - 예: `username.github.io/react-app-name`

### ❌ 작동하지 않는 구조

```
portfolio/
├── react-app-1/ (React SPA)
└── react-app-2/ (React SPA)
```

**이유**: GitHub Pages는 404.html을 **저장소 루트에서만** 인식합니다.
서브디렉토리의 React 앱에서 새로고침 시 404 에러가 발생합니다.

### 🔧 해결 방법

React SPA를 배포해야 한다면:

1. **HashRouter 사용** - URL이 `/#/path` 형태가 되지만 새로고침 문제 해결
2. **정적 사이트 생성(SSG)** - react-snap, Next.js 등으로 정적 HTML 생성
3. **별도 저장소** - 각 React 앱을 독립된 GitHub 저장소로 분리

### 📝 현재 배포된 프로젝트

- `/v2x-security-career/` - V2X Security 포트폴리오 (React, 정적 빌드)
  - 빌드 시 404.html이 자동 생성되어 SPA 라우팅 지원

### 🚀 배포 명령어

```bash
# v2x-security-career 프로젝트 배포
cd v2x-security-career
npm run build:github
# dist 폴더 내용을 portfolio/v2x-security-career/로 복사
```

---

**Note**: 이 규칙은 GitHub Pages의 기술적 제약에 따른 것입니다.
다른 호스팅 서비스(Netlify, Vercel 등)를 사용하면 이런 제약이 없습니다.