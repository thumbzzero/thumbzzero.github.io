---
title: "이벤트 루프 - 콜스택, 태스크 큐, 마이크로태스크"
date: "2026-05-28"
description: "JavaScript 이벤트 루프의 동작 원리와 콜스택, 태스크 큐, 마이크로태스크 큐의 차이"
tags: ["JavaScript"]
---

JavaScript는 싱글 스레드 언어다. 한 번에 하나의 작업만 처리할 수 있다는 뜻인데, 그럼에도 불구하고 비동기 작업이 가능한 이유가 바로 **이벤트 루프** 덕분이다.

---

## 콜스택 (Call Stack)

JavaScript 엔진이 함수를 실행할 때 사용하는 공간이다. 함수가 호출되면 스택에 쌓이고, 실행이 끝나면 제거된다.

```javascript
function a() {
  b();
}

function b() {
  console.log('b');
}

a();
```

실행 순서는 아래와 같다.

```
a() 호출 → 스택에 a 추가
b() 호출 → 스택에 b 추가
console.log('b') 실행
b 종료 → 스택에서 b 제거
a 종료 → 스택에서 a 제거
```

콜스택이 꽉 차면 `Maximum call stack size exceeded` 에러가 발생한다. 재귀 함수를  잘못 짰을 때 보이는 그 에러다 😢

---

## Web APIs

[`setTimeout`](https://developer.mozilla.org/ko/docs/Web/API/Window/setTimeout), [`fetch`](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API), [`addEventListener`](https://developer.mozilla.org/ko/docs/Web/API/EventTarget/addEventListener) 같은 비동기 함수들은 사실 JavaScript 엔진이 아니라 **브라우저가 제공하는 [Web API](https://developer.mozilla.org/ko/docs/Web/API)s**다.

이 함수들이 호출되면 브라우저가 백그라운드에서 처리하고, 작업이 완료되면 콜백 함수를 **큐(Queue)** 에 넣는다. JavaScript 엔진은 콜스택이 비었을 때 큐에서 콜백 함수를 꺼내서 실행한다.

---

## 태스크 큐 (Task Queue)

**매크로태스크 큐 (Macrotask Queue)** 라고도 한다. 아래 작업들의 콜백이 여기에 들어간다.

- `setTimeout`
- `setInterval`
- I/O 이벤트

---

## 마이크로태스크 큐 (Microtask Queue)

태스크 큐와 별개로 존재하는 큐다. 아래 작업들의 콜백이 여기에 들어간다.

- `Promise.then`, `Promise.catch`, `Promise.finally`
- `MutationObserver`

---

## 이벤트 루프의 동작 순서

이벤트 루프는 아래 순서로 반복 동작한다.

```
1. (태스크 큐에 작업이 있다면) 가장 오래된 태스크를 '하나' 꺼내어 실행한다.
   ※ 스크립트 파일이 처음 로드되어 실행되는 것 자체가 첫 번째 태스크다.
2. 콜스택이 비어지면, 마이크로태스크 큐에 대기 중인 '모든' 콜백을 전부 비울 때까지 실행한다.
3. 마이크로태스크가 모두 비워지면, 브라우저는 필요한 경우 화면을 갱신하는 '렌더링 파이프라인'을 실행한다.
4. 다시 1번으로 돌아가 반복한다.
```

핵심은 두 가지다.

- **마이크로태스크 큐는 전부 비울 때까지 실행**한다
- **태스크 큐는 한 번에 하나씩만** 실행한다

---

## 예시로 이해하기

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');
```

출력 순서가 어떻게 될까?

```
1
4
3
2
```

순서대로 따라가보면 아래와 같다.

1. `console.log('1')` → 콜스택에서 바로 실행
2. `setTimeout` → Web API로 넘어감. 콜백(`'2'`)은 태스크 큐에 대기
3. `Promise.resolve().then` → 콜백(`'3'`)은 마이크로태스크 큐에 대기
4. `console.log('4')` → 콜스택에서 바로 실행
5. 콜스택이 비었으므로 마이크로태스크 큐 확인 → `'3'` 실행
6. 마이크로태스크 큐가 비었으므로 태스크 큐 확인 → `'2'` 실행

`setTimeout`의 딜레이가 `0`이어도 Promise보다 늦게 실행되는 이유가 여기 있다.

---

## 마이크로태스크가 쌓이면 생기는 문제

마이크로태스크 큐는 전부 비울 때까지 실행하기 때문에, 마이크로태스크 안에서 마이크로태스크를 계속 추가하면 태스크 큐가 영원히 실행되지 않을 수 있다.

```javascript
function infiniteMicrotask() {
  Promise.resolve().then(infiniteMicrotask);
}

infiniteMicrotask();

setTimeout(() => {
  console.log('이건 영원히 실행 안 됨');
}, 0);
```

마이크로태스크가 계속 쌓이면 브라우저가 렌더링 파이프라인을 실행할 기회를 얻지 못하기 때문에, 다음 매크로태스크가 실행되지 않을 뿐만 아니라 **화면이 멈춘 것처럼(Frozen)** 보일 수 있다.

---

## 정리

- JavaScript는 싱글 스레드지만 이벤트 루프 덕분에 비동기 처리가 가능하다
- 매크로태스크 하나가 끝날 때마다 마이크로태스크 큐를 전부 비우고, 브라우저가 화면을 렌더링한 뒤 다음 태스크를 처리한다
- Promise 콜백은 마이크로태스크 큐, setTimeout 콜백은 태스크 큐에 들어간다
- 우선순위는 마이크로태스크 큐 > 태스크 큐이다
- 마이크로태스크가 계속 쌓이면 태스크 큐가 블로킹될 수 있다
