---
title: "AbortController로 Race Condition 해결하기"
date: "2026-05-13"
description: "검색창에서 연속된 API 요청이 발생할 때 Race Condition이 생기는 이유와, AbortController로 해결하는 방법"
---

검색창에 타이핑할 때마다 API를 호출하면, 응답이 요청 순서와 다르게 돌아올 수 있다. 네트워크 상황에 따라 먼저 보낸 요청이 나중에 올 수 있기 때문인데, 이를 **Race Condition**이라고 한다. 이는 **AbortController**로 해결할 수 있다.

---

## 문제 상황

예를 들어 "리액트"를 검색한다고 해보자.

1. "리" 입력 → API 호출 (요청 A)
2. "리액" 입력 → API 호출 (요청 B)
3. "리액트" 입력 → API 호출 (요청 C)

우리가 원하는 건 마지막 요청 C의 결과가 화면에 표시되는 것이다. 근데 네트워크 상황에 따라 응답이 **C → B → A** 순서로 올 수도 있다. 그러면 최종적으로 "리"에 대한 검색 결과가 화면에 남아버리는 버그가 생긴다😱

---

## AbortController란?

**AbortController**는 fetch 요청을 취소할 수 있게 해주는 Web API다.

사용법은 간단하다.

```javascript
const controller = new AbortController();
const signal = controller.signal;

fetch('/api/search', { signal })
  .then(res => res.json())
  .then(data => console.log(data));

// 요청 취소
controller.abort();
```

`abort()`를 호출하면 해당 fetch 요청이 취소되고, Promise는 `AbortError`를 던진다.

---

## AbortController 적용

```javascript
let controller;

const handleSearch = async (keyword) => {
  // 이전 요청이 있으면 취소
  if (controller) {
    controller.abort();
  }

  controller = new AbortController();

  try {
    const res = await fetch(`/api/search?q=${keyword}`, {
      signal: controller.signal,
    });
    const data = await res.json();
    setResults(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      // 취소된 요청은 무시
      return;
    }
    console.error(err);
  }
};
```

fetch에 signal을 전달하면 해당 요청이 AbortController와 연결된다. 새로운 요청이 들어올 때마다 이전 요청을 abort()로 취소하기 때문에, 항상 마지막 요청의 결과만 화면에 반영된다.

---

## debounce와 함께 쓰기

검색창 구현할 때는 debounce를 함께 쓰는 게 일반적이다. debounce는 타이핑이 멈춘 후 일정 시간이 지나야 API를 호출하도록 해서 **요청 횟수 자체를 줄여주고**, AbortController는 이미 보낸 요청을 취소해서 **Race Condition을 방지한다.** 역할이 다르기 때문에 함께 쓰면 더 안전하다.

같이 쓰면 이런 꼴이 된다.

```javascript
let controller;

const handleSearch = debounce(async (keyword) => {
  if (controller) {
    controller.abort();
  }

  controller = new AbortController();

  try {
    const res = await fetch(`/api/search?q=${keyword}`, {
      signal: controller.signal,
    });
    const data = await res.json();
    setResults(data);
  } catch (err) {
    if (err.name === 'AbortError') return;
    console.error(err);
  }
}, 300);
```

---

## React에서 사용할 때

useEffect에서 사용할 때는 cleanup 함수에서 abort를 호출해주면 된다.

```javascript
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/search?q=${keyword}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error(err);
    }
  };

  fetchData();

  return () => {
    controller.abort(); // 컴포넌트 언마운트 or keyword 변경 시 취소
  };
}, [keyword]);
```

keyword가 바뀔 때마다 이전 요청이 자동으로 취소된다. 컴포넌트가 언마운트될 때도 진행 중인 요청을 정리해줘서 메모리 누수도 방지할 수 있다😄

---

## 정리

- 연속된 API 요청이 발생하는 상황에서는 Race Condition이 생길 수 있다
- AbortController를 쓰면 이전 요청을 취소해서 항상 마지막 요청의 결과만 반영할 수 있다
- debounce는 요청 횟수를 줄이고, AbortController는 Race Condition을 방지한다. 역할이 다르므로 함께 쓰는 게 좋다
- React에서는 useEffect cleanup 함수에서 abort를 호출하는 패턴이 일반적이다
