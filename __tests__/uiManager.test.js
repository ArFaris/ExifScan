import { UIManager } from '../src/app/managers/uiManager.js';

const uiManager = new UIManager();

describe('UIManager File Formatting', () => {
    test('1. formatFileSize должен корректно форматировать размер в KB', () => {
        const bytes = 1536; // 1.5 KB
        expect(uiManager.formatFileSize(bytes)).toBe('1.50 KB');
    });

    test('2. formatFileSize должен возвращать "0 Bytes" для нулевого размера', () => {
        const bytes = 0; 
        expect(uiManager.formatFileSize(bytes)).toBe('0 Bytes');
    });

    test.each([
        [1024, '1.00 KB'],
        [1048576, '1.00 MB'],
        [1073741824, '1.00 GB'],
    ])('3. formatFileSize должен правильно конвертировать %s байт в %s', (inputBytes, expectedFormat) => {
        expect(uiManager.formatFileSize(inputBytes)).toBe(expectedFormat);
    });
});

