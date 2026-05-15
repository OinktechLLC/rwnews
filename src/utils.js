const RSS_URL = 'https://resource-world.ru/forums/-/index.rss'
const RSS2JSON_API = 'https://api.rss2json.com/api.json'

export const parseRSS = async () => {
  try {
    console.log(`Loading RSS via rss2json.com: ${RSS_URL}`)
    
    // Таймаут 15 секунд
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    
    const response = await fetch(`${RSS2JSON_API}?rss_url=${encodeURIComponent(RSS_URL)}&count=100`, { 
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'API error')
    }
    
    const items = data.items.map(item => {
      const title = item.title || ''
      const link = item.link || ''
      const description = item.description || item.content || ''
      const pubDate = item.pubDate || item.date || ''
      const category = item.categories?.[0] || ''
      const content = item.content || item.description || ''
      
      // Фильтруем только статьи (исключаем ресурсы по ключевым словам)
      const isArticle = !title.toLowerCase().includes('файл') && 
                       !title.toLowerCase().includes('resource') &&
                       !title.toLowerCase().includes('скачать') &&
                       description.length > 50
      
      return {
        id: item.guid || Math.random().toString(36).substr(2, 9),
        title,
        link,
        description: stripHtml(description),
        content: content, // Полный контент статьи
        pubDate,
        category,
        isArticle
      }
    })
    
    console.log(`✓ Successfully loaded ${items.length} items via rss2json`)
    
    // Возвращаем только статьи
    const filtered = items.filter(item => item.isArticle)
    if (filtered.length > 0) {
      return filtered
    } else if (items.length > 0) {
      // RSS загрузился, но нет статей (только файлы/ресурсы)
      throw new Error('В RSS-ленте нет новых статей')
    }
    
    return []
    
  } catch (error) {
    console.error('❌ rss2json failed:', error.message)
    throw new Error(`Не удалось загрузить новости: ${error.message}. Проверьте подключение к интернету.`)
  }
}

const stripHtml = (html) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export const getRecommendations = (articles, preferences) => {
  if (!preferences || preferences.length === 0) return articles.slice(0, 5)
  
  return articles
    .map(article => ({
      ...article,
      score: preferences.reduce((acc, pref) => {
        const titleMatch = article.title.toLowerCase().includes(pref.toLowerCase()) ? 2 : 0
        const descMatch = article.description.toLowerCase().includes(pref.toLowerCase()) ? 1 : 0
        const catMatch = article.category.toLowerCase().includes(pref.toLowerCase()) ? 3 : 0
        return acc + titleMatch + descMatch + catMatch
      }, 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

export const savePreferences = (prefs) => {
  localStorage.setItem('rw_preferences', JSON.stringify(prefs))
}

export const getPreferences = () => {
  const prefs = localStorage.getItem('rw_preferences')
  return prefs ? JSON.parse(prefs) : []
}

export const acceptCookies = () => {
  localStorage.setItem('rw_cookies_accepted', 'true')
}

export const cookiesAccepted = () => {
  return localStorage.getItem('rw_cookies_accepted') === 'true'
}
