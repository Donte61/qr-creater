// QR Code Generator JavaScript with Multi-Language Support

// Language System
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('qr-generator-language') || 'tr';
        this.translations = {
            tr: {
                // Error messages
                'QR kod kütüphanesi henüz yüklenmedi. Lütfen sayfayı yenileyin.': 'QR kod kütüphanesi henüz yüklenmedi. Lütfen sayfayı yenileyin.',
                'Lütfen gerekli alanları doldurun!': 'Lütfen gerekli alanları doldurun!',
                'QR kod oluşturulurken hata oluştu!': 'QR kod oluşturulurken hata oluştu!',
                'QR kod başarıyla indirildi! 💾': 'QR kod başarıyla indirildi! 💾',
                'İndirme sırasında hata oluştu!': 'İndirme sırasında hata oluştu!',
                // Default text values
                'Merhaba Dünya! 🌍': 'Merhaba Dünya! 🌍'
            },
            en: {
                // Error messages  
                'QR kod kütüphanesi henüz yüklenmedi. Lütfen sayfayı yenileyin.': 'QR code library not loaded yet. Please refresh the page.',
                'Lütfen gerekli alanları doldurun!': 'Please fill in the required fields!',
                'QR kod oluşturulurken hata oluştu!': 'An error occurred while generating QR code!',
                'QR kod başarıyla indirildi! 💾': 'QR code downloaded successfully! 💾',
                'İndirme sırasında hata oluştu!': 'An error occurred during download!',
                // Default text values
                'Merhaba Dünya! 🌍': 'Hello World! 🌍'
            }
        };
        this.initializeLanguageSystem();
    }

    initializeLanguageSystem() {
        // Set initial language
        this.setLanguage(this.currentLanguage);
        
        // Add language button event listeners
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.setLanguage(lang);
            });
        });
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('qr-generator-language', lang);
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Update active language button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        // Update all elements with translation data
        document.querySelectorAll('[data-tr]').forEach(element => {
            const trText = element.getAttribute('data-tr');
            const enText = element.getAttribute('data-en');
            
            if (lang === 'tr' && trText) {
                if (element.tagName === 'OPTION') {
                    element.textContent = trText;
                } else {
                    element.innerHTML = trText;
                }
            } else if (lang === 'en' && enText) {
                if (element.tagName === 'OPTION') {
                    element.textContent = enText;
                } else {
                    element.innerHTML = enText;
                }
            }
        });
        
        // Update placeholders
        document.querySelectorAll('[data-tr-placeholder]').forEach(element => {
            const trPlaceholder = element.getAttribute('data-tr-placeholder');
            const enPlaceholder = element.getAttribute('data-en-placeholder');
            
            if (lang === 'tr' && trPlaceholder) {
                element.placeholder = trPlaceholder;
            } else if (lang === 'en' && enPlaceholder) {
                element.placeholder = enPlaceholder;
            }
        });
        
        // Update text input value if it's default
        const textInput = document.getElementById('text-input');
        if (textInput && (textInput.value === 'Merhaba Dünya! 🌍' || textInput.value === 'Hello World! 🌍')) {
            textInput.value = lang === 'tr' ? 'Merhaba Dünya! 🌍' : 'Hello World! 🌍';
        }
        
        console.log(`🌍 Language changed to: ${lang.toUpperCase()}`);
    }

    translate(text) {
        return this.translations[this.currentLanguage][text] || text;
    }
}

class QRCodeGenerator {
    constructor() {
        console.log('🏗️ QRCodeGenerator constructor çalışıyor...');
        
        // Initialize language manager first
        this.languageManager = new LanguageManager();
        
        this.currentTab = 'text';
        this.qrCanvas = document.getElementById('qr-canvas');
        this.qrPlaceholder = document.getElementById('qr-placeholder');
        this.downloadSection = document.getElementById('download-section');
        
        // Element kontrolü
        if (!this.qrCanvas) console.error('❌ qr-canvas elementi bulunamadı!');
        if (!this.qrPlaceholder) console.error('❌ qr-placeholder elementi bulunamadı!');
        if (!this.downloadSection) console.error('❌ download-section elementi bulunamadı!');
        
        this.initializeEventListeners();
        this.initializeTabs();
        
        console.log('✅ QRCodeGenerator başarıyla oluşturuldu');
    }

    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateQRCode();
        });

        // Download button
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadQRCode();
        });

        // Real-time generation for text tab
        document.getElementById('text-input').addEventListener('input', () => {
            if (this.currentTab === 'text') {
                this.debounce(() => this.generateQRCode(), 500)();
            }
        });

        // URL input validation
        document.getElementById('url-input').addEventListener('input', (e) => {
            this.validateURL(e.target);
        });

        // Phone number formatting
        document.getElementById('sms-number').addEventListener('input', (e) => {
            this.formatPhoneNumber(e.target);
        });

        document.getElementById('vcard-phone').addEventListener('input', (e) => {
            this.formatPhoneNumber(e.target);
        });
    }

    initializeTabs() {
        console.log('📂 Tablar başlatılıyor...');
        this.switchTab('text');
        
        // Sayfa yüklendiğinde text alanında metin varsa QR kod oluştur
        setTimeout(() => {
            const textInput = document.getElementById('text-input');
            if (textInput && textInput.value.trim()) {
                console.log('🎬 Başlangıç QR kodu oluşturuluyor...');
                this.generateQRCode();
            }
        }, 500); // QRCode kütüphanesinin yüklenmesi için biraz bekle
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
        this.clearQRCode();
    }

    generateQRCode() {
        console.log('🎯 generateQRCode metodu çağrıldı');
        
        // Check if QRCode library is available
        if (typeof QRCode === 'undefined') {
            console.error('QRCode library is not loaded yet');
            this.showError(this.languageManager.translate('QR kod kütüphanesi henüz yüklenmedi. Lütfen sayfayı yenileyin.'));
            return;
        }

        const data = this.getDataForCurrentTab();
        console.log('📝 Oluşturulacak veri:', data);
        
        if (!data) {
            this.showError(this.languageManager.translate('Lütfen gerekli alanları doldurun!'));
            return;
        }

        const size = parseInt(document.getElementById('size-select').value);
        const color = document.getElementById('color-select').value;

        // QRCode kütüphanesi için options
        const options = {
            width: size,
            height: size,
            margin: 2,
            color: {
                dark: color,
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
        };
        
        console.log('🎨 Options:', options);

        try {
            // QRCode kütüphanesinin farklı versiyonları için uyumluluk
            console.log('🔧 QRCode.toCanvas çağrılıyor...');
            
            // Önce hangi QRCode versiyonu olduğunu kontrol et
            if (typeof QRCode.toCanvas === 'function') {
                QRCode.toCanvas(this.qrCanvas, data, options, (error) => {
                    if (error) {
                        console.error('QRCode error:', error);
                        this.showError(this.languageManager.translate('QR kod oluşturulurken hata oluştu!'));
                    } else {
                        console.log('✅ QR kod başarıyla oluşturuldu');
                        this.showQRCode();
                        this.animateSuccess();
                    }
                });
            } else if (typeof QRCode === 'function') {
                // Alternatif API kullanımı
                const qr = new QRCode(this.qrCanvas, {
                    text: data,
                    width: size,
                    height: size,
                    colorDark: color,
                    colorLight: '#FFFFFF',
                    correctLevel: QRCode.CorrectLevel.M
                });
                console.log('✅ QR kod başarıyla oluşturuldu (alternatif API)');
                this.showQRCode();
                this.animateSuccess();
            } else {
                throw new Error('QRCode API bulunamadı');
            }
        } catch (error) {
            console.error('QRCode generation error:', error);
            this.showError(this.languageManager.translate('QR kod oluşturulurken hata oluştu!'));
        }
    }

    getDataForCurrentTab() {
        switch (this.currentTab) {
            case 'text':
                const text = document.getElementById('text-input').value.trim();
                return text || null;

            case 'url':
                const url = document.getElementById('url-input').value.trim();
                return this.isValidURL(url) ? url : null;

            case 'wifi':
                const ssid = document.getElementById('wifi-ssid').value.trim();
                const password = document.getElementById('wifi-password').value;
                const security = document.getElementById('wifi-security').value;
                
                if (!ssid) return null;
                
                return `WIFI:T:${security};S:${ssid};P:${password};H:false;;`;

            case 'email':
                const emailTo = document.getElementById('email-to').value.trim();
                const subject = document.getElementById('email-subject').value.trim();
                const body = document.getElementById('email-body').value.trim();
                
                if (!emailTo) return null;
                
                let emailData = `mailto:${emailTo}`;
                const params = [];
                if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
                if (body) params.push(`body=${encodeURIComponent(body)}`);
                
                if (params.length > 0) {
                    emailData += '?' + params.join('&');
                }
                
                return emailData;

            case 'sms':
                const smsNumber = document.getElementById('sms-number').value.trim();
                const smsMessage = document.getElementById('sms-message').value.trim();
                
                if (!smsNumber) return null;
                
                let smsData = `sms:${smsNumber}`;
                if (smsMessage) {
                    smsData += `?body=${encodeURIComponent(smsMessage)}`;
                }
                
                return smsData;

            case 'vcard':
                const name = document.getElementById('vcard-name').value.trim();
                const phone = document.getElementById('vcard-phone').value.trim();
                const email = document.getElementById('vcard-email').value.trim();
                const organization = document.getElementById('vcard-organization').value.trim();
                const website = document.getElementById('vcard-website').value.trim();
                
                if (!name && !phone && !email) return null;
                
                let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
                if (name) vcard += `FN:${name}\n`;
                if (phone) vcard += `TEL:${phone}\n`;
                if (email) vcard += `EMAIL:${email}\n`;
                if (organization) vcard += `ORG:${organization}\n`;
                if (website) vcard += `URL:${website}\n`;
                vcard += 'END:VCARD';
                
                return vcard;

            default:
                return null;
        }
    }

    showQRCode() {
        this.qrPlaceholder.style.display = 'none';
        this.qrCanvas.style.display = 'block';
        this.downloadSection.style.display = 'block';
    }

    clearQRCode() {
        this.qrPlaceholder.style.display = 'flex';
        this.qrCanvas.style.display = 'none';
        this.downloadSection.style.display = 'none';
    }

    downloadQRCode() {
        try {
            const link = document.createElement('a');
            link.download = `qr-code-${Date.now()}.png`;
            link.href = this.qrCanvas.toDataURL();
            link.click();
            
            this.showSuccess(this.languageManager.translate('QR kod başarıyla indirildi! 💾'));
        } catch (error) {
            console.error(error);
            this.showError(this.languageManager.translate('İndirme sırasında hata oluştu!'));
        }
    }

    // Utility functions
    isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    validateURL(input) {
        const url = input.value.trim();
        if (url && !this.isValidURL(url)) {
            input.style.borderColor = '#dc3545';
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                input.value = 'https://' + url;
            }
        } else {
            input.style.borderColor = '#e9ecef';
        }
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.startsWith('90')) {
            value = '+' + value;
        } else if (value.startsWith('0')) {
            value = '+90' + value.substring(1);
        } else if (!value.startsWith('+')) {
            value = '+90' + value;
        }
        
        // Format: +90 555 123 45 67
        value = value.replace(/(\+90)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
        
        input.value = value;
    }

    showError(message) {
        this.showNotification(message, 'error');
        this.shakeButton();
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            background: type === 'error' ? 
                'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' : 
                type === 'warning' ?
                'linear-gradient(135deg, #ffc107 0%, #ff8c00 100%)' :
                'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    shakeButton() {
        const button = document.getElementById('generate-btn');
        button.classList.add('shake');
        setTimeout(() => {
            button.classList.remove('shake');
        }, 500);
    }

    animateSuccess() {
        const outputSection = document.querySelector('.output-section');
        outputSection.classList.add('success-flash');
        setTimeout(() => {
            outputSection.classList.remove('success-flash');
        }, 600);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Easter eggs and fun features
class EasterEggs {
    constructor() {
        this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        this.konamiIndex = 0;
        this.initializeEasterEggs();
    }

    initializeEasterEggs() {
        document.addEventListener('keydown', (e) => {
            if (e.code === this.konamiCode[this.konamiIndex]) {
                this.konamiIndex++;
                if (this.konamiIndex === this.konamiCode.length) {
                    this.activateKonamiCode();
                    this.konamiIndex = 0;
                }
            } else {
                this.konamiIndex = 0;
            }
        });

        // Click counter for logo
        let clickCount = 0;
        document.querySelector('header h1').addEventListener('click', () => {
            clickCount++;
            if (clickCount === 5) {
                this.activatePartyMode();
                clickCount = 0;
            }
        });
    }

    activateKonamiCode() {
        // Add rainbow effect
        document.body.style.background = 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)';
        document.body.style.backgroundSize = '400% 400%';
        document.body.style.animation = 'rainbow 3s ease infinite';
        
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes rainbow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            location.reload();
        }, 5000);
    }

    activatePartyMode() {
        const emojis = ['🎉', '🎊', '🚀', '⭐', '💫', '🌟', '✨'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                emoji.style.position = 'fixed';
                emoji.style.left = Math.random() * 100 + 'vw';
                emoji.style.top = '-50px';
                emoji.style.fontSize = '2rem';
                emoji.style.zIndex = '9999';
                emoji.style.pointerEvents = 'none';
                emoji.style.animation = 'fall 3s linear forwards';
                
                document.body.appendChild(emoji);
                
                setTimeout(() => {
                    document.body.removeChild(emoji);
                }, 3000);
            }, i * 200);
        }
        
        const fallStyle = document.createElement('style');
        fallStyle.innerHTML = `
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                }
            }
        `;
        document.head.appendChild(fallStyle);
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.startTime = performance.now();
        this.initializeMonitoring();
    }

    initializeMonitoring() {
        window.addEventListener('load', () => {
            const loadTime = performance.now() - this.startTime;
            console.log(`🚀 QR Generator loaded in ${loadTime.toFixed(2)}ms`);
            
            if (loadTime > 3000) {
                console.warn('⚠️ Slow loading detected. Consider optimizing.');
            }
        });

        // Monitor QR generation time
        const originalGenerate = QRCodeGenerator.prototype.generateQRCode;
        QRCodeGenerator.prototype.generateQRCode = function() {
            const start = performance.now();
            const result = originalGenerate.call(this);
            const end = performance.now();
            console.log(`⚡ QR generated in ${(end - start).toFixed(2)}ms`);
            return result;
        };
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 QR Code Generator v2.0 - DonTe');
    console.log('💡 Tip: Try the Konami Code for a surprise!');
    console.log('🎉 Click the title 5 times for party mode!');
    
    let isInitialized = false;
    
    // Wait for QRCode library to be available
    function initializeApp() {
        console.log('🔧 initializeApp çağrıldı - QRCode:', typeof QRCode, 'isInitialized:', isInitialized);
        
        if (typeof QRCode !== 'undefined' && !isInitialized) {
            console.log('🚀 Ana bileşenler oluşturuluyor...');
            // Initialize main components
            window.qrGenerator = new QRCodeGenerator();
            window.languageManager = window.qrGenerator.languageManager; // Export language manager
            window.easterEggs = new EasterEggs();
            window.performanceMonitor = new PerformanceMonitor();
            isInitialized = true;
            
            // Log the loading status
            if (window.qrCodeLoadingStatus === 'fallback') {
                console.log('⚠️ Using fallback QRCode implementation');
            } else {
                console.log('✅ QRCode library initialized successfully');
            }
            
            return true;
        }
        console.log('⚠️ initializeApp çıkışı - initialized değil');
        return isInitialized;
    }
    
    // Listen for QRCode library ready event
    window.addEventListener('qrCodeLibraryReady', () => {
        console.log('📦 QRCode library ready event received');
        // QRCode kütüphanesi yüklendiğinde biraz bekle
        setTimeout(() => {
            console.log('⏰ QRCode kontrolü yapılıyor...');
            initializeApp();
        }, 100); // 100ms bekle
    });
    
    // Try to initialize immediately if QRCode is already available
    if (typeof QRCode !== 'undefined') {
        console.log('🚀 QRCode already available, initializing immediately');
        initializeApp();
    } else if (window.qrCodeLoadingStatus === 'loading') {
        // QRCode library is still loading, wait for the event
        console.log('⏳ Waiting for QRCode library to load...');
    } else {
        // Fallback timeout only if no loading status is set (shouldn't happen)
        console.log('🔄 No loading status detected, using timeout fallback');
        setTimeout(() => {
            if (!isInitialized) {
                console.log('⚠️ Timeout fallback - initializing without QRCode verification');
                initializeApp();
            }
        }, 5000);
    }
    
    // Add some helpful console commands
    window.generateRandomQR = () => {
        const randomTexts = [
            'Merhaba Dünya! 🌍',
            'QR kodlar harika! 📱',
            'DonTe tarafından yapıldı 🚀',
            'Teknoloji muhteşem! 💻',
            'Bu bir test mesajıdır 📝'
        ];
        
        document.getElementById('text-input').value = randomTexts[Math.floor(Math.random() * randomTexts.length)];
        qrGenerator.switchTab('text');
        qrGenerator.generateQRCode();
    };
    
    console.log('💻 Console Command: generateRandomQR() - Rastgele QR kod oluşturur');
});
