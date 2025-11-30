from django.contrib import admin
from django.utils.html import mark_safe  # Для виводу картинки прапора
from .models import (
    Country,
    HistoricalPeriodEvents,
    HistoricalPeriod,
    HistoricalSupplement,
    HistoricalPeriodDetail,
    Question,
    Answer,
    User
)


# ==========================================
# 1. БЛОК ТЕСТІВ (Питання + Відповіді)
# ==========================================

class AnswerInline(admin.TabularInline):
    """
    Дозволяє додавати варіанти відповідей всередині картки Питання.
    """
    model = Answer
    extra = 4  # Показуємо 4 пусті рядки відразу
    min_num = 2  # Мінімум 2 варіанти


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'period')
    list_filter = ('period',)
    search_fields = ('text',)
    inlines = [AnswerInline]  # Підключаємо відповіді сюди


# ==========================================
# 2. БЛОК ІСТОРІЇ (Період + Деталі + Вкладені питання)
# ==========================================

# Це щоб додавати Питання прямо на сторінці Періоду
class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    show_change_link = True  # Додає кнопку "Редагувати", щоб перейти до додавання відповідей


# Це для детальних блоків з цитатами
class HistoricalPeriodDetailInline(admin.StackedInline):
    model = HistoricalPeriodDetail
    extra = 1
    # autocomplete_fields робить пошук подій зручним, якщо їх багато
    autocomplete_fields = ['historical_context']


@admin.register(HistoricalPeriod)
class HistoricalPeriodAdmin(admin.ModelAdmin):
    list_display = ('get_country_name', 'get_event_title')
    list_filter = ('country',)

    # Підключаємо сюди Деталі та Питання
    inlines = [HistoricalPeriodDetailInline, QuestionInline]

    # Для зручного вибору події (щоб не гортати довгий список)
    autocomplete_fields = ['description']

    # Додаткові методи для красивого відображення в списку
    def get_country_name(self, obj):
        return obj.country.main_title

    get_country_name.short_description = "Країна"

    def get_event_title(self, obj):
        return obj.description.title

    get_event_title.short_description = "Назва періоду"


# ==========================================
# 3. ДОДАТКОВІ МОДЕЛІ (Події та Доповнення)
# ==========================================

@admin.register(HistoricalPeriodEvents)
class HistoricalPeriodEventsAdmin(admin.ModelAdmin):
    list_display = ('title', 'short_desc_preview', 'likes')
    search_fields = ('title',)  # Це потрібно для autocomplete_fields

    def short_desc_preview(self, obj):
        return obj.short_description[:50] + "..."

    short_desc_preview.short_description = "Короткий опис"


@admin.register(HistoricalSupplement)
class HistoricalSupplementAdmin(admin.ModelAdmin):
    list_display = ('title',)
    search_fields = ('title', 'description')  # Це потрібно для autocomplete_fields


# ==========================================
# 4. КРАЇНИ (З фото)
# ==========================================

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('main_title', 'flag_preview')

    def flag_preview(self, obj):
        if obj.flag:
            return mark_safe(f'<img src="{obj.flag.url}" width="50" height="30" style="border:1px solid #ccc;" />')
        return "Немає фото"

    flag_preview.short_description = "Прапор"

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'score')