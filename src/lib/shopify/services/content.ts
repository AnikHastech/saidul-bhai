// ============================================================
//  Content services — menus + shop (2026-04)
// ============================================================
import { shopifyFetch } from '../client';
import {
  MENU_QUERY,
  SHOP_QUERY,
  PAGE_QUERY,
  ARTICLES_QUERY,
  ARTICLE_QUERY,
} from '../graphql/content';
import { mapArticle, nodes } from '../transforms';
import type { Article, Menu, Shop } from '../types';

export interface ShopifyPage {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary?: string;
  seo?: { title?: string | null; description?: string | null };
}

/** A CMS page by handle, or null if it doesn't exist. */
export async function getPage(handle: string): Promise<ShopifyPage | null> {
  const data = await shopifyFetch<{ page: ShopifyPage | null }>(PAGE_QUERY, { handle });
  return data.page ?? null;
}

/** Navigation menu by handle (e.g. "main-menu", "footer"). Null if missing. */
export async function getMenu(handle: string): Promise<Menu | null> {
  const data = await shopifyFetch<{ menu: Menu | null }>(MENU_QUERY, { handle });
  return data.menu ?? null;
}

/** Shop name + primary domain. */
export async function getShop(): Promise<Shop> {
  const data = await shopifyFetch<{ shop: Shop }>(SHOP_QUERY);
  return data.shop;
}

/** Recent articles from a blog (defaults to the "news" blog). Empty if none. */
export async function getArticles(blogHandle = 'news', first = 12): Promise<Article[]> {
  const data = await shopifyFetch<{ blog: { articles: any } | null }>(ARTICLES_QUERY, {
    blogHandle,
    first,
  });
  if (!data.blog) return [];
  return nodes(data.blog.articles).map(mapArticle);
}

/** A single article by handle within a blog, or null if not found. */
export async function getArticle(handle: string, blogHandle = 'news'): Promise<Article | null> {
  const data = await shopifyFetch<{ blog: { articleByHandle: any | null } | null }>(ARTICLE_QUERY, {
    blogHandle,
    handle,
  });
  const article = data.blog?.articleByHandle;
  return article ? mapArticle(article) : null;
}
