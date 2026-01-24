# Project: Vocab (v1)

## One-liner

영어만 말고, 매일 다른 나라 언어를 가볍게 접하는
잠금화면/위젯 기반 단어 습관 앱

---

## Product Philosophy

- 공부 앱 ❌
- 습관 / 노출 앱 ⭕
- 외우게 하지 않는다
- 자주, 가볍게 스치게 한다

---

## Target

- 영어 외 일본어/중국어도 가볍게 접하고 싶은 사용자
- 공부 앱에 지친 사용자
- 여행 전/중 실사용 단어를 보고 싶은 사용자

---

## Core UX Flow

1. 잠금화면/위젯에서 단어를 본다 (인지)
2. 단어를 탭한다
3. 앱이 열리며 예문으로 바로 이해한다
4. 다시 볼 단어는 ⭐로 저장한다
5. 길게 머물 필요 없이 닫는다 (30초 이내)

---

## v1 Scope (Must Have)

### Languages

- English (en)
- Japanese (ja)
- Chinese (zh)
- 사용자는 설정에서 1~3개 언어 선택 가능
- 최소 1개 이상 필수

### Home

- Today’s Words (오늘 노출된 단어들, 최대 30~50)
- Saved Words (⭐ 다시 볼 단어)
- 카드형 리스트 UI

### Word Detail

- 단어
- 발음 (ja/zh 필수)
- 뜻 (한국어 1줄)
- 예문 1~2개
- 상황/카테고리 태그
- 카테고리:
  기본 - 일상 동사 - 감정표현 - 자주 쓰는 형용사
  상황 - 여행 - 식당 - 숙소 - 쇼핑 - 이동 - 비즈니스 등
  감성/취향 - 드라마에서 자주 나오는 단어 - 연애표현
- ⭐ 다시 보기 토글
- 발음 버튼(옵션)

### Widget / Lock Screen (iOS v1)

- 단어 1개 + 뜻 1줄 + 발음
- 탭 시 해당 단어 상세로 딥링크 이동

### Settings

- 언어 선택 (1개 이상 강제)
- 카테고리 선택 (선택사항)
- 위젯 추가 가이드

---

## Non-goals (v1에서 절대 안 함)

- 퀴즈
- 학습 진도
- 목표/할당량
- 연속 학습(Streak)
- 점수/레벨/XP
- 계정/로그인/동기화

---

## Tech Stack

- React Native (Bare, Expo managed 사용 금지)
- TypeScript
- Styling: NativeWind (Tailwind CSS)
- SQLite (로컬 DB)
- iOS Widget Extension (SwiftUI + App Group)
- Android 위젯은 v1.1 이후

---

## Data Policy

- v1은 오프라인 퍼스트
- 단어/예문 데이터는 초기 번들(seed DB)로 포함
- 사용자 데이터(노출 로그, ⭐ 저장)는 로컬 저장
- 백엔드는 v1에서 사용하지 않음

---

## Design Direction

- 미니멀
- 카드형 UI
- 파스텔 / 연한 그라데이션 배경
- 카드: 화이트 + 약한 그림자
- ⭐ 다시 보기는 유일한 강한 인터랙션

---

## Success Metric (초기)

- 위젯 활성화율
- 단어 탭 → 상세 진입률
- ⭐ 다시 보기 저장률
