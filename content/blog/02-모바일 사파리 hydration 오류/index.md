---
title: "모바일 사파리 hydration 오류"
date: "2024-04-28"
description: "Unhandled Runtime Error: Text content does not match server-rendered HTML."
---

회사 홈페이지 new 버전을 개발하는 업무를 맡게 되어 개발 및 deploy를 마쳤을 때 발견하게 된 이슈이다.

로컬에서 개발을 완료한 뒤 문제가 없음을 확인하고, deploy가 완료된 상태였는데 갑자기 버그 제보 채널로부터 아래와 같은 Runtime Error가 발생한다는 제보를 받았다.

> <b>Unhandled Runtime Error</b>  
> Error: Text content does not match server-rendered HTML.

사용자에게 의미 있는 페이지를 빨리 보여주기 위해 Next.js 서버는 pre-rendering된 HTML 페이지와 해당 페이지에서 사용자의 인터렉션 처리에 필요한 JavaScript 코드를 보내주는데, 이 JavaScript 코드(ex. Event Handlers)가 실행되면서 interactive한 페이지가 되는 과정을 **hydration**이라고 한다.

위의 에러는 server-rendered HTML(서버 측의 pre-rendering HTML)과 브라우저에서 hydration 된 후 최초로 렌더링 된 content가 다를 때 발생한다.

이상한 점은 개발 환경에서도 문제가 없었고, 노트북으로 접속 시에는 확인하지 못했던 Error인데, 모바일/아이패드 기기에서 사파리로 접속 시에만 발생한다는 점이었다🤯

hydration error는 `typeof window !== 'undefined'`를 체크하지 않았거나, client only 코드를 `useEffect` 내에서 사용하지 않은 경우에 자주 발생하는데 이러한 상황은 아니었다!

#### 원인

iOS 환경에서 전화번호, 주소, 이메일 주소와 같은 text content들을 감지하여 자동으로 링크로 변환하기 때문에 hydration mismatch가 발생한다고 한다. (이러한 기능을 **format-detection** 이라고 한다.)

실제로 mismatch 텍스트로 뜨던 부분이 회사 전화번호와 문의 이메일 부분이었다😮

#### 해결

아래의 meta tag를 이용해 format-detection 기능을 끔으로써 해결할 수 있다.

```html
<meta
  name="format-detection"
  content="telephone=no, date=no, email=no, address=no"
/>
```

관련된 공식 문서 내용은 [여기](https://nextjs.org/docs/messages/react-hydration-error#common-ios-issues)에서 확인할 수 있다.
