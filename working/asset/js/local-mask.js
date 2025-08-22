// Local File Protocol Detection and Masking
(function() {
    // Check if running from file:// protocol
    if (window.location.protocol === 'file:') {
        // Create overlay styles
        const style = document.createElement('style');
        style.textContent = `
            .local-mask-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-in;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .local-mask-container {
                text-align: center;
                padding: 40px;
                max-width: 600px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.5s ease-out 0.2s both;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(30px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .local-mask-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: 0 0 0 20px rgba(102, 126, 234, 0);
                }
            }
            
            .local-mask-icon svg {
                width: 40px;
                height: 40px;
                fill: white;
            }
            
            .local-mask-title {
                font-size: 28px;
                font-weight: bold;
                color: #333;
                margin-bottom: 15px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            
            .local-mask-message {
                font-size: 16px;
                color: #666;
                line-height: 1.6;
                margin-bottom: 30px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            
            .local-mask-instruction {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px 20px;
                text-align: left;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            
            .local-mask-instruction-title {
                font-weight: bold;
                color: #333;
                margin-bottom: 10px;
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            
            .local-mask-instruction-list {
                margin: 0;
                padding-left: 20px;
                color: #555;
                font-size: 14px;
                line-height: 1.8;
                font-family: 'Courier New', Courier, monospace;
            }
            
            .local-mask-instruction-list li {
                margin-bottom: 8px;
            }
            
            .local-mask-button {
                display: inline-block;
                padding: 12px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 30px;
                font-weight: 600;
                font-size: 14px;
                transition: transform 0.2s, box-shadow 0.2s;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            
            .local-mask-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }
            
            .local-mask-footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                font-size: 12px;
                color: #999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            
            @media (max-width: 768px) {
                .local-mask-container {
                    margin: 20px;
                    padding: 30px 20px;
                }
                
                .local-mask-title {
                    font-size: 24px;
                }
                
                .local-mask-message {
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Create overlay HTML
        const overlay = document.createElement('div');
        overlay.className = 'local-mask-overlay';
        overlay.innerHTML = `
            <div class="local-mask-container">
                <div class="local-mask-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </div>
                <h1 class="local-mask-title">호스팅 서버가 필요합니다</h1>
                <p class="local-mask-message">
                    이 Vue.js CDN 애플리케이션은 보안상의 이유로<br>
                    로컬 파일 시스템에서 직접 실행할 수 없습니다.
                </p>
                <div class="local-mask-instruction">
                    <div class="local-mask-instruction-title">🚀 실행 방법:</div>
                    <ol class="local-mask-instruction-list">
                        <li>VS Code의 Live Server 확장 사용</li>
                        <li>Python: <code>python -m http.server 8000</code></li>
                        <li>Node.js: <code>npx http-server</code></li>
                        <li>웹 호스팅 서비스에 업로드</li>
                    </ol>
                </div>
                <a href="https://developer.mozilla.org/ko/docs/Web/HTTP/CORS" 
                   target="_blank" 
                   class="local-mask-button">
                    CORS 정책 알아보기
                </a>
                <div class="local-mask-footer">
                    💡 Tip: 개발 중에는 로컬 서버를 사용하는 것이 좋습니다
                </div>
            </div>
        `;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                document.body.appendChild(overlay);
            });
        } else {
            document.body.appendChild(overlay);
        }
        
        // Prevent Vue apps from initializing
        window.Vue = new Proxy(window.Vue || {}, {
            get: function(target, prop) {
                if (prop === 'createApp') {
                    return function() {
                        console.warn('Vue app initialization blocked due to file:// protocol');
                        return {
                            mount: function() { return this; },
                            component: function() { return this; },
                            directive: function() { return this; },
                            use: function() { return this; }
                        };
                    };
                }
                return target[prop];
            }
        });
    }
})();