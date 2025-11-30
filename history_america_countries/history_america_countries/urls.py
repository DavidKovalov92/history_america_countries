from django.contrib import admin
from django.urls import path
from app.views import LeaderBoardCreate, LeaderBoardList, Questions, save_score

urlpatterns = [
    path('admin/', admin.site.urls),
    path('questions/user/', LeaderBoardCreate.as_view(), name='login'),
    path('questions/', Questions.as_view(), name='quiz'),
    path('questions/leaderboard/', LeaderBoardList.as_view(), name='leaderboard'),

    path('save_score/', save_score, name='save_score'),
]