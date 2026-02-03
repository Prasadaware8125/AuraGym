'use strict';

/**
 * AURA GYM Landing Page Logic
 * Features: Sticky Nav, Mobile Menu, Smooth Scroll, Scroll Animations, Testimonial Slider, Modals
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. NAVIGATION LOGIC
    // =========================================
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-link');

    // Sticky Navbar on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Active Link Highlighting (Scroll Spy)
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });


    // =========================================
    // 2. SCROLL ANIMATIONS (Intersection Observer)
    // =========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => observer.observe(el));


    // =========================================
    // 3. TESTIMONIAL SLIDER
    // =========================================
    const testimonials = [
        {
            text: "AURA GYM changed my life. The AI coaching actually feels like a real trainer watching my form. I've added 20lbs to my bench in 2 months!",
            name: "Marcus J.",
            role: "Pro Member",
            img: "https://ui-avatars.com/api/?name=Marcus+J&background=39ff14&color=000"
        },
        {
            text: "I love the analytics. Seeing my progress visualized keeps me motivated on days I don't feel like training. Highly recommended.",
            name: "Sarah L.",
            role: "Athlete Elite",
            img: "https://ui-avatars.com/api/?name=Sarah+L&background=00f2ff&color=000"
        },
        {
            text: "The community challenges are addictive. It's the perfect mix of competition and support. Best fitness app I've used.",
            name: "David K.",
            role: "Member",
            img: "https://ui-avatars.com/api/?name=David+K&background=fff&color=000"
        }
    ];

    const track = document.querySelector('.carousel-track');
    const dotsContainer = document.querySelector('.carousel-dots');
    let currentIndex = 0;

    // Initialize Slides
    testimonials.forEach((t, index) => {
        // Create Slide
        const slide = document.createElement('div');
        slide.className = 'testimonial-card';
        slide.innerHTML = `
            <p class="testimonial-text">"${t.text}"</p>
            <div class="testimonial-author">
                <img src="${t.img}" alt="${t.name}">
                <h4>${t.name}</h4>
                <span>${t.role}</span>
            </div>
        `;
        track.appendChild(slide);

        // Create Dot
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const updateSlider = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        document.querySelectorAll('.dot').forEach((d, i) => {
            d.classList.toggle('active', i === currentIndex);
        });
    };

    const goToSlide = (index) => {
        currentIndex = index;
        updateSlider();
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateSlider();
    };

    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        updateSlider();
    };

    // Event Listeners for Controls
    document.getElementById('nextBtn').addEventListener('click', nextSlide);
    document.getElementById('prevBtn').addEventListener('click', prevSlide);

    // Auto Play
    setInterval(nextSlide, 5000);


    // =========================================
    // 4. MODAL LOGIC
    // =========================================
    // const modal = document.getElementById('joinModal');
    // const triggerBtns = document.querySelectorAll('.join-trigger');
    // const closeBtn = document.querySelector('.close-modal');
    // const joinForm = document.getElementById('joinForm');

    // triggerBtns.forEach(btn => {
    //     btn.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         modal.style.display = 'flex';
    //     });
    // });

    // closeBtn.addEventListener('click', () => {
    //     modal.style.display = 'none';
    // });

    // window.addEventListener('click', (e) => {
    //     if (e.target === modal) {
    //         modal.style.display = 'none';
    //     }
    // });

    // joinForm.addEventListener('submit', (e) => {
    //     e.preventDefault();
    //     const btn = joinForm.querySelector('button');
    //     const originalText = btn.textContent;
        
    //     btn.textContent = 'Processing...';
        
    //     setTimeout(() => {
    //         alert('Welcome to AURA GYM! Your journey begins now.');
    //         modal.style.display = 'none';
    //         joinForm.reset();
    //         btn.textContent = originalText;
    //     }, 1500);
    // });

});