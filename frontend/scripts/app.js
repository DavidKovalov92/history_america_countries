// scripts/app.js

// --- ГЛОБАЛЬНІ ЗМІННІ ---
let currentQuizData = null;
let userName = '';

// --- ФУНКЦІЇ LOCAL STORAGE ---

function loadLeaderboard() {
    const stored = localStorage.getItem('leaderboard');
    return stored ? JSON.parse(stored) : [];
}

function saveLeaderboard(board) {
    localStorage.setItem('leaderboard', JSON.stringify(board));
}

function loadCounters() {
    const storedCounters = localStorage.getItem('eventCounters');
    return storedCounters ? JSON.parse(storedCounters) : {};
}

function saveCounters(counters) {
    localStorage.setItem('eventCounters', JSON.stringify(counters));
}

function loadUserVotes() {
    const storedVotes = localStorage.getItem('userVotes');
    return storedVotes ? JSON.parse(storedVotes) : {};
}

function saveUserVotes(votes) {
    localStorage.setItem('userVotes', JSON.stringify(votes));
}

let counters = loadCounters();
let userVotes = loadUserVotes();

// ====================================
// ЛОГІКА КВІЗУ
// (showSection та функції навігації видалені, щоб уникнути конфлікту)
// ====================================

function renderQuiz(country) {
    if (typeof quizData === 'undefined') {
        console.error("Помилка: quizData не визначено. Перевірте підключення quiz_data.js");
        return;
    }
    
    currentQuizData = quizData[country]; 
    const quizQuestionsDiv = document.getElementById('quiz-questions');
    const quizTitle = document.getElementById('quiz-title');
    
    quizTitle.textContent = `Квіз: ${country === 'brazil' ? 'Бразилія 🇧🇷' : 'Куба 🇨🇺'}`;
    quizQuestionsDiv.innerHTML = '';

    currentQuizData.forEach((item, index) => {
        const qElement = document.createElement('div');
        qElement.classList.add('question-block');
        qElement.innerHTML = `
            <h4>${item.question}</h4>
            <div class="options-group" data-question-index="${index}">
                ${item.options.map(option => `
                    <label>
                        <input type="radio" name="q${index}" value="${option}">
                        ${option}
                    </label>
                `).join('<br>')}
            </div>
        `;
        quizQuestionsDiv.appendChild(qElement);
    });

    document.getElementById('submit-quiz').style.display = 'block';
}

function calculateScore() {
    if (!currentQuizData) return;
    let score = 0;
    
    currentQuizData.forEach((item, index) => {
        const selector = `input[name="q${index}"]:checked`;
        const selectedInput = document.querySelector(selector);
        
        if (selectedInput && selectedInput.value === item.answer) {
            score++;
        }
    });

    const finalScore = {
        name: userName,
        country: currentQuizData === quizData.brazil ? 'Бразилія' : 'Куба',
        score: score,
        total: currentQuizData.length,
        date: new Date().toLocaleDateString('uk-UA'),
        percentage: (score / currentQuizData.length) * 100
    };

    alert(`Тест завершено! ${finalScore.name}, Ваш результат: ${finalScore.score} з ${finalScore.total} (${finalScore.percentage.toFixed(0)}%)`);

    const leaderboard = loadLeaderboard();
    leaderboard.push(finalScore);
    
    leaderboard.sort((a, b) => b.percentage - a.percentage || b.score - a.score);
    
    saveLeaderboard(leaderboard);
    renderLeaderboard();
    // showSection('leaderboard'); // ВИДАЛЕНО
}

// ====================================
// ТАБЛИЦЯ ЛІДЕРІВ
// ====================================

function renderLeaderboard() {
    const leaderboard = loadLeaderboard();
    const tbody = document.querySelector('#leaderboard-table tbody');
    if (!tbody) return; 

    tbody.innerHTML = '';

    leaderboard.forEach((record, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${record.name}</td>
            <td>${record.country === 'Бразилія' ? '🇧🇷' : '🇨🇺'} ${record.country}</td>
            <td>${record.score} / ${record.total} (${record.percentage.toFixed(0)}%)</td>
            <td>${record.date}</td>
        `;
        if (index === 0) {
            row.style.fontWeight = 'bold';
            row.style.backgroundColor = '#fffacd';
        }
    });
}

// ====================================
// ФУНКЦІОНАЛ ЛАЙКІВ/ДИЗЛАЙКІВ
// (Залишено, оскільки він не конфліктує з відображенням)
// ====================================

function updateDisplay(eventId, counters) {
    const likes = document.getElementById(eventId + '-likes');
    const dislikes = document.getElementById(eventId + '-dislikes');
    
    if (likes) likes.textContent = counters[eventId].likes;
    if (dislikes) dislikes.textContent = counters[eventId].dislikes;
}

function updateButtonState(eventId, widget, userVotes) {
    const likeBtn = widget.querySelector('[data-action="like"]');
    const dislikeBtn = widget.querySelector('[data-action="dislike"]');
    
    if (!likeBtn || !dislikeBtn) return;

    likeBtn.classList.remove('voted');
    dislikeBtn.classList.remove('voted');
    likeBtn.disabled = false;
    dislikeBtn.disabled = false;

    if (userVotes[eventId]) {
        const currentVote = userVotes[eventId];
        const votedButton = widget.querySelector(`[data-action="${currentVote}"]`);
        const oppositeButton = widget.querySelector(`[data-action="${currentVote === 'like' ? 'dislike' : 'like'}"]`);
        
        if (votedButton && oppositeButton) {
            votedButton.classList.add('voted');
            oppositeButton.disabled = true;
        }
    }
}

function initializeFeedbackWidgets() {
    let counters = loadCounters();
    let userVotes = loadUserVotes();

    document.querySelectorAll('.feedback-widget').forEach(widget => {
        const eventId = widget.getAttribute('data-event-id');
        
        if (!counters[eventId]) {
            counters[eventId] = { likes: 0, dislikes: 0 };
            saveCounters(counters);
        }

        updateDisplay(eventId, counters);
        updateButtonState(eventId, widget, userVotes);

        widget.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', function() {
                
                const action = this.getAttribute('data-action');
                const oppositeAction = action === 'like' ? 'dislike' : 'like';
                const currentVote = userVotes[eventId];

                if (currentVote === action) {
                    counters[eventId][action + 's']--;
                    userVotes[eventId] = null;
                } 
                else if (currentVote === oppositeAction) {
                    counters[eventId][oppositeAction + 's']--;
                    counters[eventId][action + 's']++;
                    userVotes[eventId] = action;
                } 
                else {
                    counters[eventId][action + 's']++;
                    userVotes[eventId] = action;
                }

                saveCounters(counters);
                saveUserVotes(userVotes);
                
                updateDisplay(eventId, counters);
                updateButtonState(eventId, widget, userVotes);
            });
        });
    });
}


// ====================================
// ІНІЦІАЛІЗАЦІЯ (DOM READY)
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. КАРТА
    const mapElement = document.getElementById('interactive-map');
    if (mapElement) {
        var map = L.map('interactive-map').setView([-10, -60], 3); 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // МАРКЕРИ
        L.marker([-15.7797, -47.9297]).addTo(map).bindPopup('<strong>1. Бразиліа</strong>');
        L.marker([23.1136, -82.3666]).addTo(map).bindPopup('<strong>3. Гавана</strong>');
        L.marker([-22.9068, -43.1729]).addTo(map).bindPopup('<strong>2. Ріо-де-Жанейро</strong>');
        L.marker([22.36, -81.16]).addTo(map).bindPopup('<strong>4. Затока Свиней</strong>');
        L.marker([20.0083, -75.8267]).addTo(map).bindPopup('<strong>5. Сантьяго-де-Куба</strong>');
        L.marker([-23.5505, -46.6333]).addTo(map).bindPopup('<strong>6. Сан-Паулу</strong>');
    }
    
    // 2. ІНІЦІАЛІЗАЦІЯ ЛАЙКІВ
    initializeFeedbackWidgets();
    
    // 3. ОБРОБНИКИ НАВІГАЦІЇ КВІЗУ (залишаємо, але вони не приховують контент)
    
    // Кнопка 'Квіз' у хедері
    document.getElementById('show-quiz-btn').addEventListener('click', (e) => {
        e.preventDefault();
        // showSection('quiz-start-screen'); // ВИДАЛЕНО
    });
    
    // Кнопка 'Назад до контенту' (з екрану реєстрації)
    document.getElementById('show-main-content-btn').addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo(0, 0); 
    });
    
    // Кнопка 'Розпочати Квіз'
    document.querySelectorAll('.start-quiz-btn').forEach(button => {
        button.addEventListener('click', () => {
            // ... (тут логіка квізу залишиться, але не буде приховувати секції)
        });
    });

    // ... (інші обробники) ...
    
    // ПОЧАТКОВА АКТИВАЦІЯ: ВИДАЛЕНО, тому що контент вже має бути видимим.
});