# 🖥️ **Система учёта IT-инфраструктуры**

Надеюсь это небольшое руководство поможет, разобраться в проекте 😕

## 📖 **Описание проекта**

**Проект:** Система учёта IT-инфраструктуры.  
**Цель:** Разработка API-сервиса для учёта IT-инфраструктуры, включающего управление пользователями, организациями, департаментами, ролями и интеграцию с LDAP/Active Directory.  

Система обеспечивает:
- **Гибкое управление пользователями и организациями.**  
- **Ролевую модель безопасности.**  
- **Аудит действий для мониторинга изменений.**  
- **Интеграцию с существующими корпоративными решениями (OpenLDAP, AD).**

---

## 🛠️ **Функциональные требования**

### 1. **Система безопасности**
- [ ] Аутентификация и авторизация (JWT).
- [ ] Управление ролями и разрешениями (RBAC).
- [ ] Сброс пароля.
- [ ] Интеграция с OpenLDAP и Active Directory.

### 2. **Управление пользователями**
- [ ] Создание и удаление пользователей.
- [ ] Обновление данных пользователей.
- [ ] Получение списка пользователей.
- [ ] Поддержка системных пользователей.

### 3. **Управление организациями**
- [ ] Создание, обновление и удаление организаций.
- [ ] Получение списка организаций.

### 4. **Управление департаментами**
- [ ] Добавление департаментов к организациям.
- [ ] Управление данными департаментов.
- [ ] Удаление департаментов.

### 5. **Управление ролями и категориями ролей**
- [ ] Создание и удаление ролей и категорий.
- [ ] Обновление данных ролей.
- [ ] Получение списка ролей.

### 6. **Аудит действий**
- [ ] Логирование изменений пользователей.
- [ ] Отчёты по действиям, выполненным в системе.

---

## 🏗️ **Технологический стек**

Проект разработан с использованием современных технологий:  

| Технология          | Версия    | Назначение                                                                                 |
|---------------------|-----------|-------------------------------------------------------------------------------------------|
| **FastAPI**         | `0.115.6` | Основной фреймворк для разработки API с автоматической документацией.                     |
| **Uvicorn**         | `0.32.1`  | ASGI-сервер для запуска FastAPI-приложения.                                               |
| **Pydantic**        | `2.10.3`  | Для валидации входящих данных и работы с моделями.                                        |
| **SQLAlchemy**      | `2.0.36`  | ORM для работы с PostgreSQL, поддерживает сложные запросы и миграции.                     |
| **asyncpg**         | `0.30.0`  | Асинхронный драйвер для работы с PostgreSQL.                                              |
| **Alembic**         | `1.14.0`  | Управление миграциями базы данных.                                                        |
| **pytest**          | `8.3.4`   | Фреймворк для тестирования компонентов API.                                               |
| **python-dotenv**   | `1.0.1`   | Управление конфигурацией через переменные окружения `.env`.                               |
| **Celery**          | `5.5.0rc3`| Планировщик задач для асинхронной обработки.                                              |
| **Redis**           | `5.0.0`   | Хранилище данных в памяти, используется с Celery для управления задачами.                |

Для подробного описания технологий, используемых в проекте, см. [TECHNOLOGIES.md](TECHNOLOGIES.md).


---

## 🗃️ **Работа с базой данных**

Для работы с базой данных используется **PostgreSQL**.  
Основные функции:
- Управление пользователями, организациями, департаментами и ролями.
- Хранение логов изменений для аудита.
- Поддержка миграций с помощью **Alembic**.

### Команды для работы с миграциями:
1. Создать новую миграцию:
    ```bash
    alembic revision --autogenerate -m "описание изменений"
    ```
2. Применить миграции:
    ```bash
    make migrate
    ```

---

## ⚙️ **Установка и запуск**

### 1. **Установить зависимости**
```bash
make install
```

### 2. **Настроить переменные окружения**
Создайте файл `.env` в корне проекта и добавьте следующие настройки:
```
DB_HOST=psql.cair-edu.ru
DB_PORT=5435
DB_USER=postgres
DB_PASSWORD=<PASSWORD>
DB_NAME=TECH_IT_STORAGE

SECRET_KEY=<SECRET_KEY>
DEBUG=True
```

Параметры `<SECRET_KEY>` и `<PASSWORD> ` необходимо вписывать отдельно. Основной файл `.env` находится
на `taks.cair-edu.ru` (Redmine), либо в беседе телеграмма.

### 3. **Запустить проект с использованием Docker**

Для запуска приложения с помощью Docker используйте следующую команду:
```bash
make docker-up
```
Это соберёт и запустит контейнеры с необходимыми сервисами.

### 3.1. **Запуск сервера вручную (если необходимо)**
Если необходимо запустить сервер вручную (например, без Docker), используйте следующую команду:
```bash
make run
```

---

## 📋 **Тестирование**

Для запуска тестов используется **pytest**.

### Запуск тестов:
```bash
make test
```

### Правила написания тестов:
1. **Юнит-тесты:** Тестируют отдельные компоненты системы (например, отдельные функции или методы). Они не зависят от базы данных или других внешних сервисов.
    

2. **Интеграционные тесты:** Проверяют взаимодействие между различными частями системы, например, взаимодействие с базой данных или внешними API.


3. **Функциональные тесты:** Проверяют работу системы в целом, например, API-эндпоинтов.


---

## 📜 **Структура проекта**

```plaintext
StorageAPI
├── alembic/                     # Миграции базы данных
├── src
│   ├── auth                     # Пакет для аутентификации
│   ├── users/
│   │   ├── __init__.py          # Файл для инициализации пакета
│   │   ├── router.py            # Роутеры для работы с пользователями
│   │   ├── schemas.py           # Pydantic схемы для сериализации и валидации данных
│   │   ├── models.py            # Модели для базы данных (например, User)
│   │   ├── dependencies.py      # Зависимости для роутеров
│   │   ├── service.py           # Логика работы с пользователями
│   │   ├── exceptions.py        # Исключения для ошибок при работе с пользователями
│   │   └── utils.py             # Вспомогательные функции для работы с пользователями
│   ├── organizations            # Пакет для работы с организациями
│   ├── departments              # Пакет для работы с департаментами
│   ├── roles                    # Пакет для работы с ролями
│   ├── audit                    # Пакет для логирования действий (аудит)
│   ├── config.py                # Глобальные конфигурации
│   ├── models.py                # Общие модели
│   ├── database.py              # Работа с базой данных
│   ├── exceptions.py            # Глобальные исключения
│   └── main.py                  # Основной файл для FastAPI
├── tests/                       # Папка для тестов
│   ├── auth                     # Тесты для аутентификации
│   ├── users                    # Тесты для пользователей
│   ├── organizations            # Тесты для организаций
│   ├── departments              # Тесты для департаментов
│   ├── roles                    # Тесты для ролей
│   └── audit                    # Тесты для аудита
├── Dockerfile                   # Конфигурация для Docker
├── Makefile                     # Скрипты для сборки и тестирования
├── requirements/                # Зависимости
│   ├── dev.txt                  # Зависимости для разработки
│   └── production.txt           # Зависимости для продакшн
├── .env                         # Переменные окружения
├── .gitignore                   # Список игнорируемых файлов
├── logging.ini                  # Конфигурация для логирования
├── alembic.ini                  # Конфигурация для Alembic
├── Makefile                     # Автоматизация процессов в проекте
├── README.md                    # Документация
└── TECHNOLOGIES.md              # Документация по используемым технологиям
```

---

### Основные моменты:

- **src/** — основной код проекта (API, сервисы, модели и т.д.).
- **tests/** — тесты для проверки функциональности.
- **alembic/** — миграции базы данных.
- **requirements/** — зависимости для различных окружений.
- **docker-compose.yml**, **Dockerfile** — конфигурации для Docker.
- **logging.ini** — конфигурация логирования.