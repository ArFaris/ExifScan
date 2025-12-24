import { jest } from '@jest/globals';
import { UIManager } from '../../../src/app/managers/uiManager.js';

describe('UIManager', () => {
  let uiManager;

  beforeEach(() => {
    document.body.innerHTML = `
      <!-- Кнопки из первой страницы (нужны для тестов) -->
      <div class="upload-container">
        <h2 class="upload__title">Перетащите изображение сюда</h2>
        <h3 class="upload__subtitle">или выберите файл для загрузки</h3>
      </div>
      <button class="button button--pill">Получить метаданные</button>
      <button class="button button--pill">Сбросить файлы</button>
      
      <!-- СЕКЦИИ ИЗ ВТОРОЙ СТРАНИЦЫ РЕЗУЛЬТАТОВ -->
      <!-- Они находятся в <main id="results" class="results page"> -->
      
      <!-- Preview image -->
      <img id="previewImage" src="" alt="Превью загруженного изображения">
      
      <!-- Секция камеры -->
      <section class="camera">
        <h2 class="camera-title">Камера</h2>
        <ul class="camera-points"></ul>
      </section>
      
      <!-- Секция настроек -->
      <article class="settings">
        <h2>Настройки съемки</h2>
        <div class="points__group points-settings"></div>
      </article>
      
      <!-- Секция времени -->
      <article class="time">
        <h2>Временная информация</h2>
        <ul class="time-points"></ul>
      </article>
      
      <!-- Секция общей информации -->
      <ul class="meta-info"></ul>
    `;

    uiManager = new UIManager();
  });

  describe('formatFileSize()', () => {
    test('должен корректно форматировать размер в KB', () => {
      expect(uiManager.formatFileSize(1536)).toBe('1.50 KB');
    });

    test('должен возвращать "0 Bytes" для нулевого размера', () => {
      expect(uiManager.formatFileSize(0)).toBe('0 Bytes');
    });

    test.each([
      [1024, '1.00 KB'],
      [1048576, '1.00 MB'],
      [1073741824, '1.00 GB'],
    ])('должен правильно конвертировать %s байт в %s', (inputBytes, expectedFormat) => {
      expect(uiManager.formatFileSize(inputBytes)).toBe(expectedFormat);
    });
  });

  describe('setDropZoneState()', () => {
    test('должен добавлять класс dragover', () => {
      uiManager.setDropZoneState('dragover');
      
      const dropZone = document.querySelector('.upload-container');
      expect(dropZone.classList.contains('upload--dragover')).toBe(true);
    });

    test('должен добавлять класс has-file', () => {
      uiManager.setDropZoneState('has-file');
      
      const dropZone = document.querySelector('.upload-container');
      expect(dropZone.classList.contains('upload--has-file')).toBe(true);
    });
  });

  describe('showFileInfo()', () => {
    test('должен отображать информацию о файле', () => {
      const mockFile = {
        name: 'photo.jpg',
        size: 2048000 // 2MB
      };

      uiManager.showFileInfo(mockFile);
      
      const title = document.querySelector('.upload__title');
      const subtitle = document.querySelector('.upload__subtitle');
      
      expect(title.textContent).toBe('Выбран файл: photo.jpg');
      expect(subtitle.textContent).toBe('Размер: 1.95 MB');
    });
  });

  describe('enableAnalyzeButton()', () => {
    test('должен активировать кнопку анализа', () => {
      const button = document.querySelector('.button--pill');
      // В реальном коде кнопка может иметь класс "button--pill" без "button"
      uiManager.enableAnalyzeButton();
      
      // Проверяем что кнопка стала активной
      expect(button.classList.contains('button--active')).toBe(true);
      expect(button.disabled).toBe(false);
    });
  });

  describe('resetUI()', () => {
    test('должен сбрасывать UI в начальное состояние', () => {
      // Сначала делаем кнопку активной
      const button = document.querySelector('.button--pill');
      button.disabled = false;
      button.classList.add('button--active');
      
      // Сбрасываем
      uiManager.resetUI();
      
      const title = document.querySelector('.upload__title');
      expect(title.textContent).toBe('Перетащите изображение сюда');
      expect(button.classList.contains('button--active')).toBe(false);
      expect(button.disabled).toBe(true);
    });
  });

  describe('showCameraInfo()', () => {
    test('должен отображать данные камеры', () => {
      const data = [
        ['Производитель', 'Canon'],
        ['Модель', 'EOS 5D']
      ];
      
      uiManager.showCameraInfo(data);
      
      const cameraPoints = document.querySelector('.camera-points');
      expect(cameraPoints.innerHTML).toContain('Производитель: Canon');
      expect(cameraPoints.innerHTML).toContain('Модель: EOS 5D');
    });

    test('должен скрывать секцию если данных нет', () => {
      uiManager.showCameraInfo(null);
      
      const cameraSection = document.querySelector('.camera');
      expect(cameraSection.style.display).toBe('none');
    });
  });

  describe('showImageSection()', () => {
    test('должен отображать превью изображения', () => {
      const imgElement = document.getElementById('previewImage');
      imgElement.src = '';
      imgElement.style.display = 'none';
      
      uiManager.showImageSection('blob:test-url', 'test.jpg');
      
      expect(imgElement.style.display).toBe('block');
      expect(imgElement.src).toBe('blob:test-url');
    });

    test('должен скрывать изображение если URL отсутствует', () => {
      const imgElement = document.getElementById('previewImage');
      imgElement.src = 'data:test';
      imgElement.style.display = 'block';
      
      uiManager.showImageSection(null, null);

      expect(imgElement.style.display).toBe('none');
    });
  });
});