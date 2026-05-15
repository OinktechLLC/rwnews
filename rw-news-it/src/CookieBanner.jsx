import React from 'react';

export default function CookieBanner({ show, onAccept, onDecline }) {
    if (!show) return null;

    return (
        <div className="cookie-banner show">
            <p>
                🍪 Мы используем файлы cookie для улучшения работы приложения, 
                персонализации контента и анализа использования. 
                Продолжая использовать приложение, вы соглашаетесь с нашей 
                <a href="#privacy" style={{ color: 'var(--primary-color)', marginLeft: '5px' }}>Политикой конфиденциальности</a>.
            </p>
            <div className="cookie-buttons">
                <button className="accept-cookies" onClick={onAccept}>
                    Принять
                </button>
                <button className="decline-cookies" onClick={onDecline}>
                    Отклонить
                </button>
            </div>
        </div>
    );
}
