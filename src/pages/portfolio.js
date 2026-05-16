import * as React from "react"

const PortfolioPage = () => {
  const portfolioUrl = process.env.GATSBY_PORTFOLIO_URL

  return (
    <iframe
      src={portfolioUrl}
      title="Portfolio"
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

export default PortfolioPage
