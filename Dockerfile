# 1. Використовуємо легку версію Python (змініть 3.13 на вашу версію, якщо треба)
FROM python:3.13-slim

# 2. Вимикаємо створення .pyc файлів та буферизацію виводу (важливо для логів Docker)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Встановлюємо робочу директорію всередині контейнера
WORKDIR /app

# 4. Встановлюємо залежності системи (якщо потрібні для PostgreSQL чи Pillow)
# Якщо використовуєте тільки SQLite, цей крок можна спростити, але краще залишити
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Копіюємо файл залежностей і встановлюємо їх
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 6. Копіюємо весь код проєкту в контейнер
COPY . /app/

# 7. Збираємо статичні файли (WhiteNoise буде їх роздавати з папки staticfiles)
# Це критичний крок для статики!
RUN python manage.py collectstatic --noinput

# 8. Відкриваємо порт 8000
EXPOSE 8000

# 9. Запускаємо Gunicorn
# Замініть 'history_america_countries' на назву вашої папки, де лежить wsgi.py
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "history_america_countries.wsgi:application"]