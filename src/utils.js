import { useState, useEffect } from 'react'

const RSS_URL = 'https://resource-world.ru/forums/-/index.rss'

export const parseRSS = async () => {
  try {
    // Используем CORS прокси для обхода ограничений браузера
    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(RSS_URL)
    const response = await fetch(proxyUrl)
    if (!response.ok) throw new Error('Network response was not ok')
    const text = await response.text()
    
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, 'text/xml')
    
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
    
    // Возвращаем только статьи
    return items.filter(item => item.isArticle)
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
