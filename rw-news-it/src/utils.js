// Умные рекомендации и управление предпочтениями пользователя

const TOPIC_KEYWORDS = {
    'Minecraft': ['minecraft', 'майнкрафт', 'mc', 'крафт'],
    'Моды': ['мод', 'мода', 'mods', 'modpack'],
    'Плагины': ['плагин', 'плагины', 'plugin', 'spigot', 'bukkit', 'paper'],
    'Серверы': ['сервер', 'сервера', 'server', 'хостинг'],
    'BuildCraft': ['buildcraft', 'билдкрафт', 'bc mod', 'трубы', 'карьеры'],
    'IndustrialCraft': ['industrialcraft', 'ика', 'ic2', 'индастриал'],
    'Технологии': ['технологии', 'technology', 'технические', 'механизмы'],
    'Гайды': ['гайд', 'руководство', 'guide', 'туториал', 'обучение'],
    'Обновления': ['обновление', 'update', 'релиз', 'версия', 'patch'],
    'Советы': ['совет', 'tips', 'лайфхак', 'рекомендации']
};

/**
 * Извлекает темы из текста статьи
 */
export function extractTopics(text) {
    const topics = [];
    const lowerText = text.toLowerCase();
    
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            topics.push(topic);
        }
    }
    
    // Если тем не найдено, добавляем общую
    if (topics.length === 0) {
        topics.push('Новости');
    }
    
    return topics;
}

/**
 * Получает рекомендации на основе предпочтений пользователя
 */
export function getRecommendations(articles, userPreferences, viewedArticles = []) {
    if (!userPreferences || userPreferences.length === 0) {
        // Если нет предпочтений, возвращаем последние статьи
        return articles.slice(0, 5);
    }
    
    // Считаем релевантность каждой статьи
    const scoredArticles = articles.map(article => {
        let score = 0;
        
        // Баллы за совпадение тем
        article.topics.forEach(topic => {
            if (userPreferences.includes(topic)) {
                score += 10;
            }
        });
        
        // Баллы за недавность
        const pubDate = new Date(article.pubDate);
        const daysOld = (new Date() - pubDate) / (1000 * 60 * 60 * 24);
        if (daysOld < 1) score += 5;
        else if (daysOld < 3) score += 3;
        else if (daysOld < 7) score += 1;
        
        // Штраф за уже просмотренные
        if (viewedArticles.includes(article.id)) {
            score -= 20;
        }
        
        return { ...article, score };
    });
    
    // Сортируем по релевантности и возвращаем топ-5
    return scoredArticles
        .sort((a, b) => b.score - a.score)
        .filter(article => !viewedArticles.includes(article.id))
        .slice(0, 5);
}

/**
 * Сохраняет предпочтения пользователя в localStorage
 */
export function saveUserPreferences(preferences) {
    try {
        localStorage.setItem('rw_news_preferences', JSON.stringify(preferences));
        localStorage.setItem('rw_news_prefs_updated', new Date().toISOString());
    } catch (e) {
        console.warn('Не удалось сохранить предпочтения:', e);
    }
}

/**
 * Получает предпочтения пользователя из localStorage
 */
export function getUserPreferences() {
    try {
        const stored = localStorage.getItem('rw_news_preferences');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Не удалось получить предпочтения:', e);
    }
    return [];
}

/**
 * Проверяет согласие на cookie
 */
export function checkCookies() {
    return localStorage.getItem('rw_news_cookies_consent') === 'accepted';
}

/**
 * Принимает согласие на cookie
 */
export function acceptCookies() {
    localStorage.setItem('rw_news_cookies_consent', 'accepted');
    localStorage.setItem('rw_news_cookies_date', new Date().toISOString());
}

/**
 * Отклоняет согласие на cookie
 */
export function declineCookies() {
    localStorage.setItem('rw_news_cookies_consent', 'declined');
}

/**
 * Сохраняет историю просмотров
 */
export function saveViewedArticle(articleId) {
    try {
        const viewed = JSON.parse(localStorage.getItem('rw_news_viewed') || '[]');
        if (!viewed.includes(articleId)) {
            viewed.unshift(articleId);
            // Храним только последние 50 просмотров
            viewed.splice(50);
            localStorage.setItem('rw_news_viewed', JSON.stringify(viewed));
        }
    } catch (e) {
        console.warn('Не удалось сохранить историю просмотров:', e);
    }
}

/**
 * Получает историю просмотров
 */
export function getViewedArticles() {
    try {
        return JSON.parse(localStorage.getItem('rw_news_viewed') || '[]');
    } catch (e) {
        console.warn('Не удалось получить историю просмотров:', e);
        return [];
    }
}

/**
 * Очищает все данные пользователя
 */
export function clearUserData() {
    localStorage.removeItem('rw_news_preferences');
    localStorage.removeItem('rw_news_viewed');
    localStorage.removeItem('rw_news_cookies_consent');
    localStorage.removeItem('rw_news_cookies_date');
    localStorage.removeItem('rw_news_prefs_updated');
}

/**
 * Анализирует поведение пользователя для улучшения рекомендаций
 */
export function analyzeUserBehavior() {
    const preferences = getUserPreferences();
    const viewed = getViewedArticles();
    
    return {
        preferencesCount: preferences.length,
        viewedCount: viewed.length,
        hasPreferences: preferences.length > 0,
        isActiveUser: viewed.length > 5,
        lastActive: localStorage.getItem('rw_news_prefs_updated')
    };
}
