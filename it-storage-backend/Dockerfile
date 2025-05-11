# Используем официальный образ Python
FROM python:3.12-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Установка системных зависимостей для WeasyPrint
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpango1.0-0 \
        libcairo2 \
        libgdk-pixbuf2.0-0 \
        libglib2.0-0 \
        libjpeg-dev \
        zlib1g-dev \
        libpng-dev \
        libxml2-dev \
        libxslt1-dev \
        g++ \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


# Копируем зависимости
COPY requirements/prod.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r prod.txt

# Копируем исходный код
COPY . .

# Указываем порт, который будет использовать приложение
EXPOSE 8000

# Команда для запуска приложения
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]