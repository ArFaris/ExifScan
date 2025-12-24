import { jest } from '@jest/globals';
import { UploadManager } from '../../../src/app/managers/uploadManager.js';

// СОЗДАЕМ МОКИ ПЕРЕД ИМПОРТАМИ
const mockUIManagerInstance = {
  showFileInfo: jest.fn(),
  enableAnalyzeButton: jest.fn(),
  showError: jest.fn(),
  setDropZoneState: jest.fn(),
  resetUI: jest.fn(),
  showImageSection: jest.fn(),
  scrollToSection: jest.fn(),
  formatFileSize: jest.fn().mockReturnValue('1.00 KB')
};

const mockDisplayManagerInstance = {
  displayExifData: jest.fn(),
  resetData: jest.fn(),
  json: null,
  jsonButton: { removeEventListener: jest.fn() },
  downloadJson: jest.fn()
};

// Мокаем зависимости
jest.mock('../../../src/app/managers/uiManager.js', () => ({
  UIManager: jest.fn(() => mockUIManagerInstance)
}));

jest.mock('../../../src/app/managers/displayManager.js', () => ({
  DisplayManager: jest.fn(() => mockDisplayManagerInstance)
}));

// Импортируем ПОСЛЕ моков
import { UIManager } from '../../../src/app/managers/uiManager.js';
import { DisplayManager } from '../../../src/app/managers/displayManager.js';

describe('UploadManager', () => {
  let uploadManager;
  let mockUiManager;
  let mockDisplayManager;
  let mockEvent;

  beforeEach(() => {
    // СОЗДАЕМ ПОЛНЫЙ DOM С ВСЕМИ ЭЛЕМЕНТАМИ
    document.body.innerHTML = `
      <!-- Элементы для UIManager.showFileInfo() -->
      <div class="upload-container">
        <h2 class="upload__title">Перетащите изображение сюда</h2>
        <h3 class="upload__subtitle">или выберите файл для загрузки</h3>
      </div>
      
      <!-- Кнопки -->
      <button class="button button--pill">Получить метаданные</button>
      <button class="button button--pill">Сбросить файлы</button>
      
      <!-- Для DisplayManager -->
      <button id="result-button">Скопировать JSON</button>
      
      <!-- Input для файлов -->
      <div class="file-input-wrapper">
        <input type="file" hidden />
      </div>
      
      <!-- ДЛЯ PageManager (важно!) -->
      <main id="upload" class="page active"></main>
      <main id="results" class="results page"></main>
      <div id="loader" class="loader"></div>
      <button id="header-button">Начать сейчас</button>
      
      <!-- Для showImageSection -->
      <img id="previewImage" src="" alt="Превью">
    `;

    // Мокаем URL API
    global.URL = {
      createObjectURL: jest.fn(() => 'blob:test-url'),
      revokeObjectURL: jest.fn()
    };

    // Используем мокированные инстансы
    mockUiManager = mockUIManagerInstance;
    mockDisplayManager = mockDisplayManagerInstance;
    
    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
    
    // Создаем UploadManager
    uploadManager = new UploadManager(mockUiManager, mockDisplayManager);
    
    mockEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        files: []
      },
      target: {
        files: []
      }
    };
  });

  describe('validateFile()', () => {
    test('должен принимать валидные JPEG файлы', () => {
      const validFiles = [
        { type: 'image/jpeg', size: 5 * 1024 * 1024 },
        { type: 'image/jpg', size: 10 * 1024 * 1024 },
        { type: 'image/png', size: 1 * 1024 * 1024 }
      ];
      
      validFiles.forEach(file => {
        expect(uploadManager.validateFile(file)).toBe(true);
      });
    });

    test('не должен принимать невалидные файлы', () => {
      const invalidFiles = [
        { type: 'text/plain', size: 1024 },
        { type: 'image/jpeg', size: 11 * 1024 * 1024 },
        { type: 'image/gif', size: 1024 }
      ];
      
      invalidFiles.forEach(file => {
        expect(uploadManager.validateFile(file)).toBe(false);
      });
    });
  });

  describe('handleFileSelect()', () => {
    test('должен обрабатывать валидный файл', () => {
      const validFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024 * 1024
      };
      
      // Мокаем validateFile
      uploadManager.validateFile = jest.fn().mockReturnValue(true);
      
      uploadManager.handleFileSelect(validFile);
      
      expect(uploadManager.selectedFile).toBe(validFile);
      expect(URL.createObjectURL).toHaveBeenCalledWith(validFile);
      expect(mockUiManager.showFileInfo).toHaveBeenCalledWith(validFile);
      expect(mockUiManager.enableAnalyzeButton).toHaveBeenCalled();
    });

    test('не должен обрабатывать невалидный файл', () => {
      const invalidFile = {
        name: 'test.txt',
        type: 'text/plain',
        size: 1024
      };
      
      // Мокаем validateFile
      uploadManager.validateFile = jest.fn().mockReturnValue(false);
      
      uploadManager.handleFileSelect(invalidFile);
      
      expect(uploadManager.selectedFile).toBe(null);
      expect(mockUiManager.showError).toHaveBeenCalled();
    });
  });

  describe('Drag and Drop events', () => {
    test('handleDragOver должен предотвращать стандартное поведение', () => {
      uploadManager.handleDragOver(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockUiManager.setDropZoneState).toHaveBeenCalledWith('dragover');
    });

    test('handleDragLeave должен сбрасывать состояние', () => {
      uploadManager.handleDragLeave(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockUiManager.setDropZoneState).toHaveBeenCalledWith('normal');
    });

    test('handleDrop должен обрабатывать перетаскивание файлов', () => {
      const mockFile = { 
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024 
      };
      mockEvent.dataTransfer.files = [mockFile];
      
      // Мокаем handleFileSelect
      uploadManager.handleFileSelect = jest.fn();
      uploadManager.validateFile = jest.fn().mockReturnValue(true);
      
      uploadManager.handleDrop(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockUiManager.setDropZoneState).toHaveBeenCalledWith('normal');
      expect(uploadManager.handleFileSelect).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('resetFile()', () => {
    test('должен сбрасывать состояние', () => {
      uploadManager.selectedFile = { name: 'test.jpg' };
      uploadManager.selectedImageUrl = 'blob:test';
      
      uploadManager.resetFile();
      
      expect(uploadManager.selectedFile).toBe(null);
      expect(uploadManager.selectedImageUrl).toBe(null);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
      expect(mockUiManager.resetUI).toHaveBeenCalled();
      expect(mockDisplayManager.resetData).toHaveBeenCalled();
    });
  });
});