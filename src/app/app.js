import { UploadManager } from './managers/uploadManager.js';
import { UIManager } from './managers/uiManager.js';
import { DisplayManager } from './managers/displayManager.js';

class ExifScanApp {
    constructor() {
        this.uiManager = new UIManager();
        this.displayManager = new DisplayManager(this.uiManager);
        this.uploadManager = new UploadManager(this.uiManager, this.displayManager);
    }

    init() {
        this.uploadManager.init();
        this.bindHeaderButtons();
        this.bindHeaderLinks();
        this.bindMainHeaderButton();
    }

    bindHeaderButtons() {
        const buttons = document.querySelectorAll('.button--rounded');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.uiManager.scrollToUploadSection();
             });
        });
    }

    bindMainHeaderButton() {
        const mainButton = document.getElementById('header-button');
        mainButton.addEventListener('click', () => {
            if (this.uploadManager.isSecondPageActive()) {
                this.uploadManager.resetFile();
                this.uiManager.scrollToSection('upload-section');
            }
        })
    }

    bindHeaderLinks() {
        const links = document.querySelectorAll('.header__link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;

                if (this.uploadManager.isSecondPageActive()) {
                    this.uploadManager.resetFile(false);
                }
                
                this.uiManager.scrollToSection(section);
            })
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new ExifScanApp();
    app.init();
}); 
