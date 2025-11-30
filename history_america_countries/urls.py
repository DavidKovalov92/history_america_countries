from django.contrib import admin
from django.urls import path
from app.views import IndexView, PeriodDetailView, LeaderBoardCreate, LeaderBoardList, Questions, save_score

urlpatterns = [
    path('admin/', admin.site.urls),

    # Головна сторінка
    path('', IndexView.as_view(), name='index'),

    # Детальна сторінка
    # <int:period_id> має співпадати з pk_url_kwarg у views.py
    path('period/<int:period_id>/', PeriodDetailView.as_view(), name='period_detail'),

    path('questions/user/', LeaderBoardCreate.as_view(), name='login'),
    path('questions/', Questions.as_view(), name='quiz'),
    path('questions/leaderboard/', LeaderBoardList.as_view(), name='leaderboard'),

    path('save_score/', save_score, name='save_score'),
]
