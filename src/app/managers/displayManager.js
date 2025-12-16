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
        this.jsonButton.removeEventListener('cllick', this.downloadJson.bind(this))
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
        this.json = JSON.stringify(data);

        this.jsonButton.removeEventListener('click', this.downloadJsonBound);
        this.downloadJsonBound = this.downloadJson.bind(this);
        this.jsonButton.addEventListener('click', this.downloadJson.bind(this));
    }

    resetData() {
        this.json = null;
        this.uiManager.showImageSection(null);
        this.uiManager.showCameraInfo(null);
        this.uiManager.showSettingsInfo(null);
        this.uiManager.showTimeInfo(null);
        this.uiManager.showGeneralInfo(null);
        
        this.jsonButton.removeEventListener('click', this.downloadJsonBound);
        this.downloadJsonBound = null;
    }

    downloadJson() {
        if (!this.json) {
            this.uiManager.showError('JSON отсутствует');
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
