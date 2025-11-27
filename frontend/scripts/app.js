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
// ЛОГІКА КВІЗУ та ЛІДЕРБОРДУ (ЗАЛИШАЄМО ТІЛЬКИ ДАНІ)
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

// ... (renderQuiz, calculateScore, showSection — ВИДАЛЕНО, щоб не було помилок) ...

// ====================================
// ФУНКЦІОНАЛ ЛАЙКІВ/ДИЗЛАЙКІВ
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

function initializeReadMore() {
    document.querySelectorAll('.read-more-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); 
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            const buttonText = this.querySelector('strong');
            
            if (targetElement.style.display === 'block') {
                targetElement.style.display = 'none';
                buttonText.textContent = 'Читати детальніше...';
            } else {
                targetElement.style.display = 'block';
                buttonText.textContent = 'Сховати деталі';
            }
        });
    });
}


// ====================================
// ІНІЦІАЛІЗАЦІЯ (DOM READY)
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. КАРТА (Ініціалізація карти)
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
    
    // 2. ІНІЦІАЛІЗАЦІЯ ФУНКЦІОНАЛУ
    initializeFeedbackWidgets();
    initializeReadMore(); 
    renderLeaderboard(); // Відображаємо лідерборд, якщо він є в DOM
    
    // 3. ОБРОБНИКИ НАВІГАЦІЇ КВІЗУ (Залишаємо тільки необхідне)
    
    // Кнопка 'Квіз' у хедері: Показуємо екран реєстрації та приховуємо main-content
    document.getElementById('show-quiz-btn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('main-content').style.display = 'none';
        showSection('quiz-start-screen');
    });
    
    // Кнопка 'Назад до контенту' (з екрану квізу): Повертаємо на головний контент
    document.getElementById('show-main-content-btn').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('main-content');
        window.scrollTo(0, 0); 
    });
    
    // Кнопка 'Розпочати Квіз'
    document.querySelectorAll('.start-quiz-btn').forEach(button => {
        button.addEventListener('click', () => {
            const nameInput = document.getElementById('user-name');
            userName = nameInput.value.trim();
            const errorDiv = document.getElementById('name-error');

            if (userName.length < 3) {
                errorDiv.style.display = 'block';
                nameInput.focus();
                return;
            }
            errorDiv.style.display = 'none';

            const country = button.getAttribute('data-country');
            
            showSection('quiz-container');
            renderQuiz(country);
        });
    });

    // Кнопка 'Завершити Квіз'
    document.getElementById('submit-quiz').addEventListener('click', calculateScore);
    
    // Кнопка 'Скасувати та вийти' (з екрана квізу)
    document.getElementById('cancel-quiz-btn').addEventListener('click', () => {
        showSection('quiz-start-screen');
    });
    
    // Кнопка 'Назад' з лідерборду
    document.getElementById('leaderboard-back-btn').addEventListener('click', () => {
        showSection('quiz-start-screen');
    });
    
    // ІНІЦІАЛІЗАЦІЯ ГОЛОВНОГО ЕКРАНА: Показуємо основний контент
    // (Це важлива дія, але оскільки в HTML є style="display: block;", вона тут не потрібна для відображення, а лише для логіки)
    // showSection('main-content'); // Видалено, щоб не конфліктувати з початковим display: block
});