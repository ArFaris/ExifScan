export class UIManager {
    scrollToUploadSection() {
        this.scrollToSection('upload-section');
    }

    scrollToSection(section) {
        const element = document.querySelector(`.${section}`);

        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
            })
        } else {
            console.warn(`Секция ${section} не найдена`);
        }
    }

    setDropZoneState(state) {
        const dropZone = document.querySelector('.upload-container');
        dropZone.classList.remove('upload--dragover', 'upload--has-file');
        
        if (state === 'dragover') {
            dropZone.classList.add('upload--dragover');
        } else if (state === 'has-file') {
            dropZone.classList.add('upload--has-file');
        }
    }

    showFileInfo(file) {
        const title = document.querySelector('.upload__title');
        const subtitle = document.querySelector('.upload__subtitle');
        
        title.textContent = `Выбран файл: ${file.name}`;
        subtitle.textContent = `Размер: ${this.formatFileSize(file.size)}`;
        this.setDropZoneState('has-file');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    }

    enableAnalyzeButton() {
        const analyzeBtn = document.querySelectorAll('.button--pill')[0];
        analyzeBtn.disabled = false;
        analyzeBtn.classList.add('button--active');
    }

    resetUI() {
        const title = document.querySelector('.upload__title');
        const subtitle = document.querySelector('.upload__subtitle');
        
        title.textContent = 'Перетащите изображение сюда';
        subtitle.textContent = 'или выберите файл для загрузки';
        
        this.setDropZoneState('normal');
        
        const analyzeBtn = document.querySelectorAll('.button--pill')[0];
        analyzeBtn.disabled = true;
        analyzeBtn.classList.remove('button--active');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    #showData(selector, tag = 'li', className, data, template) {
        const section = document.querySelector(selector);

        if (!section) {
            console.error(`Error: ${selector} is undefined`);
            return;
        }

        section.innerHTML = data.map(([label, value]) => template(tag, className, label, value)).join('');
    }

    #templates = [
        (t, c, l, v) => `
            <${t} class="${c}">
            <img class="point--icon" src="./assets/icons/marker.svg" alt="Иконка точки">
            <p class="point--text">${l}: ${v}</p>
            </${t}>
        `,
        (t, c, l, v) => `
            <li class=${c}><b>${l}: </b>${v}</li>
        `
    ]

   showCameraInfo(data) {
        const show = data && data.length > 0;
        if (show) {
            this.#showData('.camera .camera-points', 'li', 'point camera-point', data, this.#templates[0]);
        }
        this.#toggleSection('.camera', show);
    }

    showSettingsInfo(data) {
        const show = data && data.length > 0;
        if (show) {
            this.#showData('.points__group.points-settings', 'div', 'point', data, this.#templates[0]);
        }
        this.#toggleSection('.settings', show);
    }

    showTimeInfo(data) {
        const show = data && data.length > 0;
        if (show) {
            this.#showData('.time-points', 'li', 'time-point', data, this.#templates[1]);
        }
        this.#toggleSection('.time', show);
    }

    showGeneralInfo(data) {
        const show = data && data.length > 0;
        if (show) {
            this.#showData('.meta-info', 'li', '', data, this.#templates[1]);
        }
        this.#toggleSection('.meta-info', show);
    }

    showImageSection(imageUrl, imageName) {
        const imgElement = document.getElementById('previewImage');

        if (!imgElement) return;

        if (imageUrl) {
            if (imgElement.src && imgElement.src.startsWith('blob: ')) {
                URL.revokeObjectURL(imgElement.src);
            }

            imgElement.src = imageUrl;
            imgElement.style.display = 'block';
        } else {
            imgElement.src = '';
            imgElement.style.display = 'none'
        }
    }

    showGPSData(data) {
        const lat = data[0][1];
        const lon = data[1][1];
        const heig = data[2][1];

        if (lat === '-' || lon === '-') {
            const imgElement = document.getElementById('gps-title');

            if (!imgElement) return;
        }
    }

    #toggleSection(selector, show) {
        const section = document.querySelector(selector);
        if (section) {
            section.style.display = show ? 'block' : 'none';
            if (selector === '.meta-info') {
                requestAnimationFrame(() => {
                    const settingsSection = document.getElementById('settingsSection');
                    if (settingsSection) {
                        section.style.height = `${settingsSection.offsetHeight}px`;
                    }
                });
            }
        }
    }

    downloadJson(json, filename = 'photo', contentType = 'img/json') {
        const blob = new Blob([json], { type: contentType });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }
}