import { typograf } from './typograf';

/** Применяет типограф к текстовым узлам HTML, не трогая теги, атрибуты, <script>, <style>, <pre>, <code>. */
export function typografHtml(html: string): string {
  const skip = /<(script|style|pre|code|textarea)\b[\s\S]*?<\/\1>/gi;
  const parts: string[] = [];
  let last = 0;
  for (const m of html.matchAll(skip)) {
    parts.push(process(html.slice(last, m.index)));
    parts.push(m[0]);
    last = m.index! + m[0].length;
  }
  parts.push(process(html.slice(last)));
  return parts.join('');
}

function process(chunk: string): string {
  // текст между тегами
  return chunk.replace(/>([^<]+)</g, (_, text: string) => `>${typograf(text)}<`);
}
