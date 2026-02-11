'use strict';

/**
 * AURA GYM ADMIN DASHBOARD LOGIC
 * Frontend controller for the admin/trainer dashboard:
 * - Uses members injected from the server (window.ADMIN_MEMBERS)
 * - Renders the members table and supports filtering/search
 * - Handles animations, charts, and logout
 */

// Global state for admin dashboard
const ADMIN_STATE = {
    members: (window.ADMIN_MEMBERS || []).map(m => ({
        id: m._id,
        name: m.username,
        email: m.email,
        plan: 'Standard',
        status: 'Active',
        joined: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ''
    })),
    stats: {
        totalMembers: (window.ADMIN_MEMBERS || []).length,
        totalWorkouts: 0,
        activeSubs: (window.ADMIN_MEMBERS || []).length
    },
    activeFilter: 'all'
};

// Fallback demo data if no members yet
if (!ADMIN_STATE.members.length) {
    ADMIN_STATE.members = [
        { id: 101, name: 'Alex Johnson', email: 'alex@example.com', plan: 'Pro', status: 'Active', joined: '2023-01-15' },
        { id: 102, name: 'Sarah Connor', email: 'sarah@example.com', plan: 'Elite', status: 'Active', joined: '2023-02-20' }
    ];
}

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    initNavigation();
    initMembersTable(ADMIN_STATE.members);
    initFilters();
    initAnimations();
    initCharts(); // If canvas elements exist
    initModals();
});

function checkAdminAuth() {
    if (!localStorage.getItem('aura_admin_session')) {
        // localStorage.setItem('aura_admin_session', 'true'); // Uncomment to force login
    }
}

// =========================================
// 1. NAVIGATION & SCROLL REVEAL
// =========================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.view-section');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const titleEl = document.getElementById('current-page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            titleEl.textContent = link.querySelector('span').textContent;

            if (window.innerWidth <= 768) sidebar.classList.remove('open');
            
            // Re-trigger animations
            initAnimations();
        });
    });

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Logout of Admin Dashboard?')) {
                // Let the server handle the real logout
                window.location.href = '/logout';
            }
        });
    }
}

function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Trigger counters if visible
                if (entry.target.querySelector('.counter') || entry.target.id === 'members-management') {
                    animateCounters();
                }
                // Animate bars if Nutrition section
                if (entry.target.id === 'nutrition-analytics') {
                    animateMacroBars();
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    animateCounters();
}

function animateCounters() {
    document.querySelectorAll('.counter').forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 1500;
        const increment = target / (duration / 16);
        let current = 0;
        const update = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(update);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        update();
    });
    // Legacy stats
    if(document.getElementById('total-members')) {
        document.getElementById('total-members').textContent = ADMIN_STATE.stats.totalMembers.toLocaleString();
        document.getElementById('total-workouts').textContent = ADMIN_STATE.stats.totalWorkouts.toLocaleString();
        document.getElementById('active-subs').textContent = ADMIN_STATE.stats.activeSubs.toLocaleString();
    }
}

function animateMacroBars() {
    document.querySelectorAll('.macro-bar').forEach(bar => {
        const width = bar.style.getPropertyValue('--w');
        bar.style.width = width;
    });
}

// =========================================
// 2. MEMBERS LOGIC
// =========================================
function initFilters() {
    const pills = document.querySelectorAll('.pill');
    const searchInput = document.getElementById('member-search');

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            ADMIN_STATE.activeFilter = pill.dataset.filter;
            filterMembers();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterMembers(e.target.value.toLowerCase());
        });
    }
}

function filterMembers(searchTerm = '') {
    let filtered = ADMIN_STATE.members;

    // Apply Tab Filter
    if (ADMIN_STATE.activeFilter !== 'all') {
        const f = ADMIN_STATE.activeFilter;
        if (f === 'active' || f === 'inactive') {
            filtered = filtered.filter(m => m.status.toLowerCase() === f);
        } else if (f === 'pro' || f === 'elite') {
            filtered = filtered.filter(m => m.plan.toLowerCase() === f);
        }
    }

    // Apply Search
    if (searchTerm) {
        filtered = filtered.filter(m => 
            m.name.toLowerCase().includes(searchTerm) || 
            m.email.toLowerCase().includes(searchTerm) ||
            m.plan.toLowerCase().includes(searchTerm)
        );
    }

    initMembersTable(filtered);
}

function initMembersTable(data) {
    const tbody = document.querySelector('#members-table tbody');
    const countEl = document.getElementById('current-count');
    const totalEl = document.getElementById('total-count');
    
    if(tbody) {
        tbody.innerHTML = '';
        
        if(countEl) countEl.innerText = data.length;
        if(totalEl) totalEl.innerText = ADMIN_STATE.members.length;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#555;">No members found matching filters.</td></tr>';
            return;
        }

        data.forEach((member, index) => {
            const tr = document.createElement('tr');
            // Add animation class with staggered delay
            tr.className = 'table-row-anim';
            tr.style.animationDelay = `${index * 0.05}s`;

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
                <td>
                    <span style="color: ${member.plan === 'Elite' ? 'var(--warning)' : (member.plan === 'Pro' ? 'var(--secondary)' : 'var(--text-gray)')}; font-weight:600;">
                        ${member.plan}
                    </span>
                </td>
                <td>${member.joined}</td>
                <td><span style="color:var(--success)">2 mins ago</span></td>
                <td class="text-right">
                    <div class="row-actions">
                        <button class="action-btn" onclick="togglePreview(this, ${member.id})" title="View Details"><i class="fa-solid fa-eye"></i></button>
                        <button class="action-btn" onclick="viewMember(${member.id})" title="Edit Member"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn" style="color:var(--danger); border-color:rgba(255,71,87,0.3)" title="Suspend"><i class="fa-solid fa-ban"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Inline Preview Logic
window.togglePreview = function(btn, id) {
    const tr = btn.closest('tr');
    const existingPreview = tr.nextElementSibling;
    const icon = btn.querySelector('i');

    if (existingPreview && existingPreview.classList.contains('preview-row')) {
        existingPreview.remove();
        btn.style.background = '';
        btn.style.color = '';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-eye');
        return;
    }

    // Close other previews
    document.querySelectorAll('.preview-row').forEach(row => {
        const prevBtn = row.previousElementSibling.querySelector('.action-btn');
        if(prevBtn) {
            prevBtn.style.background = '';
            prevBtn.style.color = '';
            prevBtn.querySelector('i').classList.replace('fa-chevron-up', 'fa-eye');
        }
        row.remove();
    });

    const member = ADMIN_STATE.members.find(m => m.id === id);
    const previewRow = document.createElement('tr');
    previewRow.className = 'preview-row';
    previewRow.innerHTML = `
        <td colspan="6">
            <div class="preview-content">
                <div><strong>Last Workout:</strong> Upper Body Power (Yesterday)</div>
                <div><strong>Attendance:</strong> 12 days this month</div>
                <div><strong>Notes:</strong> Consistent user. No flagged issues. Account in good standing.</div>
            </div>
        </td>
    `;
    
    tr.after(previewRow);
    
    // Active state for button
    btn.style.background = 'var(--secondary)';
    btn.style.color = '#000';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-chevron-up');
};

// =========================================
// 3. MODAL & CHARTS
// =========================================
window.viewMember = function(id) {
    const member = ADMIN_STATE.members.find(m => m.id === id);
    const modalBody = document.getElementById('member-modal-body');
    modalBody.innerHTML = `
        <div class="detail-row"><label>ID</label> <span>#${member.id}</span></div>
        <div class="detail-row"><label>Name</label> <span>${member.name}</span></div>
        <div class="detail-row"><label>Plan</label> <span>${member.plan}</span></div>
    `;
    document.getElementById('member-modal').classList.add('active');
};

function initModals() {
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => document.getElementById('member-modal').classList.remove('active'));
    });
    document.getElementById('save-member-btn').addEventListener('click', () => {
        alert('Member details updated!');
        document.getElementById('member-modal').classList.remove('active');
    });
}

function initCharts() {
    if(document.getElementById('revenueChart')) drawRevenueChart();
    if(document.getElementById('membershipPieChart')) drawMembershipPie();
    if(document.getElementById('workoutTypesChart')) drawWorkoutTypesChart();
    // if(document.getElementById('macroChart')) drawMacroChart(); // Replaced by CSS bars
}

// Chart drawing functions... (Retained from previous code)
function drawRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const canvas = ctx.canvas;
    canvas.width = canvas.parentElement.clientWidth; canvas.height = 300;
    const data = [10, 25, 40, 35, 55, 60, 85];
    const w = canvas.width; const h = canvas.height; const padding = 40;
    ctx.beginPath(); ctx.moveTo(padding, h - padding); ctx.lineTo(w - padding, h - padding); ctx.strokeStyle = '#333'; ctx.stroke();
    ctx.beginPath(); ctx.strokeStyle = '#00f2ff'; ctx.lineWidth = 3;
    const stepX = (w - padding * 2) / (data.length - 1); const maxVal = 100;
    data.forEach((val, i) => {
        const x = padding + i * stepX; const y = h - padding - (val / maxVal) * (h - padding * 2);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.lineTo(w - padding, h - padding); ctx.lineTo(padding, h - padding); ctx.fillStyle = 'rgba(0, 242, 255, 0.1)'; ctx.fill();
}

function drawMembershipPie() {
    const ctx = document.getElementById('membershipPieChart').getContext('2d');
    const canvas = ctx.canvas; canvas.width = 300; canvas.height = 300;
    const data = [40, 35, 25]; const colors = ['#333', '#00f2ff', '#39ff14']; let startAngle = 0;
    const total = data.reduce((a, b) => a + b, 0); const centerX = canvas.width / 2; const centerY = canvas.height / 2; const radius = 100;
    data.forEach((val, i) => {
        const sliceAngle = (val / total) * 2 * Math.PI;
        ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle); ctx.fillStyle = colors[i]; ctx.fill();
        startAngle += sliceAngle;
    });
    ctx.beginPath(); ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI); ctx.fillStyle = '#14171f'; ctx.fill();
}

function drawWorkoutTypesChart() {
    const ctx = document.getElementById('workoutTypesChart').getContext('2d');
    const canvas = ctx.canvas; canvas.width = canvas.parentElement.clientWidth; canvas.height = 250;
    const labels = ['Strength', 'Cardio', 'HIIT', 'Yoga']; const data = [45, 30, 15, 10]; const colors = ['#39ff14', '#00f2ff', '#ff4757', '#ffa502'];
    const w = canvas.width; const h = canvas.height; const barHeight = 30; const startY = 30;
    data.forEach((val, i) => {
        const y = startY + i * 50; const barW = (val / 100) * (w - 150);
        ctx.fillStyle = '#a0aec0'; ctx.font = '14px Inter'; ctx.fillText(labels[i], 10, y + 20);
        ctx.fillStyle = colors[i]; ctx.fillRect(100, y, barW, barHeight);
        ctx.fillStyle = '#fff'; ctx.fillText(val + '%', 100 + barW + 10, y + 20);
    });
}

window.downloadReport = function() {
    alert('Report downloading...');
};