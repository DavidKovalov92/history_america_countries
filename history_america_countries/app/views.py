import json
import random

from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import ListView, CreateView
from app.models import User, Question
# Create your views here.


class LeaderBoardCreate(CreateView):
    template_name = "frontend/user.html"
    model = User
    fields = ['username']
    success_url = reverse_lazy('quiz')
    def form_valid(self, form):
        response = super().form_valid(form)
        self.request.session['current_user_id'] = self.object.id
        return response


class Questions(ListView):
    template_name = 'frontend/questions.html'
    model = Question

    def get(self, request, *args, **kwargs):
        if 'current_user_id' not in request.session:
            return redirect(reverse_lazy('login'))
        return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # 1. Перетворюємо QuerySet (базу даних) у звичайний список Python
        all_questions = list(self.object_list)

        # 2. ПЕРЕМІШУЄМО ПОРЯДОК ПИТАНЬ
        # Кожен раз при оновленні сторінки цей порядок буде випадковим
        random.shuffle(all_questions)

        questions_data = []

        for q in all_questions:
            # Отримуємо відповіді до поточного питання
            answers = list(q.answers.all())

            # 3. ПЕРЕМІШУЄМО ВАРІАНТИ ВІДПОВІДЕЙ
            # Наприклад, було [А, Б, В, Г], стало [В, А, Г, Б]
            random.shuffle(answers)

            options = []
            correct_index = 0

            # Проходимося по вже перемішаних відповідях
            for i, ans in enumerate(answers):
                options.append(ans.text)
                # 4. Шукаємо, де тепер опинилася правильна відповідь
                if ans.is_correct:
                    correct_index = i

            # Додаємо тільки якщо є варіанти (захист від пустих питань)
            if options:
                questions_data.append({
                    "question": q.text,
                    "options": options,
                    "correct": correct_index
                })

        context['questions_json'] = json.dumps(questions_data)
        return context

@csrf_exempt
def save_score(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        score = data.get('score')
        user_id = request.session.get('current_user_id')

        if user_id:
            user = User.objects.get(id=user_id)
            user.score = score  # Оновлюємо бали
            user.save()
            return JsonResponse({'status': 'ok'})
    return JsonResponse({'status': 'error'}, status=400)


class LeaderBoardList(ListView):
    template_name = "frontend/leader_board.html"
    model = User
    ordering = ("-score", )


