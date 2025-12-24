import { jest } from '@jest/globals';
import { DisplayManager } from '../../../src/app/managers/displayManager.js';

describe('DisplayManager', () => {
  let displayManager;
  let mockUiManager;

  beforeEach(() => {
    mockUiManager = {
      showCameraInfo: jest.fn(),
      showSettingsInfo: jest.fn(),
      showTimeInfo: jest.fn(),
      showGPSData: jest.fn(),
      showGeneralInfo: jest.fn(),
      showError: jest.fn(),
      showImageSection: jest.fn(),
      downloadJson: jest.fn()
    };

    document.body.innerHTML = '<button id="result-button">Скопировать JSON</button>';
    
    displayManager = new DisplayManager(mockUiManager);
  });

  describe('displayExifData()', () => {
    test('должен отображать все категории данных', () => {
      const exifData = {
        camera: { 'Производитель': 'Canon' },
        settings: { 'Диафрагма': 'f/2.8' },
        time: { 'Дата съемки': '2023-01-01' },
        gps: { 'Широта': '55.7558° N' },
        fileInfo: { 'Имя файла': 'test.jpg' }
      };

      displayManager.displayExifData(exifData);

      expect(mockUiManager.showCameraInfo).toHaveBeenCalled();
      expect(mockUiManager.showSettingsInfo).toHaveBeenCalled();
      expect(mockUiManager.showTimeInfo).toHaveBeenCalled();
      expect(mockUiManager.showGPSData).toHaveBeenCalled();
      expect(mockUiManager.showGeneralInfo).toHaveBeenCalled();
    });

    test('должен сохранять JSON данные', () => {
      const exifData = { camera: { 'Производитель': 'Canon' } };
      
      displayManager.displayExifData(exifData);
      
      expect(displayManager.json).toBe(JSON.stringify(exifData));
    });
  });

  describe('resetData()', () => {
    test('должен сбрасывать все данные', () => {
      displayManager.json = 'test';
      
      const button = document.getElementById('result-button');
      button.removeEventListener = jest.fn();

      displayManager.resetData();

      expect(displayManager.json).toBe(null);
      expect(mockUiManager.showImageSection).toHaveBeenCalledWith(null);
      expect(mockUiManager.showCameraInfo).toHaveBeenCalledWith(null);
      expect(mockUiManager.showSettingsInfo).toHaveBeenCalledWith(null);
      expect(mockUiManager.showTimeInfo).toHaveBeenCalledWith(null);
      expect(mockUiManager.showGeneralInfo).toHaveBeenCalledWith(null);
      expect(button.removeEventListener).toHaveBeenCalled();
    });
  });

  describe('downloadJson()', () => {
    test('должен скачивать JSON если данные существуют', () => {
      const mockJson = JSON.stringify({ test: 'data' });
      displayManager.json = mockJson;

      displayManager.downloadJson();

      expect(mockUiManager.downloadJson).toHaveBeenCalledWith(mockJson);
    });

    test('должен показывать ошибку если JSON отсутствует', () => {
      displayManager.json = null;

      displayManager.downloadJson();

      expect(mockUiManager.showError).toHaveBeenCalledWith('JSON отсутствует');
    });
  });
});