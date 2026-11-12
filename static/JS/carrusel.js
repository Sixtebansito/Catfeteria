// ==========================================================================
// CARRUSEL INTERACTIVO PRO - CATFETERÍA
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.carousel-container');
    const slide = document.querySelector('.carousel-slide');
    if (!container || !slide) return;

    let items = document.querySelectorAll('.carousel-slide a, .carousel-slide .carousel-item');
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    const totalOriginal = items.length;
    if (totalOriginal <= 1) return;

    // Crear dots dinámicos
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalOriginal; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            dot.addEventListener('click', () => {
                goToSlide(i + 1);
                resetAutoplay();
            });
            dotsContainer.appendChild(dot);
        }
    }

    // Clones para loop infinito
    const firstClone = items[0].cloneNode(true);
    const lastClone = items[items.length - 1].cloneNode(true);
    firstClone.id = 'first-clone';
    lastClone.id = 'last-clone';

    slide.appendChild(firstClone);
    slide.insertBefore(lastClone, slide.firstChild);

    items = document.querySelectorAll('.carousel-slide a, .carousel-slide .carousel-item');
    let currentIndex = 1;
    let slideWidth = container.clientWidth;

    function setSlidePosition(animate = true) {
        slideWidth = container.clientWidth;
        if (animate) {
            slide.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        } else {
            slide.style.transition = 'none';
        }
        slide.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
    }

    // Initial position
    setSlidePosition(false);

    function updateDots() {
        if (!dotsContainer) return;
        const allDots = dotsContainer.querySelectorAll('.dot');
        allDots.forEach(d => d.classList.remove('active'));

        let dotIndex = currentIndex - 1;
        if (currentIndex === 0) dotIndex = totalOriginal - 1;
        if (currentIndex === items.length - 1) dotIndex = 0;

        if (allDots[dotIndex]) {
            allDots[dotIndex].classList.add('active');
        }
    }

    function goToSlide(index) {
        currentIndex = index;
        setSlidePosition(true);
        updateDots();
    }

    function nextSlide() {
        if (currentIndex >= items.length - 1) return;
        currentIndex++;
        setSlidePosition(true);
        updateDots();
    }

    function prevSlide() {
        if (currentIndex <= 0) return;
        currentIndex--;
        setSlidePosition(true);
        updateDots();
    }

    slide.addEventListener('transitionend', () => {
        if (items[currentIndex].id === 'last-clone') {
            currentIndex = items.length - 2;
            setSlidePosition(false);
        }
        if (items[currentIndex].id === 'first-clone') {
            currentIndex = 1;
            setSlidePosition(false);
        }
        updateDots();
    });

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
            resetAutoplay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
            resetAutoplay();
        });
    }

    // Resize recalculation
    window.addEventListener('resize', () => {
        setSlidePosition(false);
    });

    // Autoplay
    let autoplayTimer = setInterval(nextSlide, 4500);

    function resetAutoplay() {
        clearInterval(autoplayTimer);
        autoplayTimer = setInterval(nextSlide, 4500);
    }

    // Pausar en hover
    container.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    container.addEventListener('mouseleave', () => resetAutoplay());

    // Soporte táctil básico (Swipe en móviles)
    let startX = 0;
    let endX = 0;

    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        clearInterval(autoplayTimer);
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        resetAutoplay();
    }, { passive: true });
});
