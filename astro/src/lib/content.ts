/**
 * Build-time content layer.
 *
 * Tries Supabase first (the owner's dashboard keeps working as the CMS),
 * falls back to the local cache so the build never breaks offline.
 * On Cloudflare Pages the build machine has network access, so the
 * published site always contains the latest Supabase content.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface Category { id: number; slug: string; emoji?: string; name_id?: string; name_en?: string; description_id?: string; description_en?: string; sort_order?: number; }
export interface Product {
  id: string | number; slug?: string; name: string; brand?: string; category_id?: number;
  rating?: number | string; price_text?: string; badge_id?: string; badge_en?: string;
  summary_id?: string; summary_en?: string; description_id?: string; description_en?: string;
  pros?: { id?: string[]; en?: string[] }; cons?: { id?: string[]; en?: string[] };
  image_url?: string; affiliate_url?: string; is_featured?: boolean;
}
export interface Article { id: string | number; slug?: string; title_id?: string; title_en?: string; excerpt_id?: string; excerpt_en?: string; cover_image_url?: string; category?: { name_en?: string }; }

const SUPABASE_URL = 'https://xnwbhhyjzjblfjkpsfaz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_n0jfaDMNvHMUvNBsarYp5Q_k6qHPDPQ';
const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'content-cache.json');

interface Content { categories: Category[]; products: Product[]; articles: Article[]; source: 'supabase' | 'cache' | 'empty'; }

function readCache(): Content | null {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch { return null; }
}

function writeCache(content: Content) {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ ...content, source: 'cache' }, null, 2));
  } catch { /* read-only fs is fine */ }
}

async function fetchTable<T>(table: string, query: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) throw new Error(`${table}: HTTP ${res.status}`);
  return res.json();
}

let cached: Content | null = null;

export async function getContent(): Promise<Content> {
  if (cached) return cached;
  try {
    const [categories, products, articles] = await Promise.all([
      fetchTable<Category>('categories', 'select=*&is_active=eq.true&order=sort_order.asc'),
      fetchTable<Product>('products', 'select=*&is_published=eq.true&order=created_at.desc'),
      fetchTable<Article>('articles', 'select=*,category:categories(name_en)&status=eq.published&order=published_at.desc')
    ]);
    cached = { categories, products, articles, source: 'supabase' };
    writeCache(cached);
    console.log(`[content] live from Supabase: ${categories.length} categories, ${products.length} products, ${articles.length} articles`);
    return cached;
  } catch (error) {
    const fallback = readCache();
    if (fallback) {
      cached = { ...fallback, source: 'cache' };
      console.warn(`[content] Supabase unreachable (${(error as Error).message}) — using local cache (${cached.products.length} products)`);
      return cached;
    }
    console.warn(`[content] Supabase unreachable and no cache — building with empty content. (${(error as Error).message})`);
    cached = { categories: [], products: [], articles: [], source: 'empty' };
    return cached;
  }
}

export const localized = (row: Record<string, any>, field: string, lang: 'id' | 'en' = 'id') =>
  row?.[`${field}_${lang}`] || row?.[`${field}_en`] || row?.[`${field}_id`] || '';
