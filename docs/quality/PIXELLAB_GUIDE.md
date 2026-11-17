# 그못섬 PixelLab MCP 제작·비용 운영 기준서 v1.0

- 조사일: 2026-11-17 (KST).
- 상태: **제작 운영 가이드 / 신규 에셋·코드 구현 및 테스트 미실행**.
- 대상: Pixel Apprentice(Tier 1)를 사용하는 그못섬 제작자와 Codex 에셋 담당 AI.
- 근거: [PixelLab MCP 도구 명세](https://api.pixellab.ai/mcp/docs), [플랜](https://www.pixellab.ai/), [MCP 안내](https://www.pixellab.ai/mcp), [공식 문서](https://www.pixellab.ai/docs), [Game Builder](https://www.pixellab.ai/ai-game-builder). 아래 비용은 조사 시점 공식 명세의 generation 단위다. 실행 전 현재 연결의 도구 스키마·요금·잔액을 우선 확인한다. 이 문서는 계정 조회·실제 과금·생성 실행 결과가 아니다.

> 2026-11-17 디자인 연구 보완: [아트 디렉션](../ART_STYLE_GUIDE.md), [레퍼런스 아카이브](../ART_REFERENCE.md). 아래 기존 32px·수염 등은 현행 기준/예시이며 신규 폴드 시안에서는 수염 생략, 검은 귀, 짧은 몸, 넓은 미간 및 48/64px 비교를 별도 검토한다. 기존 승인 규격 변경이나 유료 생성 승인을 뜻하지 않는다. 실제 참조는 권리 확인 후 역할별로 사용하고 최신 도구 도움말·요금 확인.

## 1. 적용 범위와 의사결정

- 디자인·기능의 최상위 기준: [프로젝트 기획](PROJECT_SPEC.md), [펫 돌보기/친밀도 v0.3](PET_CARE_SPEC.md), [캐릭터 생활 기획](CHARACTER_LIFE_SPEC.md), [픽셀 제작](../pixel-asset-style-guide.md), [카메라](../room-camera-standard.md), [검수](ASSET_CHECK.md). 이 문서는 외부 도구의 사용법을 보완하며 위 명세를 변경하지 않는다.
- 신규 캐릭터는 이족보행 동물형 동반자, 기본 무의상 몸체 + 별도 착용 파츠. 포만감·기분·청결도·친밀도와 성격별 대사, LIFE-01~07의 아트를 지원한다. 가챠, 사망, 친밀도/가구 구매에 따른 XP·재화 보너스는 도입하지 않는다.
- 현재 승인된 핑크 겨울 다락방 빈 배경, 기존 8방향 고양이(`src/assets/selected-room-20261112/cat/`), 좌표(170×128) 및 4:3 콘솔 화면을 보호한다. 새 32×32 이족보행 원본은 후보로 분리하고 채택/교체는 별도 승인. 24×18 신규 타일 구조는 리뉴얼 후보이지 현행 좌표를 변경하는 지시가 아니다.
- 에셋 생성·시각 승인·게임 적용·운영 배포는 각각 다른 단계다. 이 문서를 읽었다고 생성·대량 과금·코드 변경·main 병합·실서비스 배포를 할 수 있는 것은 아니다.

## 2. Tier 1 범위 및 비용 단위

| 항목 | 공식 공개 안내 / 운영 기준 |
| --- | --- |
| Pixel Apprentice | $12/월 기본가, 월 2,000 generations. 공식 할인 단계 표기 $12→10→9.5→9.0. 결제 주기·세금·계정별 실청구는 본인 계정에서 확인 |
| 이미지 | 공개 플랜의 일반 이미지 생성 최대 320×320. MCP 개별 도구는 다른 허용 규격을 명시할 수 있어 큰 이미지/특수 비율은 실제 권한 및 스키마 확인 |
| 캐릭터/동작 | 회전, 텍스트 및 스켈레톤 애니메이션, 유료 Pro 계열 도구(개별 제한 확인) |
| 수정 | 인페인팅, 팔레트/픽셀 보정. 일반 v3 인페인트 Tier 1 최대 256×256, Tier 2부터 512×512; Pro Flash 최대 256px급 |
| 맵/방 | 타일셋, Map Workshop, 방 생성·가구 분리 사용 가능 |
| UI/효과/편집 | UI 에셋, 구독자용 픽셀 워크벤치·VFX 워크벤치; 생성형 추가 작업은 별도 비용 확인 |
| Game Builder | Tier 1부터 포함. 게임에 넣을 아트는 동일한 월간 generation 한도를 소비 |
| 상업 이용 | 공식 플랜은 생성물의 상업 이용 및 사용자 권리를 안내, 모델 학습 용도 제외. 입력 레퍼런스에 대한 권리는 별도로 확보 |
| Tier 2+ 전용 | 음악·효과음 생성 및 음악 루프 도구. Tier 2는 $24/월·5,000 generations·우선 대기열·최대 10 동시 백그라운드 작업·일반 512×512 생성/편집 등. Tier 1에서 자동 유료 업그레이드하지 않는다 |

Generation은 결과 이미지 수, 프레임 수 또는 Codex 토큰과 동일하지 않다. 예를 들어 8방향 원본 한 세트는 2 generations일 수 있으나 행동 8방향은 각각 과금될 수 있다. `get_balance`로 구독 generation과 별도 USD credits 잔액을 구분하며, API 종량제 USD 요금표나 웹 편집기 요금과 MCP 과금식을 혼용하지 않는다. 초과 과금·자동 결제/잔여분 이월 여부는 확인되지 않았으므로 가정하지 않는다.

## 3. 연결 확인 → 작업 계획 → 생성 → 검수

1. Codex에서 이미 연결된 PixelLab MCP 도구를 발견한다. `get_balance`, `list_projects`, `list_characters`, `list_objects`, `list_jobs` 로 현재 자산과 잔액을 읽는다. 직접 REST 호출/인증 재설정으로 우회하지 않는다. 도구 미연결이면 해당 작업을 멈추고 표시한다.
2. 기준서·승인 레퍼런스를 읽고 대상 ID, 시점, 원본 크기, 방향·행동, 소재 팔레트, 예상 요금, 최대 허용 비용을 정한다. `search_help(tool="도구명")`은 도구 전문/요금 확인용 무료 호출이며 `get_pro_flash_capabilities`로 Pro Flash 규격/요금을 조회한다. 모르는 요금은 미확정으로 두고 제출 전에 확인한다. 새 유료 생성은 사용자 작업 요청에 포함되고 예산이 명확할 때만 실행한다.
3. 첫 시안/단일 방향을 검수한 뒤 동일 ID와 승인된 프레임을 재사용한다. 서버는 생성 뒤 즉시 ID를 주고 백그라운드 처리(통상 수십 초~수 분)를 하므로 `get_*`, `wait_for_jobs`, `list_jobs`로 조회; 같은 작업을 새로 제출하지 않는다. 캐릭터 생성 직후 애니메이션 예약이 가능하더라도 그못섬은 원본 승인 뒤 확장한다. 취소는 작업 시작 전 무료, 이미 진행한 작업은 청구될 수 있으며 자체 실패는 미청구라는 공식 설명을 따른다. 장시간 작업은 처리 상태부터 조사한다.
4. 완료 결과를 미리보기/다운로드하고 원본 보존 사본에서만 수정한다. 같은 계정의 웹 Creator에서도 조회할 수 있다. 결과가 리뷰 상태라면 선택한 후보만 `select_object_frames`로 확정하고 삭제는 자동 실행하지 않는다.
5. `export_asset` 또는 해당 get 도구로 PNG/ZIP·메타데이터 다운로드. UUID가 다운로드 접근 키이므로 공개 저장소에 다운로드 URL/인증키/개인 정보 올리지 않는다. 크기·프레임·알파·소재·발점·실제 화면 합성 검수 후 사용자 승인. 신규 코드 반영/에셋 교체는 별도 작업.

### 요금표 (대표 도구, 작업 단위)

| 범주 / 도구 | generation 기준 | 그못섬 용도 |
| --- | --- | --- |
| `get_balance`, `search_help`, `get_pro_flash_capabilities`, 조회/내보내기 | 0 (생성하지 않음) | 잔액/요금/ID/다운로드 |
| `create_character` v3 | 32px 텍스트 2; 정면 참조 32px 1 (최소 1, 8방향 참조 면적 식); standard 1, pro 32px 10 | 원본 8방향 |
| `create_character_pro_flash` | 32px 텍스트+8방향 6; 기존 정면 재사용 시 회전 비용만, 무료 견적 | 어려운 원본의 고품질 대안 |
| `animate_character` | 32px template 또는 짧은 v3는 통상 방향당 1; pixminimax 방향당 1~6; skeleton-v3 방향당 2~4 | 행동별 방향 확장 |
| `create_character_state` | 32px 원본은 상태당 10 (4/8방향 묶음, 크면 15/25) | 소품 든 정적 자세 등 |
| `transfer_outfit` | 32~128px 프레임 10/호출; 129~170px 15, 171~256px 25 | 옷 적용 비교용 프레임 |
| `edit_animation` | 16~128px 10/호출, 129~170px 15, 171~256px 25 | 여러 프레임 동시 수정 |
| `mirror_animation`, `set_canvas_size`, `manage_state` | 0 | 대칭 동작 복제/여백/복제본 |
| `create_image_pixflux`, `create_image_pixen` | 1/호출 | 아이콘·소품·시안 |
| `create_image_pro_from_style` | 호출당 10/15/25 (정사각 32px 64후보=10, 64px 16후보=10, 256px 1후보=10) | 동일 미술 스타일의 후보 제작 |
| Pro Flash 이미지 생성·편집·인페인트 계열 | 긴 변 기준 ≤96px 5, 100~208px 6, 212~256px 9 (규격 견적 우선) | 작은 고품질 생성/수정 |
| `inpaint_image` | Tier 1 일반 인페인트 10/호출 | 마스크 영역만 수정 |
| `edit_image` | 정사각 ≤256 10, ≤341 15, 그 이상 25 (비정사각 별도) | 프레임 묶음 수정 |
| `image_to_pixelart` / `image_to_pixelart_pro` / Flash | 1 / 20 / 6 | 참고 이미지 도트 변환 |
| `unzoom_image`, `correct_pixelart`, `reduce_colors` | 각각 0.1 | 격자·색 보정 |
| `pixelart_workbench`, `save_to_asset` | 구독자 무료 | 픽셀 직접 편집·검사; 승인 원본 덮어쓰기 금지 |
| `create_map_object` | 공개 MCP 항목에 정확한 비용 명시 없음: 실제 도구 도움말/요금 확인 | 단일 방향 가구·오브젝트 |
| `create_1_direction_object` | 10 또는 15/호출 (후보 시트 기준) | 소품 후보 묶음 |
| `create_8_direction_object`, `expand_object_to_8_directions` | 8방향 생성 10/15/25 (긴 변 ≤84/85~112/113~168px); 확장은 10~25, 견적 확인 | 회전이 실제 필요한 가구 |
| `animate_object` | v3 최대 64px·8프레임 예시 방향당 1, pro 방향당 10~25 (비용 승인 필수) | 조명·분수 등 |
| `create_topdown_tileset` | standard 1, pro 타일 ≤32px 15 / 그 이상 25 | 바다·해안·잔디 경계 |
| `create_tiles_pro` / `create_path_tiles` | 타일 10~25 / 연결 길 10~25 (시트 크기·시점별) | 마루/길/지역 타일 |
| `create_map`, `edit_map`, `place_map_tiles`, `place_map_object`, `move_map_object`, `get_map` | 0, 이미 보유한 아트 배치 | 맵 구성 및 내보내기 |
| `inpaint_map` | ≤96px 5, ≤208px 6, ≤256px 9 (영역 긴 변) | 제한된 맵 영역 수정 |
| `create_room` | 20 (48/64px 타일 25), 가구 분리 추가 10 | 방 콘셉트/건축 키트 |
| `cut_out_room_furniture` | 10 | 합성 방을 빈 바닥·가구로 분리 |
| `create_ui_asset` | 10/15/25 (정사각 ≤256/≤341/그 이상, 비율별 차등) | 다이어리·HUD 요소 |
| `create_ui_states`, `create_font` | 금액은 라이브 도움말/제출 전 확인 | 버튼 상태·폰트(한글 검증 필요) |
| `create_portrait_character` | 16~64px 10, 128/160px 15 | 선택적 대화 초상화 |
| `create_vocal_animation` | 64px 이하·입 모양 7개 기본 3, 추가 패스 가능; `create_talking_gif` 무료 | 선택적 입 모양 (한글 립싱크 미지원 명세, 후순위) |
| `vfx_workbench` | 구독자 무료 | 하트·반짝임·구매 완료 연출 |

세부 비용은 절대 연속식으로 추정하지 않는다. 1방향 오브젝트는 길이 구간 16~32=10, 33~42=15, 43~64=10, 65~85=15, 86~128=10, 129~170=15, 171~256=10. 8방향은 다른 비용식이다. v3 애니메이션은 실제 생성 캔버스 × 프레임 수 / 65,536의 올림(최소 1) × 요청 방향 수; 프레임 크기/모드/시작 프레임 포함 여부에 따른 실제 비용은 제출 영수증을 기록한다. 마스크를 작게 해도 원본/출력 캔버스 기준 비용은 감소하지 않을 수 있다.

## 4. 캐릭터 기본 원본/8방향

### 제작 규격
- 캔버스: 신규 32×32 논리 픽셀(기존 원본 크기 일괄 변경 금지), 정수 픽셀, PNG 투명 배경, 알파 0/255, 물리적 발점과 밑 여백 정렬. 정수배 최근접 확대만 미리보기에서 사용.
- 머리:몸 약 2:1, 동물 특징이 명확한 대두형, 아주 짧은 두 팔/두 다리, 작은 눈/입. 승인 눈 디자인/수염(고양이)과 정체성 유지; 리본·벨·모자·의상 없는 기본 몸체. 색상은 승인 PNG의 실제 RGB에서 가져온다. 기존 스타일과 달라지는 팔레트 수치는 승인 전 확정하지 않는다.
- 기본 방향: south(정면), south-east, east, north-east, north(후면), north-west, west, south-west. 미들앵글 2.5D와 일치하는 `low top-down`을 우선 검토하며, `high top-down`은 비교 후보로만 사용한다. 시점 차이를 강제로 기울이거나 비등방 리사이즈하지 않는다.
- 새 ID의 정면 시안을 먼저 확정해야 한다. 기존 사족보행 고양이를 변형 원본으로 사용해 교체하지 않는다. 종별 대안/색상은 사용자가 승인한 기준 이미지에 맞추며 대량 동시 생성하지 않는다.

### 도구 선택
| 도구 | 실제 사용 방식 | 주의 |
| --- | --- | --- |
| `create_image_pixen` | 32px 정면 후보 단독 제작(1회 1 generation) | 원본 확정 전 회전 작업 금지 |
| `create_character` | mode=v3, size=32, body_type=humanoid, n_directions=8, 정면 reference_image_url | v3 레퍼런스는 정확히 정면이어야 함; 3/4 참조는 모든 방향이 틀어질 수 있음. v3와 pro는 캔버스 규격이 정확한 반면 standard는 여백 증가 |
| `create_character_pro_flash` | template_id=mannequin, width=height=32, n_directions=8; 무료 비용 견적 | 동물형이어도 두 발이면 mannequin. cat/dog 등의 템플릿은 네 발용. custom은 스켈레톤 애니메이션 제한 |
| `create_character` mode=pro | 고난도 스타일 일치·참조 콘셉트/팔레트용 | 기본 32px 10 generations; 필요할 때만. 모드에 따라 palette/style 제약이 있으므로 현재 계약 확인 |

영문 원본 프롬프트 예시(기존 32px 기준의 예시이며 신규 폴드 후보 선택·기존 고양이 교체 명령 아님):
```text
32x32 transparent pixel-art sprite of a tiny bipedal anthropomorphic cat companion.
Standing upright, large round head, very short rounded arms and legs, soft muted
pastel fur, small sleepy eyes matching the approved reference, tiny mouth,
cat whiskers, bare body without clothing or accessories. Clean one-pixel outline,
flat colors and one shading step, no blur, gradients, soft edges or background.
Front-facing south, fixed mid-angle 2.5D game camera, consistent grounded feet.
```

정면·측면·후면·대각선에서 눈의 위치, 귀·꼬리·발의 일관성, 몸통 길이, 투명 여백을 확인하고 8방향 시트를 승인한다. `get_character` 메타데이터로 실제 크기와 방향을 확인하며 `pixelart_workbench inspect`로 픽셀을 직접 검토한다. 새 자산만 보정·재저장한다.

## 5. 행동과 표정

| 순서 | 행동 | 목표 프레임/방향 | 모드 후보 |
| --- | --- | --- | --- |
| P0 | 기본 대기 | 2 / 기본 방향부터 | 실제 원본 + 무료 픽셀 편집(눈 깜빡임/귀 움직임) |
| P0 | 걷기 | 4 × 8방향 | v3 또는 pixminimax 4, template의 실제 프레임 수 확인 |
| P0 | 먹기 | 4 / 정면 시험, 필요 방향만 확대 | v3 또는 pixminimax |
| P0 | 쓰다듬기 | 3 / 정면 시험 | skeleton-v3 3 또는 4프레임 v3에서 선별 |
| P1 | 앉기·눕기 | 각각 2 / 정면 우선 | 승인된 정적 원본과 무료 편집 |
| P1 | 잠자기 | 3 / 정면 우선 | skeleton-v3 또는 4프레임에서 선별 |
| P1 | 놀기 | 4 / 정면 우선 | v3 또는 pixminimax |
| P2 | 친밀도 특별 표현 | 2~4 후보 | 기존 행동 재사용+하트 VFX |

목표는 [PET_CARE_SPEC](PET_CARE_SPEC.md)의 제작값이며 모든 생성기가 그대로 지원하지는 않는다. `animate_character`에서 v3는 4~16 짝수, pixminimax는 4의 배수(4~40), 커스텀 skeleton-v3는 3~15, 템플릿은 고유 프레임 수다. v3/pixminimax는 `keep_first_frame=false`라야 정확히 요청 개수, 기본 true면 시작 프레임이 더해진다. 2/3프레임을 억지로 요청하지 말고 핸드 픽셀 보정 또는 유효 프레임 선별로 맞춘다. 템플릿은 `get_character`가 제공한 available_animations의 실제 ID를 선택한다.

예시(의사 코드, 도구 스키마 확인 후 사용):
```python
animate_character(character_id=approved_new_id, mode="v3",
                  action_description="small gentle walking steps, fixed body scale",
                  animation_name="walk", directions=["south"],
                  frame_count=4, keep_first_frame=False)
# 단일 방향 검수 후 같은 animation_group_id와 animation_name으로 나머지 방향 추가
```

- 대칭 방향은 비대칭 무늬·소품이 없고 시각적으로 올바를 때만 `mirror_animation` 활용. 원본 방향과 실제 반대 방향의 네이밍을 검증한다.
- 표정: 기본, 행복, 졸림(콧방울), 슬픔(눈물), 놀람, 사랑, 어질어질, 부끄러움, 삐짐. 화남은 기본으로 대체. 얼굴 본체에 9종 전체를 매번 유료 생성하지 않고 눈/볼/땀/눈물/하트 등 작은 픽셀 수정/오버레이로 우선 구현할 수 있도록 아트를 제작한다. 표정과 행동 조합마다 얼굴/몸을 다시 생성하는 방식은 피한다.
- `create_character_state`는 필요시 먹을 것/장난감 자세 또는 특정 상태의 8방향 정적 비교 시안으로 사용한다. 애니메이션 및 분리 파츠를 자동 보장하지 않는다.
- 대사는 텍스트 말풍선과 짧은 표정 변화 중심. 포트레이트/입 모양 생성은 후순위. `create_talking_gif`는 라틴 문자 기반이라 한글 직접 립싱크를 보장하지 않는다.
- 수면, 가구에 앉기, 먹기 등 각 행동 마지막 프레임에서 다음 상태로 돌아가는 모습과 발점/손 위치를 확인. 시간·친밀도·상태 변화와 반복 돌보기 제한은 승인 명세를 따르며 아트 연출 자체로 재화를 지급하지 않는다.

## 6. 의상 및 소품

- 기본 몸체는 모든 파츠의 마스터. 머리(모자/머리띠), 목(리본/스카프), 몸통(옷), 손(장난감/음식)은 설계 후보 슬롯. 기준 프레임과 방향별 부착 좌표, 가려짐/전면·후면 레이어를 별도 기록하며 새로운 슬롯·상품·가격·기간 결정은 승인 절차를 따른다.
- 우선 첫 소품 1종을 정면에서 테스트하고 걷기 4프레임/8방향의 고정 앵커를 검수한다. 단색/대칭 소품은 `pixelart_workbench`에서 직접 분리 그리기/복제(무료), 복잡한 의상은 `transfer_outfit`으로 원본과 같은 캐릭터가 실제 의상 입은 참조 1장을 제공한다.
- `transfer_outfit`은 32~64px에서 한 호출 최대 15개의 입력 프레임(참조 1칸과 별개)과 원순서로 돌아오는 전체 착용 이미지. 프레임별 비용이 아니라 10 generations/호출; 8방향 걷기 4장씩 32프레임을 모두 이전한다면 15+15+2로 최소 3회=30 (방향별 묶음 품질을 우선하며, 8방향 각각 호출 시 80). 서로 다른 방향을 묶어 결과가 흐트러지면 방향별 비용을 별도 승인한다.
- 이 기능은 의상 레이어를 자동 분리하지 않는다. 새 이미지에서 기존 몸체·눈·색을 변경한 픽셀이 없는지 비교하고, 투명 의상 레이어를 별도로 편집한다. 자동 이미지 차분만으로 겹침·가려짐을 해결했다고 판정하지 않는다. 원본과 파츠를 다른 파일로 관리하며 방향별 전체 합성본을 QA 증거로 저장한다.
- 기본/착용/해제/걷기/앉기/눕기/가구와 접촉하는 포즈에서 파츠 떨림, 머리·꼬리 가림, 좌우 반전 오류를 비교. 의상 구매 유도 연출은 선택형이며 실제 구매 권한·재화와 독립.

## 7. 가구·실내 제작

1. 승인된 빈 방 및 기존 가구의 시점·상대 크기를 참조한다. 바닥/벽/상판 타입, 크기, 바닥 점유, 발점, 접촉 위치(침대 중심/의자 좌석), 소재별 팔레트부터 정한다.
2. 가구마다 독립 투명 PNG: 예시 침대·의자·책상·러그·책장·화분. `create_map_object` 단일 방향 또는 `create_image_pixen` 1 generation 시안, `create_1_direction_object` 후보 묶음/동일 스타일 선택. 기존 물건을 `import_object`로 무료 가져와 사용 가능. 투명도/팔레트 제약을 확인하고 이미 소유한 자산을 불필요하게 다시 생성하지 않는다. 8방향 회전은 실제 회전 기능 범위가 승인된 물건만.
3. 소재별 2색, 필요 시 3색 + 공통 짙은 갈색 윤곽은 별도. 가구 전체 3색으로 제한 금지. 1px 윤곽·불투명 픽셀·그라데이션 금지·단단한 명암. 승인 소재 마스크로 검증한다. 오래된 렌더러의 smoothing을 정상으로 간주하지 않는다.
4. 방에 가구·캐릭터를 합성하여 미들앵글, 하단 접지, y=72 경계/기존 footY 순서, 전면 선택, 실제 콘솔 가독성을 확인한다. 가구 반전은 비대칭·시점이 맞을 때만 한다. 가구 사용 미리보기는 실제 구매·배치 데이터와 분리한다.
5. LIFE-05 시즌 시안은 같은 목재·천 팔레트와 시점/스케일을 사용하는 세트로 제작. 침대·선반·러그 등 소량 먼저 승인, 나머지 확대. 기간과 소유 여부/테마 정책은 프로젝트 명세에 따른다.

### 방 생성 도구의 한계와 활용
`create_room`은 바닥 7×6 셀의 단일 방 구도 기본(32px 셀, top-down 결과 256×256), north/east/south/west 문 위치 지정(1~8), 같은 시점의 `style_room_id`로 벽/바닥 스타일 재사용, 타일 건축 키트 ZIP을 제공한다. top-down은 뒤 벽이 보이고, isometric은 2:1, oblique는 경사진 벽과 바닥만(현재 가구 없음). 그못섬은 등각/사다리꼴 구도를 채택하지 않으므로 top-down만 시안으로 비교한다. 기본 출력이 4:3도 170×128도 아니고 24×18 구조도 아니다. 무리하게 축소·늘리거나 현행 배경을 교체하지 않는다.

`pieces=false`로 방을 먼저 검수하고, 가구·빈 바닥 분리 필요시 `cut_out_room_furniture` 10 generations를 추가한다. `get_room`의 PNG·건축 키트·layers JSON 및 좌표 정보를 확인한다. 분리 결과의 그림자/투명도는 운영용 독립 가구 규격과 다를 수 있으므로 수동 QA 후 선별한다. 새 4:3 배경은 독립적인 구조물/타일과 승인된 실제 논리 해상도로 재조립하는 안을 사전 검토한다. `create_image_pixen` 대형 후보는 Tier 1 실제 크기 권한 확인하고 무리한 대형 생성을 하지 않는다.

## 8. 섬 월드맵 및 타일

- 목표 시안: 4:3, 파스텔 섬, 중앙 광장·집·상점·공원·하단 선착장, 길의 연속성과 명확한 클릭 영역. 현재 맵/이동 흐름 기준과 후보를 구분. 그못섬의 신규 타일 크기와 월드 좌표는 기존 구현/최신 승인으로 검증 전 고정하지 않는다.
- `create_topdown_tileset` standard 16/24/32 px(1 generation)로 바다→모래→잔디를 먼저 시험한다. 앞 타일셋의 공유 base tile ID를 다음의 lower/upper_base_tile_id에 이어 경계 색과 픽셀 연결을 통일한다. standard는 높은 탑다운 시점, palette 설정은 pro에서 사용한다. 승인 카메라에 맞춰 pro low top-down과 비교가 필요한 경우에만 비용 승인. 바다·지형의 walkable 명시를 검토한다.
- `create_tiles_pro` 독립 타일/terrain 그룹과 `create_path_tiles` 연결 길은 유료. 평면 정사각 바닥은 실제 표면이 겹치지 않도록 projection 확인. `import_tiles`는 보유 아트 재사용. `create_map` → `edit_map` / `place_map_tiles` → `place_map_object` → `move_map_object` → `view_map`으로 이미 생성한 아트 배치(무료). 두 지형 간 전이 타일이 없으면 경계가 끊길 수 있다.
- `get_map(export="pixellab")`에서 map.json 및 이미지 ZIP을 받아 현재 엔진용 데이터 변환안을 검토한다. 다른 엔진은 Godot/Unity 내보내기가 있으나 그못섬 저장 형식을 자동 대체하지 않는다. 길 막힘/출입구 연결/클릭 영역/레이어/모바일 가독성 검증. `inpaint_map`은 일부 맵 종류/레이어에서 불가하므로 먼저 확인.

## 9. 다이어리 및 상점 UI

| 화면 | PixelLab 제작할 에셋 | 게임 UI에서 유지하는 요소 |
| --- | --- | --- |
| 마이룸 | 상태바 틀, 네 상태 아이콘, 하단 주요 버튼·선택 상태 | 실제 상태 수치, 클릭 영역, 재화, 접근성 |
| 다이어리 | 펼친 파스텔 블루 링바인더·격자종이·인덱스·카드 틀 | 프로필/랭킹/미션 텍스트, 6개 핵심 메뉴+별도 설정 후보 |
| 상점/보관함 | 아이템 카드·탭·구매 버튼·기간/보유 배지 | 상품명, 가격, 잔액, 구매 가능/실패, 미리보기 |
| 월드맵 | 장소 아이콘·핀·팝업·이동 버튼 | 활성/잠김·이동 목적지, 상점 양쪽 접근 |
| 편집 모드 | 회전/이동/저장/취소 아이콘·선택 강조 틀 | 실제 가구 이동, 편집 상태, 충돌 안내 |

UI는 합성 이미지(감성 검토)와 실제 조각으로 나눈다. `create_ui_asset`은 패널·button/tab/health_bar 등 요소 또는 가상 좌표(pieces) 템플릿에서 디자인하며 256×256급 10 generations부터. 4:3 패널은 도구의 종횡비별 최대치 및 Tier 1 권한 확인. 256×192 같은 후보 크기도 실제 스키마와 요금 확인 뒤 작업. `style_image_base64`는 사용자 승인 레퍼런스의 색·도트 스타일을 복사하는 용도로, 레이아웃 복사를 보장하지 않는다. 고정형 레이아웃을 원하는 경우 pieces의 가상 좌표계와 결과 분리 후 실제 반응형 화면을 검수한다. `update_ui_asset(split=true)`로 분리, `create_ui_states`로 hover/pressed/selected/disabled 대안을 제작; 기본 상태와 크기/중심/밑줄/라벨의 대비를 맞춘다. 단순 색·버튼 상태는 직접 픽셀 편집으로 재사용을 우선한다.

다이어리는 기존 스크랩북 3:7 후보, 파스텔 블루/종이/얇은 윤곽을 유지하되 글자·수치·아이콘을 한 장의 배경에 고정하여 생성하지 않는다. 생성된 한글 글자/폰트가 읽히거나 한글 전체 문자를 포함한다고 가정하지 않는다. 한글 라벨은 접근 가능한 실제 텍스트로 구성하는 것을 기본으로 한다. 상점 접근/하단 버튼/상시 상태/가구 편집 모드는 사용자 선택 후보이며 구체적 구현 승인 및 현재 화면 비교가 필요하다.

## 10. 무료 편집·효과·검수 도구

| 도구 | 활용 |
| --- | --- |
| `pixelart_workbench(argv=["describe","cli"])` | 구독자 무료 픽셀 직접 편집의 명령/플래그 확인 |
| `pixelart_workbench` inspect / lint / split / join | 방향/프레임 시트 확인, 픽셀 수정, 정수 격자 분할·비교 시트, 결함 검토; 서버가 로컬 파일 경로를 직접 읽는다고 가정하지 않음 |
| `save_to_asset` | 새 갤러리 이미지 또는 승인된 신규 복제본에 무손실 픽셀 저장. 원본 덮어쓰기 금지. 프레임 재생 시간은 게임 메타데이터에서 별도 관리 |
| `vfx_workbench` | 구독자 무료로 하트, 청소 반짝임, 구매 축하 효과 조립·렌더. spritesheet PNG+JSON/GIF 다운로드. 과한 파티클·대형 프레임·반복 렌더링 금지 |
| `get_upload_url` | 작업 요청 범위의 레퍼런스를 업로드 경로로 전달. 토큰·회원 데이터 금지 |
| `export_asset` | ZIP/spritesheet/Aseprite/GIF 등. 캐릭터 ZIP의 회전/상태/행동별 프레임과 metadata 확인 |
| `list_projects`, `add_to_project`, `manage_project`, `update_*_tags` | PixelLab 폴더/게임 작업물 구분, 승인 ID 관리. 폴더는 프로젝트 분류용이고 게임 workspace/배포 없음 |

무료 편집은 PixelLab generation을 쓰지 않는다는 의미이며 Codex 사용량/서비스 별도 한도까지 무료라는 뜻은 아니다. `correct_pixelart`/인페인트는 유료이므로 QA 실패 픽셀의 직접 수정 우선. 프로젝트 에셋 파일은 [ASSET_CHECK](ASSET_CHECK.md)의 실제 스크립트와 프로필을 사용한다. 자동 검사는 PNG/알파/해상도/색/마스크를 확인할 뿐, 눈·정체성·카메라·가독성·앵커·움직임을 대신 승인하지 않는다.

### 검수 메타데이터 (작성 권장)
- 로컬 후보 파일/PixelLab asset ID, 부모 원본 ID, 이름/종/색상/방향/상태, mode/seed(제공된 경우), 프레임 수·크기·FPS/loop, 부착점/발점, 팔레트와 소재 마스크, 예상/실제 generation, 처리 결과, 시각 검수 및 승인 여부.
- 파일명 후보 예: `cat_pink_base_south.png`, `cat_pink_walk_south_000.png`, `cat_pink_accessory_head_beret_south.png`, `furniture_whitewood_bed.png`. 기존 파일명 규칙을 우선한다. 승인/미승인 시안을 구분하며 승인 에셋의 기존 경로를 바꾸지 않는다.
- 상태: DRAFT(시안) → REVIEW(검수) → APPROVED(시각 승인) → IMPLEMENTED(실제 게임 반영·검증). 요금과 PNG만 검증했다고 구현/배포 완료를 기록하지 않는다.

## 11. Game Builder — 기존 그못섬과 분리

공식 [Game Builder 설명](https://www.pixellab.ai/ai-game-builder)과 [MCP 안내](https://www.pixellab.ai/mcp)에 따르면 2D 브라우저 게임 템플릿(top-down/side-scroller), Phaser 4 + TypeScript 프로젝트, 에셋 연결·브라우저 플레이테스트·호스팅 및 멀티플레이어 기반을 제공한다. Tier 1부터 이용할 수 있으며 신규 아트는 정상 generation 차감. 코드 에이전트 사용량/호스팅·배포 세부 한도는 계정 안내 확인 전 무료/무제한으로 단정하지 않는다.

| 기능 | 그못섬 권장 활용 |
| --- | --- |
| 별도 Game Builder 프로젝트 | 신규 캐릭터 이동/가구 겹침/상태바·다이어리 레이아웃의 작은 기술 시연. 실제 repository·운영 DB·Discord 토큰·재화 연동 금지 |
| `list_projects(kind="game")`, `add_to_project` | 별도 게임에 승인 시안이나 테스트 자산 연결 |
| `sandbox_create_session`, `sandbox_read`, `sandbox_write`, `sandbox_edit`, `sandbox_run`, `sandbox_bash` | 별도 workspace의 코드 읽기·편집·실행·빌드; 구현 요청 및 승인 범위 내에서만 사용 |
| `sandbox_read_image`, `sandbox_playtest` | 스크린샷·실제 플레이 확인(배포된 preview_url이 필요한 경우 공개 승인 먼저) |
| `sandbox_sync`, `sandbox_deploy_worker`, `sandbox_undeploy` | 외부 동기화/배포/삭제 작업. 별도 승인 없이는 호출하지 않음 |

절차: 웹에서 테스트용 top-down 템플릿 선택 → 기존 아트 또는 신규 승인 후보 ID만 연결 → 가짜 상태·재화로 작은 기능 1개씩 시험 → 모바일/PC 확인 → 필요한 독립 PNG/JSON/관찰 결과만 기존 GitHub 프로젝트에 인계. 공식 설명의 `*.pixellab.run` 링크는 링크 보유자가 플레이 가능한 외부 공개 주소이므로 비공개라고 가정하지 않고 운영 데이터는 업로드하지 않는다. 자동 공개를 피할 수 있는지 확인하기 전 프로젝트 생성·공개 테스트를 진행하지 않는다. 기존 GitHub 코드의 무손실 가져오기/양방향 동기화/엔진 호환 자동 병합은 확인되지 않았다. **그못섬 기존 프로젝트는 Codex+GitHub에서 유지하고 Game Builder는 실험실로 활용한다.** 요금과 엔진의 편의성이 기존 로그인·저장·권한·경제를 자동 보장하지 않는다. 이번 문서 작업에서는 Game Builder 생성·배포·테스트를 하지 않는다.

## 12. 제작 순서와 초기 예산 예시

| 단계 | 승인 게이트 | 예시 generation |
| --- | --- | ---: |
| A | 기존 자산 조회, 스타일·좌표 대조 | 0 |
| B | 정면 2종 이내의 후보(각 1), 선정 1종의 8방향 v3 참조(1) | 3 |
| C | 걷기 8방향(8), 먹기 1방향(1), 놀기 1방향(1), 쓰다듬기 3프레임 skeleton 예시(2), 잠자기 3프레임 skeleton 예시(2); 대기/앉기/눕기·표정은 직접 편집 우선 | 14 |
| D | 첫 의상 정면 걷기 4프레임 + 같은 방향 참조 1개, transfer_outfit 1회 | 10 |
| E | 64px 가구 1방향 후보 묶음, 배치 비교 | 10 |
| F | 방 비교 시안 기본 타일 20 + 필요 시 가구 분리 10 | 30 |
| G | 바다-모래, 모래-잔디 standard 세트 2회, 맵 배치 무료 | 2 |
| H | 기본 UI 256×256급 패널 1회, VFX 편집 무료 | 10 |
| 합계 | 예시 한 사이클(반복·추가 방향·인페인트·UI 상태 및 권한 차이 제외) | 79 |

이 표는 가상의 최소 탐색비용이며 실제 소비나 구매 승인 한도가 아니다. 79/2,000은 월간 공개 기준 3.95%다. 남은 월간 수량은 `get_balance` 결과가 우선한다. 한 번에 모두 진행하지 않고 B의 정면 승인 → C 단일 방향 검수 → D/E 소품·가구 검수 → F/G/H 비교 순서를 적용. 실패/재생성이나 고해상도 작업은 별도 재견적한다. 특히 방향별 전체 의상을 여러 행동에 전송할 경우 호출 수가 빠르게 증가하므로 동일 팔레트·레이어 재사용을 우선한다.

## 13. Codex 실행 요청 양식

```text
AGENTS.md와 docs/quality/PIXELLAB_GUIDE.md 및 관련 승인 명세를 읽어 주세요.
역할: PixelLab 에셋 제작·검수
대상: 신규 이족보행 [종/색/행동 또는 에셋 종류]
목적: [단일 시안]
유지: 승인 원본, 기존 8방향 고양이, 빈방, 게임 코드, 좌표, 재화 및 DB
먼저 get_balance, search_help, 필요한 기존 자산 ID를 확인하고
도구·모드·규격·예상 generation·최대 사용량·검수 기준을 보고해 주세요.
제가 승인한 비용과 범위 안에서만 생성하고, 단일 방향/원본 확인 뒤에만 확장하세요.
결과는 후보 PNG 및 프레임 정보, 실제 차감량, 수치·시각 검수, 남은 문제로 보고하세요.
게임 소스/운영 에셋 교체/main 병합/배포는 별도 승인 전 하지 마세요.
```

## 14. 공식 출처 및 업데이트 방법

- [MCP 명세](https://api.pixellab.ai/mcp/docs): 모든 도구, 호출 인자, 가격·크기·내보내기 계약의 1차 출처. 특히 character/animation, object/tiles/map, room/UI, editing, project/sandbox, workbench, balance/jobs 항목.
- [가격 및 공식 튜토리얼 목록](https://www.pixellab.ai/): 구독 한도와 상업 라이선스, Game Builder·애니메이션·의상 상태·UI·인테리어 맵 영상 안내. 영상 전체를 시청했다고 주장하지 않는다.
- [MCP 사용 안내](https://www.pixellab.ai/mcp): Codex 등 AI 에이전트로 도구 이용, 동일 계정 자산, 워크벤치, 작업 영역. [공식 API 안내](https://www.pixellab.ai/llms.txt)는 REST용 참고이며 본 가이드의 MCP 계약을 대체하지 않는다.
- [시작 가이드](https://www.pixellab.ai/docs/getting-started): 초기 이미지/인페인트 반복 보정. [인페인트 v3](https://www.pixellab.ai/docs/tools/inpaint-v3): 플랜별 크기/요금.
- [Game Builder](https://www.pixellab.ai/ai-game-builder): 템플릿·엔진·호스팅/공유·Tier 1 여부. [VFX 안내](https://www.pixellab.ai/pixel-art-vfx-generator): 구독자 워크벤치와 내보내기.
- 도구 명세가 바뀌면 날짜·변경점·공식 근거·검증 여부를 남긴다. 코드/가격·게임 기능 변경 승인은 [DECISIONS](DECISIONS.md)와 AGENTS.md를 따른다. 신규 에셋 제작 전에 라이브 도구 도움말과 구독 잔액을 확인한다.
