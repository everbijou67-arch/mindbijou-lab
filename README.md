# 5주기 간호교육인증평가 통합관리 시스템

한영대학교 간호학과 5주기 간호교육인증평가 자체평가 TFT 운영을 위한 웹 기반 통합관리 플랫폼입니다.

## 주요 기능

- **대시보드**: 6개 인증 영역 KPI 및 D-Day 카운터
- **미흡·권고사항 관리**: D1~D8 미흡사항, R1~R7 권고사항 개선 추적
- **증빙자료 관리**: 영역별 증빙자료 수집 현황 관리
- **TFT 일정**: Phase 1~4 실행 계획 추적
- **체크리스트**: 6개 영역별 준비 사항 점검
- **회의록**: TFT 및 위원회 회의 기록

## 기술 스택

- Frontend: React + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Express.js + SQLite (better-sqlite3 + Drizzle ORM)
- Build: Vite

## 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5000` 접속

## 배포 (Render.com)

- Build Command: `npm install && npm run build`
- Start Command: `NODE_ENV=production node dist/index.cjs`
- Environment: Node.js

## 인증 정보

- 현재 인증: 인증(3년) 2025.6.12~2028.6.11
- 목표: 5년 인증 (2028)
