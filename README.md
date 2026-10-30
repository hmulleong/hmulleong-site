# Hmulleong

흐물렁 캐릭터 아카이브 사이트예요. 내용은 전부 `data.json` 한 파일에 있어요.

## 파일 구성

| 파일 | 하는 일 | 고칠 일 |
|---|---|---|
| `data.json` | 캐릭터, 공지·소식, 축전·선물, 첫 화면 설정 | **자주** |
| `assets/` | 영상, 캐릭터 이미지, 축전 사진 | 이미지 추가할 때 |
| `index.html`, `style.css`, `app.js` | 디자인과 동작 | 거의 안 건드려요 |

## 수정하는 법 (GitHub 웹에서)

1. 저장소에서 `data.json`을 누르고, 오른쪽 위 **연필 아이콘**을 눌러요.
2. 내용을 고치고 **Commit changes**를 눌러요.
3. 1분쯤 뒤 사이트에 반영돼요. (안 바뀌면 새로고침)

### 이미지 올리기

1. `assets` 폴더로 들어가서 **Add file → Upload files**로 사진을 올려요.
2. `data.json`에 `"assets/올린파일이름.jpg"`처럼 적어요.
   - 파일 이름은 **영어·숫자·`-`·`_`** 로만 지어주세요. (예: `dotaeho-cover.jpg`)
   - 한 장에 2~3MB 이하가 좋아요.

## data.json 칸 설명

### 첫 화면 (`site`)
```json
"site": {
  "name": "Hmulleong",              ← 필기체로 써지는 이름
  "video": "assets/hero.mp4",        ← 배경 영상 (MP4 또는 GIF)
  "poster": "assets/hero-poster.jpg",← 영상이 뜨기 전 보이는 사진
  "opacity": 60,                     ← 영상 진하기 (10~100)
  "outro": "《얕은 캐릭 없음. 빠져나갈 수 없음 주의》",
  "pushoong": "https://푸슝-주소",       ← 비워두면 푸슝 칸이 안 보여요
  "platforms": [                     ← 아래 Links 칸에 나오는 앱 링크
    { "label": "Caveduck", "url": "https://...", "note": "한 줄 설명(선택)" },
    { "label": "Bloom",    "url": "", "note": "" }
  ]
}
```

- `url`이 빈 항목은 사이트에 안 보여요. 주소만 채우면 나타나요.
- 앱을 더 넣으려면 `{ "label": "앱 이름", "url": "https://...", "note": "" }`를 쉼표로 이어 붙이면 돼요.
- 푸슝이나 앱 링크가 하나라도 있으면 메뉴에 **Links**가 생기고, 축전·선물 아래에 Links 칸이 나와요.

### 캐릭터 (`chars`) — 적은 순서대로 카드가 나와요
```json
{
  "id": "dotaeho",                   ← 영어로, 겹치지 않게 (주소에 쓰여요)
  "name": "도태호",
  "role": "한 줄 소개",
  "tags": ["소꿉친구", "순애"],
  "cover": "assets/dotaeho.jpg",     ← 세로 3:4 이미지 추천
  "links": [                         ← 몇 개든 OK. 적은 순서대로 버튼이 나와요
    { "label": "Caveduck", "url": "https://..." },
    { "label": "Bloom",    "url": "https://..." }
  ],
  "body": "소개글.\n\n빈 줄(\\n\\n)로 문단을 나눠요. **이렇게** 감싸면 굵게.",
  "adult": false,                    ← true면 19 표시 + 인증 전 잠김
  "adultBody": ""                    ← 성인 인증한 사람에게만 보이는 설정
}
```

### 공지·소식 (`posts`)
```json
{
  "id": "update-1031",
  "kind": "notice",                  ← notice(공지) / update(업데이트) / news(소식)
  "title": "제목",
  "date": "2026-10-31",
  "pinned": false,                   ← true면 맨 앞 흰 칸에 고정
  "cover": "",
  "link": "",
  "body": "본문"
}
```

### 축전·선물 (`gifts`)
```json
{
  "id": "gift-1",
  "kind": "축전",                    ← 축전 / 선물
  "image": "assets/gift-1.jpg",
  "title": "작품 제목",
  "from": "보내주신 분",
  "date": "2026-10-31",
  "note": "메모 (없으면 빈칸)"
}
```

## 실수했을 때

- 사이트에 "data.json을 불러오지 못했어요"가 뜨면 **쉼표나 따옴표**가 빠진 거예요.
  - 항목과 항목 사이에는 쉼표 `,`가 있어야 하고, 마지막 항목 뒤에는 쉼표가 없어야 해요.
  - 글 안에 큰따옴표를 쓰려면 `\"`로 적어요.
- 이전 상태로 되돌리려면: 저장소의 **History(시계 아이콘)** 에서 이전 버전을 볼 수 있어요.

## 성인 인증에 대해

출생 연도를 스스로 입력하는 안내형 인증이에요. 본인확인은 아니고, 잠긴 내용도 페이지 파일에는 들어 있어요. 수위 높은 상세 서사는 자체 인증이 있는 플랫폼에 두고 `link`로 연결하는 걸 추천해요.

