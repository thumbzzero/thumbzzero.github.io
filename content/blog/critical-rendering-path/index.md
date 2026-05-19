---
title: "Critical Rendering Path"
date: "2026-05-19"
description: "브라우저가 HTML, CSS, JavaScript를 화면에 픽셀로 그려내기까지의 과정, Critical Rendering Path를 알아보자"
tags: ["Browser"]
---

## Critical Rendering Path란?

브라우저가 서버로부터 HTML을 받아서 화면에 픽셀로 그려내기까지의 과정을 [**Critical Rendering Path(CRP)**](https://developer.mozilla.org/ko/docs/Web/Performance/Guides/Critical_rendering_path) 라고 한다.

이 과정을 이해하면 "왜 이 페이지는 느리지?", "왜 스타일이 잠깐 깨졌다가 적용되지?" 같은 문제의 원인을 파악할 수 있다.

크게 아래 단계로 이루어진다.

```
HTML 파싱 → DOM 생성
CSS 파싱 → CSSOM 생성
DOM + CSSOM → Render Tree 생성
Layout
Paint
Composite
```

하나씩 살펴보자.

---

## 1. DOM 생성

브라우저는 서버로부터 받은 HTML을 한 줄씩 읽으면서 **DOM(Document Object Model)** 트리를 만든다.

```html
<html>
  <body>
    <h1>안녕하세요</h1>
    <p>반갑습니다</p>
  </body>
</html>
```

이 HTML은 아래와 같은 트리 구조로 변환된다.

```
Document
└── html
    └── body
        ├── h1 ("안녕하세요")
        └── p ("반갑습니다")
```

이때 HTML을 파싱하다가 `<script>` 태그를 만나면 **파싱이 멈춘다.** JavaScript가 DOM을 변경할 수 있기 때문에 브라우저가 일단 JS를 먼저 실행하고 다시 파싱을 재개한다. 그래서 `<script>` 태그를 `<body>` 맨 아래에 두거나 `defer` 속성을 쓰는 게 일반적이다.

`defer`를 쓰면 JS 파일을 백그라운드에서 다운로드하면서 HTML 파싱을 계속 진행하고, 파싱이 완전히 끝난 뒤에 JS를 실행한다. 파싱을 블로킹하지 않으니 초기 렌더링이 빨라진다.

```html
<script defer src="app.js"></script>
```

---

## 2. CSSOM 생성

HTML 파싱 중 `<link rel="stylesheet">` 를 만나면 CSS 파일을 받아서 **CSSOM(CSS Object Model)** 트리를 만든다.

CSSOM은 DOM과 비슷한 트리 구조인데, 중요한 특징이 있다. CSS는 **cascading** 특성상 부모의 스타일이 자식에게 상속되기 때문에, 브라우저는 CSS를 전부 파싱하기 전까지 CSSOM을 완성할 수 없다.

즉, **CSS는 렌더링을 블로킹한다.** CSS 파일이 늦게 로드되면 그만큼 화면이 늦게 그려진다.

---

## 3. Render Tree 생성

DOM과 CSSOM이 완성되면 두 트리를 합쳐서 **Render Tree**를 만든다.

Render Tree에는 실제로 화면에 보이는 요소만 포함된다. 예를 들어 `display: none`이 적용된 요소는 Render Tree에 포함되지 않는다. (참고로 `visibility: hidden`은 공간은 차지하므로 Render Tree에 포함된다.)

---

## 4. Layout (Reflow)

Render Tree가 완성되면 각 요소의 **크기와 위치**를 계산한다. 이 과정을 **Layout** 또는 **Reflow**라고 한다.

뷰포트 크기, 폰트 크기, 요소의 width/height 등을 기반으로 화면 어디에 얼마나 크게 그릴지 계산한다.

이 과정은 비용이 크다. 특히 DOM 요소의 크기나 위치를 JS로 변경하면 Layout이 다시 일어나는데, 이게 자주 발생하면 성능 저하로 이어진다.

---

## 5. Paint (Repaint)

Layout이 끝나면 실제로 픽셀을 채워넣는 **Paint** 단계가 진행된다. 색상, 배경, 그림자, 텍스트 등을 그린다.

Layout과 마찬가지로 스타일 변경이 생기면 다시 발생한다. 다만 `color`, `background-color` 같은 변경은 Layout은 건드리지 않고 Paint만 다시 일어난다.

---

## 6. Composite

마지막으로 여러 레이어를 합성해서 최종 화면을 만드는 **Composite** 단계다.

`transform`, `opacity` 같은 속성은 Layout과 Paint를 건드리지 않고 Composite 단계에서만 처리된다. 그래서 애니메이션을 만들 때 `left/top` 대신 `transform`을 쓰는 게 성능상 유리한 이유가 여기 있다😄

---

## 정리

```
HTML 파싱    → DOM 생성        (script 태그 만나면 파싱 블로킹)
CSS 파싱     → CSSOM 생성      (렌더링 블로킹)
DOM + CSSOM  → Render Tree    (display:none 제외)
Layout       → 크기/위치 계산  (비용 큼)
Paint        → 픽셀 채우기     (색상, 배경 등)
Composite    → 레이어 합성     (transform, opacity는 여기서만)
```

이 흐름을 알고 있으면 성능 문제가 생겼을 때 어느 단계에서 병목이 생기는지 좁혀나갈 수 있다.

예를 들면 이런 식이다.

- **페이지 첫 로딩이 느리다** → `<head>`에 파싱을 블로킹하는 `<script>`가 있는 건 아닌지, CSS 파일이 너무 크지 않은지 (DOM 파싱 / CSSOM 생성)
- **스타일이 잠깐 깨졌다가 적용된다** → Render Tree가 두 번 만들어지면서 Paint가 두 번 일어나는 것. CSS가 `<head>`가 아닌 곳에 있거나, JS로 동적으로 삽입되거나, 웹폰트가 늦게 로드되는 경우에 발생한다 (Render Tree)
- **스크롤할 때 버벅인다** → JS가 매 프레임마다 `offsetHeight` 같은 값을 읽어서 강제로 Reflow를 유발하는 건 아닌지 (Layout)
- **애니메이션이 끊긴다** → `left/top` 대신 `transform`으로 바꾸면 Composite만 일어나서 개선되는 경우가 많다 (Composite)
