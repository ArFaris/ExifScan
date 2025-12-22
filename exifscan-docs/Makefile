# Переменные
DOCUMENT = main
LATEX = pdflatex
BUILD_DIR = build

# Основная цель
all: pdf

# Сборка PDF (два прохода для корректных ссылок)
pdf:
	@echo "Сборка документации..."
	mkdir -p $(BUILD_DIR)
	$(LATEX) -output-directory=$(BUILD_DIR) $(DOCUMENT).tex
	$(LATEX) -output-directory=$(BUILD_DIR) $(DOCUMENT).tex
	@echo "Готово: $(BUILD_DIR)/$(DOCUMENT).pdf"

# Быстрая сборка (один проход)
quick:
	$(LATEX) -output-directory=$(BUILD_DIR) $(DOCUMENT).tex

# Очистка временных файлов
clean:
	rm -rf $(BUILD_DIR)
	rm -f *.aux *.log *.out *.toc

.PHONY: all pdf quick clean
