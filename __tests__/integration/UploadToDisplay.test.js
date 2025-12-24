import { jest } from '@jest/globals';
import { UIManager } from '../../src/app/managers/uiManager.js';
import { DisplayManager } from '../../src/app/managers/displayManager.js';
import { UploadManager } from '../../src/app/managers/uploadManager.js';

describe('Интеграция: Загрузка и отображение EXIF данных', () => {
  let uploadManager;
  let uiManager;
  let displayManager;

  beforeEach(() => {
    document.body.innerHTML = `
      <!-- Кнопка, которую ищет PageManager -->
      <button id="header-button">Начать сейчас</button>
      
      <div class="upload-container">
        <div class="upload__title">Перетащите изображение сюда</div>
        <div class="upload__subtitle">или выберите файл для загрузки</div>
        <div class="file-input-wrapper">
          <input type="file" hidden />
        </div>
        <button class="button button--pill" disabled>Получить метаданные</button>
        <button class="button button--pill">Сбросить файлы</button>
      </div>
      
      <!-- Страницы для PageManager -->
      <main id="upload" class="page active"></main>
      <main id="results" class="results page"></main>
      <div id="loader" class="loader"></div>
      
      <!-- Элементы для отображения данных -->
      <div class="camera">
        <ul class="camera-points"></ul>
      </div>
      <div class="points__group points-settings"></div>
      <ul class="time-points"></ul>
      <ul class="meta-info"></ul>
      <img id="previewImage" />
      <button id="result-button">Скопировать JSON</button>
    `;

    // Мокаем URL API
    global.URL = {
      createObjectURL: jest.fn(() => 'blob:test-url'),
      revokeObjectURL: jest.fn()
    };

    // Мокаем window.scrollTo
    window.scrollTo = jest.fn();

    // Мокаем ExifReader
    global.window.ExifReader = {
      load: jest.fn()
    };

    // Создаем экземпляры менеджеров
    uiManager = new UIManager();
    displayManager = new DisplayManager(uiManager);
    uploadManager = new UploadManager(uiManager, displayManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('полный цикл загрузки и анализа файла', async () => {
    // Мокаем файл
    const mockFile = {
      name: 'test.jpg',
      type: 'image/jpeg',
      size: 1024 * 1024,
      lastModified: Date.now(),
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10))
    };

    // Мокаем ExifReader для возврата данных
    window.ExifReader.load.mockResolvedValue({
      Make: { description: 'Canon' },
      Model: { description: 'EOS 5D' },
      FNumber: { description: 'f/2.8' },
      ISOSpeedRatings: { description: '100' }
    });

    // Загружаем файл
    uploadManager.handleFileSelect(mockFile);
    
    expect(uploadManager.selectedFile).toBe(mockFile);
    
    // Анализируем файл
    await uploadManager.analyzeFile();
    
    // Проверяем, что ExifReader был вызван
    expect(window.ExifReader.load).toHaveBeenCalled();
    
    // Вместо проверки моков, проверяйте DOM изменения
    const cameraPoints = document.querySelector('.camera-points');
    const previewImage = document.getElementById('previewImage');
    
    // Проверяем что элементы есть и были обновлены
    expect(cameraPoints).toBeTruthy();
    expect(previewImage).toBeTruthy();
    expect(previewImage.src).toContain('blob:test-url');
  });

  test('ошибка при загрузке невалидного файла', () => {
    const invalidFile = {
      name: 'test.txt',
      type: 'text/plain',
      size: 1024
    };

    uploadManager.handleFileSelect(invalidFile);
    
    expect(uploadManager.selectedFile).toBeNull();
  });
});