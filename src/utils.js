import { useState, useEffect } from 'react'

const RSS_URL = 'https://resource-world.ru/forums/-/index.rss'

// Список CORS прокси от разных разработчиков
const PROXY_LIST = [
  // ВсеОриджины (классический)
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  // КорсХэвэн
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  // КорсБридж
  (url) => `https://cors-anywhere.herokuapp.com/${url}`,
  // ДжейсонП
  (url) => `https://jsonp.afeld.me/?url=${encodeURIComponent(url)}`,
  // КодЭвридей
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
  // ИсОнЦФГ
  (url) => `https://isomorphic-git.org/downloads/cors-proxy/${encodeURIComponent(url)}`,
  // КорсШип
  (url) => `https://cors.sh/${url}`,
  // Воркэраус
  (url) => `https://worker.corс.sh/${url}`,
  // ПиксельПинг
  (url) => `https://proxy.pixelping.ru/${encodeURIComponent(url)}`,
  // МайКорсПрокси
  (url) => `https://my-cors-proxy.glitch.me/?url=${encodeURIComponent(url)}`,
  // ФастКорс
  (url) => `https://fast-cors-proxy.herokuapp.com/${url}`,
  // УниверсалКорс
  (url) => `https://universal-cors-proxy.glitch.me/?url=${encodeURIComponent(url)}`,
  // НодКорсПрокси
  (url) => `https://node-cors-proxy.herokuapp.com/${url}`,
  // КвирксМодКорс
  (url) => `https://quirksmode-cors-proxy.herokuapp.com/${url}`,
  // Татнет (текущий рабочий)
  (url) => `https://secure-272717.tatnet.app/${encodeURIComponent(url)}`,
]

export const parseRSS = async () => {
  try {
    let lastError = null
    
    // Перебираем прокси по очереди
    for (let i = 0; i < PROXY_LIST.length; i++) {
      try {
        const proxyUrl = PROXY_LIST[i](RSS_URL)
        console.log(`Trying proxy ${i + 1}/${PROXY_LIST.length}: ${proxyUrl}`)
        
        // Таймаут 8 секунд для каждого прокси
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)
        
        const response = await fetch(proxyUrl, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/xml, text/xml',
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const text = await response.text()
        
        // Проверяем что ответ похож на XML
        if (!text.includes('<rss') && !text.includes('<?xml')) {
          throw new Error('Invalid XML response')
        }
        
        const parser = new DOMParser()
        const xml = parser.parseFromString(text, 'text/xml')
        
        // Проверяем на ошибки парсинга
        const parseError = xml.querySelector('parsererror')
        if (parseError) {
          throw new Error('XML parsing error')
        }
        
        const items = Array.from(xml.querySelectorAll('item')).map(item => {
          const title = item.querySelector('title')?.textContent || ''
          const link = item.querySelector('link')?.textContent || ''
          const description = item.querySelector('description')?.textContent || ''
          const pubDate = item.querySelector('pubDate')?.textContent || ''
          const category = item.querySelector('category')?.textContent || ''
          
          // Фильтруем только статьи (исключаем ресурсы по ключевым словам)
          const isArticle = !title.toLowerCase().includes('файл') && 
                           !title.toLowerCase().includes('resource') &&
                           !title.toLowerCase().includes('скачать') &&
                           description.length > 50
          
          return {
            id: Math.random().toString(36).substr(2, 9),
            title,
            link,
            description: stripHtml(description),
            pubDate,
            category,
            isArticle
          }
        })
        
        console.log(`Successfully loaded with proxy ${i + 1}`)
        // Возвращаем только статьи
        return items.filter(item => item.isArticle)
        
      } catch (proxyError) {
        console.warn(`Proxy ${i + 1} failed:`, proxyError.message)
        lastError = proxyError
        // Продолжаем пробовать следующий прокси
        continue
      }
    }
    
    // Если все прокси не сработали
    console.error('All proxies failed:', lastError)
    throw new Error('Все прокси не работают. Проверьте подключение к интернету.')
    
  } catch (error) {
    console.error('Error parsing RSS:', error)
    return []
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
