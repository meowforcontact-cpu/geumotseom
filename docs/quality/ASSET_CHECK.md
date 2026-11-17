# 픽셀 에셋 자동 검사

기준은 [공식 아트 규칙](../pixel-asset-style-guide.md)이다. 검사기는 이미지를 수정하지 않는다.

```sh
python -m pip install -r scripts/pixel-assets-requirements.txt
python scripts/test_pixel_assets.py
python scripts/check_pixel_assets.py --baseline
python scripts/check_pixel_assets.py --changed main
python scripts/check_pixel_assets.py --file path/to/new.png --kind furniture --size 48 64 --materials path/to/materials.json
python scripts/check_pixel_assets.py --file path/to/menu.png --kind ui --size 512 384 --palette path/to/approved-palette.json
```

크기는 예시이며 실제 승인된 에셋 규격을 사용한다. 기존 4:3 배경은 실제 파일 1024×768, 논리 월드 170×128이다. 크기가 다른 8방향 고양이 원본을 일괄 32×32로 바꾸지 않는다.

- PNG 포맷/이미지 크기/배경 비율/투명 배경/반투명 픽셀/불투명 RGB 수를 자동 확인한다.
- 신규 스프라이트와 UI에는 실제 승인된 RGB 팔레트를 등록한다. 투명 픽셀의 RGB는 무시하며, 누락은 REVIEW, 승인 목록 밖의 불투명 색상은 FAIL이다. 512×384는 명령 형식 예시이며 확정되지 않은 UI 규격을 강제하지 않는다.
- 가구 소재별 이진 마스크(같은 해상도, 흰색=영역, 검정=제외)를 준비하면 마스크별 2색, 승인 필요시 3색, 공통 외곽선 1색을 확인한다. 전체 RGB 수는 참고 정보일 뿐이다.
- 마스크 하나당 소재 하나를 표현한다. 임의 분할 금지. 중복 및 미포함 픽셀은 실패한다. 승인된 색/시각적 1픽셀 윤곽·원근·안티앨리어싱 여부·발점·실게임 가독성은 별도 검수한다.
- 기존 배치 에셋의 반투명 픽셀은 REVIEW로 기록하고 원본은 보존한다. 신규 에셋은 반투명 픽셀 발견 시 FAIL. 신규 가구의 크기/마스크 없이는 REVIEW.
- 종료 0: 수치 검사 통과(기존 baseline의 관찰 항목은 제외), 1: 실패, 2: 신규 에셋 검토 필요. 수치 통과는 디자인 최종 승인과 다르다.

소재 마스크 파일 예시 (실제 에셋이 아닌 형식 예시):
```json
{"materials":[{"name":"천","mask":"cloth.png","max_colors":2},{"name":"목재","mask":"wood.png","max_colors":2},{"name":"외곽선","mask":"outline.png","outline":true}]}
```

기존 에셋 일괄 자동 수정/축소/투명화는 하지 않는다. 신규 검사 결과와 승인 원본 비교를 먼저 수행한다.

## PR 및 main push 자동 검사
PR 또는 main push에서 추가/수정/이름 변경된 `src/assets/`, `src/art/`의 PNG를 자동 감지한다. 신규 또는 변경 에셋은 `scripts/pixel-profiles.json`에 승인된 크기/종류와 필요한 마스크 명세 경로 또는 팔레트를 등록한다. 미등록/검토 필요/실패는 검사 실패로 표시한다. 마스크 PNG는 게임 에셋 폴더 대신 별도 검수 폴더에 저장한다.

등록 형식 예시 (실제 기준 아님):
```json
{"src/assets/example.png":{"kind":"furniture","size":[48,64],"materials":"docs/quality/masks/example.json"}}
```
스프라이트/UI의 예시 프로필은 `{"kind":"sprite","size":[32,32],"palette":["#010203","#040506"]}`이다(예시 색상은 승인 팔레트가 아님).

기존 파일을 수정하지 않은 PR에는 신규 검사 대상이 없다. push로 동작하는 dist 게시 워크플로도 P0·전체 회귀·기존 에셋·변경 PNG 검사를 통과해야 게시용 커밋을 만든다. main 브랜치 병합 자체를 강제 차단하려면 저장소의 보호 규칙에서 verify-room 체크를 필수로 지정해야 한다. 수동 게시와 실제 Cloudflare 배포 여부는 별도로 확인한다.
