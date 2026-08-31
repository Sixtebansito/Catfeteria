//Carrusel
const carouselSlide = document.querySelector('.carousel-slide');
let carouselItems = document.querySelectorAll('.carousel-slide a'); 
const dotsContainer = document.querySelector('.carousel-dots');

const originalCount = carouselItems.length;

for (let i = 0; i < originalCount; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.dataset.index = i;
    dotsContainer.appendChild(dot);

    dot.addEventListener('click', () => {
        counter = i + 1; 
        updateCarousel();
        updateDots();
        resetInterval();
    });
}
const dots = document.querySelectorAll('.dot');

const firstClone = carouselItems[0].cloneNode(true);
const lastClone = carouselItems[carouselItems.length - 1].cloneNode(true);

firstClone.id = 'first-clone';
lastClone.id = 'last-clone';

carouselSlide.append(firstClone);
carouselSlide.prepend(lastClone);

carouselItems = document.querySelectorAll('.carousel-slide a');

let counter = 1; 
let size = carouselItems[0].clientWidth;

carouselSlide.style.transform = 'translateX(' + (-size * counter) + 'px)';


function updateCarousel() {
    carouselSlide.style.transition = "transform 0.4s ease-in-out";
    carouselSlide.style.transform = 'translateX(' + (-size * counter) + 'px)';
}

function updateDots() {
    dots.forEach(dot => dot.classList.remove('active'));
    
    let dotIndex = counter - 1;
    if (counter === 0) dotIndex = originalCount - 1; 
    if (counter === carouselItems.length - 1) dotIndex = 0;
    
    if(dotIndex >= 0 && dotIndex < dots.length) {
        dots[dotIndex].classList.add('active');
    }
}

function moveToNext() {
    if (counter >= carouselItems.length - 1) return;
    counter++;
    updateCarousel();
    updateDots();
}

carouselSlide.addEventListener('transitionend', () => {
    if (carouselItems[counter].id === 'last-clone') {
        carouselSlide.style.transition = "none";
        counter = carouselItems.length - 2;
        carouselSlide.style.transform = 'translateX(' + (-size * counter) + 'px)';
    }
    if (carouselItems[counter].id === 'first-clone') {
        carouselSlide.style.transition = "none";
        counter = 1;
        carouselSlide.style.transform = 'translateX(' + (-size * counter) + 'px)';
    }
    updateDots(); 
});

window.addEventListener('resize', () => {
    size = carouselItems[0].clientWidth;
    carouselSlide.style.transition = "none";
    carouselSlide.style.transform = 'translateX(' + (-size * counter) + 'px)';
});

let slideInterval = setInterval(moveToNext, 5000);

function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(moveToNext, 5000);
}