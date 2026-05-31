---
title: "setTimeout vs setInterval"
date: "2026-05-30"
description: "setTimeout과 setInterval의 차이, 비동기 작업에서 올바르게 사용하는 법"
tags: ["JavaScript"]
---

JavaScript의 타이머 함수에는 `setInterval`과 `setTimeout`가 있다.

---

## [setTimeout](https://developer.mozilla.org/ko/docs/Web/API/Window/setTimeout)

**일정 시간 후에 한 번** 실행한다.

```javascript
setTimeout(() => {
  console.log('1초 후 실행');
}, 1000);
```

---

## [setInterval](https://developer.mozilla.org/ko/docs/Web/API/Window/setInterval)

**일정 시간마다 반복** 실행한다.

```javascript
setInterval(() => {
  console.log('1초마다 실행');
}, 1000);
```

---

## 타이머 정리

두 함수 모두 반환된 ID로 취소할 수 있다.

```javascript
const timeoutId = setTimeout(() => {}, 1000);
clearTimeout(timeoutId);

const intervalId = setInterval(() => {}, 1000);
clearInterval(intervalId);
```

React에서는 두 함수 사용 시 cleanup 함수에서 정리를 해주어야 한다.

```javascript
useEffect(() => {
  const id = setInterval(() => {
    doSomething();
  }, 1000);

  return () => clearInterval(id);
}, []);
```

---

## 비동기 작업과 함께 쓸 때

`setInterval`은 **내부 비동기 작업의 완료 여부와 관계없이** 일정 간격으로 콜백을 실행한다.

```javascript
setInterval(async () => {
  await fetch('/api/data'); // 이 요청이 1초 넘게 걸린다면?
}, 1000);
```

`setInterval`은 콜백을 실행시킬 뿐, 그 안의 비동기 작업이 끝나는지 신경 쓰지 않는다. 이전 `fetch`가 아직 응답을 기다리는 중이어도 1초 후엔 다음 콜백을 실행하기 때문에, **요청이 동시에 여러 개 쌓일 수 있다.**

`setTimeout`을 재귀로 쓰면 **이전 작업이 끝난 후** 다음 타이머가 시작된다.

```javascript
const repeat = async () => {
  await fetch('/api/data'); // 작업이 끝난 후
  setTimeout(repeat, 1000); // 1초 후에 다음 실행
};

repeat();
```

작업이 3초 걸리면 그게 끝난 뒤 1초 후에 다음 요청을 보내므로 요청이 겹칠 일이 없다.

[참고] [폴링(Polling)](/polling)

---

## 실제로 어떻게 차이나는지

```
setInterval (간격 1초, 작업 3초)
|---작업A(3초)---|
    |---작업B(3초)---|  ← 1초 후 시작, A와 겹침
        |---작업C(3초)---|  ← 또 겹침

재귀 setTimeout (간격 1초, 작업 3초)
|---작업A(3초)---|--1초--|---작업B(3초)---|--1초--|---작업C(3초)---|
                         ↑ A 끝난 후 1초 후에 시작
```

---

## 정확한 딜레이가 보장되지 않는다

두 함수 모두 딜레이가 **정확히** 보장되지 않는다는 걸 알아두면 좋다.

타이머 콜백은 태스크 큐에 들어간다. 콜스택이 바쁘면 지정한 시간이 지나도 바로 실행되지 않을 수 있다.

```javascript
setTimeout(() => {
  console.log('1초 후?');
}, 1000);

// 콜스택이 바쁘면 1초보다 늦게 실행될 수 있다
for (let i = 0; i < 1000000000; i++) {} // 무거운 작업
```

---

## 정리

- `setTimeout`은 한 번, `setInterval`은 반복 실행이다
- React에서는 cleanup 함수에서 타이머를 정리해야 한다
- `setInterval`은 내부 비동기 작업의 완료 여부와 관계없이 실행되어 네트워크 요청이 겹칠 수 있다
- 비동기 작업을 반복할 때는 재귀 `setTimeout`이 안전하다
- 두 함수 모두 딜레이가 정확히 보장되지 않는다. 콜스택이 바쁘면 늦게 실행될 수 있다
