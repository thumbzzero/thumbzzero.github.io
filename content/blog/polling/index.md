---
title: "폴링(Polling)"
date: "2026-05-31"
description: "폴링의 개념과 적절한 사용 시점"
tags: ["JavaScript"]
---

실시간으로 데이터를 받아와야 하는 상황에서 어떤 방식을 써야 할지 고민이 될 때가 있다. 그 중 가장 구현이 단순한 방법이 **폴링**이다.

---

## 폴링이란?

서버에 변경사항이 생겼는지 클라이언트가 주기적으로 직접 물어보는 방식이다.  
(서버가 먼저 알려주는 게 아니라, 클라이언트가 계속 물어보는 방식)

```javascript
// 5초마다 API 호출
const poll = async () => {
  try {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    setNotifications(data);
  } finally {
    setTimeout(poll, 5000); // 요청이 끝난 후 5초 뒤에 다음 요청 (중첩 방지)
  }
};

poll();
```

---

## 실시간 데이터를 받는 세 가지 방법

실시간 데이터를 받는 방법은 크게 세 가지다.

| 방식 | 누가 먼저 | 구현 |
|---|---|---|
| 폴링 | 클라이언트가 주기적으로 요청 | `setTimeout` 재귀 호출 |
| 웹소켓 | 서버가 변경 시 푸시 | `new WebSocket(url)` |
| SSE | 서버가 단방향 스트림 | `new EventSource(url)` |

---

## Long Polling

일반 폴링을 개선한 방식이다. 서버가 즉시 응답하지 않고, **새 데이터가 생길 때까지 연결을 유지**했다가 응답한다.

```javascript
const longPoll = async () => {
  try {
    const res = await fetch('/api/messages?wait=true');
    const data = await res.json();
    setMessages(data);
  } catch (err) {
    console.error(err);
  } finally {
    longPoll(); // 응답 후 즉시 다시 연결
  }
};

longPoll();
```

```
클라이언트 → 서버   요청
서버             (30초 대기)
서버 → 클라이언트   응답
클라이언트 → 서버   즉시 재요청
```

일반 폴링보다 불필요한 요청이 줄고 데이터를 더 빠르게 받을 수 있다. 웹소켓을 쓰기 어려운 환경에서 대안으로 주로 쓰인다.

---

## 폴링의 단점

**(1) 불필요한 요청이 많다**  
데이터가 바뀌지 않아도 계속 요청을 보낸다. 서버 부하가 늘고, 사용자가 많아질수록 더 심해진다.
```
5초마다 요청 × 사용자 1000명 = 분당 12,000번 요청
데이터 변경이 거의 없어도 동일
```

**(2) 실시간성이 부족하다**  
5초마다 폴링하면 최대 5초 지연이 생긴다. 지연을 줄이려면 주기를 짧게 해야 하는데, 그러면 요청이 더 많아진다.

---

## 언제 쓰면 좋은가

**(1) 구현이 단순해도 되는 경우**  
웹소켓이나 SSE 설정이 부담스럽고, 실시간성이 크게 중요하지 않을 때 폴링이 무난하다.

**(2) 갱신 주기가 길어도 되는 경우**  
대시보드 통계, 배치 작업 진행 상황처럼 몇 초~몇 분 단위로 갱신해도 충분한 경우에 적합하다.

```javascript
// 작업 완료 여부 확인 - 3초마다 폴링
const checkJobStatus = async (jobId) => {
  try {
    const res = await fetch(`/api/jobs/${jobId}`);
    const { status } = await res.json();

    if (status === 'done') {
      onComplete();
      return; // 완료되면 재귀 종료
    }
  } catch (err) {
    console.error(err);
  }

  setTimeout(() => checkJobStatus(jobId), 3000); // 완료 전이면 3초 후 재확인
};
```

---

## 언제 쓰지 말아야 하나

**(1) 실시간성이 중요한 경우**  
채팅, 실시간 알림, 주식 시세처럼 즉각적인 반응이 필요하면 웹소켓이나 SSE가 적합하다.

**(2) 사용자가 많은 경우**  
동시 접속자가 많으면 폴링 요청이 서버에 큰 부하를 준다.

**(3) 데이터 변경이 드문 경우**  
변경이 거의 없는 데이터를 계속 폴링하면 대부분의 요청이 낭비다.

---

## React에서 폴링 구현하기

```javascript
function usePolling(url, interval = 5000) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let timeoutId;
    let cancelled = false; // 언마운트 후 재스케줄 및 상태 업데이트를 방지하기 위함

    const fetchData = async () => {
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) timeoutId = setTimeout(fetchData, interval);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [url, interval]);

  return data;
}

// 사용
function Dashboard() {
  const stats = usePolling('/api/stats', 10000); // 10초마다 갱신

  return <div>{stats?.count}</div>;
}
```

---

## 정리

- 폴링은 클라이언트가 주기적으로 서버에 요청해서 데이터를 가져오는 방식이다
- 구현이 단순하지만 불필요한 요청이 많고 실시간성이 부족하다
- Long Polling은 서버가 데이터가 생길 때까지 응답을 지연시켜 불필요한 요청을 줄인다
- 갱신 주기가 길어도 되거나, 작업 완료 여부 확인처럼 단발성인 경우에 적합하다
- 채팅, 실시간 알림처럼 즉각적인 반응이 필요하면 웹소켓이나 SSE가 적합하다
