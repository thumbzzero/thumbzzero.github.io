---
title: "clamp()로 반응형 디자인 구현하기"
date: "2026-06-07"
description: "미디어 쿼리 없이 CSS clamp()로 뷰포트 크기에 따라 부드럽게 스케일링되는 반응형 레이아웃 구현하기"
tags: ["CSS"]
---

반응형 디자인을 구현할 때 보통 미디어 쿼리로 브레이크포인트마다 `px` 값을 지정하는 방식을 많이 쓴다. 근데 이 방법은 브레이크포인트 사이에서 값이 뚝뚝 끊기고, 미디어 쿼리가 많아질수록 관리가 힘들어진다. `clamp()`를 쓰면 이 문제를 깔끔하게 해결할 수 있다.

---

## clamp()

`clamp(min, val, max)` 형태로 사용한다.

```css
.title {
  font-size: clamp(1rem, 2.5vw, 2rem);
}
```

- **min (최솟값)**: 허용되는 값의 하한선. 만약 선호값(val)이 이 최솟값보다 작아지면, clamp() 함수는 최솟값을 최종 결과로 사용한다.
- **val (선호값)**: 결과가 최솟값과 최댓값 사이에 있는 동안에 기본적으로 사용되는 표현식. 보통 vw, % 같은 가변 단위를 자주 사용한다.
- **max (최댓값)**: 허용되는 값의 상한선. 선호값(val)이 이 최댓값보다 커지면, clamp() 함수는 최댓값을 최종 결과로 사용한다.

선호값을 기준으로 동작하되, 최솟값보다 작아지거나 최댓값보다 커지지 않도록 제한한다.

[mdn 문서](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp)

---

## 미디어 쿼리와 비교

```css
/* 미디어 쿼리 방식 - 브레이크포인트 사이에서 값이 뚝 끊김 */
.title {
  font-size: 1rem;
}

@media (min-width: 768px) {
  .title {
    font-size: 1.5rem;
  }
}

@media (min-width: 1200px) {
  .title {
    font-size: 2rem;
  }
}

/* clamp() 방식 */
.title {
  font-size: clamp(1rem, 2.5vw, 2rem);
}
```

---

## 선호값 계산하기

`clamp()`에서 가장 헷갈리는 부분이 선호값이다. `2.5vw`처럼 감으로 넣기보다 원하는 시작점과 끝점을 기준으로 계산하는 방법이 있다.

예를 들어 **뷰포트 375px일 때 1rem, 1200px일 때 2rem**으로 스케일링하고 싶다면 아래 공식을 쓰면 된다.

```
선호값 = calc((기울기 * 100vw) + 상수)
---------------------------------------------
기울기 = (최댓값 - 최솟값) / (최대뷰포트 - 최소뷰포트)
상수(y절편) = 최솟값 - (최소뷰포트 * 기울기)
```

```css
font-size: clamp(1rem, calc(1.94vw + 0.55rem), 2rem);
```

직접 계산하기 번거로우면 [CSS Clamp 생성기](https://pxtovw.co.kr/clamp-generator.html) 같은 사이트를 활용하는 것도 좋다.

---

## 웹 접근성(Accessibility) 관련 주의점

`font-size`에 `clamp()`를 쓸 때는 웹 접근성을 위해 아래 두 가지를 참고하여 설정하는 것이 좋다.

**(1) 선호값에 rem 섞기**  
선호값에 `2.5vw`처럼 가변 단위만 단독으로 쓰면 브라우저를 확대(Zoom)해도 글자 크기가 커지지 않으므로 `rem`과 `vw`가 섞인 `calc()` 형태를 쓰는 것이 좋다.

**(2) 최댓값은 최솟값의 2배 이상인 상대 단위로 설정하기**  
텍스트는 최소 200%까지 확대될 수 있도록 `clamp()`의 최댓값(max)은 최솟값(min)의 2배 이상이 되도록 잡는 게 좋다.

```css
.title {
  font-size: clamp(1rem, calc(1.5vw + 0.7rem), 2rem); 
}
```

---

## 사용 가능한 CSS 속성

`clamp()`는 폰트 크기뿐만 아니라 `width`, `padding`, `margin`, `gap` 등 크기를 다루는 곳이면 어디든 쓸 수 있다.

```css
/* 패딩 */
.container {
  padding: clamp(1rem, 5vw, 3rem);
}

/* 너비 */
.card {
  width: clamp(280px, 50%, 600px);
}

/* 간격 */
.grid {
  gap: clamp(1rem, 3vw, 2rem);
}
```

---

## min(), max()

- `min(a, b)` → 둘 중 **작은** 값 선택
- `max(a, b)` → 둘 중 **큰** 값 선택

```css
.container {
  width: min(1200px, 100%);
}

.button {
  height: max(44px, 3rem);
}
```

사실 `clamp(min, val, max)`는 `max(min, min(val, max))`와 동일하다. `min()`, `max()`를 조합한 것이 `clamp()`인 셈이다.

---

## 브라우저 지원

`clamp()`는 모던 브라우저에서 모두 지원한다. IE는 지원하지 않지만, IE를 지원할 일이 없다면 걱정 없이 써도 된다😄
