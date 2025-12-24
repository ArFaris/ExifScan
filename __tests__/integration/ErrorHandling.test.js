import { jest } from '@jest/globals';
import { UIManager } from '../../src/app/managers/uiManager.js';
import { UploadManager } from '../../src/app/managers/uploadManager.js';
import { DisplayManager } from '../../src/app/managers/displayManager.js';

describe('Обработка ошибок в ExifScan', () => {
  let uploadManager;
  let uiManager;
  let displayManager;

  beforeEach(() => {
    document.body.innerHTML = `
      <!-- Контейнер загрузки -->
      <div class="upload-container">
        <!-- ДОБАВЬТЕ ЭТИ ЭЛЕМЕНТЫ: -->
        <h2 class="upload__title">Перетащите изображение сюда</h2>
        <h3 class="upload__subtitle">или выберите файл для загрузки</h3>
      </div>
      
      <!-- Кнопки -->
      <button class="button--pill">Получить метаданные</button>
      
      <!-- Для уведомлений -->
      <div class="notification"></div>
      
      <!-- Для DisplayManager -->
      <button id="result-button">Скопировать JSON</button>
    `;

    // Мокаем URL API
    global.URL = {
      createObjectURL: jest.fn(() => 'blob:test-url'),
      revokeObjectURL: jest.fn()
    };

    // Создаем экземпляры менеджеров
    uiManager = new UIManager();
    displayManager = new DisplayManager(uiManager);
    uploadManager = new UploadManager(uiManager, displayManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Показ уведомлений', () => {
    test('должен показывать уведомление об ошибке', () => {
      document.createElement = jest.fn(() => ({
        className: '',
        textContent: '',
        style: {},
        remove: jest.fn()
      }));
      
      document.body.appendChild = jest.fn();
      
      uiManager.showError('Test error');
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    test('должен показывать уведомление об успехе', () => {
      document.createElement = jest.fn(() => ({
        className: '',
        textContent: '',
        style: {},
        remove: jest.fn()
      }));
      
      document.body.appendChild = jest.fn();
      
      uiManager.showNotification('Test success', 'success');
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(document.body.appendChild).toHaveBeenCalled();
    });
  });

  describe('Валидация файлов', () => {
    test('должен отклонять невалидные файлы', () => {
      const invalidFiles = [
        { name: 'test.exe', type: 'application/octet-stream', size: 1024 },
        { name: 'huge.jpg', type: 'image/jpeg', size: 20 * 1024 * 1024 }
      ];

      invalidFiles.forEach(file => {
        uploadManager.handleFileSelect(file);
        expect(uploadManager.selectedFile).toBeNull();
      });
    });

    test('должен принимать валидные файлы', () => {
      const validFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024
      };

      uploadManager.handleFileSelect(validFile);
      expect(uploadManager.selectedFile).toBe(validFile);
      
      const title = document.querySelector('.upload__title');
      const subtitle = document.querySelector('.upload__subtitle');
      
      expect(title.textContent).toBe('Выбран файл: test.jpg');
      expect(subtitle.textContent).toBe('Размер: 1.00 KB');
    });
  });
});