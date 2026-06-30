// ============================================================
//  Content GraphQL operations — menus, shop (2026-04)
// ============================================================

/** Navigation menu by handle (e.g. "main-menu", "footer"); nests 3 levels. */
export const MENU_QUERY = /* GraphQL */ `
  query Menu($handle: String!) {
    menu(handle: $handle) {
      id
      title
      items {
        id
        title
        url
        type
        items {
          id
          title
          url
          type
          items {
            id
            title
            url
            type
          }
        }
      }
    }
  }
`;

/** Shop name + primary domain — for SEO and footer. */
export const SHOP_QUERY = /* GraphQL */ `
  query Shop {
    shop {
      name
      description
      primaryDomain {
        url
        host
      }
    }
  }
`;

/** A CMS page by handle (about, shipping, etc.). */
export const PAGE_QUERY = /* GraphQL */ `
  query Page($handle: String!) {
    page(handle: $handle) {
      id
      title
      handle
      body
      bodySummary
      seo {
        title
        description
      }
    }
  }
`;

/** Articles from a blog (journal index + home news row). */
export const ARTICLES_QUERY = /* GraphQL */ `
  query Articles($blogHandle: String!, $first: Int = 12) {
    blog(handle: $blogHandle) {
      handle
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            excerpt
            contentHtml
            publishedAt
            authorV2 { name }
            image { url altText width height }
          }
        }
      }
    }
  }
`;

/** A single article by handle within a blog. */
export const ARTICLE_QUERY = /* GraphQL */ `
  query Article($blogHandle: String!, $handle: String!) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $handle) {
        id
        title
        handle
        excerpt
        contentHtml
        publishedAt
        authorV2 { name }
        image { url altText width height }
        seo { title description }
      }
    }
  }
`;
