# 회귀 테스트 우선순위

기존 테스트를 재사용한다. 이 목록은 향후 추가 기능을 이미 검증했다고 주장하지 않는다.

| 우선 | 영역 | 현재 자동 검사 | 핵심 수용 조건 |
| --- | --- | --- | --- |
| P0 | OAuth/저장 권한 | discord.test.mjs | 세션 필수, CSRF/Origin, 이전 revision 거부, 계정별 접근 |
| P0 | 재화·구매·저장·호환성 | storage.test.mjs, starter.test.mjs, selected-room-assets.test.mjs | 잔액 부족·중복 구매 거부, 기존 데이터/보유품 보존 |
| P0 | 날짜·보상 | attendance.test.mjs, daily.test.mjs | KST 자정, 중복 출석/미션 방지, 누적 유지 |
| P1 | 방·가구·펫 | room-placement.test.mjs, public-room-depth.test.mjs, selected-room-assets.test.mjs, starter-pet.test.mjs | 좌표·깊이·이동·저장 복원·기존 원본 유지 |
| P1 | 메뉴·화면 | navigation.test.mjs, room-ui.test.mjs, original-runtime.test.mjs | 정상 화면 이동과 상태 유지 |
| P2 | 콘솔·시각·색상 | console-button-geometry.test.mjs, controller-*.test.mjs, tint-palette.test.mjs, pink-attic-room.test.mjs | 버튼/히트박스·잘림·도트와 테마 일관성 |

## 명령
```sh
npm run build
node --test test/discord.test.mjs test/storage.test.mjs test/attendance.test.mjs test/daily.test.mjs test/selected-room-assets.test.mjs
npm test
```
Node 22 이상. 현재 CI verify-room은 빌드·콘솔 검사·전체 회귀 테스트를 실행한다. 배포 전 P0 및 관련 테스트 실패 시 병합/배포 중지.

## 추가 검증 (현재 자동 검사 외)
- 모바일 터치·가로/세로 화면과 실제 버튼 클릭, 가구 드래그 후 재접속.
- 실제 별도 테스트 계정의 로그인과 계정 간 격리. 운영 데이터 변경 또는 토큰 기록 금지.
- 권한·결제·운영 재화 연동 신규 개발 시 서버 검증, 중복 요청/실패 롤백, 감사 로그, 실사용 승인 절차를 설계한다.
- 실제 운영 URL/버전 확인은 CI 통과와 별도다.

## 기록 양식
테스트 명령 / 실행 환경 / 통과·실패 수 / 실패 재현 / 미검증 항목 / 배포 여부. 실제 실행하지 않은 검사는 미실행 처리.
