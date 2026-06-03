---
title: "브라우저 렌더링 레이어와 will-change"
date: "2026-06-03"
description: "브라우저 렌더링 레이어 분리와 will-change 활용법"
tags: ["Browser", "CSS"]
---

브라우저가 화면을 그릴 때 모든 요소를 하나의 레이어에 그리지 않는다. 특정 조건에서 요소를 **별도의 레이어**로 분리해서 처리하는데, 이걸 잘 활용하면 성능을 높일 수 있다. `transform`과 `will-change`가 바로 이것과 관련이 있다.

---

## 레이어란?

브라우저는 페이지를 여러 개의 레이어로 나눠서 그린다. 각 레이어는 독립적으로 처리되기 때문에, 한 레이어에 변화가 생겨도 다른 레이어에는 영향을 주지 않는다.

레이어가 분리되면 변경이 생긴 레이어만 다시 그리면 되기 때문에 Reflow, Repaint 없이 **Composite 단계에서만 처리**할 수 있다. 그리고 이 작업은 GPU가 담당하기 때문에 CPU 부담도 줄어든다.

---

## transform이 성능에 유리한 이유

`transform`은 Reflow, Repaint를 건드리지 않고 Composite 단계에서만 처리된다. 그래서 애니메이션을 만들 때 `left/top` 대신 `transform`을 쓰는 게 성능상 유리하다.

```css
/* ❌ Reflow 발생 */
.box {
  transition: left 0.3s;
}
.box:hover {
  left: 100px;
}

/* ✅ Composite만 발생 */
.box {
  transition: transform 0.3s;
}
.box:hover {
  transform: translateX(100px);
}
```

`transform` 애니메이션이 실행되면 브라우저가 해당 요소를 별도 레이어로 분리해서 GPU가 처리하도록 한다.

---

## [will-change](https://developer.mozilla.org/ko/docs/Web/CSS/Reference/Properties/will-change)란?

`will-change`는 브라우저에게 **"이 요소는 곧 변할 거야"** 라고 미리 알려주는 속성이다. 브라우저는 이 힌트를 받으면 해당 요소를 미리 별도 레이어로 분리해서 준비해둔다.

```css
.box {
  will-change: transform;
}
```

애니메이션이 시작될 때 레이어를 새로 만드는 비용이 없어지기 때문에 첫 프레임부터 부드럽게 동작한다.

> 참고: will-change: transform이나 will-change: opacity 등을 사용하면 해당 요소에 새로운 쌓임 맥락(Stacking Context)이 형성된다. 만약 적용 후 z-index가 예상과 다르게 동작한다면 이 부분을 확인해야 한다.

---

## will-change 남용하면 안 되는 이유

`will-change`를 모든 요소에 남발하면 오히려 성능이 나빠진다.

레이어를 만드는 데는 **메모리 비용**이 든다. 레이어가 많아질수록 GPU 메모리 사용량이 늘어나고, 오히려 버벅임이 생길 수 있다.

```css
/* ❌ 이렇게 하면 안 됨 */
* {
  will-change: transform;
}
```

`will-change`는 실제로 성능 문제가 있는 요소에만, 그리고 애니메이션이 일어나기 직전에 JS로 추가하고 끝나면 제거하는 방식이 이상적이다.

```javascript
element.addEventListener('mouseenter', () => {
  element.style.willChange = 'transform';
});

element.addEventListener('animationend', () => {
  element.style.willChange = 'auto';
});
```

---

## opacity 애니메이션도 Composite에서 처리된다

`transform`과 마찬가지로 `opacity` 애니메이션도 Composite 단계에서만 처리된다. 페이드 인/아웃 애니메이션을 만들 때 `opacity`를 쓰면 Reflow, Repaint 없이 부드럽게 동작한다.

```css
/* ✅ Composite만 발생 */
.box {
  transition: opacity 0.3s;
}
.box:hover {
  opacity: 0;
}
```

---

## 정리

- 브라우저는 특정 요소를 별도 레이어로 분리해서 GPU가 처리하도록 한다
- `transform`, `opacity` 애니메이션은 Reflow, Repaint 없이 Composite 단계에서만 처리되어 성능상 유리하다
- `will-change`로 브라우저에게 미리 힌트를 주면 첫 프레임부터 부드럽게 동작한다
- `will-change`는 남발하면 메모리 낭비로 오히려 성능이 나빠지므로 필요한 곳에만 써야 한다
- `will-change` 적용 시 새로운 쌓임 맥락(Stacking Context)이 형성될 수 있음에 유의한다
