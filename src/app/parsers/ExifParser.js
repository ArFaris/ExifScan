export class ExifParser {
    constructor(file) {
        this.file = file;
    }

    async parse() {
        try {
            const allTags = await this.extractExif(this.file);
            return this.categorize(allTags);
        } catch (error) {
            throw error;
        }
    }

    async extractExif(file) {
        if (!window.ExifReader) {
            throw new Error('Exif parser не загружен');
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            return window.ExifReader.load(arrayBuffer, {
                includeUnknown: true
            });
        } catch (error) {
            return {};
        }
    }

    categorize(exifData) {
        return {
            camera: this.#extractCamera(exifData),
            settings: this.#extractSettings(exifData),
            time: this.#extractTime(exifData),
            gps: this.#extractGPS(exifData),
            fileInfo: this.#extractFileInfo(exifData, this.file)
        };
    } 

    // 1. КАМЕРА (Camera)
    #extractCamera(exif) {
        return {
            'Производитель': this.#getValue(exif.Make?.description),
            'Модель': this.#getValue(exif.Model?.description),
            'Объектив': this.#getValue(exif.LensModel?.description),
            'Серийный номер объектива': this.#getValue(exif.LensSerialNumber?.description),
            'Программное обеспечение': this.#getValue(exif.Software?.description)
        };
    }

    // 2. НАСТРОЙКИ СЪЕМКИ (Settings)
    #extractSettings(exif) {
        return {
            'Диафрагма': this.#getValue(exif.FNumber?.description),
            'Фокусное расстояние': this.#getValue(exif.FocalLength?.description),
            'Эквивалент 35мм': this.#getValue(exif.FocalLengthIn35mmFilm?.description),
            'ISO': this.#getValue(exif.ISOSpeedRatings?.description),
            'Выдержка': this.#getValue(exif.ExposureTime?.description),
            'Экспокоррекция': this.#getValue(exif.ExposureBiasValue?.description),
            'Режим замера': this.#getMeteringMode(exif.MeteringMode?.value),
            'Баланс белого': this.#getWhiteBalance(exif.WhiteBalance?.value),
            'Режим съемки': this.#getExposureProgram(exif.ExposureProgram?.value)
        };
    }

    // 3. ВРЕМЯ (Time)
    #extractTime(exif) {
        return {
            'Дата съемки': this.#getValue(exif.DateTimeOriginal?.description),
            'Дата оцифровки': this.#getValue(exif.DateTimeDigitized?.description),
            'Дата изменения': this.#getValue(exif.DateTime?.description)
        };
    }

    // 4. GPS
    #extractGPS(exif) {
        return {
            'Широта': this.#getValue(exif.GPSLatitude?.description),
            'Долгота': this.#getValue(exif.GPSLongitude?.description),
            'Высота': this.#getValue(exif.GPSAltitude?.description)
        };
    }
    
    // 5. ОБЩАЯ ИНФОРМАЦИЯ О ФАЙЛЕ (FileInfo)
    #extractFileInfo(exif, file) {
        return {
            'Имя файла': file.name,
            'Размер файла': this.#formatFileSize(file.size),
            'Тип файла': file.type,
            'Дата изменения': new Date(file.lastModified).toLocaleString('ru'),
            'Ширина': this.#getValue(exif['Image Width']?.description || exif.ImageWidth?.description),
            'Высота': this.#getValue(exif['Image Height']?.description || exif.ImageHeight?.description),
            'Битовая глубина': this.#getValue(exif['Bits Per Sample']?.description),
            'Цветовое пространство': this.#getColorSpace(exif.ColorSpace?.value),
            'Ориентация': this.#getOrientation(exif.Orientation?.value),
            'Компрессия': this.#getCompression(exif.Compression?.value),
            'Автор': this.#getValue(exif.Artist?.description),
            'Горизонтальное разрешение для печати': this.#getValue(exif.XResolution?.description),
            'Вертикальное разрешение для печати': this.#getValue(exif.YResolution?.description),
            'Единицы измерения разрешения': this.#getResolutionUnit(exif.ResolutionUnit?.value),
            'Метод сжатия цветности': this.#getValue(exif.YCbCrSubSampling?.description || exif.PhotometricInterpretation?.description)
        };
    }

    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    
    #getValue(value) {
        return value !== undefined && value !== null && value !== '' ? value : "-";
    }

    #getMeteringMode(value) {
        if (value === undefined || value === null) return "-";
        const modes = {
            0: 'Неизвестно',
            1: 'Среднее',
            2: 'Центрально-взвешенное',
            3: 'Точечное',
            4: 'Мультизонное',
            5: 'Частичное',
            6: 'Оценочное',
            255: 'Другое'
        };
        return modes[value] || "-";
    }

    #getWhiteBalance(value) {
        if (value === undefined || value === null) return "-";
        const modes = {
            0: 'Авто',
            1: 'Ручной',
            'Auto': 'Авто',
            'Manual': 'Ручной'
        };
        return modes[value] || "-";
    }

    #getExposureProgram(value) {
        if (value === undefined || value === null) return "-";
        const programs = {
            0: 'Не определен',
            1: 'Ручной',
            2: 'Приоритет диафрагмы',
            3: 'Приоритет выдержки',
            4: 'Авто',
            5: 'Творческий',
            6: 'Действие',
            7: 'Портрет',
            8: 'Пейзаж'
        };
        return programs[value] || "-";
    }

    #getColorSpace(value) {
        if (value === undefined || value === null) return "-";
        const spaces = {
            1: 'sRGB',
            2: 'Adobe RGB',
            65535: 'Не калиброванный'
        };
        return spaces[value] || "-";
    }

    #getOrientation(value) {
        if (value === undefined || value === null) return "-";
        const orientations = {
            1: 'Нормальное',
            2: 'Зеркальное по горизонтали',
            3: 'Поворот на 180°',
            4: 'Зеркальное по вертикали',
            5: 'Поворот на 90° по часовой + зеркальное',
            6: 'Поворот на 90° по часовой',
            7: 'Поворот на 90° против часовой + зеркальное',
            8: 'Поворот на 90° против часовой'
        };
        return orientations[value] || "-";
    }

    #getCompression(value) {
        if (value === undefined || value === null) return "-";
        const compressions = {
            1: 'Без сжатия',
            6: 'JPEG сжатие',
            7: 'JPEG сжатие'
        };
        return compressions[value] || "-";
    }

    #getResolutionUnit(value) {
        if (value === undefined || value === null) return "-";
        const units = {
            1: 'Нет (пиксели)',
            2: 'Дюймы',
            3: 'Сантиметры'
        };
        return units[value] || "-";
    }

    #formatFileSize(bytes) {
        if (bytes === 0) return '0 Б';
        const units = ['Б', 'КБ', 'МБ', 'ГБ'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
}