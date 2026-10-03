import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Выполненные проекты: один .md — один кейс
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(), // короткое название-суть для плитки, до 40 знаков
    subtitle: z.string(), // что это за проект, одна строка
    metric: z.string(), // главная цифра для плитки: «15 → 24 %»
    metricLabel: z.string(), // подпись к цифре
    company: z.string(), // МТС Линк / Т-Банк / Aviasales
    industry: z.string(), // UCaaS / Финтех / Тревел / EdTech
    role: z.string(),
    order: z.number(),
    tone: z.enum(['grad', 'light', 'dark', 'soft']).default('light'),
    results: z.array(z.object({ value: z.string(), label: z.string() })),
    artifacts: z
      .array(z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() }))
      .default([]),
    draft: z.boolean().default(false),
    // устаревшие поля — не выводятся, оставлены, чтобы старые файлы не ломали сборку
    period: z.string().optional(),
    team: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Статьи: один .md — одна статья. Раздел на главной и пункт меню появляются, когда есть хотя бы одна
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(), // 1–2 предложения для карточки и поисковиков
      kind: z.enum(['Статья', 'Интервью', 'Кейс', 'Выступление']).default('Статья'),
      order: z.number().default(100), // порядок карточек: меньше — выше; новые свои статьи ставить выше внешних
      date: z.coerce.date().optional(), // можно не указывать, если дата публикации неизвестна
      source: z.string().optional(), // площадка: «basil education», «РСМ» — для внешних публикаций
      cover: image().optional(), // картинка в src/content/articles/… рядом со статьёй
      tags: z.array(z.string()).default([]),
      external: z.string().url().optional(), // если статья опубликована на другой площадке — ссылка туда
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects, articles };
