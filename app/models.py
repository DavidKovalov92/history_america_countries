from django.db import models


# Create your models here.

class Country(models.Model):
    """
    Модель для верхньої частини сторінки (Заголовок та прапор)
    На скріншоті: 'Бразилія: Від Диктатури до Демократії' + Прапор
    """
    main_title = models.CharField(max_length=200,
                                  verbose_name="Головний заголовок")  # "Бразилія: Від Диктатури до Демократії"
    flag = models.ImageField(upload_to='flags/', verbose_name="Прапор")  # Картинка прапора

    def __str__(self):
        return self.main_title

    class Meta:
        verbose_name = "Країна"
        verbose_name_plural = "Країни"

class HistoricalPeriodEvents(models.Model):
    # На скріншоті: "Ера Жетуліо Варгаса та її наслідки"
    title = models.CharField(max_length=200, verbose_name="Заголовок періоду")

    # На скріншоті: "Період післявоєнної нестабільності..."
    short_description = models.TextField(verbose_name="Короткий опис")

    # Це поле для кнопки "Читати детальніше..." (повний текст статті)
    detail = models.TextField(verbose_name="Повний текст статті", blank=True)

class HistoricalPeriod(models.Model):
    """
    Модель для кожного блоку історії (Ера Варгаса, Військовий режим тощо)
    """
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name="periods", verbose_name="Країна")

    description = models.ForeignKey(HistoricalPeriodEvents, on_delete=models.CASCADE, blank=True, null=True)



    def __str__(self):
        return str(self.country)

    class Meta:
        verbose_name = "Історичний період"
        verbose_name_plural = "Історичні періоди"


class HistoricalSupplement(models.Model):  # Виправлено назву (було Historical_supplements)
    title = models.CharField(max_length=100, verbose_name="Заголовок події ")  # Правління Фульхенсіо Батісти
    description = models.CharField(max_length=500,
                                   verbose_name="Опис події")  # Батіста прийшов до влади в результаті військового перевороту 1952 року...

    def __str__(self):
        return self.title


class HistoricalPeriodDetail(models.Model):  # Виправлено назву (було HistoricalPeriod_dateil)
    # Це дозволяє в адмінці "Історичного періоду" додавати ці деталі прямо всередині.
    period = models.ForeignKey(HistoricalPeriod, on_delete=models.CASCADE, related_name="period_details",
                               verbose_name="Період")  # Куба: Дореволюційний період (1959)

    description = models.CharField(max_length=1000,
                                   verbose_name="Опис")  # Період між кінцем Другої світової війни та перемогою Революції 1959 року був відзначений ...
    quote = models.CharField(max_length=100,
                             verbose_name='Цитати')  # Фульхенсіо Батіста, диктатор, чий режим був повалений революцією.
    historical_title = models.CharField(max_length=100, verbose_name="Заголовок")  # Правління Фульхенсіо Батісти

    # Тут залишаємо ManyToMany, бо одна деталь може посилатися на багато подій зі списку.
    # Але тепер це буде працювати коректно.
    historical_context = models.ManyToManyField(
        HistoricalSupplement,
        verbose_name="Перелік подій",
        blank=True,
        related_name="details"
    )

    source = models.CharField(max_length=100, verbose_name="Джерело інформації")


class Question(models.Model):
    # Додав це поле, щоб Питання можна було створювати всередині "Історичного періоду" (якщо потрібно)
    period = models.ForeignKey(HistoricalPeriod, on_delete=models.CASCADE, related_name='questions', null=True,
                               blank=True, verbose_name="Період")
    text = models.CharField(max_length=255)

    # Тут більше нічого не треба. Питання не знає про відповіді напряму в базі даних.

    def __str__(self):
        return self.text


class Answer(models.Model):
    # ВИПРАВЛЕНО: ManyToMany змінено на ForeignKey.
    # Це дозволяє додавати варіанти відповідей прямо на сторінці створення Питання.
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='answers'
    )

    # ТЕКСТ ВАРІАНТУ:
    text = models.CharField(max_length=255)

    # ПРАВИЛЬНІСТЬ:
    is_correct = models.BooleanField(default=False, verbose_name="Це правильна відповідь?")

class User(models.Model):
    username = models.CharField(default="Unnamed")
    score = models.IntegerField(default=0)
