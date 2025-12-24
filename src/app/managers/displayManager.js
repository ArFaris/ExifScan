export class DisplayManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.categoryHandlers = {
            camera: 'showCameraInfo',
            settings: 'showSettingsInfo', 
            time: 'showTimeInfo',
            gps: 'showGPSData',
            fileInfo: 'showGeneralInfo'
        }
        this.json = null;
        this.jsonButton = document.getElementById('result-button');
        this.jsonButton.removeEventListener('click', this.downloadJson.bind(this));
        
        this.jsonButton.removeEventListener('click', this.copyJsonBound);
        this.copyJsonBound = this.copyJsonToClipboard.bind(this);
        this.jsonButton.addEventListener('click', this.copyJsonBound);
        
        this.jsonButton.textContent = 'Копировать JSON';
    }

    displayExifData(data) { 
        for(const [categoryName, uiMethod] of Object.entries(this.categoryHandlers)) {
            const categoryData = data[categoryName];

            let strings;
            if (categoryData) {
                strings = this.#createString(categoryData);
            }

            if (this.uiManager[uiMethod]) {
                this.uiManager[uiMethod](strings);
            }
        }
        this.json = JSON.stringify(data, null, 2);

        this.jsonButton.removeEventListener('click', this.copyJsonBound);
        this.copyJsonBound = this.copyJsonToClipboard.bind(this);
        this.jsonButton.addEventListener('click', this.copyJsonBound);
    }

    resetData() {
        this.json = null;
        this.uiManager.showImageSection(null);
        this.uiManager.showCameraInfo(null);
        this.uiManager.showSettingsInfo(null);
        this.uiManager.showTimeInfo(null);
        this.uiManager.showGeneralInfo(null);
        
        this.jsonButton.removeEventListener('click', this.copyJsonBound);
        this.copyJsonBound = null;
    }

    copyJsonToClipboard() {
        if (!this.json) {
            this.uiManager.showError('JSON отсутствует');
            return;
        }

        navigator.clipboard.writeText(this.json)
            .then(() => {
                this.uiManager.showNotification('JSON скопирован в буфер обмена!');
                
                const originalText = this.jsonButton.textContent;
                this.jsonButton.textContent = 'Скопировано!';
                
                setTimeout(() => {
                    this.jsonButton.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Ошибка при копировании: ', err);
                this.uiManager.showError('Не удалось скопировать JSON');
                
                this.fallbackCopyTextToClipboard(this.json);
            });
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.uiManager.showNotification('JSON скопирован в буфер обмена!');
                
                const originalText = this.jsonButton.textContent;
                this.jsonButton.textContent = 'Скопировано!';
                
                setTimeout(() => {
                    this.jsonButton.textContent = originalText;
                }, 2000);
            } else {
                this.uiManager.showError('Не удалось скопировать JSON');
            }
        } catch (err) {
            console.error('Ошибка при копировании: ', err);
            this.uiManager.showError('Не удалось скопировать JSON');
        }
        
        document.body.removeChild(textArea);
    }

    downloadJson() {
        if (!this.json) {
            this.uiManager.showError('JSON отсутствует');
            return;
        }

        this.uiManager.downloadJson(this.json);
    }

    #createString(data) {
        return Object.entries(data)
            .filter(([_, value]) =>
                value !== undefined && value !== null
            )
            .map(([key, value]) => {
                return [key, value];
            })
    }
}