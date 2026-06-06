---
title: "이벤트 위임"
date: "2026-06-06"
description: "이벤트 버블링을 활용해 자식 요소의 이벤트를 부모에서 처리하는 이벤트 위임 패턴"
tags: ["JavaScript"]
---

리스트 아이템 100개에 각각 클릭 이벤트를 달아야 한다고 해보자. 아이템마다 이벤트 리스너를 하나씩 붙이는 것보다 더 나은 방법이 있다. 바로 **이벤트 위임**이다.

---

## 이벤트 버블링

이벤트 위임을 이해하려면 **이벤트 버블링**을 알아야 한다.

DOM에서 이벤트가 발생하면 해당 요소에서 시작해서 **부모 요소로 계속 전파**된다. 이걸 버블링이라고 한다.

```html
<ul>
  <li>아이템 1</li>
  <li>아이템 2</li>
</ul>
```

`li`를 클릭하면 이벤트가 아래 순서로 전파된다.

```
li → ul → body → html → document → window
```

즉, `li`에서 발생한 클릭 이벤트를 부모인 `ul`에서도 감지할 수 있다.

---

## 이벤트 위임

이벤트 위임이란 이벤트 버블링을 활용해서 **자식 요소의 이벤트를 부모 요소에서 처리**하는 패턴이다.

```javascript
// ❌ 아이템마다 이벤트 리스너 등록
const items = document.querySelectorAll('li');
items.forEach(item => {
  item.addEventListener('click', handleClick);
});

// ✅ 부모에 이벤트 리스너 하나만 등록
const ul = document.querySelector('ul');
ul.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    handleClick(e.target);
  }
});
```

`e.target`은 실제로 클릭된 요소를 가리킨다. 부모에 리스너를 달아도 어떤 자식이 클릭됐는지 알 수 있다.

---

## 이벤트 위임이 더 효율적인 이유


**(1) 메모리 사용량이 줄어든다**

이벤트 리스너는 메모리를 차지한다. 아이템이 100개면 리스너도 100개다. 이벤트 위임을 쓰면 리스너가 하나뿐이다.

**(2) 동적으로 추가된 요소에도 동작한다**

```javascript
// ❌ 나중에 추가된 아이템에는 이벤트가 없음
const items = document.querySelectorAll('li');
items.forEach(item => {
  item.addEventListener('click', handleClick);
});

const newItem = document.createElement('li');
newItem.textContent = '새 아이템';
ul.appendChild(newItem); // 이 아이템은 클릭해도 반응 없음

// ✅ 나중에 추가된 아이템도 자동으로 처리됨
ul.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    handleClick(e.target);
  }
});
```

부모에 리스너가 달려있기 때문에 나중에 추가된 자식 요소도 버블링을 통해 자동으로 처리된다.

**(3) 이벤트 리스너 관리가 쉬워진다**

리스너가 하나뿐이라 제거할 때도 하나만 제거하면 된다. 아이템이 동적으로 추가/제거되더라도 리스너를 따로 관리할 필요가 없다.

---

## e.target vs e.currentTarget

이벤트 위임을 쓸 때 헷갈리기 쉬운 부분이다.

- `e.target` - 이벤트가 **실제로 발생한** 요소
- `e.currentTarget` - 이벤트 리스너가 **등록된** 요소

```javascript
ul.addEventListener('click', (e) => {
  console.log(e.target); // 클릭된 li
  console.log(e.currentTarget); // 리스너가 달린 ul
});
```

---

## 중첩 구조에서 주의할 점

자식 요소 안에 또 다른 요소가 있으면 `e.target`이 의도하지 않은 요소를 가리킬 수 있다.

```html
<ul>
  <li>
    <span>아이템 1</span>
  </li>
</ul>
```

`span`을 클릭하면 `e.target`이 `li`가 아니라 `span`이 된다. `closest()`로 해결할 수 있다.

```javascript
ul.addEventListener('click', (e) => {
  const item = e.target.closest('li'); // 가장 가까운 li 찾기
  if (!item || !ul.contains(item)) return; // li 밖을 클릭하거나 ul 내부가 아닌 경우 무시
  handleClick(item);
});
```

`closest()`는 자기 자신부터 시작해서 부모 방향으로 올라가며 조건에 맞는 가장 가까운 요소를 찾아준다.

---

## 버블링이 안 되는 이벤트

모든 이벤트가 버블링되는 건 아니다. `focus`, `blur`, `scroll` 같은 이벤트는 버블링되지 않기 때문에 이벤트 위임을 쓸 수 없다.

대신 버블링되는 버전인 `focusin`, `focusout`을 쓰면 된다.

```javascript
// ❌ focus는 버블링 안 됨
ul.addEventListener('focus', handleFocus);

// ✅ focusin은 버블링됨
ul.addEventListener('focusin', handleFocus);
```


또는 이벤트 캡처링(Capturing)을 활용하면 이벤트 위임을 쓸 수 있다.
```javascript
// addEventListener 세 번째 인자로 true를 주어 이벤트 캡처링 단계에서 focus 이벤트를 감지하여 위임 구현
ul.addEventListener('focus', handleFocus, true);
```

---

## 정리

- 이벤트 위임은 자식 요소의 이벤트를 부모에서 처리하는 패턴이다
- 이벤트 버블링 덕분에 부모에서 어떤 자식이 이벤트를 발생시켰는지 알 수 있다
- 리스너 수가 줄어 메모리 사용량이 감소하고, 동적으로 추가된 요소도 자동으로 처리된다
- 중첩 구조에서는 `e.target` 대신 `closest()`를 쓰면 안전하다
