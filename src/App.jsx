import { useState, useEffect } from 'react'
import { parseRSS, getRecommendations, savePreferences, getPreferences } from './utils'
import CookieBanner from './CookieBanner'

function App() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [currentPage, setCurrentPage] = useState('home')
  const [preferences, setPreferences] = useState([])
  const [prefInput, setPrefInput] = useState('')

  useEffect(() => {
    loadArticles()
    setPreferences(getPreferences())
  }, [])

  const loadArticles = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await parseRSS()
      if (data && data.length > 0) {
        setArticles(data)
      } else {
        setError('Не удалось загрузить новости. Проверьте подключение к интернету или попробуйте позже.')
      }
    } catch (err) {
      setError(err.message || 'Произошла ошибка при загрузке новостей')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPreference = () => {
    if (prefInput.trim()) {
      const newPrefs = [...preferences, prefInput.trim()]
      setPreferences(newPrefs)
      savePreferences(newPrefs)
      setPrefInput('')
    }
  }

  const handleRemovePreference = (index) => {
    const newPrefs = preferences.filter((_, i) => i !== index)
    setPreferences(newPrefs)
    savePreferences(newPrefs)
  }

  const recommendedArticles = getRecommendations(articles, preferences)

  const renderContent = () => {
    switch(currentPage) {
      case 'faq':
        return (
          <div className="page-content">
            <h1>FAQ - Часто задаваемые вопросы</h1>
            <div className="faq-item">
              <h3>Откуда берутся новости?</h3>
              <p>Новости автоматически загружаются из RSS-ленты Resource World (https://resource-world.ru/forums/-/index.rss)</p>
            </div>
            <div className="faq-item">
              <h3>Как работают рекомендации?</h3>
              <p>Система анализирует ваши предпочтения (ключевые слова) и подбирает статьи, которые соответствуют вашим интересам.</p>
            </div>
            <div className="faq-item">
              <h3>Можно ли читать статьи офлайн?</h3>
              <p>Нет, для загрузки новостей требуется подключение к интернету.</p>
            </div>
            <button onClick={() => setCurrentPage('home')} className="back-btn">← Назад</button>
          </div>
        )
      case 'terms':
        return (
          <div className="page-content">
            <h1>Условия использования</h1>
            <p>1. Сервис предоставляет доступ к новостям из открытых RSS-источников.</p>
            <p>2. Все права на контент принадлежат ресурсу Resource World.</p>
            <p>3. Запрещено использование сервиса в коммерческих целях без разрешения.</p>
            <p>4. Мы не несем ответственности за точность информации в статьях.</p>
            <button onClick={() => setCurrentPage('home')} className="back-btn">← Назад</button>
          </div>
        )
      case 'privacy':
        return (
          <div className="page-content">
            <h1>Политика конфиденциальности</h1>
            <p>1. Мы собираем минимальные данные: предпочтения пользователей (хранятся локально в браузере).</p>
            <p>2. Cookie используются только для сохранения настроек пользователя.</p>
            <p>3. Мы не передаем данные третьим лицам.</p>
            <p>4. Вы можете очистить свои данные в любой момент через настройки браузера.</p>
            <button onClick={() => setCurrentPage('home')} className="back-btn">← Назад</button>
          </div>
        )
      case 'docs':
        return (
          <div className="page-content">
            <h1>Документация разработчика</h1>
            <h3>Технологии:</h3>
            <ul>
              <li>React 18 + Vite</li>
              <li>CSS Variables для темизации</li>
              <li>DOMParser для парсинга XML</li>
            </ul>
            <h3>API:</h3>
            <p>RSS: https://resource-world.ru/forums/-/index.rss</p>
            <p>CORS Proxy: Автоматический выбор из 15 прокси (AllOrigins, CorsProxy.io, ThingProxy и др.)</p>
            <h3>Структура проекта:</h3>
            <pre>
{`rw-news-it/
├── src/
│   ├── App.jsx (основной компонент)
│   ├── utils.js (парсинг и рекомендации)
│   └── CookieBanner.jsx
├── docs/
│   ├── FAQ.md
│   ├── TERMS.md
│   └── PRIVACY.md
└── README.md`}
            </pre>
            <button onClick={() => setCurrentPage('home')} className="back-btn">← Назад</button>
          </div>
        )
      default:
        return (
          <div className="home-content">
            {/* Блок рекомендаций */}
            {preferences.length > 0 && (
              <section className="recommendations">
                <h2>🎯 Рекомендации для вас</h2>
                <div className="articles-grid">
                  {recommendedArticles.slice(0, 3).map(article => (
                    <div key={article.id} className="article-card recommended" onClick={() => setSelectedArticle(article)}>
                      <h3>{article.title}</h3>
                      <p className="date">{new Date(article.pubDate).toLocaleDateString('ru-RU')}</p>
                      <p className="excerpt">{article.description.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Управление предпочтениями */}
            <section className="preferences-section">
              <h2>⚙️ Мои предпочтения</h2>
              <div className="pref-input-group">
                <input 
                  type="text" 
                  value={prefInput}
                  onChange={(e) => setPrefInput(e.target.value)}
                  placeholder="Добавить тему (например: JavaScript, React)"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPreference()}
                />
                <button onClick={handleAddPreference} className="add-btn">Добавить</button>
              </div>
              <div className="preferences-list">
                {preferences.map((pref, index) => (
                  <span key={index} className="pref-tag">
                    {pref}
                    <button onClick={() => handleRemovePreference(index)}>×</button>
                  </span>
                ))}
                {preferences.length === 0 && <p className="no-prefs">Добавьте темы для персональных рекомендаций</p>}
              </div>
            </section>

            {/* Все статьи */}
            <section className="all-articles">
              <h2>📰 Все новости</h2>
              {loading ? (
                <div className="loading">Загрузка новостей...</div>
              ) : error ? (
                <div className="error-message">
                  <p>⚠️ {error}</p>
                  <button onClick={loadArticles} className="retry-btn">Попробовать снова</button>
                </div>
              ) : articles.length === 0 ? (
                <div className="no-articles">
                  <p>Новости не найдены</p>
                  <button onClick={loadArticles} className="retry-btn">Обновить</button>
                </div>
              ) : (
                <div className="articles-grid">
                  {articles.map(article => (
                    <div key={article.id} className="article-card" onClick={() => setSelectedArticle(article)}>
                      <h3>{article.title}</h3>
                      <p className="date">{new Date(article.pubDate).toLocaleDateString('ru-RU')}</p>
                      <p className="excerpt">{article.description.substring(0, 150)}...</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1 onClick={() => { setCurrentPage('home'); setSelectedArticle(null); }} className="logo">
          RW News IT
        </h1>
        <nav className="nav">
          <button onClick={() => { setCurrentPage('home'); setSelectedArticle(null); }}>Главная</button>
          <button onClick={() => setCurrentPage('faq')}>FAQ</button>
          <button onClick={() => setCurrentPage('terms')}>Условия</button>
          <button onClick={() => setCurrentPage('privacy')}>Политика</button>
          <button onClick={() => setCurrentPage('docs')}>Docs</button>
        </nav>
      </header>

      <main className="main">
        {selectedArticle ? (
          <article className="article-view">
            <button onClick={() => setSelectedArticle(null)} className="back-btn">← Назад к списку</button>
            <h1>{selectedArticle.title}</h1>
            <p className="meta">
              <span className="date">{new Date(selectedArticle.pubDate).toLocaleString('ru-RU')}</span>
              {selectedArticle.category && <span className="category">{selectedArticle.category}</span>}
            </p>
            <div className="article-body">
              <p>{selectedArticle.description}</p>
            </div>
            <div className="article-actions">
              <a 
                href={selectedArticle.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="source-link"
              >
                Читать оригинал на Resource World →
              </a>
            </div>
          </article>
        ) : (
          renderContent()
        )}
      </main>

      <footer className="footer">
        <p>© 2024 RW News IT. Новости с Resource World.</p>
        <p>
          <a href="#terms" onClick={(e) => { e.preventDefault(); setCurrentPage('terms'); }}>Условия</a> | 
          <a href="#privacy" onClick={(e) => { e.preventDefault(); setCurrentPage('privacy'); }}> Политика</a> |
          <a href="#faq" onClick={(e) => { e.preventDefault(); setCurrentPage('faq'); }}> FAQ</a>
        </p>
      </footer>

      <CookieBanner />
    </div>
  )
}

export default App
