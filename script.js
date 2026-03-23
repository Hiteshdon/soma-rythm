/**
 * SomaRhythm Music Academy - Main JavaScript
 * Handles all interactivity, animations, and form validation
 */

(function() {
    'use strict';

    // ================================
    // DOM Elements
    // ================================
    const elements = {
        navbar: document.querySelector('.navbar'),
        navToggle: document.querySelector('.nav-toggle'),
        navMenu: document.querySelector('.nav-menu'),
        navLinks: document.querySelectorAll('.nav-link'),
        sections: document.querySelectorAll('section[id]'),
        animatedElements: document.querySelectorAll('.animate-on-scroll'),
        floatingNotesContainer: document.querySelector('.floating-notes'),
        equalizerCanvas: document.getElementById('equalizer-canvas'),
        backToTopBtn: document.getElementById('back-to-top'),
        enrollModal: document.getElementById('enroll-modal'),
        enrollBtns: document.querySelectorAll('.enroll-btn'),
        modalClose: document.querySelector('.modal-close'),
        modalBackdrop: document.querySelector('.modal-backdrop'),
        modalClassName: document.getElementById('modal-class-name'),
        enrollClassSelect: document.getElementById('enroll-class'),
        enrollForm: document.getElementById('enroll-form'),
        contactForm: document.getElementById('contact-form'),
        toast: document.getElementById('toast'),
        toastMessage: document.querySelector('.toast-message'),
        copyBtns: document.querySelectorAll('.copy-btn'),
        scrollToBtns: document.querySelectorAll('[data-scroll-to]'),
        currentYear: document.getElementById('current-year')
    };

    // ================================
    // Initialization
    // ================================
    function init() {
        // Set current year
        if (elements.currentYear) {
            elements.currentYear.textContent = new Date().getFullYear();
        }

        // Initialize all features
        initNavigation();
        initScrollAnimations();
        initFloatingNotes();
        initEqualizer();
        initBackToTop();
        initModal();
        initForms();
        initClipboard();
        initScrollToButtons();

        // Initial scroll check
        handleScroll();
    }

    // ================================
    // Navigation
    // ================================
    function initNavigation() {
        // Mobile menu toggle
        elements.navToggle?.addEventListener('click', toggleMobileMenu);

        // Close menu on link click
        elements.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Scroll listener for navbar styling and active link
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMobileMenu();
                closeModal();
            }
        });
    }

    function toggleMobileMenu() {
        const isOpen = elements.navMenu.classList.toggle('active');
        elements.navToggle.classList.toggle('active');
        elements.navToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMobileMenu() {
        elements.navMenu.classList.remove('active');
        elements.navToggle.classList.remove('active');
        elements.navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function handleScroll() {
        const scrollY = window.scrollY;

        // Navbar background on scroll
        if (scrollY > 50) {
            elements.navbar.classList.add('scrolled');
        } else {
            elements.navbar.classList.remove('scrolled');
        }

        // Update active nav link
        updateActiveNavLink(scrollY);

        // Back to top button visibility
        if (scrollY > 500) {
            elements.backToTopBtn?.classList.add('visible');
        } else {
            elements.backToTopBtn?.classList.remove('visible');
        }
    }

    function updateActiveNavLink(scrollY) {
        let currentSection = '';

        elements.sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // ================================
    // Scroll Animations (IntersectionObserver)
    // ================================
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        elements.animatedElements.forEach(el => observer.observe(el));
    }

    // ================================
    // Floating Musical Notes
    // ================================
    function initFloatingNotes() {
        if (!elements.floatingNotesContainer) return;

        const notes = ['♪', '♫', '♩', '♬', '𝄞'];
        const noteCount = 15;

        for (let i = 0; i < noteCount; i++) {
            createFloatingNote(notes, i);
        }
    }

    function createFloatingNote(notes, index) {
        const note = document.createElement('span');
        note.className = 'note';
        note.textContent = notes[Math.floor(Math.random() * notes.length)];
        
        // Random positioning and timing
        note.style.left = `${Math.random() * 100}%`;
        note.style.animationDelay = `${Math.random() * 15}s`;
        note.style.animationDuration = `${15 + Math.random() * 10}s`;
        note.style.fontSize = `${1 + Math.random() * 1.5}rem`;

        elements.floatingNotesContainer.appendChild(note);
    }

    // ================================
    // Canvas Equalizer Animation
    // ================================
    function initEqualizer() {
        const canvas = elements.equalizerCanvas;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        let bars = [];

        function resizeCanvas() {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            initBars();
        }

        function initBars() {
            bars = [];
            const barCount = Math.floor(canvas.offsetWidth / 8);
            for (let i = 0; i < barCount; i++) {
                bars.push({
                    x: i * 8,
                    height: Math.random() * 50 + 20,
                    targetHeight: Math.random() * 100 + 30,
                    speed: Math.random() * 2 + 1,
                    hue: 260 + (i / barCount) * 60 // Purple to teal gradient
                });
            }
        }

        function animate() {
            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;

            ctx.clearRect(0, 0, width, height);

            bars.forEach((bar, index) => {
                // Smooth height transition
                if (Math.abs(bar.height - bar.targetHeight) < 1) {
                    bar.targetHeight = Math.random() * (height * 0.6) + 20;
                }
                bar.height += (bar.targetHeight - bar.height) * 0.05;

                // Create gradient for each bar
                const gradient = ctx.createLinearGradient(0, height, 0, height - bar.height);
                gradient.addColorStop(0, `hsla(${bar.hue}, 80%, 60%, 0.8)`);
                gradient.addColorStop(1, `hsla(${bar.hue + 30}, 80%, 50%, 0.2)`);

                ctx.fillStyle = gradient;
                ctx.fillRect(bar.x, height - bar.height, 5, bar.height);

                // Glow effect
                ctx.shadowColor = `hsla(${bar.hue}, 80%, 60%, 0.5)`;
                ctx.shadowBlur = 10;
            });

            ctx.shadowBlur = 0;
            animationId = requestAnimationFrame(animate);
        }

        // Initialize
        resizeCanvas();
        animate();

        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 200);
        });

        // Pause animation when not visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animate();
                } else {
                    cancelAnimationFrame(animationId);
                }
            });
        }, { threshold: 0 });

        observer.observe(canvas);
    }

    // ================================
    // Back to Top Button
    // ================================
    function initBackToTop() {
        elements.backToTopBtn?.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ================================
    // Modal
    // ================================
    function initModal() {
        // Open modal buttons
        elements.enrollBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const className = btn.dataset.class;
                openModal(className);
            });
        });

        // Close modal
        elements.modalClose?.addEventListener('click', closeModal);
        elements.modalBackdrop?.addEventListener('click', closeModal);

        // Trap focus in modal
        elements.enrollModal?.addEventListener('keydown', trapFocus);
    }

    function openModal(className) {
        if (!elements.enrollModal) return;

        // Set class name in title and select
        elements.modalClassName.textContent = className + ' Classes';
        if (elements.enrollClassSelect) {
            elements.enrollClassSelect.value = className;
        }

        // Show modal
        elements.enrollModal.hidden = false;
        requestAnimationFrame(() => {
            elements.enrollModal.classList.add('active');
        });

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus first input
        const firstInput = elements.enrollModal.querySelector('input');
        firstInput?.focus();
    }

    function closeModal() {
        if (!elements.enrollModal) return;

        elements.enrollModal.classList.remove('active');
        
        setTimeout(() => {
            elements.enrollModal.hidden = true;
        }, 300);

        document.body.style.overflow = '';

        // Reset form
        elements.enrollForm?.reset();
        clearFormErrors(elements.enrollForm);
    }

    function trapFocus(e) {
        if (e.key !== 'Tab') return;

        const focusableElements = elements.enrollModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    // ================================
    // Form Validation
    // ================================
    function initForms() {
        // Enroll form
        elements.enrollForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(elements.enrollForm)) {
                submitForm(elements.enrollForm, 'enrollment');
            }
        });

        // Contact form
        elements.contactForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(elements.contactForm)) {
                submitForm(elements.contactForm, 'contact');
            }
        });

        // Real-time validation on blur
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => {
                if (field.closest('.form-group').classList.contains('error')) {
                    validateField(field);
                }
            });
        });
    }

    function validateForm(form) {
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    function validateField(field) {
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup?.querySelector('.error-message');
        let errorMessage = '';

        // Required check
        if (field.required && !field.value.trim()) {
            errorMessage = 'This field is required';
        }
        // Email validation
        else if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                errorMessage = 'Please enter a valid email address';
            }
        }
        // Phone validation (basic)
        else if (field.type === 'tel' && field.value) {
            const phoneRegex = /^[\d\s\-+()]{8,}$/;
            if (!phoneRegex.test(field.value)) {
                errorMessage = 'Please enter a valid phone number';
            }
        }
        // Name validation
        else if (field.name === 'name' && field.value) {
            if (field.value.trim().length < 2) {
                errorMessage = 'Name must be at least 2 characters';
            }
        }

        // Update UI
        if (errorMessage) {
            formGroup?.classList.add('error');
            if (errorElement) errorElement.textContent = errorMessage;
            return false;
        } else {
            formGroup?.classList.remove('error');
            if (errorElement) errorElement.textContent = '';
            return true;
        }
    }

    function clearFormErrors(form) {
        if (!form) return;
        
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            const errorEl = group.querySelector('.error-message');
            if (errorEl) errorEl.textContent = '';
        });
    }

    function submitForm(form, type) {
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;

            // Success
            form.reset();
            clearFormErrors(form);

            if (type === 'enrollment') {
                closeModal();
                showToast('Enrollment submitted successfully! We\'ll contact you soon.');
            } else {
                showToast('Message sent successfully! We\'ll get back to you soon.');
            }
        }, 1500);
    }

    // ================================
    // Toast Notifications
    // ================================
    function showToast(message, duration = 4000) {
        if (!elements.toast) return;

        elements.toastMessage.textContent = message;
        elements.toast.hidden = false;

        requestAnimationFrame(() => {
            elements.toast.classList.add('active');
        });

        setTimeout(() => {
            elements.toast.classList.remove('active');
            setTimeout(() => {
                elements.toast.hidden = true;
            }, 300);
        }, duration);
    }

    // ================================
    // Clipboard Copy
    // ================================
    function initClipboard() {
        elements.copyBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const textToCopy = btn.dataset.copy;
                
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    
                    // Visual feedback
                    const originalText = btn.querySelector('.copy-icon').textContent;
                    btn.querySelector('.copy-icon').textContent = '✓';
                    btn.classList.add('copied');
                    
                    showToast('Copied to clipboard!', 2000);

                    setTimeout(() => {
                        btn.querySelector('.copy-icon').textContent = originalText;
                        btn.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showToast('Copied to clipboard!', 2000);
                }
            });
        });
    }

    // ================================
    // Scroll to Video Buttons
    // ================================
    function initScrollToButtons() {
        elements.scrollToBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.scrollTo;
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerOffset = 100;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Add highlight effect
                    targetElement.style.transition = 'box-shadow 0.3s ease';
                    targetElement.style.boxShadow = '0 0 30px rgba(155, 77, 255, 0.5)';
                    
                    setTimeout(() => {
                        targetElement.style.boxShadow = '';
                    }, 2000);
                }
            });
        });
    }

    // ================================
    // Start Application
    // ================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
