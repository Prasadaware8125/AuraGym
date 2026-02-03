'use strict';

/**
 * AURA GYM ADMIN DASHBOARD LOGIC
 * Features: SPA Navigation, Data Visualization (Canvas), Member Management
 */

// =========================================
// 1. STATE & MOCK DATA
// =========================================
const ADMIN_STATE = {
    members: [
        { id: 101, name: 'Alex Johnson', email: 'alex@example.com', plan: 'Pro', status: 'Active', joined: '2023-01-15' },
        { id: 102, name: 'Sarah Connor', email: 'sarah@example.com', plan: 'Elite', status: 'Active', joined: '2023-02-20' },
        { id: 103, name: 'Mike Ross', email: 'mike@example.com', plan: 'Free', status: 'Inactive', joined: '2022-11-05' },
        { id: 104, name: 'Jessica Pearson', email: 'jessica@pearson.com', plan: 'Elite', status: 'Active', joined: '2023-03-10' },
        { id: 105, name: 'Harvey Specter', email: 'harvey@specter.com', plan: 'Pro', status: 'Active', joined: '2023-01-22' },
    ],
    stats: {
        totalMembers: 1245,
        totalWorkouts: 8932,
        activeSubs: 982
    },
    currentUser: null
};

// =========================================
// 2. INITIALIZATION
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    initNavigation();
    initMembersTable();
    initCharts();
    initModals();
    updateOverviewStats();
});

function checkAdminAuth() {
    // Simple session check simulation
    if (!localStorage.getItem('aura_admin_session')) {
        localStorage.setItem('aura_admin_session', 'true');
    }
}

// =========================================
// 3. NAVIGATION & UI
// =========================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.view-section');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const titleEl = document.getElementById('current-page-title');

    // Section Switching
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            // Update Nav State
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update Section Visibility
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Update Header Title
            titleEl.textContent = link.querySelector('span').textContent;

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Mobile Sidebar Toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        if(confirm('Logout of Admin Dashboard?')) {
            localStorage.removeItem('aura_admin_session');
            window.location.href = 'index.html'; // Redirect to landing page (simulation)
        }
    });
}

function updateOverviewStats() {
    document.getElementById('total-members').textContent = ADMIN_STATE.stats.totalMembers.toLocaleString();
    document.getElementById('total-workouts').textContent = ADMIN_STATE.stats.totalWorkouts.toLocaleString();
    document.getElementById('active-subs').textContent = ADMIN_STATE.stats.activeSubs.toLocaleString();
}

// =========================================
// 4. MEMBER MANAGEMENT
// =========================================
function initMembersTable() {
    const tbody = document.querySelector('#members-table tbody');
    tbody.innerHTML = '';

    ADMIN_STATE.members.forEach(member => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="member-cell">
                    <img src="https://ui-avatars.com/api/?name=${member.name}&background=random" alt="${member.name}">
                    <div>
                        <strong>${member.name}</strong><br>
                        <small style="color:var(--text-muted)">${member.email}</small>
                    </div>
                </div>
            </td>
            <td><span class="status-badge ${member.status === 'Active' ? 'status-active' : 'status-inactive'}">${member.status}</span></td>
            <td>${member.plan}</td>
            <td>${member.joined}</td>
            <td>Today</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="viewMember(${member.id})">Edit</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Exposed to global scope for inline onclick
window.viewMember = function(id) {
    const member = ADMIN_STATE.members.find(m => m.id === id);
    if (!member) return;

    const modalBody = document.getElementById('member-modal-body');
    modalBody.innerHTML = `
        <div class="detail-row"><label>ID</label> <span>#${member.id}</span></div>
        <div class="detail-row"><label>Name</label> <span>${member.name}</span></div>
        <div class="detail-row"><label>Email</label> <span>${member.email}</span></div>
        <div class="detail-row"><label>Plan</label> 
            <select style="background:#0b0d12; color:#fff; border:1px solid #333; padding:5px; border-radius:4px;">
                <option ${member.plan === 'Free' ? 'selected' : ''}>Free</option>
                <option ${member.plan === 'Pro' ? 'selected' : ''}>Pro</option>
                <option ${member.plan === 'Elite' ? 'selected' : ''}>Elite</option>
            </select>
        </div>
        <div class="detail-row"><label>Status</label> 
            <button class="btn btn-sm ${member.status === 'Active' ? 'btn-outline' : 'btn-primary'}">
                ${member.status === 'Active' ? 'Deactivate' : 'Activate'}
            </button>
        </div>
    `;

    document.getElementById('member-modal').classList.add('active');
};

function initModals() {
    const modal = document.getElementById('member-modal');
    const closeBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    document.getElementById('save-member-btn').addEventListener('click', () => {
        alert('Member details updated!');
        modal.classList.remove('active');
    });
}

// =========================================
// 5. REPORTS
// =========================================
window.downloadReport = function() {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Generating...';
    setTimeout(() => {
        btn.textContent = 'Downloaded';
        setTimeout(() => btn.textContent = originalText, 2000);
    }, 1000);
};

// =========================================
// 6. CHARTS (Pure JS Canvas)
// =========================================
function initCharts() {
    drawRevenueChart();
    drawMembershipPie();
    drawWorkoutTypesChart();
    drawMacroChart();
}

function drawRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const canvas = ctx.canvas;
    // Resize for parent
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 300;

    const data = [10, 25, 40, 35, 55, 60, 85]; // Mock Revenue
    const w = canvas.width;
    const h = canvas.height;
    const padding = 40;

    // Draw Line
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding); // X-Axis
    ctx.strokeStyle = '#333';
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 3;
    
    const stepX = (w - padding * 2) / (data.length - 1);
    const maxVal = 100;

    data.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = h - padding - (val / maxVal) * (h - padding * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill Area
    ctx.lineTo(w - padding, h - padding);
    ctx.lineTo(padding, h - padding);
    ctx.fillStyle = 'rgba(0, 242, 255, 0.1)';
    ctx.fill();
}

function drawMembershipPie() {
    const ctx = document.getElementById('membershipPieChart').getContext('2d');
    const canvas = ctx.canvas;
    canvas.width = 300;
    canvas.height = 300; // Fixed size for Pie

    const data = [40, 35, 25]; // Free, Pro, Elite
    const colors = ['#333', '#00f2ff', '#39ff14'];
    let startAngle = 0;

    const total = data.reduce((a, b) => a + b, 0);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;

    data.forEach((val, i) => {
        const sliceAngle = (val / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.fillStyle = colors[i];
        ctx.fill();
        startAngle += sliceAngle;
    });

    // Inner Hole (Donut)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
    ctx.fillStyle = '#14171f'; // Card bg
    ctx.fill();
}

function drawWorkoutTypesChart() {
    const ctx = document.getElementById('workoutTypesChart').getContext('2d');
    const canvas = ctx.canvas;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 250;

    const labels = ['Strength', 'Cardio', 'HIIT', 'Yoga'];
    const data = [45, 30, 15, 10];
    const colors = ['#39ff14', '#00f2ff', '#ff4757', '#ffa502'];

    const w = canvas.width;
    const h = canvas.height;
    const barHeight = 30;
    const startY = 30;

    data.forEach((val, i) => {
        const y = startY + i * 50;
        const barW = (val / 100) * (w - 150);

        // Label
        ctx.fillStyle = '#a0aec0';
        ctx.font = '14px Inter';
        ctx.fillText(labels[i], 10, y + 20);

        // Bar
        ctx.fillStyle = colors[i];
        ctx.fillRect(100, y, barW, barHeight);

        // Value
        ctx.fillStyle = '#fff';
        ctx.fillText(val + '%', 100 + barW + 10, y + 20);
    });
}

function drawMacroChart() {
    // Simple bar chart for macros
    const ctx = document.getElementById('macroChart').getContext('2d');
    const canvas = ctx.canvas;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 250;

    const data = [120, 200, 60]; // Protein, Carbs, Fat
    const labels = ['Protein', 'Carbs', 'Fats'];
    const colors = ['#39ff14', '#00f2ff', '#ffa502'];
    
    const w = canvas.width;
    const h = canvas.height;
    const barW = 50;
    const spacing = (w - (barW * 3)) / 4;
    const maxVal = 250;

    data.forEach((val, i) => {
        const x = spacing + i * (barW + spacing);
        const barH = (val / maxVal) * (h - 50);
        const y = h - 30 - barH;

        ctx.fillStyle = colors[i];
        ctx.fillRect(x, y, barW, barH);

        // Text
        ctx.fillStyle = '#a0aec0';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + barW/2, h - 10);
    });
}