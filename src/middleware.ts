import { defineMiddleware } from 'astro:middleware';
import { typografHtml } from './lib/typograf-html';

// Типограф для всех HTML-страниц: висячие предлоги, неразрывные пробелы у чисел и тире
export const onRequest = defineMiddleware(async (_ctx, next) => {
  const res = await next();
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('text/html')) return res;
  const html = await res.text();
  return new Response(typografHtml(html), { status: res.status, headers: res.headers });
});
