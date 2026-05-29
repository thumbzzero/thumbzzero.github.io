---
title: "Reflow와 Repaint"
date: "2026-05-29"
description: "브라우저 렌더링 성능에 직접적인 영향을 미치는 Reflow와 Repaint"
tags: ["Browser", "JavaScript"]
---

브라우저가 화면을 그리는 과정 중 **Layout(Reflow)** 과 **Paint(Repaint)** 단계는 성능에 직접적인 영향을 미친다.

---

## Reflow란?

요소의 **크기나 위치가 변경**될 때 브라우저가 Layout을 다시 계산하는 과정이다.

Reflow가 발생하는 대표적인 상황들이다.

- DOM 요소 추가/삭제
- 요소의 width, height, margin, padding 변경
- 폰트 크기 변경
- 브라우저 창 크기 변경
- `offsetWidth`, `scrollTop` 같은 레이아웃 관련 속성 읽기

특히 마지막 경우가 함정인데, JS에서 레이아웃 관련 속성을 읽는 것만으로도 Reflow가 발생한다. 브라우저가 최신 값을 반환하기 위해 강제로 Layout을 재계산하기 때문이다.

---

## Repaint란?

요소의 **시각적 스타일이 변경**될 때 픽셀을 다시 그리는 과정이다. Reflow 이후에는 항상 Repaint가 따라온다.

Repaint만 발생하는 상황 (Reflow 없이) 은 아래와 같다.

- `color`, `background-color` 변경
- `visibility` 변경
- `box-shadow` 변경

---

## 왜 줄여야 하나?

Reflow와 Repaint는 **비용이 크다.**

특히 Reflow는 해당 요소뿐만 아니라 **주변 요소, 심지어 부모/자식 요소까지 영향을 미친다.** 한 요소의 크기가 바뀌면 주변 레이아웃이 전부 다시 계산될 수 있기 때문이다. 이게 반복되면 버벅임이 생긴다.

---

## 줄이는 방법

**1. 읽기/쓰기 분리 — Forced Synchronous Layout 방지**

브라우저는 성능 최적화를 위해 스타일 변경 사항을 즉시 반영하지 않고 **모아뒀다가 한 번에 처리**한다. 이를 **배치(batch) 처리**라고 한다.

근데 JS에서 `offsetWidth` 같은 레이아웃 관련 속성을 읽으면, 브라우저는 최신 값을 반환하기 위해 모아둔 변경 사항을 즉시 처리해버린다. 이걸 **Forced Synchronous Layout**이라고 한다. 변경 사항을 배치로 처리하지 못하고 강제로 동기적으로 Reflow가 일어나는 것이다.

읽기/쓰기가 반복되면 매 반복마다 Forced Synchronous Layout이 발생한다.

```javascript
// ❌ 읽고 쓰기가 반복되면서 매번 Forced Synchronous Layout 발생
for (let i = 0; i < elements.length; i++) {
  const width = elements[i].offsetWidth; // 읽기 → 즉시 Reflow 강제 발생
  elements[i].style.width = width + 10 + 'px'; // 쓰기
}
```

읽기를 먼저 다 끝내면 브라우저가 쓰기를 모아서 한 번에 처리할 수 있다.

```javascript
// ✅ 읽기 먼저, 쓰기 나중에 → Forced Synchronous Layout 방지
const widths = elements.map(el => el.offsetWidth); // 읽기
widths.forEach((width, i) => {
  elements[i].style.width = width + 10 + 'px'; // 쓰기
});
```

**2. transform, opacity 활용**

`transform`과 `opacity`는 Reflow, Repaint 없이 **Composite 단계에서만 처리**된다. 애니메이션을 만들 때 `left/top` 대신 `transform`을 쓰는 게 성능상 유리한 이유다.

```javascript
// ❌ Reflow 발생
element.style.left = '100px';

// ✅ Composite만 발생
element.style.transform = 'translateX(100px)';
```

**3. 잦은 DOM 변경은 DocumentFragment 활용**

**DocumentFragment**는 메모리 안에만 존재하는 가상의 DOM 컨테이너다. 실제 DOM에 연결되어 있지 않기 때문에 DocumentFragment에 요소를 추가해도 Reflow가 발생하지 않는다. 모든 작업이 끝난 후 한 번만 실제 DOM에 추가하면 된다.

```javascript
// ❌ 루프마다 Reflow 발생
for (let i = 0; i < 100; i++) {
  const li = document.createElement('li');
  li.textContent = i;
  ul.appendChild(li); // 매번 실제 DOM에 추가 → Reflow
}

// ✅ DocumentFragment에 모아서 한 번에 추가
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const li = document.createElement('li');
  li.textContent = i;
  fragment.appendChild(li); // 메모리 안에서만 작업
}
ul.appendChild(fragment); // 실제 DOM에 한 번만 추가 → Reflow 1번
```

---

## 정리

- Reflow는 크기/위치 변경 시, Repaint는 시각적 스타일 변경 시 발생한다
- Reflow는 주변 요소까지 영향을 미치기 때문에 특히 비용이 크다
- 읽기/쓰기가 반복되면 Forced Synchronous Layout이 발생하므로 읽기와 쓰기는 분리하는 게 좋다
- 스타일 변경은 한 번에, 애니메이션은 transform으로, 잦은 DOM 변경은 DocumentFragment를 활용하면 Reflow를 줄일 수 있다
