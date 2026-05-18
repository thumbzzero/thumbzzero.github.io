import * as React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const [query, setQuery] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState([])

  const allTags = React.useMemo(() => {
    const tagSet = new Set()
    posts.forEach(post => {
      ;(post.frontmatter.tags || []).forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [posts])

  const toggleTag = tag => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const filteredPosts = posts.filter(post => {
    const q = query.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (post.frontmatter.title || "").toLowerCase().includes(q) ||
      (post.frontmatter.description || post.excerpt || "")
        .toLowerCase()
        .includes(q)

    const postTags = post.frontmatter.tags || []
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every(tag => postTags.includes(tag))

    return matchesSearch && matchesTags
  })

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <Bio />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    )
  }

  return (
    <Layout location={location} title={siteTitle}>
      <Bio />
      <div className="search-wrapper">
        <input
          className="search-input"
          type="search"
          placeholder="Search posts..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search posts"
        />
      </div>
      {allTags.length > 0 && (
        <div className="tag-filter">
          <span className="tag-filter-label">Tags</span>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-filter-btn${selectedTags.includes(tag) ? " active" : ""}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      <ol style={{ listStyle: `none` }}>
        {filteredPosts.length === 0 ? (
          <p className="search-empty">No posts match "{query}"</p>
        ) : (
          filteredPosts.map(post => {
            const title = post.frontmatter.title || post.fields.slug

            return (
              <li key={post.fields.slug}>
                <article
                  className="post-list-item"
                  itemScope
                  itemType="http://schema.org/Article"
                >
                  <header>
                    <h2>
                      <Link to={post.fields.slug} itemProp="url">
                        <span itemProp="headline">{title}</span>
                      </Link>
                    </h2>
                    <small>{post.frontmatter.date}</small>
                    {post.frontmatter.tags?.length > 0 && (
                      <div className="post-tags">
                        {post.frontmatter.tags.map(tag => (
                          <button
                            key={tag}
                            className={`tag-pill${selectedTags.includes(tag) ? " active" : ""}`}
                            onClick={e => {
                              e.preventDefault()
                              toggleTag(tag)
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </header>
                  <section>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: post.frontmatter.description || post.excerpt,
                      }}
                      itemProp="description"
                    />
                  </section>
                </article>
              </li>
            )
          })
        )}
      </ol>
    </Layout>
  )
}

export default BlogIndex

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => <Seo title="All posts" />

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
          tags
        }
      }
    }
  }
`
