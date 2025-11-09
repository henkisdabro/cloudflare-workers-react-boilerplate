/**
 * Cloudflare Workers + React Boilerplate - Landing Page Scripts
 * Progressive enhancement with vanilla JavaScript
 */

(function() {
    'use strict';

    /**
     * Intersection Observer for fade-in animations
     * Adds 'fade-in-up' class when elements enter viewport
     */
    function initScrollAnimations() {
        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: immediately show all elements
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    // Unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Elements to animate
        const animatedElements = document.querySelectorAll(`
            .value-prop,
            .feature-card,
            .step,
            .command-card,
            .example-category,
            .tech-category,
            .comparison-column
        `);

        animatedElements.forEach(el => {
            // Add pending class instead of inline style
            el.classList.add('fade-in-pending');
            observer.observe(el);
        });
    }

    /**
     * Smooth scrolling for anchor links
     * Enhances skip-to-content and any other hash links
     */
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');

                // Only prevent default if target exists
                if (targetId !== '#' && document.querySelector(targetId)) {
                    e.preventDefault();

                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        // Smooth scroll to target
                        try {
                            targetElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        } catch (err) {
                            // Fallback for older browsers
                            targetElement.scrollIntoView();
                        }

                        // Update focus for accessibility
                        targetElement.focus({ preventScroll: true });
                    }
                }
            });
        });
    }

    /**
     * Track CTA button clicks
     * Log to console for analytics purposes (can be enhanced with actual tracking)
     */
    function initCTATracking() {
        const primaryCTAs = document.querySelectorAll('.btn-primary');
        const secondaryCTAs = document.querySelectorAll('.btn-secondary');

        primaryCTAs.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('CTA Click: Use Template');
                // Future: Add analytics tracking here
                // Example: gtag('event', 'click', { event_category: 'CTA', event_label: 'Use Template' });
            });
        });

        secondaryCTAs.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('CTA Click: Star on GitHub');
                // Future: Add analytics tracking here
            });
        });
    }

    /**
     * Add keyboard navigation enhancements
     * Improve accessibility for keyboard users
     */
    function initKeyboardNavigation() {
        // Add visible focus indicators for keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    }

    /**
     * Lazy load external images (badges from shields.io)
     * Improves initial page load performance
     */
    function initLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading is supported
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                img.src = img.dataset.src || img.src;
            });
        } else {
            // Fallback: load all images immediately
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        }
    }

    /**
     * Add copy-to-clipboard functionality for code blocks
     * Enhances user experience for command examples
     */
    function initCodeCopyButtons() {
        const codeBlocks = document.querySelectorAll('.step-code code');

        codeBlocks.forEach(block => {
            // Create copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.textContent = 'Copy';
            copyButton.setAttribute('aria-label', 'Copy code to clipboard');

            // Style the button
            Object.assign(copyButton.style, {
                position: 'absolute',
                top: '8px',
                right: '8px',
                padding: '4px 8px',
                fontSize: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                opacity: '0',
                transition: 'opacity 0.2s'
            });

            // Make parent position relative
            const parent = block.parentElement;
            parent.style.position = 'relative';

            // Helper functions for showing/hiding button
            const showButton = () => {
                copyButton.style.opacity = '1';
            };

            const hideButton = () => {
                if (copyButton.textContent !== 'Copied!') {
                    copyButton.style.opacity = '0';
                }
            };

            // Show on hover AND focus (keyboard accessible)
            parent.addEventListener('mouseenter', showButton);
            parent.addEventListener('focusin', showButton);

            parent.addEventListener('mouseleave', hideButton);
            parent.addEventListener('focusout', hideButton);

            // Ensure button itself is keyboard focusable
            copyButton.setAttribute('tabindex', '0');
            copyButton.addEventListener('focus', showButton);

            // Copy functionality
            copyButton.addEventListener('click', async () => {
                const text = block.textContent;

                try {
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(text);
                    } else {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = text;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-999999px';
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                    }

                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                        copyButton.style.opacity = '0';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text:', err);
                }
            });

            parent.appendChild(copyButton);
        });
    }

    /**
     * Initialize all functionality when DOM is ready
     */
    function init() {
        initScrollAnimations();
        initSmoothScrolling();
        initCTATracking();
        initKeyboardNavigation();
        initLazyLoading();
        initCodeCopyButtons();

        // Log successful initialization
        console.log('Cloudflare Workers + React Boilerplate - Page initialized');
    }

    // Run initialization when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already loaded
        init();
    }

})();
