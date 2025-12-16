import { UploadManager } from '../src/app/managers/uploadManager.js';

const mockUiManager = {};
const mockDisplayManager = {};
const uploadManager = new UploadManager(mockUiManager, mockDisplayManager);

describe('UploadManager File Validation', () => {
    test('4. validateFile должен разрешать JPEG до 10MB', () => {
        const file = { type: 'image/jpeg', size: 5 * 1024 * 1024 };
        expect(uploadManager.validateFile(file)).toBe(true);
    });

    test('5. validateFile должен отклонять файлы больше 10MB', () => {
        const file = { type: 'image/png', size: 10 * 1024 * 1024 + 1 };
        expect(uploadManager.validateFile(file)).toBe(false);
    });
});

