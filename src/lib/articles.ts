import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

/** Опубликованные статьи, новые сверху */
export async function getArticles(): Promise<Article[]> {
  const all = await getCollection('articles', ({ data }) => !data.draft);
  // сначала по полю order, внутри — новые сверху
  return all.sort(
    (a, b) => a.data.order - b.data.order || (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0),
  );
}

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

/** Время чтения: ~180 слов в минуту */
export function readingTime(body: string | undefined): number {
  const words = (body ?? '').replace(/[#>*_`\-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

export function articleHref(a: Article): string {
  return a.data.external ?? `/articles/${a.id}/`;
}
