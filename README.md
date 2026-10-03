# rinakzhigitov.ru

Личный сайт Рината Акжигитова — продакт-менеджера. Astro, статика, GitHub Pages.

## Как редактировать

| Что поменять | Где |
|---|---|
| Тексты главной: заголовок, факты, «Обо мне», компетенции, компании, образование, «Вне работы» | `src/data/site.ts` |
| Кейсы (один файл — один проект) | `src/content/projects/*.md`, схема полей — `src/content.config.ts` |
| Цвета, шрифты, размеры | `src/styles/global.css` |
| Фото | `src/assets/photo/` |
| Логотипы компаний | `public/logos/` + список в `src/data/site.ts` |
| Резюме | `public/resume.pdf` |

Папка `materials/` — исходники кейсов и фото. В репозиторий не попадает (`.gitignore`).

## Команды

```bash
npm install        # один раз
npm run dev        # локально: http://localhost:4321
npm run build      # сборка в dist/
```

Публикация — автоматически при пуше в `main` (GitHub Actions → GitHub Pages).
