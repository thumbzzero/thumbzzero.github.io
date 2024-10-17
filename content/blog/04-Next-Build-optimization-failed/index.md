---
title: "[Next.js] Build optimization failed: found page without a React Component as default export 에러"
date: "2024-10-17"
description: "Build optimization failed: found page without a React Component as default export 에러 원인과 해결"
---

Next.js로 개발 중이던 프로젝트를 `npm run build` 커맨드를 이용하여 빌드를 시도했는데, 아래와 같은 에러가 발생하며 빌드에 실패하였다.

> Build optimization failed: found page without a React Component as default export in  
> pages/[발생 파일]

위의 오류는 Next.js에서 `pages` 디렉토리의 파일 중에 특정 파일이 **React 컴포넌트**를 `export default`로 내보내지 않았을 때 발생한다.
(***Pages Router** 사용 시)
  
Next.js에서는 `pages` 디렉토리에서 `export default`된 **React 컴포넌트**를 기반으로 라우팅을 처리하기 때문에 위와 같은 오류가 발생하면 오류가 발생한 파일이 React 컴포넌트를 `export default`하고 있는지 확인이 필요하다.

<p class="highlight">즉, pages 디렉토리 내의 모든 파일은 아래와 같은 형식이어야 한다.</p>

```tsx
export default function Page() {
    return <div>Page</div>;
}
```

나의 경우에는 `index.tsx`에 사용할 style-component 코드를 작성한 `style.ts` 파일로 인해 발생하였고,  
해당 style 코드의 위치를 변경하고 라우트로 이용할 `index.tsx`만 남기니 해결되었다.

아래는 라우팅 관련 Next.js 공식 문서 내용이다.

<div class="box">
The Pages Router has a file-system based router built on the concept of pages.<br><br>
When a file is added to the pages directory, it's automatically available as a route.<br><br>
In Next.js, a page is a React Component exported from a .js, .jsx, .ts, or .tsx file in the pages directory. Each page is associated with a route based on its file name.
</div>  
<br>

[공식 문서 링크](https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts)