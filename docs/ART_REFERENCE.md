# 그못섬 디자인 레퍼런스 아카이브

- 2026-11-17 KST / **REFERENCE · REVIEW**: 사용자 첨부 자료와 이번까지 수집한 링크를 정리한 연구 자료. 최종 에셋 승인이나 게임 반영을 뜻하지 않는다.
- 적용 기준은 [ART_STYLE_GUIDE](ART_STYLE_GUIDE.md), 현재 규격/보호 대상은 [기존 제작 기준](pixel-asset-style-guide.md)을 따른다.
- 타 작품 그래픽·캐릭터·도안은 스타일을 분석하기 위한 참조다. 원본 재배포, 트레이싱, 그대로 게임에 삽입, 저작권/라이선스 미확인 입력의 생성 사용은 금지한다. 이 저장소가 공개되어 있으므로 사용자 첨부 원본/개인 화면·제3자 스프라이트 파일을 복제하지 않고 이름·링크·분석만 기록한다.

## 1. 사용자 첨부 — 무엇이 귀여운가

| 자료 | 관찰 및 논리 픽셀(추정) | 가져올 것 / 피할 것 |
| --- | --- | --- |
| Baby Pomi/Pomi 커서 GIF(13A74377…; 동일 이름의 중복본), 쿠로미 커서(43135709…), 시나모롤 커서(682EFCD3…), 마이멜로디 커서(9B10F06A…) | 핑크·검정·하늘색 등 같은 캐릭터의 여러 포즈, 커서/상태 표시·작은 장식 세트 | 얼굴 여백, 작은 덩어리, 포즈 전환으로 개성. 모든 캐릭터를 같은 형상에 색만 변경하거나 UI 포인터를 그대로 복제하지 않음 |
| IMG_6003.jpeg 핑크 커서 시트, F1B1677E… GIF 하늘 리본·긴 귀 동물 | 단순한 얼굴·작은 신체, 픽셀 기반 표정/자세 변화 | 말랑한 큰 머리와 작은 몸, 최소 디테일. 리본은 기본 몸체에 고정하지 않음 |
| A12AAC2E…jpeg 햄버거와 노란 고양이 일러스트 | 큰 눈·볼·짧은 팔다리, 음식과 캐릭터의 상호작용 | 캐릭터 생활 연출 아이디어, 원본의 렌더링이나 채도는 직접 기준으로 삼지 않음 |
| IMG_6489.jpeg·IMG_6500.jpeg 파스텔 동물/디저트 마스코트 | 축소 화면에서도 컵케이크/동물의 실루엣과 색 구분 | 종마다 몸·귀·꼬리·소품 특징 차별화, 음식 모티프도 한 가지 주요 특징으로 제한 |
| IMG_6501.png 및 초기 R2 시안 (DDB93D9C…png) | 초기 고양이 후보/정면 도트 결과 | 실패 원인(각진 윤곽, 과도한 단순화) 비교 자료; 승인 에셋 아님 |
| IMG_6534.jpeg 파스텔 갈색/하늘 긴 귀 동물 | 각 캐릭터 실제 차지 영역 약 35~37×22 그리드 | 가로로 넓은 얼굴, 넓은 미간, 극단적으로 작은 몸, 색에 맞춘 외곽선. 긴 귀의 원형 복제 금지 |
| IMG_6535.jpeg 핑크 긴 귀 동물 | 약 29×20 | 작은 눈·입과 얼굴 여백, 32px 수준에서도 인상 구분 가능 |
| IMG_6537.jpeg 리본 곰 비즈 도안 | 도안 표기 67×62, 31색 | 복잡한 장식/실루엣도 픽셀로 표현 가능. 전신 이동 스프라이트에 이 정도 밀도/색수 강제하지 않음 |
| IMG_6538.jpeg 검은 머리 인간 SD 비즈 도안 | 격자 52×52, 캐릭터 영역은 더 작음 | 머리/얼굴 아래쪽에 밀집한 눈·입, 간단한 몸, 옷·헤어 차이로 개성 표현 |
| IMG_6539.jpeg 두 인간 SD 도안 | 합본 격자 67×41, 개별은 대략 35×40 이하 | 같은 비례 안에서 헤어·눈·복장·포즈로 차별화. 합본 격자를 단일 스프라이트 크기로 오해하지 않음 |
| IMG_6540.jpeg 금발 SD 도안 | 격자 43×50, 캐릭터 실제 영역 약 39×36 | 얼굴 중심 비례·작은 몸, 의상 장식과 손 위치 |
| IMG_6542.jpeg 파랑/보라 캐릭터와 표정 아이콘 | 전신은 약 33×41 / 43×32, 얼굴 아이콘은 별도 | 기하학적 실루엣·각자의 포인트, 얼굴만으로 상태를 읽는 방법 |
| IMG_6543.jpeg 햄토리 6포즈 | 포즈별 대략 24~32px 수준 | 작은 스프라이트에서 얼굴·팔·몸 전체를 바꾸는 표정과 행동 |
| IMG_6544.jpeg 파치리스 | 약 44×49로 추정 | 꼬리·귀 등 종별 주요 특징이 한눈에 보이는 실루엣, 3/4 방향과 명암 |
| IMG_6551.png Hamtaro Rainbow Rescue 원본 스프라이트 시트 | 시트 789×754 표시 픽셀; 개별 이동 프레임은 훨씬 작고 얼굴/코스튬 표정은 별도 크기 | 대기/이동, 좌우 당기기, 나무, 합류, 땀, 미끄럼, 겁, 풍선, 다양한 표정, 의상 변화의 행동 체계. 원작의 스프라이트 복제 대신 움직임 원리 분석 |

위 수치는 확대 이미지의 픽셀 계단 또는 표기 격자를 이용한 대략적인 판독치다(정확한 원본 논리 크기·팔레트 미확인). 격자 캔버스, 투명 여백을 제외한 유효 캐릭터 bbox, 화면 표시 크기, 합본 시트 크기를 각각 구분한다. 비즈 도안은 정적 그림의 표현력 참고이며 게임 스프라이트 규격 증거가 아니다. IMG_6497~6498(도구 화면), IMG_6507~6517 및 IMG_6524~6529(작업 대화/보고), 85ADCC7E…·AB1559A0…·ADDDBD5A…·CCB82142… PNG(후보 시트)는 아래 자체 실험 기록으로 분류한다.

## 2. 자체 실험 (사용자 제공 Codex 결과 보고 기준)

- 초기 텍스트 위주 생성 및 R2는 실제 이미지 참조 부족/과도한 단순화 등의 문제로 재검토. 색수 자체만으로 판단하지 않는다.
- 실제 레퍼런스를 넣은 PixelLab Pro 정면 비교: 32×32 독립 1회 64후보, 48×48 독립 1회 25후보, 합계 89. 동일 참조/프롬프트/시드, style 이미지 및 참조 이미지 3개 입력, palette·max_colors 미지정. 보고상 전부 투명 PNG, 알파 0/255, 원본 픽셀 보존; 이 문서 작업에서 원본 89개를 재검증한 것은 아니다.
- 32px 추천: S32-37, 54, 63, 18, 24. 큰 도트 덩어리 장점, 각진 머리, 눈이 닫힌 선처럼 보이는 문제.
- 48px 추천: S48-22, 10, 01, 07, 24. 얼굴 윤곽/눈의 여유가 더 좋음. S48-22는 새침한 눈과 균형, S48-01은 친근한 인상; 모두 미선택. S48-02/04/16/23의 접힌 귀 실루엣은 새 폴드 후보 참고(강아지처럼 읽히는 모양은 피함).
- 기존 48px 후보는 일부 캐릭터의 bbox가 캔버스보다 상당히 작고 몸통이 길다. 캔버스 확장은 디테일 자동 향상을 보장하지 않는다.
- 보고된 과금 20.2 generations = 참조 전처리 0.2 + 32px Pro 10 + 48px Pro 10. 당시 잔여 1,975.80, 재생성/유료 수정 제외. 과거 영수증일 뿐 현재 잔액·차후 비용 보장 아님.
- 다음 비교안은 48·64px 독립 생성 및 실제 화면 비교(32px 기존 결과 대조). 아직 생성하거나 선택하지 않음.

## 3. 게임 스프라이트 레퍼런스 — 우선순위별 링크

모든 링크는 수집한 열람 출처이며, 팬 아카이브와 공식/상업 배포처를 구분한다. 상세 링크는 개별 시트의 예시; 원본 사용 허가와는 별개다.

| 우선 | 작품/아카이브 | 집중할 요소 |
| --- | --- | --- |
| ★★★ | [Hamtaro Rainbow Rescue](https://www.spriters-resource.com/game_boy_advance/hamtarorr/) · [햄토리 시트](https://www.spriters-resource.com/game_boy_advance/hamtarorr/asset/19723/) | 전체 행동 설계의 핵심: 작은 몸에서 표정과 행동의 자유, 포즈별 중심 이동, 확대 얼굴·코스튬 분리 |
| ★★★ | [Hamtaro Ham-Ham Heartbreak](https://www.spriters-resource.com/game_boy_advance/hamtarohamhamheartbreak/) · [시트](https://www.spriters-resource.com/game_boy_advance/hamtarohamhamheartbreak/asset/26220/) | 감정과 몸짓의 결합, 도구/의상, 캐릭터끼리 상호작용 |
| ★★ | [Ham-Ham Games](https://www.spriters-resource.com/game_boy_advance/hamtarohamgames/) · [Ham-Hams Unite!](https://www.spriters-resource.com/game_boy_gbc/hamtaroham/) | 미니게임·집단 행동, 저해상도 동작 명료성 |
| ★★★ | [Pokémon Mystery Dungeon Red Rescue Team](https://www.spriters-resource.com/game_boy_advance/pokemonmysterydungeonredrescueteam/) · [Explorers of Sky](https://www.spriters-resource.com/ds_dsi/pokemonmysterydungeonexplorersofsky/) · [초상화](https://www.spriters-resource.com/ds_dsi/pokemonmysterydungeonexplorersofsky/asset/24968/) | 종별 비례·실루엣, 이동 방향과 시점, 다른 표정의 초상화 분리 |
| ★★★ | [PMD SpriteCollab](https://sprites.pmdcollab.org/) · [PortraitCollab](https://portraits.pmdcollab.org/) · [협업 저장소](https://github.com/PMDCollab/SpriteCollab) | 원작 및 커뮤니티 작품의 포즈/방향/프레임/앵커 구조 연구; 각 자산 출처·라이선스 별개 |
| ★★★ | Chocoken Sweets Wagon: [Clement/Orange](https://www.spriters-resource.com/ds_dsi/chocokennodekitatesweetswagon/asset/473372/) · [Kirsch](https://www.spriters-resource.com/ds_dsi/chocokennodekitatesweetswagon/asset/473375/) · [Blue/Bitter](https://www.spriters-resource.com/ds_dsi/chocokennodekitatesweetswagon/asset/473003/) · [Sweets Department Creamy/White](https://www.spriters-resource.com/ds_dsi/chocokennosweetsdepartment/asset/460953/) | 동글동글한 얼굴, 작은 몸과 음식 테마, 종/색/성격을 동시에 구분하는 귀여움 |
| ★★★ | [Tamagotchi Connection Corner Shop](https://www.spriters-resource.com/ds_dsi/tamagotchiconnectioncornershop/) · [On](https://www.spriters-resource.com/lcd_handhelds/tamagotchion/) · [M!x](https://www.spriters-resource.com/lcd_handhelds/tamagotchimx/) · [Smart](https://www.spriters-resource.com/lcd_handhelds/tamagotchismart/) · [4U](https://www.spriters-resource.com/lcd_handhelds/tamagotchi4u4u/) · [기종 모음](https://www.spriters-resource.com/lcd_handhelds/T.html) | 돌보기/상점/감정/진화, 짧은 루프, 캐릭터별 독특한 형태·색 포인트. Sanrio 협업은 비례와 인상만 참고 |
| ★★ | [Magical Starsign](https://www.spriters-resource.com/ds_dsi/magicalstarsign/) · [Lassi](https://www.spriters-resource.com/ds_dsi/magicalstarsign/asset/218692/) · [Mokka](https://www.spriters-resource.com/ds_dsi/magicalstarsign/asset/218729/) · [Gelato](https://www.spriters-resource.com/ds_dsi/magicalstarsign/asset/218820/) · [Sorbet](https://www.spriters-resource.com/ds_dsi/magicalstarsign/asset/218735/) | 인간형/동물형 SD의 다양한 비례, 옷과 움직임 |
| ★★ | [Pururun! Shizuku-chan](https://www.spriters-resource.com/ds_dsi/pururunshizukuchanmeironomorinodoubutsutachi/) | 다양한 동물의 귀/꼬리/얼굴, 작은 크기에서 종 차별화 |
| ★★ | [Kirby & the Amazing Mirror](https://www.spriters-resource.com/game_boy_advance/kirbyandtheamazingmirror/) · [Kirby](https://www.spriters-resource.com/game_boy_advance/kirbyandtheamazingmirror/asset/2664/) · [The Legendary Starfy](https://www.spriters-resource.com/ds_dsi/legendarystarfy/) · [Yoshi's Island](https://www.spriters-resource.com/snes/yoshiisland/) · [분리형 시트](https://www.spriters-resource.com/snes/yoshiisland/asset/91914/) | 눌림·늘어남·예비동작·반동, 몸 전체로 감정/행동 표현. 격투/플랫폼 액션을 그대로 이식하지 않음 |
| ★ | [Snoopy Tennis](https://www.spriters-resource.com/game_boy_gbc/snoopytennis/asset/247437/) · [MapleStory](https://www.spriters-resource.com/pc_computer/maplestory/) · [Kino](https://www.spriters-resource.com/pc_computer/maplestory/asset/22057/) | 최소 픽셀로 동물 움직임, 펫 대기·반응 루프 및 다양한 실루엣 |

## 4. 공간·가구·꾸미기·UI

| 참조 | 가져올 요소 / 피할 요소 |
| --- | --- |
| [Hello Kitty Happy Party Pals](https://www.spriters-resource.com/game_boy_advance/hellokittyhappypartypals/) · [방 시트](https://www.spriters-resource.com/game_boy_advance/hellokittyhappypartypals/asset/40291/) | 파스텔 실내, 친근한 생활 오브젝트. 아카이브가 제한적이므로 캐릭터 애니메이션 자료까지 있다고 가정하지 않음 |
| [Dogz 2 소녀 방](https://www.spriters-resource.com/game_boy_advance/dogz2/asset/4098/) · [소년 방](https://www.spriters-resource.com/game_boy_advance/dogz2/asset/4093/) · [공원](https://www.spriters-resource.com/game_boy_advance/dogz2/asset/4104/) | 펫과 가구의 상대 크기, 미들앵글 실내·외부 동선 |
| [Harvest Moon: Friends of Mineral Town](https://www.spriters-resource.com/game_boy_advance/hmfomt/) · [More Friends](https://www.spriters-resource.com/game_boy_advance/hmmfomt/) | GBA식 생활 밀도·타일 그리드·출입구·소품, 과한 시점 혼합 피하기 |
| [Stardew Valley](https://www.spriters-resource.com/pc_computer/stardewvalley/) · [가구](https://www.spriters-resource.com/pc_computer/stardewvalley/asset/126521/) · [정면 관련 시트](https://www.spriters-resource.com/pc_computer/stardewvalley/asset/169588/) · [동물 모자](https://www.spriters-resource.com/pc_computer/stardewvalley/asset/224027/) · [고양이](https://www.spriters-resource.com/pc_computer/stardewvalley/asset/77888/) | 발점·벽/바닥 배치·독립 가구, 반복 가능한 방향/착용 파츠 |
| [LimeZu Modern Interiors](https://limezu.itch.io/moderninteriors) | 독립 가구와 모듈형 캐릭터·의상·애니메이션 설계. 라이선스 확인 전 에셋 미사용 |
| [Riclmbr 32×32 동물](https://riclmbr.itch.io/cute-pixel-animals-114-animated-animals-32x32) · [Hikari 32×32 펫](https://hikari-ex.itch.io/cute-pixel-pets-pack-animated-cat-dog-32x32) · [itch 탐색](https://itch.io/game-assets/tag-32x32/tag-cute/tag-pixel-art) | 32px의 행동 프레임/종 구분이 가능한지 비교; 팩의 스타일을 그대로 채택하지 않음 |
| [Cattails](https://cattailsgame.com/) · [Snacko](https://store.steampowered.com/app/1125510/Snacko/) | 고양이 생활·공간 탐색·꾸미기 경험. Snacko는 3D/2.5D 공간 경험 참고, 픽셀 캔버스 기준 아님 |
| [Cocoro no Cocoron](https://www.spriters-resource.com/ds_dsi/cocoronococoron/) · [Cinnamoroll 카페 UI](https://www.spriters-resource.com/ds_dsi/cinnamorollohanashishiyokirakiradekorecafe/asset/549051/) · [The Urbz](https://www.spriters-resource.com/game_boy_advance/urbzsimsinthecity/) | 카드·장식·카페 메뉴·생활 요소의 보조 탐색 자료. 실제 개별 시트는 추가 확인 필요 |
| 사용자 언급 KiiiKiii 펼쳐지는 책, 2000년대 링바인더·다이어리·스크랩북 UI | 책 펼침, 인덱스, 겹친 종이, 미션 스티커, 탐색의 재미. 정확한 KiiiKiii 참고 URL 미확인; 상호작용은 가벼운 전환 중심 |
| 사용자 언급 포코피아, 포켓몬 DS RPG, 레트로 생활 게임 | 공간 발견→수집→배치의 재미, 섬/광장/상점/공원/선착장 연결. 특정 작품의 화면·UI·캐릭터를 그대로 복제하지 않음 |

## 5. 레퍼런스 사용 순서

1. 얼굴/비례(사용자 선호 도안·커서) → 행동(Hamtaro) → 종별 실루엣(PMD/Chocoken/Tamagotchi) → 파츠(LimeZu/PMD) → 공간(GBA·DS) → UI(다이어리/책)로 역할을 분리한다.
2. 한 이미지에 모든 요소를 혼합하지 않는다. 원하는 레퍼런스의 속성만 텍스트로 명시하고 실제 사용 권리 확인된 이미지에 한하여 역할별로 참조한다.
3. 원본 픽셀 크기·bbox·팔레트·알파·시점·앵커·포즈별 차이를 먼저 기록한 뒤, [디자인 기준](ART_STYLE_GUIDE.md)의 실제 게임 합성 검수와 단계별 승인을 따른다.
