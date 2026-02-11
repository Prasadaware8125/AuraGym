'use strict';

/**
 * AURA GYM MEMBER DASHBOARD
 * Frontend controller for the logged-in member.
 * - Uses workouts + meals injected from the server (window.MEMBER_BOOTSTRAP)
 * - Handles theme, navigation, modals, and charts
 * - Renders dynamic stats based on the member's own data
 */

// Single in-memory state object for the whole dashboard
const APP = {
    user: {}, // currently only used by profile form; name/email in UI come from EJS currentUser
    workouts: (window.MEMBER_BOOTSTRAP && window.MEMBER_BOOTSTRAP.workouts) || [],
    meals: (window.MEMBER_BOOTSTRAP && window.MEMBER_BOOTSTRAP.meals) || [],
    weightHistory: [180, 178, 177, 176, 175, 174, 173] // demo weight trend for chart
};

// Main entrypoint when the member dashboard has loaded
document.addEventListener('DOMContentLoaded', () => {
    initTheme();      // Dark / light theme toggle
    loadData();       // Initialize UI with server-provided data
    initNavigation(); // Sidebar navigation logic
    initModals();     // Open/close workout + meal modals
    initForms();      // Hook up workout and profile forms
    renderAll();      // Initial render of tables/cards
    initAnimations(); // Scroll-based animations and charts
});

/* =========================================
   THEME LOGIC
   ========================================= */
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check localStorage. Default to 'dark' if not set.
    const savedTheme = localStorage.getItem('aura_theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && true); 

    if (isDark) {
        body.classList.add('dark');
        if(toggle) toggle.checked = true;
    } else {
        body.classList.remove('dark');
        if(toggle) toggle.checked = false;
    }

    if (toggle) {
        toggle.addEventListener('change', () => {
            if (toggle.checked) {
                body.classList.add('dark');
                localStorage.setItem('aura_theme', 'dark');
            } else {
                body.classList.remove('dark');
                localStorage.setItem('aura_theme', 'light');
            }
        });
    }
}

/* =========================================
   DATA HELPERS (server-synced)
   ========================================= */
function loadData() {
    // Initial data is already in APP via window.MEMBER_BOOTSTRAP
    renderAll();
}

function saveData() {
    // Left for compatibility; server is source of truth now.
    // When APP is updated from responses, just re-render.
    renderAll();
}

/* =========================================
   ANIMATIONS
   ========================================= */
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                if (entry.target.id === 'progress') {
                    animateCounters();
                    drawWeightChart(true);
                }
                if (entry.target.id === 'nutrition') {
                    animateNutritionRing();
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal, .view-section').forEach(el => observer.observe(el));
    
    window.triggerSectionAnimations = (id) => {
        if(id === 'progress') { animateCounters(); drawWeightChart(true); }
        if(id === 'nutrition') { animateNutritionRing(); }
    }
}

function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 1500; 
        const increment = target / (duration / 16); 
        let current = 0;
        const updateCount = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}

function animateNutritionRing() {
    const circle = document.getElementById('cal-ring');
    if (!circle) return;
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    const totalCals = APP.meals.reduce((sum, m) => sum + parseInt(m.calories), 0);
    const target = 2500;
    const percent = Math.min(totalCals / target, 1);
    const offset = circumference - (percent * circumference);
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;
    circle.getBoundingClientRect(); // reflow
    circle.style.strokeDashoffset = offset;
}

/* =========================================
   RENDERING
   ========================================= */
function renderAll() {
    // document.querySelectorAll('.user-name').forEach(el => el.textContent = APP.user.name);
    
    const mealsList = document.getElementById('meals-list');
    if (mealsList) {
        mealsList.innerHTML = '';
        let totalCals = 0;
        APP.meals.forEach(m => {
            totalCals += parseInt(m.calories);
            const div = document.createElement('div');
            div.className = 'meal-card';
            div.innerHTML = `<h4>${m.name}</h4><p>${m.calories} kcal</p><button class="btn-sm btn-danger" data-meal-id="${m._id || ''}"><i class="fa-solid fa-trash"></i></button>`;
            mealsList.appendChild(div);
        });
        const nutriEl = document.getElementById('nutri-total-cals');
        if (nutriEl) nutriEl.textContent = totalCals;
    }
    
    const tbody = document.querySelector('#workouts-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        APP.workouts.forEach((w) => {
            const dateStr = w.date ? new Date(w.date).toLocaleDateString() : '';
            tbody.innerHTML += `<tr>
                <td>${dateStr}</td>
                <td>${w.title}</td>
                <td>${w.type}</td>
                <td>${w.duration}m</td>
                <td>${w.calories}</td>
                <td><button class="btn-sm btn-danger" onclick="deleteWorkout('${w._id || ''}')"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        });
    }
    
    const burnEl = document.getElementById('stat-cals-burned');
    const workEl = document.getElementById('stat-workouts');
    if (burnEl) burnEl.textContent = APP.workouts.reduce((s, w) => s + parseInt(w.calories), 0);
    if (workEl) workEl.textContent = APP.workouts.length;
}

/* =========================================
   CHARTING
   ========================================= */
function drawWeightChart(animate = false) {
    const canvas = document.getElementById('weightHistoryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 300;
    const w = canvas.width;
    const h = canvas.height;
    const pad = 40;
    const data = APP.weightHistory;
    const maxVal = Math.max(...data) + 5;
    const minVal = Math.min(...data) - 5;
    
    const getX = (i) => pad + (i * (w - pad * 2) / (data.length - 1));
    const getY = (val) => h - pad - ((val - minVal) / (maxVal - minVal)) * (h - pad * 2);

    let progress = 0;
    const speed = animate ? 0.02 : 1;

    function draw() {
        ctx.clearRect(0, 0, w, h);
        
        // Dynamic Grid Color based on Theme
        const isDark = document.body.classList.contains('dark');
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<5; i++) {
            const y = pad + (i * (h - pad * 2) / 4);
            ctx.moveTo(pad, y); ctx.lineTo(w-pad, y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#00f2ff';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        const pointsToDraw = data.length * progress;
        for (let i = 0; i < pointsToDraw; i++) {
            const x = getX(i);
            const y = getY(data[i]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        if (progress > 0.1) {
            ctx.lineTo(getX(Math.min(Math.floor(pointsToDraw), data.length-1)), h - pad);
            ctx.lineTo(pad, h - pad);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, 'rgba(0, 242, 255, 0.2)');
            grad.addColorStop(1, 'rgba(0, 242, 255, 0)');
            ctx.fillStyle = grad;
            ctx.fill();
        }

        if (progress < 1 && animate) {
            progress += speed;
            requestAnimationFrame(draw);
        }
    }
    draw();
}

function drawWeeklyChart() {
    const canvas = document.getElementById('weeklyActivityChart');
    if (!canvas) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    const data = [30, 45, 0, 60, 45, 90, 0];
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const barWidth = (w - 60) / 7;
    const maxVal = 100;
    
    data.forEach((val, i) => {
        const barH = (val / maxVal) * (h - 40);
        const x = 30 + i * barWidth;
        const y = h - 20 - barH;
        
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(x + 10, y, barWidth - 20, barH);
        
        ctx.fillStyle = document.body.classList.contains('dark') ? '#a0aec0' : '#8f9bba';
        ctx.font = '12px Inter';
        ctx.fillText(days[i], x + (barWidth/2) - 4, h - 5);
    });
}

/* =========================================
   NAVIGATION & UTILS
   ========================================= */
function initNavigation() {
    const sections = document.querySelectorAll('.view-section');
    const links = document.querySelectorAll('.nav-link');
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebar-toggle');

    if (toggle) toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            if (sidebar) sidebar.classList.remove('open');
            if (window.triggerSectionAnimations) window.triggerSectionAnimations(targetId);
        });
    });
}

function initModals() {
    const modals = document.querySelectorAll('.modal');
    document.getElementById('open-workout-modal')?.addEventListener('click', () => document.getElementById('modal-workout').classList.add('active'));
    document.getElementById('open-meal-modal')?.addEventListener('click', () => document.getElementById('modal-meal').classList.add('active'));
    document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', () => modals.forEach(m => m.classList.remove('active'))));
    window.addEventListener('click', (e) => { modals.forEach(m => { if (e.target === m) m.classList.remove('active'); }); });
}

function initForms() {
    document.getElementById('form-workout')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('w-title').value,
            type: document.getElementById('w-type').value,
            duration: document.getElementById('w-duration').value,
            calories: document.getElementById('w-calories').value
        };
        fetch('/member/workouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.workouts) {
                APP.workouts = data.workouts;
                renderAll();
            }
            document.getElementById('modal-workout').classList.remove('active');
        });
    });
    
    // Profile Form Logic (still local-only for now)
    const pForm = document.getElementById('profile-form');
    if (pForm) {
        pForm.addEventListener('submit', (e) => {
            e.preventDefault();
            APP.user.name = document.getElementById('edit-name').value;
            APP.user.email = document.getElementById('edit-email').value;
            saveData();
            alert('Profile updated successfully!');
        });
    }
}

window.deleteWorkout = (id) => {
    if (!id) return;
    if (confirm('Delete this workout?')) {
        fetch(`/member/workouts/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.workouts) {
                    APP.workouts = data.workouts;
                    renderAll();
                }
            });
    }
};

document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('[data-meal-id]')) {
        const btn = e.target.closest('[data-meal-id]');
        const id = btn.getAttribute('data-meal-id');
        if (id && confirm('Delete this meal?')) {
            fetch(`/member/meals/${id}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(data => {
                    if (data.meals) {
                        APP.meals = data.meals;
                        renderAll();
                    }
                });
        }
    }
});