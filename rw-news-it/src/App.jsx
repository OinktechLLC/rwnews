import React, { useState, useEffect } from 'react';
import { extractTopics, getRecommendations, saveUserPreferences, getUserPreferences, checkCookies, acceptCookies, declineCookies } from './utils.js';
import CookieBanner from './CookieBanner.jsx';
import './App.css';

const RSS_URL = 'https://resource-world.ru/forums/-/index.rss';

export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [articles, setArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userPreferences, setUserPreferences] = useState([]);
    const [showCookieBanner, setShowCookieBanner] = useState(false);

    useEffect(() => {
        // Check cookies consent
        if (!checkCookies()) {
            setShowCookieBanner(true);
        }
        
        // Load user preferences
        const prefs = getUserPreferences();
        setUserPreferences(prefs);
        
        // Fetch RSS feed
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use a CORS proxy for RSS fetching
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`);
            const data = await response.json();
            
            if (!data.contents) {
                throw new Error('Не удалось получить RSS ленту');
            }
            
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, 'text/xml');
            
            const items = xml.querySelectorAll('item');
            const parsedArticles = [];
            
            items.forEach((item, index) => {
                const title = item.querySelector('title')?.textContent || '';
                const link = item.querySelector('link')?.textContent || '';
                const description = item.querySelector('description')?.textContent || '';
                const pubDate = item.querySelector('pubDate')?.textContent || '';
                const content = item.querySelector('content\\:encoded')?.textContent || 
                               item.querySelector('encoded')?.textContent || description;
                
                // Filter only articles (skip resources based on title patterns)
                const isResource = title.toLowerCase().includes('файл') || 
                                  title.toLowerCase().includes('скачать') ||
                                  title.toLowerCase().includes('resource');
                
                if (!isResource && title) {
                    const topics = extractTopics(title + ' ' + description);
                    parsedArticles.push({
                        id: index,
                        title,
                        link,
                        description: stripHtml(description),
                        content: stripHtml(content),
                        pubDate: new Date(pubDate).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        topics
                    });
                }
            });
            
            setArticles(parsedArticles);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const stripHtml = (html) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const handleArticleClick = (article) => {
        setSelectedArticle(article);
        setCurrentPage('article');
        
        // Update preferences based on clicked article
        const newPrefs = [...new Set([...userPreferences, ...article.topics])].slice(0, 10);
        setUserPreferences(newPrefs);
        saveUserPreferences(newPrefs);
    };

    const handleTopicSelect = (topic) => {
        if (userPreferences.includes(topic)) {
            const newPrefs = userPreferences.filter(t => t !== topic);
            setUserPreferences(newPrefs);
            saveUserPreferences(newPrefs);
        } else {
            const newPrefs = [...userPreferences, topic].slice(0, 10);
            setUserPreferences(newPrefs);
            saveUserPreferences(newPrefs);
        }
    };

    const handleAcceptCookies = () => {
        acceptCookies();
        setShowCookieBanner(false);
    };

    const handleDeclineCookies = () => {
        declineCookies();
        setShowCookieBanner(false);
    };

    const renderHeader = () => (
        <header className="header">
            <a href="#" className="logo" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setSelectedArticle(null); }}>
                📰 RW News IT
            </a>
            <nav className="nav">
                <button 
                    className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
                    onClick={() => { setCurrentPage('home'); setSelectedArticle(null); }}
                >
                    Главная
                </button>
                <button 
                    className={`nav-btn ${currentPage === 'faq' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('faq')}
                >
                    FAQ
                </button>
                <button 
                    className={`nav-btn ${currentPage === 'terms' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('terms')}
                >
                    Условия
                </button>
                <button 
                    className={`nav-btn ${currentPage === 'privacy' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('privacy')}
                >
                    Политика
                </button>
                <button 
                    className={`nav-btn ${currentPage === 'docs' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('docs')}
                >
                    Docs
                </button>
                <button 
                    className="refresh-btn"
                    onClick={fetchArticles}
                    title="Обновить новости"
                >
                    🔄 Обновить
                </button>
            </nav>
        </header>
    );

    const renderHome = () => (
        <div className="main-content">
            <div className="articles-list">
                {loading ? (
                    <div className="loading">Загрузка новостей...</div>
                ) : error ? (
                    <div className="error">Ошибка: {error}</div>
                ) : (
                    articles.map(article => (
                        <div 
                            key={article.id} 
                            className="article-card"
                            onClick={() => handleArticleClick(article)}
                        >
                            <h2 className="article-title">{article.title}</h2>
                            <div className="article-meta">
                                <span>📅 {article.pubDate}</span>
                                <span>🏷️ {article.topics.slice(0, 3).join(', ')}</span>
                            </div>
                            <p className="article-excerpt">
                                {article.description.substring(0, 200)}...
                            </p>
                        </div>
                    ))
                )}
            </div>
            
            <aside className="sidebar">
                <div className="preferences">
                    <h3 className="section-title">🎯 Ваши интересы</h3>
                    <div className="topic-tags">
                        {['Minecraft', 'Моды', 'Плагины', 'Серверы', 'BuildCraft', 'IndustrialCraft', 'Технологии', 'Гайды', 'Обновления', 'Советы'].map(topic => (
                            <span 
                                key={topic}
                                className={`topic-tag ${userPreferences.includes(topic) ? 'selected' : ''}`}
                                onClick={() => handleTopicSelect(topic)}
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
                
                <div className="recommendations">
                    <h3 className="section-title">💡 Рекомендации</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {userPreferences.length > 0 
                            ? `Мы рекомендуем статьи по темам: ${userPreferences.join(', ')}`
                            : 'Выберите интересы слева, чтобы получать персонализированные рекомендации'}
                    </p>
                </div>
            </aside>
        </div>
    );

    const renderArticle = () => (
        <div className="article-view">
            <button className="back-btn" onClick={() => setCurrentPage('home')}>
                ← Назад к новостям
            </button>
            
            {selectedArticle && (
                <>
                    <div className="article-view-header">
                        <h1 className="article-view-title">{selectedArticle.title}</h1>
                        <div className="article-view-meta">
                            <span>📅 {selectedArticle.pubDate}</span>
                            <span>🏷️ {selectedArticle.topics.join(', ')}</span>
                        </div>
                    </div>
                    
                    <div className="article-view-content">
                        <p>{selectedArticle.description}</p>
                        {selectedArticle.content && selectedArticle.content !== selectedArticle.description && (
                            <p>{selectedArticle.content}</p>
                        )}
                        
                        <a 
                            href={selectedArticle.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="source-link"
                        >
                            🔗 Открыть оригинал на Resource World →
                        </a>
                    </div>
                </>
            )}
        </div>
    );

    const renderFAQ = () => (
        <div className="page">
            <h1 className="page-title">❓ Часто задаваемые вопросы (FAQ)</h1>
            
            <div className="page-section">
                <h3>Что такое RW News IT?</h3>
                <p>RW News IT — это современное веб-приложение для чтения новостей с портала Resource World. Мы агрегируем статьи и новости, предоставляя удобный интерфейс для чтения.</p>
            </div>
            
            <div className="page-section">
                <h3>Как часто обновляются новости?</h3>
                <p>Новости обновляются автоматически при загрузке страницы. Вы также можете нажать кнопку "Обновить" в меню для получения свежих статей.</p>
            </div>
            
            <div className="page-section">
                <h3>Как работают рекомендации?</h3>
                <p>Система анализирует ваши предпочтения (выбранные темы) и историю просмотров, чтобы предлагать релевантные статьи. Чем больше вы используете приложение, тем точнее становятся рекомендации.</p>
            </div>
            
            <div className="page-section">
                <h3>Безопасно ли использовать приложение?</h3>
                <p>Да, приложение не требует регистрации и не собирает личные данные. Все данные о предпочтениях хранятся локально в вашем браузере.</p>
            </div>
            
            <div className="page-section">
                <h3>Можно ли читать статьи без перехода на сайт?</h3>
                <p>Да, большинство статей можно прочитать прямо в нашем приложении. Однако для полного доступа к некоторым материалам может потребоваться переход на оригинальный сайт Resource World.</p>
            </div>
        </div>
    );

    const renderTerms = () => (
        <div className="page">
            <h1 className="page-title">📋 Условия использования</h1>
            
            <div className="page-section">
                <h3>1. Общие положения</h3>
                <p>1.1. Используя RW News IT, вы соглашаетесь с данными условиями использования.</p>
                <p>1.2. Приложение предоставляет доступ к новостям с сайта Resource World через RSS-ленту.</p>
                <p>1.3. Мы не являемся авторами контента и не несем ответственности за содержание статей.</p>
            </div>
            
            <div className="page-section">
                <h3>2. Правила использования</h3>
                <p>2.1. Запрещено использовать приложение в коммерческих целях без разрешения.</p>
                <p>2.2. Запрещено модифицировать, копировать или распространять код приложения.</p>
                <p>2.3. Пользователь обязуется не нарушать авторские права владельцев контента.</p>
            </div>
            
            <div className="page-section">
                <h3>3. Ограничения ответственности</h3>
                <p>3.1. Приложение предоставляется "как есть" без каких-либо гарантий.</p>
                <p>3.2. Мы не гарантируем бесперебойную работу приложения.</p>
                <p>3.3. Мы не несем ответственности за убытки, возникшие в результате использования приложения.</p>
            </div>
            
            <div className="page-section">
                <h3>4. Изменения условий</h3>
                <p>4.1. Мы оставляем за собой право изменять условия использования в любое время.</p>
                <p>4.2. Продолжение использования приложения после изменений означает согласие с новыми условиями.</p>
            </div>
        </div>
    );

    const renderPrivacy = () => (
        <div className="page">
            <h1 className="page-title">🔒 Политика конфиденциальности</h1>
            
            <div className="page-section">
                <h3>1. Сбор данных</h3>
                <p>1.1. Мы собираем минимальный объем данных для улучшения работы приложения:</p>
                <ul>
                    <li>Предпочтения по темам новостей (хранятся локально)</li>
                    <li>История просмотров (хранится локально)</li>
                    <li>Технические данные (тип браузера, разрешение экрана)</li>
                </ul>
            </div>
            
            <div className="page-section">
                <h3>2. Использование файлов cookie</h3>
                <p>2.1. Приложение использует файлы cookie для:</p>
                <ul>
                    <li>Сохранения пользовательских предпочтений</li>
                    <li>Анализа использования приложения</li>
                    <li>Персонализации контента</li>
                </ul>
                <p>2.2. Вы можете отключить cookie в настройках браузера, но это может ограничить функциональность.</p>
            </div>
            
            <div className="page-section">
                <h3>3. Защита данных</h3>
                <p>3.1. Все данные хранятся локально в вашем браузере и не передаются на наши серверы.</p>
                <p>3.2. Мы не передаем данные третьим лицам.</p>
                <p>3.3. Мы используем современные методы защиты данных.</p>
            </div>
            
            <div className="page-section">
                <h3>4. Ваши права</h3>
                <p>4.1. Вы имеете право на доступ к своим данным.</p>
                <p>4.2. Вы можете запросить удаление своих данных.</p>
                <p>4.3. Вы можете отозвать согласие на обработку данных в любой момент.</p>
            </div>
            
            <div className="page-section">
                <h3>5. Контакты</h3>
                <p>По вопросам конфиденциальности обращайтесь: privacy@rwnewsit.local</p>
            </div>
        </div>
    );

    const renderDocs = () => (
        <div className="page">
            <h1 className="page-title">📚 Документация</h1>
            
            <div className="page-section">
                <h3>О проекте</h3>
                <p>RW News IT — это open-source проект для чтения новостей Resource World. Приложение построено на современных технологиях: React, HTML5, CSS3.</p>
            </div>
            
            <div className="page-section">
                <h3>Технологический стек</h3>
                <ul>
                    <li><strong>Frontend:</strong> React 18, JSX</li>
                    <li><strong>Стили:</strong> CSS3 с переменными</li>
                    <li><strong>Данные:</strong> RSS парсинг через CORS-прокси</li>
                    <li><strong>Хранение:</strong> LocalStorage для предпочтений пользователя</li>
                </ul>
            </div>
            
            <div className="page-section">
                <h3>Архитектура приложения</h3>
                <p>Приложение состоит из следующих компонентов:</p>
                <ul>
                    <li><strong>App.jsx</strong> — главный компонент, управляет навигацией</li>
                    <li><strong>CookieBanner.jsx</strong> — баннер согласия на cookie</li>
                    <li><strong>utils.js</strong> — вспомогательные функции для парсинга и рекомендаций</li>
                </ul>
            </div>
            
            <div className="page-section">
                <h3>API и источники данных</h3>
                <p>Приложение использует:</p>
                <ul>
                    <li>RSS-лента: https://resource-world.ru/forums/-/index.rss</li>
                    <li>CORS-прокси: api.allorigins.win</li>
                </ul>
            </div>
            
            <div className="page-section">
                <h3>Установка и запуск</h3>
                <p>1. Клонируйте репозиторий</p>
                <p>2. Откройте public/index.html в браузере</p>
                <p>3. Или используйте локальный сервер для разработки</p>
            </div>
            
            <div className="page-section">
                <h3>Вклад в проект</h3>
                <p>Приветствуются pull requests, баг-репорты и предложения по улучшению!</p>
            </div>
        </div>
    );

    return (
        <div className="app">
            {renderHeader()}
            
            {currentPage === 'home' && renderHome()}
            {currentPage === 'article' && renderArticle()}
            {currentPage === 'faq' && renderFAQ()}
            {currentPage === 'terms' && renderTerms()}
            {currentPage === 'privacy' && renderPrivacy()}
            {currentPage === 'docs' && renderDocs()}
            
            <CookieBanner 
                show={showCookieBanner}
                onAccept={handleAcceptCookies}
                onDecline={handleDeclineCookies}
            />
        </div>
    );
}
