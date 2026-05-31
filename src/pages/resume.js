import * as React from "react"

const ResumePage = () => {
  const resumeUrl = process.env.GATSBY_RESUME_URL

  return (
    <iframe
      src={resumeUrl}
      title="Resume"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: "none",
      }}
    />
  )
}

export const Head = () => <title>이력서</title>

export default ResumePage
