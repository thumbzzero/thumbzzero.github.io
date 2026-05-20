---
title: "Sticky Hover - 터치 디바이스에서 hover가 안 사라지는 문제"
date: "2026-05-20"
description: "터치 디바이스에서 hover 스타일이 사라지지 않는 Sticky Hover 현상과 해결 방법"
tags: ["CSS"]
---

모바일에서 버튼이나 링크를 탭했을 때 hover 스타일이 사라지지 않고 남아있는 경우가 있다. 이를 **Sticky Hover**라고 하는데, 대부분 의도한 동작은 아닐 것이다.

---

## 문제 상황

```css
.button {
  background: var(--button-color);
  color: white;
}

.button:hover {
  background: var(--button-color-hover);
}
```

마우스 환경에서는 버튼 밖으로 이동하면 hover가 해제된다. 모바일에서는 탭한 후 hover 시 적용된 배경색이 그대로 남아있다.

<div style="border: 1px solid #e8d5d5; border-radius: 8px; padding: 32px; margin: 24px 0; background: #fdf8f8; text-align: center;">
  <style>
    .shb-btn { padding: 12px 28px; background: #D88080; color: white; border: none; border-radius: 6px; font-size: 15px; cursor: pointer; }
    .shb-btn:hover { background: #b85c5c; }
  </style>
  <button class="shb-btn">버튼을 탭해보세요</button>
  <p style="margin-top: 16px; font-size: 14px; color: #9a7070; margin-bottom: 0;">모바일에서 탭 후 손을 떼면 hover 색상이 그대로 유지된다 (hover 지원 기기는 정상 작동)</p>
</div>

---

## 해결 방법

hover 미디어 쿼리를 활용하여 hover를 지원하는 디바이스에서만 hover 스타일을 적용한다.

```css
.button {
  background: var(--button-color);
}

/* hover를 지원하는 디바이스에서만 적용 */
@media (hover: hover) {
  .button:hover {
    background: var(--button-color-hover);
  }
}
```

`hover: hover`는 마우스처럼 정확한 포인터가 있어서 hover가 가능한 디바이스를 의미한다. 터치 디바이스는 `hover: none`이라 이 미디어 쿼리에 해당하지 않는다.

`pointer` 미디어 쿼리와 함께 쓰면 더 정확하다.

```css
@media (hover: hover) and (pointer: fine) {
  .button:hover {
    background: var(--button-color-hover);
  }
}
```

- `hover: hover` - hover 지원 여부
- `pointer: fine` - 마우스처럼 정밀한 포인터 (터치는 `pointer: coarse`)



```css
/* 기본 스타일 */
.button {
  background: var(--button-color);
  color: white;
  transition: background 0.2s ease;
}

/* hover 지원 디바이스에서만 */
@media (hover: hover) and (pointer: fine) {
  .button:hover {
    background: var(--button-color-hover);
  }
}

/* 터치 디바이스는 active로 눌린 상태 표현 */
.button:active {
  background: var(--button-color-hover);
}
```

터치 디바이스에서는 `:hover` 대신 `:active`로 눌린 상태를 표현하면 자연스럽다. 탭하는 동안만 스타일이 적용되고 손을 떼면 바로 해제된다.

---

## 정리

- 터치 디바이스에서 브라우저가 터치 이벤트를 마우스 이벤트로 에뮬레이션하면서 hover가 해제되지 않는 현상이다
- `@media (hover: hover) and (pointer: fine)`으로 hover를 지원하는 디바이스에서만 hover 스타일을 적용한다
- 터치 디바이스에서는 `:hover` 대신 `:active`로 눌린 상태를 표현하자
