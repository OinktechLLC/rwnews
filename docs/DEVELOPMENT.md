# Документация разработчика

## Обзор проекта

RW News IT - это современное React-приложение для агрегации новостей с сайта Resource World.

## Архитектура

### Компоненты

```
App (основной)
├── Header (навигация)
├── Main
│   ├── Recommendations (умные рекомендации)
│   ├── PreferencesSection (управление предпочтениями)
│   ├── AllArticles (список статей)
│   └── ArticleView (просмотр статьи)
├── Footer
└── CookieBanner
```

### Модули

- **main.jsx** - точка входа, рендеринг приложения
- **App.jsx** - основной компонент с логикой
- **utils.js** - утилиты для парсинга и рекомендаций
- **CookieBanner.jsx** - компонент уведомления о cookie
- **App.css** - стили с CSS переменными

## API

### RSS Парсинг

```javascript
import { parseRSS } from './utils'

const articles = await parseRSS()
// Возвращает массив объектов Article
```

#### Структура Article

```typescript
interface Article {
  id: string          // Уникальный идентификатор
  title: string       // Заголовок статьи
  link: string        // Ссылка на оригинал
  description: string // Краткое описание
  pubDate: string     // Дата публикации
  category: string    // Категория
  isArticle: boolean  // Флаг статьи (отфильтровано)
}
```

### Рекомендации

```javascript
import { getRecommendations } from './utils'

const recommended = getRecommendations(articles, preferences)
// preferences - массив строк (ключевые слова)
```

#### Алгоритм рекомендаций

1. Для каждой статьи подсчитывается score
2. Баллы начисляются за совпадения:
   - Заголовок: +2 балла
   - Описание: +1 балл
   - Категория: +3 балла
3. Статьи сортируются по убыванию score
4. Возвращаются топ-5 статей

### Управление предпочтениями

```javascript
import { savePreferences, getPreferences } from './utils'

// Сохранение
savePreferences(['JavaScript', 'React', 'Node.js'])

// Получение
const prefs = getPreferences()
// ['JavaScript', 'React', 'Node.js']
```

### Cookie

```javascript
import { acceptCookies, cookiesAccepted } from './utils'

// Проверка статуса
if (!cookiesAccepted()) {
  // Показать баннер
}

// Принятие
acceptCookies()
```

## Стилизация

### CSS Переменные

```css
:root {
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --background: #f8fafc;
  --card-background: #ffffff;
  /* ... другие переменные */
}
```

### Адаптивность

Приложение использует mobile-first подход:
- Базовые стили для мобильных устройств
- Media queries для планшетов и десктопов
- Grid и Flexbox для layout

## Сборка и развертывание

### Локальная разработка

```bash
npm install
npm run dev
# Приложение откроется на http://localhost:3000
```

### Production сборка

```bash
npm run build
# Результат в папке dist/
```

### Развертывание на GitHub Pages

1. Установите gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Добавьте в package.json:
```json
{
  "homepage": "https://username.github.io/rw-news-it",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Задеплойте:
```bash
npm run deploy
```

## Тестирование

### Ручное тестирование

1. Проверка загрузки RSS
2. Фильтрация статей
3. Работа рекомендаций
4. Сохранение предпочтений
5. Cookie баннер
6. Навигация между страницами
7. Адаптивность

### Автоматическое тестирование

Рекомендуется добавить:
- Unit тесты для utils.js
- Component тесты для основных компонентов
- E2E тесты для критических путей

## Производительность

### Оптимизации

- Ленивая загрузка изображений (если будут добавлены)
- Мемоизация тяжелых вычислений
- Code splitting для больших компонентов
- Минификация в production

### Metrics

Целевые показатели:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

## Безопасность

### Реализованные меры

- Sanitization HTML контента (stripHtml функция)
- CORS proxy для безопасного доступа к RSS
- LocalStorage вместо cookies для чувствительных данных
- HTTPS только ссылки на внешние ресурсы

### Рекомендации

- Регулярно обновлять зависимости
- Использовать Content Security Policy
- Валидировать все входные данные

## Расширение функционала

### Возможные улучшения

1. **Темная тема**
   - Добавить CSS переменные для темной темы
   - Переключатель в UI

2. **Поиск по статьям**
   - Поиск по заголовку и описанию
   - Фильтрация по дате и категории

3. **Избранное**
   - Сохранение статей в LocalStorage
   - Отдельная страница для избранного

4. **Уведомления**
   - Push уведомления о новых статьях
   - Service Worker для офлайн режима

5. **Мультиязычность**
   - i18n библиотека
   - Переключатель языков

## Отладка

### Console logging

```javascript
// В utils.js включите логи для отладки
console.log('Parsed articles:', articles)
console.log('Recommendations:', recommendedArticles)
```

### React DevTools

Установите расширение React DevTools для:
- Инспекции компонентов
- Отладки состояния
- Профилирования производительности

## Лицензия

MIT License - свободное использование с указанием авторства.

---

**Контакты:** Создайте Issue в репозитории для вопросов по разработке.
