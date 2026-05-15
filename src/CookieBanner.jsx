import { useState, useEffect } from 'react'

const CookieBanner = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('rw_cookies_accepted')
    if (!accepted) {
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('rw_cookies_accepted', 'true')
    setIsVisible(false)
    onAccept()
  }

  if (!isVisible) return null

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>
          🍪 Мы используем cookie для улучшения работы сайта и персонализации рекомендаций.
          Продолжая использовать сайт, вы соглашаетесь с нашей 
          <a href="#privacy" onClick={(e) => { e.preventDefault(); window.location.hash = 'privacy' }}>политикой конфиденциальности</a>.
        </p>
        <button onClick={handleAccept} className="accept-btn">Принять</button>
      </div>
    </div>
  )
}

export default CookieBanner
