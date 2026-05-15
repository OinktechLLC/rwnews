import { useState, useEffect } from 'react'

const RSS_URL = 'https://resource-world.ru/forums/-/index.rss'

// Список CORS прокси - только проверенные рабочие
const PROXY_LIST = [
  // ВсеОриджины (самый надежный)
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  // КорсХэвэн
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  // КодЭвридей (thingproxy)
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
  // КорсШип
  (url) => `https://cors.sh/${url}`,
  // ПиксельПинг
  (url) => `https://proxy.pixelping.ru/${encodeURIComponent(url)}`,
  // ИсОнЦФГ (isomorphic-git)
  (url) => `https://cdn.jsdelivr.net/gh/isomorphic-git/cors-proxy@master/proxy?url=${encodeURIComponent(url)}`,
]

export const parseRSS = async () => {
  try {
    let lastError = null
    let successCount = 0
    
    // Перебираем прокси по очереди
    for (let i = 0; i < PROXY_LIST.length; i++) {
      try {
        const proxyUrl = PROXY_LIST[i](RSS_URL)
        console.log(`Trying proxy ${i + 1}/${PROXY_LIST.length}: ${proxyUrl}`)
        
        // Таймаут 10 секунд для каждого прокси
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch(proxyUrl, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/xml, text/xml',
            'Origin': '*',
          },
          mode: 'cors',
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const text = await response.text()
        
        // Проверяем что ответ похож на XML
        if (!text.includes('<rss') && !text.includes('<?xml') && !text.includes('<feed')) {
          throw new Error('Invalid XML response: ' + text.substring(0, 100))
        }
        
        const parser = new DOMParser()
        const xml = parser.parseFromString(text, 'text/xml')
        
        // Проверяем на ошибки парсинга
        const parseError = xml.querySelector('parsererror')
        if (parseError) {
          throw new Error('XML parsing error: ' + parseError.textContent)
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
        
        console.log(`✓ Successfully loaded ${items.length} items with proxy ${i + 1}`)
        successCount++
        // Возвращаем только статьи
        const filtered = items.filter(item => item.isArticle)
        if (filtered.length > 0) {
          return filtered
        }
        
      } catch (proxyError) {
        console.warn(`✗ Proxy ${i + 1} failed:`, proxyError.message)
        lastError = proxyError
        // Продолжаем пробовать следующий прокси
        continue
      }
    }
    
    // Если все прокси не сработали
    console.error('❌ All proxies failed:', lastError)
    throw new Error(`Все прокси не работают. Последняя ошибка: ${lastError?.message || 'Неизвестная ошибка'}. Проверьте подключение к интернету.`)
    
  } catch (error) {
    console.error('Error parsing RSS:', error)
    // Возвращаем пустой массив вместо падения
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
