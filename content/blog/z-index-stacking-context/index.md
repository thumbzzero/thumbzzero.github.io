---
title: "z-index가 예상대로 작동하지 않는 원인: stacking context"
date: "2026-06-05"
description: "z-index가 예상대로 작동하지 않게 하는 stacking context의 생성 조건과 동작 원리"
tags: ["CSS", "Browser", "Debugging"]
---

z-index에 더 큰 값을 줘도 뒤로 가는 경우가 있다. 원인은 대부분 **stacking context** 때문이다.

---

## z-index가 항상 통하지 않는 이유

z-index는 **같은 stacking context 안에서만** 비교된다.

다른 stacking context에 속한 요소끼리는 z-index 값이 아무리 커도 의미가 없다. 부모의 stacking context 순서가 먼저 결정되기 때문이다.

---

## stacking context란?

브라우저는 요소를 쌓을 때 **독립적인 레이어 그룹**을 만들기도 한다. 이 그룹을 **stacking context**라고 한다.

stacking context 안에서 자식 요소들의 z-index는 그 context 안에서만 유효하다. 다른 stacking context와 비교할 때는 자식의 z-index가 아니라 **부모 stacking context의 z-index**가 기준이 된다.

---

## stacking context가 생기는 조건

stacking context가 생기는 대표적인 경우는 아래와 같다.

- `position`이 `relative`, `absolute`이고 `z-index`가 `auto`가 아닐 때
- `position`이 `fixed`, `sticky`일 때
- `opacity`가 1 미만일 때
- `transform`이 `none`이 아닐 때
- `filter`가 `none`이 아닐 때
- `will-change`에 위 속성들이 지정되어 있을 때
- `isolation: isolate`일 때

---

## 예시 1

```html
<div class="A">
  A / z-index: 1
  <div class="A-child">A-child<br>z-index: 999</div>
</div>

<div class="B">
  B / z-index: 2
  <div class="B-child">B-child<br>z-index: 1</div>
</div>
```

```css
.A, .B {
  position: absolute;
  width: 200px;
  height: 200px;
}

.A {
  top: 50px;
  left: 50px;
  background-color: lightblue;
  z-index: 1; /* Stacking Context 생성 */
}

.B {
  top: 100px;
  left: 100px;
  background-color: lightgreen;
  z-index: 2; /* Stacking Context 생성 (A보다 무조건 위에 옴) */
}

.A-child, .B-child {
  position: absolute;
  width: 100px;
  height: 100px;
}

.A-child {
  top: 50px;
  left: 50px;
  background-color: red;
  z-index: 999; /* z-index가 매우 높지만 부모(A)에 갇힘 */
}

.B-child {
  top: 50px;
  left: 50px;
  background-color: yellow;
  z-index: 1;
}
```

<div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; margin: 24px 0; background: #fafafa;">
  <style>
    .sc1-scene { position: relative; width: 250px; height: 250px; margin: 0 auto; }
    .sc1-A { position: absolute; top: 0; left: 0; width: 200px; height: 200px; background-color: lightblue; z-index: 1; }
    .sc1-B { position: absolute; top: 50px; left: 50px; width: 200px; height: 200px; background-color: lightgreen; z-index: 2; }
    .sc1-Achild { position: absolute; top: 50px; left: 50px; width: 100px; height: 100px; background-color: slateblue; z-index: 999; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: white; text-align: center; line-height: 1.5; }
    .sc1-Bchild { position: absolute; top: 50px; left: 50px; width: 100px; height: 100px; background-color: yellow; z-index: 1; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #555; text-align: center; line-height: 1.5; }
  </style>
  <div class="sc1-scene">
    <div class="sc1-A">
      <span style="font-size:11px;font-weight:bold;padding:3px 6px;display:block;">A / z-index: 1</span>
      <div class="sc1-Achild">A-child<br>z-index: 999</div>
    </div>
    <div class="sc1-B">
      <span style="font-size:11px;font-weight:bold;padding:3px 6px;display:block;">B / z-index: 2</span>
      <div class="sc1-Bchild">B-child<br>z-index: 1</div>
    </div>
  </div>
</div>

`A-child`의 z-index가 999임에도 불구하고 `B-child`(z-index: 1) 보다 뒤에 있다.

`A`와 `B`가 각각 stacking context를 만들기 때문에, `A-child`와 `B-child`의 z-index는 서로 비교되지 않는다. `A(z-index: 1)`와 `B(z-index: 2)`가 먼저 비교되고, `A`가 뒤에 있기 때문에 그 안의 `A-child`도 무조건 뒤에 있을 수밖에 없다.

---

## 예시 2

```css
/* 부모에게 투명도나 블렌드 모드를 주면 */
.parent {
  opacity: 0.9; 
  /* 또는 mix-blend-mode: multiply; */
}

/* 자식의 z-index가 부모 안에 갇히게 됩니다 */
.child {
  position: absolute;
  z-index: 9999; 
}
```

<div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px 24px 16px; margin: 24px 0; background: #fafafa;">
  <style>
    .sc2-scene { position: relative; width: 320px; height: 200px; margin: 0 auto; }
    .sc2-parent { position: absolute; top: 20px; left: 10px; width: 180px; height: 160px; background: lightblue; opacity: 0.9; }
    .sc2-child { position: absolute; top: 30px; left: 20px; width: 140px; height: 100px; z-index: 9999; background: slateblue; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: white; text-align: center; line-height: 1.5; }
    .sc2-overlay { position: absolute; top: 40px; left: 140px; width: 170px; height: 120px; z-index: 1; background: lightgreen; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #333; text-align: center; line-height: 1.5; }
  </style>
  <div class="sc2-scene">
    <div class="sc2-parent">
      <span style="font-size:11px;font-weight:bold;padding:4px 6px;display:block;">parent / opacity: 0.9</span>
      <div class="sc2-child">child<br>z-index: 9999</div>
    </div>
    <div class="sc2-overlay">외부 요소<br>z-index: 1</div>
  </div>
</div>

부모 요소에 디자인 효과를 주다가 stacking context가 생성되어 자식의 z-index가 먹통이 될 수 있다.

---

## isolation: isolate

stacking context를 의도적으로 만들고 싶을 때 쓰는 속성이다.

예를 들어 모달이나 드롭다운처럼 다른 요소 위에 떠야 하는 컴포넌트를 만들 때, 외부 z-index의 영향을 받지 않도록 격리할 수 있다.

```css
.modal-wrapper {
  isolation: isolate; /* 이 안에서 z-index가 독립적으로 동작 */
}
```

z-index를 마구 올리는 대신, 필요한 곳에서만 stacking context를 명시적으로 만들면 z-index 관리가 훨씬 깔끔해진다.

---

## 디버깅 방법

z-index가 예상대로 안 된다면 아래 순서로 확인해보자.

1. 크롬 DevTools → Elements 탭에서 해당 요소 선택
2. Computed 탭에서 `z-index`, `position`, `transform`, `opacity` 확인
3. 부모 요소를 타고 올라가며 stacking context를 만드는 속성이 있는지 확인

---

## 정리

- z-index는 같은 stacking context 안에서만 비교된다
- stacking context는 `position + z-index` 외에도 `transform`, `opacity`, `filter` 등으로 생긴다
- 부모가 stacking context를 만들면 자식의 z-index는 외부와 비교되지 않는다
- `isolation: isolate`로 stacking context를 명시적으로 만들면 z-index 관리가 깔끔해진다
- z-index가 안 먹힌다면 부모 요소를 타고 올라가며 stacking context를 찾아보자
