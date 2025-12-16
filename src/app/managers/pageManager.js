export class PageManager {
    constructor() {
        this.firstPage = document.getElementById('upload');
        this.secondPage = document.getElementById('results');
        this.loader = document.getElementById('loader');
        this.headerButton = document.getElementById('header-button');
    }

    showFirstPage(shouldScroll) {
        this.hideAllPages();
        this.firstPage.classList.add('active');
        this.headerButton.textContent = 'Начать сейчас';

        if (shouldScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }
    }

    showSecondPage() {
        this.hideAllPages();
        this.secondPage.classList.add('active');
        this.headerButton.textContent = 'Загрузить другое фото';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    hideAllPages() {
        this.firstPage.classList.remove('active');
        this.secondPage.classList.remove('active');
    }

    isSecondPageActive() {
        return this.secondPage.classList.contains('active');
    }

    showLoader() {
        if (this.loader) {
            this.loader.classList.add('active');
        }
    }

    hideLoader() {
        if (this.loader) {
            this.loader.classList.remove('active');
        }
    }
}