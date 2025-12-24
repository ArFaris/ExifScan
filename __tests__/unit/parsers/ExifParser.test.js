import { jest } from '@jest/globals';
import { ExifParser } from '../../../src/app/parsers/ExifParser.js';

describe('ExifParser', () => {
  let parser;
  let mockFile;

  beforeEach(() => {
    mockFile = {
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
      lastModified: Date.now(),
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10))
    };

    parser = new ExifParser(mockFile);
    
    // Мокаем ExifReader
    global.window.ExifReader = {
      load: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Конструктор', () => {
    test('должен создавать экземпляр с переданным файлом', () => {
      expect(parser.file).toBe(mockFile);
    });
  });

  describe('parse()', () => {
    test('должен парсить EXIF данные', async () => {
      const mockExif = {
        Make: { description: 'Canon' },
        Model: { description: 'EOS 5D' }
      };
      window.ExifReader.load.mockResolvedValue(mockExif);

      const result = await parser.parse();
      
      expect(result).toHaveProperty('camera');
      expect(result).toHaveProperty('settings');
      expect(result).toHaveProperty('time');
      expect(result).toHaveProperty('gps');
      expect(result).toHaveProperty('fileInfo');
    });

    test('должен обрабатывать ошибки при парсинге', async () => {
      window.ExifReader.load.mockRejectedValue(new Error('Parse error'));

      await expect(parser.parse()).rejects.toThrow('Parse error');
    });
  });

  describe('Категоризация данных', () => {
    test('должен возвращать "-" для отсутствующих данных', async () => {
      window.ExifReader.load.mockResolvedValue({});
      
      const result = await parser.parse();
      
      expect(result.camera['Производитель']).toBe('-');
      expect(result.camera['Модель']).toBe('-');
    });

    test('должен форматировать размер файла', async () => {
      const testCases = [
        { size: 0, expected: '0 Б' },
        { size: 1023, expected: '1023.00 Б' },
        { size: 1024, expected: '1.00 КБ' }
      ];

      for (const { size, expected } of testCases) {
        const file = { ...mockFile, size };
        const parserWithSize = new ExifParser(file);
        
        window.ExifReader.load.mockResolvedValue({});
        
        const result = await parserWithSize.parse();
        expect(result.fileInfo['Размер файла']).toBe(expected);
      }
    });
  });
});