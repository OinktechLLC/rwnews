# 📚 Документация для разработчиков

## О проекте

RW News IT — это open-source проект для чтения новостей Resource World. Приложение построено на современных технологиях: React, HTML5, CSS3.

## Технологический стек

### Frontend
- **React 18** - библиотека для создания пользовательских интерфейсов
- **JSX** - синтаксическое расширение JavaScript
- **CSS3** - стилизация с использованием CSS Custom Properties

### Инструменты сборки
- **Vite** - быстрый сборщик проектов
- **Babel** - транспиляция JSX

### Данные и хранение
- **RSS** - источник новостей (Resource World)
- **CORS Proxy** - api.allorigins.win для обхода CORS
- **LocalStorage** - хранение предпочтений пользователя

## Архитектура приложения

```
rw-news-it/
├── public/
│   ├── index.html          # Точка входа HTML
│   └── styles.css          # Глобальные стили
├── src/
│   ├── main.jsx            # Точка входа React
│   ├── App.jsx             # Главный компонент
│   ├── CookieBanner.jsx    # Компонент баннера cookie
│   └── utils.js            # Утилиты и функции
├── docs/                   # Документация
├── package.json            # Зависимости npm
└── vite.config.js          # Конфигурация Vite
```

## Компоненты

### App.jsx

Главный компонент приложения, управляет:
- Навигацией между страницами
- Загрузкой и отображением статей
- Пользовательскими предпочтениями
- Cookie consent

**Состояния:**
```javascript
const [currentPage, setCurrentPage] = useState('home');
const [articles, setArticles] = useState([]);
const [selectedArticle, setSelectedArticle] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [userPreferences, setUserPreferences] = useState([]);
const [showCookieBanner, setShowCookieBanner] = useState(false);
```

### CookieBanner.jsx

Компонент баннера согласия на cookie:
- Отображается при первом посещении
- Предлагает принять или отклонить cookie
- Сохраняет выбор пользователя

### utils.js

Набор вспомогательных функций:

| Функция | Описание |
|---------|----------|
| `extractTopics(text)` | Извлекает темы из текста статьи |
| `getRecommendations(articles, prefs, viewed)` | Получает рекомендации |
| `saveUserPreferences(prefs)` | Сохраняет предпочтения |
| `getUserPreferences()` | Получает предпочтения |
| `checkCookies()` | Проверяет согласие на cookie |
| `acceptCookies()` | Принимает cookie |
| `declineCookies()` | Отклоняет cookie |
| `saveViewedArticle(id)` | Сохраняет историю просмотров |
| `getViewedArticles()` | Получает историю просмотров |
| `clearUserData()` | Очищает все данные |
| `analyzeUserBehavior()` | Анализирует поведение |

## API и источники данных

### RSS Лента

**URL:** `https://resource-world.ru/forums/-/index.rss`

**Формат ответа:**
```xml
<rss>
  <channel>
    <item>
      <title>Заголовок статьи</title>
      <link>https://...</link>
      <description>Краткое описание</description>
      <pubDate>Дата публикации</pubDate>
      <content:encoded>Полный контент</content:encoded>
    </item>
  </channel>
</rss>
```

### CORS Proxy

**URL:** `https://api.allorigins.win/get?url=<encoded_url>`

**Использование:**
```javascript
const response = await fetch(
  `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`
);
const data = await response.json();
const xml = parser.parseFromString(data.contents, 'text/xml');
```

## Установка и запуск

### Простой способ

```bash
# Открыть в браузере
open public/index.html
```

### С локальным сервером

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve public
```

### Для разработки с Vite

```bash
# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Сборка продакшн версии
npm run build
```

## Система рекомендаций

### Алгоритм

1. **Анализ тем**: Извлечение ключевых слов из текста
2. **Сопоставление**: Сравнение с предпочтениями пользователя
3. **Оценка релевантности**:
   - +10 баллов за каждую совпавшую тему
   - +5 баллов за статью сегодня
   - +3 балла за статью за последние 3 дня
   - +1 балл за статью за последнюю неделю
   - -20 баллов за уже просмотренную статью

### Темы

```javascript
const TOPIC_KEYWORDS = {
    'Minecraft': ['minecraft', 'майнкрафт', 'mc', 'крафт'],
    'Моды': ['мод', 'мода', 'mods', 'modpack'],
    'Плагины': ['плагин', 'плагины', 'plugin', 'spigot'],
    'Серверы': ['сервер', 'сервера', 'server', 'хостинг'],
    'BuildCraft': ['buildcraft', 'билдкрафт', 'bc mod'],
    'IndustrialCraft': ['industrialcraft', 'ика', 'ic2'],
    'Технологии': ['технологии', 'technology', 'технические'],
    'Гайды': ['гайд', 'руководство', 'guide', 'туториал'],
    'Обновления': ['обновление', 'update', 'релиз', 'версия'],
    'Советы': ['совет', 'tips', 'лайфхак', 'рекомендации']
};
```

## Хранение данных

### LocalStorage Keys

| Ключ | Тип | Описание |
|------|-----|----------|
| `rw_news_preferences` | Array | Предпочтения пользователя |
| `rw_news_viewed` | Array | История просмотров |
| `rw_news_cookies_consent` | String | Согласие на cookie |
| `rw_news_cookies_date` | String | Дата согласия |
| `rw_news_prefs_updated` | String | Дата обновления предпочтений |

## Вклад в проект

### Как внести вклад

1. Форкните репозиторий
2. Создайте ветку (`git checkout -b feature/AmazingFeature`)
3. Внесите изменения (`git commit -m 'Add some AmazingFeature'`)
4. Отправьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

### Стандарты кода

- Используйте функциональные компоненты React
- Применяйте хуки для управления состоянием
- Следуйте принципам чистого кода
- Комментируйте сложные участки

### Стиль кода

```javascript
// Правильно
export function MyComponent({ prop }) {
    const [state, setState] = useState(initialValue);
    
    useEffect(() => {
        // логика
    }, [dependencies]);
    
    return <div>{content}</div>;
}
```

## Лицензия

MIT License - свободное использование с указанием авторства.

---

**RW News IT Development Team** © 2024
