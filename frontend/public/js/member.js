'use strict';

/**
 * AURA GYM MEMBER DASHBOARD LOGIC
 * Features: SPA Nav, CRUD for Workouts/Meals, Charts, Stats Calc
 */

// =========================================
// 1. STATE & MOCK DATA
// =========================================
const APP = {
    user: {
        name: 'Alex Johnson',
        email: 'alex.j@auragym.com',
        joined: '2023-11-15'
    },
    workouts: [
        { id: 1, date: '2023-10-25', title: 'Upper Body Power', type: 'Strength', duration: 60, calories: 450 },
        { id: 2, date: '2023-10-24', title: 'HIIT Cardio', type: 'Cardio', duration: 45, calories: 500 },
        { id: 3, date: '2023-10-22', title: 'Leg Day', type: 'Strength', duration: 70, calories: 600 }
    ],
    meals: [
        { id: 1, name: 'Oatmeal & Berries', calories: 350 },
        { id: 2, name: 'Grilled Chicken Salad', calories: 450 },
        { id: 3, name: 'Protein Shake', calories: 180 }
    ],
    weightHistory: [180, 178, 177, 176, 175, 174, 173] // Last 7 weeks
};

// =========================================
// 2. INITIALIZATION
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadData();
    initNavigation();
    initModals();
    initForms();
    renderAll();
});

function checkAuth() {
    // Simulated check. In real app, check token.
    const loggedIn = localStorage.getItem('aura_member_logged_in');
    if (!loggedIn) {
        // For demo purposes, we automatically "log in" if not set,
        // so the dashboard is viewable immediately.
        localStorage.setItem('aura_member_logged_in', 'true');
    }
}

function loadData() {
    // Check LocalStorage for updated data, otherwise use Mock
    const storedWorkouts = localStorage.getItem('aura_workouts');
    const storedMeals = localStorage.getItem('aura_meals');
    const storedUser = localStorage.getItem('aura_user_info');

    if (storedWorkouts) APP.workouts = JSON.parse(storedWorkouts);
    if (storedMeals) APP.meals = JSON.parse(storedMeals);
    if (storedUser) APP.user = JSON.parse(storedUser);
}

function saveData() {
    localStorage.setItem('aura_workouts', JSON.stringify(APP.workouts));
    localStorage.setItem('aura_meals', JSON.stringify(APP.meals));
    localStorage.setItem('aura_user_info', JSON.stringify(APP.user));
    renderAll();
}

// =========================================
// 3. RENDERING LOGIC
// =========================================
function renderAll() {
    renderHeader();
    renderStats();
    renderRecentLogs();
    renderWorkoutsTable();
    renderNutrition();
    renderProfile();
    drawWeeklyChart();
    drawWeightChart();
}

function renderHeader() {
    document.querySelector('.user-name').textContent = APP.user.name;
    document.getElementById('welcome-msg').textContent = `Welcome back, ${APP.user.name.split(' ')[0]}!`;
    document.getElementById('profile-name').textContent = APP.user.name;
    document.getElementById('profile-email').textContent = APP.user.email;
    
    // Date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', options);
}

function renderStats() {
    // Calculate Stats
    const totalCalsBurned = APP.workouts.reduce((sum, w) => sum + parseInt(w.calories), 0);
    const totalCalsConsumed = APP.meals.reduce((sum, m) => sum + parseInt(m.calories), 0);
    
    document.getElementById('stat-cals-burned').textContent = totalCalsBurned;
    document.getElementById('stat-cals-consumed').textContent = totalCalsConsumed;
    document.getElementById('stat-workouts').textContent = APP.workouts.length;
}

function renderRecentLogs() {
    const list = document.getElementById('recent-logs-list');
    list.innerHTML = '';
    
    // Combine logs
    const logs = [
        ...APP.workouts.map(w => ({ type: 'workout', text: `Workout: ${w.title}`, val: `-${w.calories} kcal` })),
        ...APP.meals.map(m => ({ type: 'meal', text: `Meal: ${m.name}`, val: `+${m.calories} kcal` }))
    ];

    // Show last 5
    logs.slice(-5).reverse().forEach(log => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        li.innerHTML = `
            <span>${log.text}</span>
            <span style="color: ${log.type === 'workout' ? 'var(--secondary)' : 'var(--primary)'}">${log.val}</span>
        `;
        list.appendChild(li);
    });
}

function renderWorkoutsTable() {
    const tbody = document.querySelector('#workouts-table tbody');
    tbody.innerHTML = '';

    APP.workouts.forEach((w, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${w.date}</td>
            <td>${w.title}</td>
            <td>${w.type}</td>
            <td>${w.duration} min</td>
            <td>${w.calories}</td>
            <td>
                <button class="btn-sm btn-danger" onclick="deleteWorkout(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderNutrition() {
    const list = document.getElementById('meals-list');
    list.innerHTML = '';
    let totalCals = 0;

    APP.meals.forEach(m => {
        totalCals += parseInt(m.calories);
        const div = document.createElement('div');
        div.className = 'meal-card';
        div.innerHTML = `
            <h4>${m.name}</h4>
            <p>${m.calories} kcal</p>
        `;
        list.appendChild(div);
    });

    document.getElementById('nutri-total-cals').textContent = totalCals;
    const percent = Math.min((totalCals / 2500) * 100, 100);
    document.getElementById('cal-progress').style.width = `${percent}%`;
}

function renderProfile() {
    document.getElementById('edit-name').value = APP.user.name;
    document.getElementById('edit-email').value = APP.user.email;
}

// =========================================
// 4. CHARTING (Pure JS Canvas)
// =========================================
function drawWeeklyChart() {
    const canvas = document.getElementById('weeklyActivityChart');
    if (!canvas) return;
    
    // Parent Width
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 250;
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    // Clear
    ctx.clearRect(0, 0, w, h);
    
    // Mock Data (Activity Minutes)
    const data = [30, 45, 0, 60, 45, 90, 0];
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const barWidth = (w - 60) / 7;
    const maxVal = 100;
    
    data.forEach((val, i) => {
        const barH = (val / maxVal) * (h - 40);
        const x = 30 + i * barWidth;
        const y = h - 20 - barH;
        
        // Bar
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(x + 10, y, barWidth - 20, barH);
        
        // Label
        ctx.fillStyle = '#a0aec0';
        ctx.font = '12px Inter';
        ctx.fillText(days[i], x + (barWidth/2) - 4, h - 5);
    });
}

function drawWeightChart() {
    const canvas = document.getElementById('weightHistoryChart');
    if (!canvas) return;

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    
    const data = APP.weightHistory;
    const w = canvas.width;
    const h = canvas.height;
    const pad = 40;
    
    ctx.clearRect(0, 0, w, h);
    
    // Grid Lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.moveTo(pad, h-pad);
    ctx.lineTo(w, h-pad);
    ctx.stroke();

    // Line
    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const xStep = (w - pad) / (data.length - 1);
    const minW = Math.min(...data) - 5;
    const maxW = Math.max(...data) + 5;
    
    data.forEach((weight, i) => {
        const x = pad + i * xStep;
        const y = h - pad - ((weight - minW) / (maxW - minW)) * (h - pad * 2);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        // Dot
        // ctx.fillStyle = '#00f2ff';
        // ctx.fillRect(x-3, y-3, 6, 6);
    });
    ctx.stroke();
}

// =========================================
// 5. NAVIGATION & UI EVENTS
// =========================================
function initNavigation() {
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.view-section');
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    const titleEl = document.getElementById('current-page-title');

    // Sidebar Toggle (Mobile)
    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Nav Click
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            
            // Update Active State
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show Section
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            
            // Update Header Title
            titleEl.textContent = link.querySelector('span').textContent;
            
            // Close sidebar on mobile
            sidebar.classList.remove('open');
        });
    });
}

// =========================================
// 6. MODALS & FORMS
// =========================================
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const openers = [
        { btn: 'open-workout-modal', modal: 'modal-workout' },
        { btn: 'open-meal-modal', modal: 'modal-meal' }
    ];

    openers.forEach(obj => {
        document.getElementById(obj.btn).addEventListener('click', () => {
            document.getElementById(obj.modal).classList.add('active');
        });
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById(btn.getAttribute('data-modal')).classList.remove('active');
        });
    });
    
    // Close on outside click
    window.addEventListener('click', (e) => {
        modals.forEach(m => {
            if (e.target === m) m.classList.remove('active');
        });
    });
}

function initForms() {
    // Workout Form
    document.getElementById('form-workout').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('w-title').value;
        const type = document.getElementById('w-type').value;
        const dur = document.getElementById('w-duration').value;
        const cals = document.getElementById('w-calories').value;

        const newWorkout = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            title, type, duration: dur, calories: cals
        };

        APP.workouts.unshift(newWorkout);
        saveData();
        document.getElementById('modal-workout').classList.remove('active');
        e.target.reset();
    });

    // Meal Form
    document.getElementById('form-meal').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('m-name').value;
        const cals = document.getElementById('m-calories').value;

        APP.meals.push({ id: Date.now(), name, calories: cals });
        saveData();
        document.getElementById('modal-meal').classList.remove('active');
        e.target.reset();
    });

    // Profile Form
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        APP.user.name = document.getElementById('edit-name').value;
        APP.user.email = document.getElementById('edit-email').value;
        saveData();
        alert('Profile updated successfully!');
    });
}

// Global functions for inline HTML events
window.deleteWorkout = (index) => {
    if(confirm('Delete this workout?')) {
        APP.workouts.splice(index, 1);
        saveData();
    }
};