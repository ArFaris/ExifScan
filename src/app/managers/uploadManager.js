import { ExifParser } from '../parsers/ExifParser.js'
import { PageManager } from './pageManager.js'

export class UploadManager {
    constructor(uiManager, displayManager) {
        this.uiManager = uiManager;
        this.displayManager = displayManager;
        this.pageManager = new PageManager();
        this.dropZone = document.querySelector('.upload-container');
        this.fileInput = document.querySelector('.file-input-wrapper');
        this.analyzeBtn = document.querySelectorAll('.button--pill')[0];
        this.resetBtn = document.querySelectorAll('.button--pill')[1];
        this.selectedFile = null;
        this.selectedImageUrl = null;
        this.imageName = null;
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        
        this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
        
        this.analyzeBtn.addEventListener('click', this.analyzeFile.bind(this));
        this.resetBtn.addEventListener('click', this.resetFile.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uiManager.setDropZoneState('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uiManager.setDropZoneState('normal');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uiManager.setDropZoneState('normal');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileSelect(files[0]);
        }
    }
 
    handleFileSelect(file) {
        if (!file) return;
        
        if (!this.validateFile(file)) {
            this.uiManager.showError('Выберите файл JPEG или PNG до 10MB');
            return;
        }
        
        this.selectedFile = file;

        const imageUrl = URL.createObjectURL(file);
        this.selectedImageUrl = imageUrl;

        const imageName = file.name;
        this.imageName = imageName;

        this.uiManager.showFileInfo(file);
        this.uiManager.enableAnalyzeButton();
    }

    isSecondPageActive() {
        return this.pageManager.isSecondPageActive();
    }

    validateFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 10 * 1024 * 1024;
        return validTypes.includes(file.type) && file.size <= maxSize;
    }

    async analyzeFile() {
        if (!this.selectedFile) {
            this.uiManager.showError('Сначала выберите файл');
            return;
        }

        try {
            this.pageManager.showLoader();

            const exifParser = new ExifParser(this.selectedFile);
            const data = await exifParser.parse();

            this.pageManager.showSecondPage();
            this.displayManager.displayExifData(data);
            this.uiManager.showImageSection(this.selectedImageUrl, this.imageName);
        } catch (error) {
            this.uiManager.showError('Ошибка при извлечении метаданных');
            console.error(error);
        } finally {
            this.pageManager.hideLoader();
        }
    }

    resetFile(shouldScroll = true) {
        this.selectedFile = null;

        if (this.selectedImageUrl) {
            URL.revokeObjectURL(this.selectedImageUrl);
            this.selectedImageUrl = null;
        }

        this.fileInput.value = '';
        this.uiManager.resetUI();
        this.displayManager.resetData();
        this.pageManager.showFirstPage(shouldScroll);
    }
}