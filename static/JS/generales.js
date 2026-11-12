// ==========================================================================
// CATFETERÍA - JAVASCRIPT GENERAL & INTERACTIVIDAD PRO
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. MENÚ MÓVIL Y NAVBAR SCROLL ---
    const nav = document.querySelector('#nav');
    const btnAbrirMenu = document.querySelector('#abrir');
    const btnCerrarMenu = document.querySelector('#cerrar');
    const mainHeader = document.querySelector('.main-header');

    if (btnAbrirMenu && nav) {
        btnAbrirMenu.addEventListener('click', () => {
            nav.classList.add('visible');
            document.body.style.overflow = 'hidden';
        });
    }

    if (btnCerrarMenu && nav) {
        btnCerrarMenu.addEventListener('click', () => {
            nav.classList.remove('visible');
            document.body.style.overflow = '';
        });
    }

    // Cerrar menú al hacer clic en un enlace
    if (nav) {
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('visible');
                document.body.style.overflow = '';
            });
        });
    }

    // Efecto scrolled en header
    window.addEventListener('scroll', () => {
        if (mainHeader) {
            if (window.scrollY > 40) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        }

        // Botón volver arriba
        const btnSubir = document.getElementById('btn-subir');
        if (btnSubir) {
            if (window.scrollY > 350) {
                btnSubir.classList.add('visible');
            } else {
                btnSubir.classList.remove('visible');
            }
        }
    });

    // Funcionalidad Volver Arriba
    const btnSubir = document.getElementById('btn-subir');
    if (btnSubir) {
        btnSubir.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // --- 2. SISTEMA DE TOAST NOTIFICATIONS ---
    function showToast(message, icon = 'bi-check-circle-fill') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerHTML = `<i class="bi ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }


    // --- 3. CARRITO DE COMPRAS Y PERSISTENCIA ---
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart');
    const openCartBtn = document.getElementById('open-cart-btn');
    const cartBadge = document.getElementById('cart-badge');

    const btnPagar = document.querySelector('.btn-checkout');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutBtn = document.getElementById('close-checkout');
    const confirmOrderBtn = document.getElementById('btn-confirm-order');

    const inputName = document.getElementById('client-name');
    const inputPhone = document.getElementById('client-phone');
    const inputEmail = document.getElementById('client-email');
    const orderForm = document.getElementById('order-form');
    const orderSuccess = document.getElementById('order-success');

    let cart = [];

    // Cargar perfil si existe
    try {
        const userProfile = JSON.parse(localStorage.getItem('userProfile'));
        if (userProfile) {
            if (inputName) inputName.value = userProfile.name || '';
            if (inputPhone) inputPhone.value = userProfile.phone || '';
            if (inputEmail) inputEmail.value = userProfile.email || '';
        }
    } catch (e) {
        console.warn('Error reading userProfile', e);
    }

    function loadCart() {
        try {
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                cart = JSON.parse(storedCart);
            }
        } catch (e) {
            cart = [];
        }
        renderCart();
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
    }

    function updateCartBadge() {
        if (!cartBadge) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.innerText = totalItems;
        if (totalItems > 0) {
            cartBadge.classList.add('bounce');
            setTimeout(() => cartBadge.classList.remove('bounce'), 400);
        }
    }

    function openCart(e) {
        if (e) e.preventDefault();
        if (cartOverlay && cartSidebar) {
            cartOverlay.classList.add('active');
            cartSidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeCart() {
        if (cartOverlay && cartSidebar) {
            cartOverlay.classList.remove('active');
            cartSidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function addItemToCart(e) {
        e.preventDefault();
        const button = e.currentTarget || e.target;
        const card = button.closest('.custom-card, .suplemento, .menu-item');

        const id = button.getAttribute('data-id') || (card ? card.getAttribute('data-id') : Date.now().toString());
        let title = button.getAttribute('data-nombre');
        let priceAttr = button.getAttribute('data-precio');
        let imageSrc = button.getAttribute('data-imagen');

        if (!title && card) {
            const h3 = card.querySelector('h3');
            if (h3) title = h3.innerText.trim();
        }
        if (!priceAttr && card) {
            const priceEl = card.querySelector('.card-price, .precio');
            if (priceEl) {
                priceAttr = priceEl.innerText.replace(/[^0-9.]/g, '');
            }
        }
        if (!imageSrc && card) {
            const imgEl = card.querySelector('img');
            if (imgEl) imageSrc = imgEl.src;
        }

        const price = parseFloat(priceAttr) || 0;
        title = title || 'Producto';
        imageSrc = imageSrc || '/static/Imagenes/Menu y Promos/logocatfeteria.png';

        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                title,
                price,
                image: imageSrc,
                quantity: 1
            });
        }

        saveCart();
        renderCart();
        showToast(`¡${title} agregado al carrito!`, 'bi-bag-check-fill');

        // Micro-animación en botón
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
    }

    function renderCart() {
        if (!cartItemsContainer || !cartTotalElement) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-state">
                    <i class="bi bi-cart-x"></i>
                    <p>Tu carrito está vacío</p>
                    <small style="color:#9c8e84;">¡Elige cafés exquisitos o mimos para tu michi!</small>
                </div>
            `;
            cartTotalElement.innerText = '0.00';
            updateCartBadge();
            return;
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.title}" onerror="this.src='/static/Imagenes/Menu y Promos/logocatfeteria.png'">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <span class="cart-item-price-unit">$${item.price.toFixed(2)} c/u</span>
                    <div class="qty-controls">
                        <button class="qty-btn minus" data-id="${item.id}" aria-label="Disminuir">-</button>
                        <span class="qty-number">${item.quantity}</span>
                        <button class="qty-btn plus" data-id="${item.id}" aria-label="Aumentar">+</button>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: #c67d49; font-size: 0.95rem;">$${itemTotal.toFixed(2)}</div>
                    <span class="remove-item" data-id="${item.id}" title="Eliminar"><i class="bi bi-trash3"></i></span>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });

        cartTotalElement.innerText = total.toFixed(2);
        updateCartBadge();

        // Listeners en items del carrito
        cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                cart = cart.filter(p => p.id !== id);
                saveCart();
                renderCart();
            });
        });

        cartItemsContainer.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const isPlus = e.currentTarget.classList.contains('plus');
                const targetItem = cart.find(p => p.id === id);
                if (!targetItem) return;

                if (isPlus) {
                    targetItem.quantity += 1;
                } else {
                    targetItem.quantity -= 1;
                    if (targetItem.quantity <= 0) {
                        cart = cart.filter(p => p.id !== id);
                    }
                }
                saveCart();
                renderCart();
            });
        });
    }

    function clearCart() {
        cart = [];
        saveCart();
        renderCart();
        showToast('Carrito vaciado', 'bi-trash3');
    }

    // Asociar botones "Agregar al carrito"
    document.querySelectorAll('.agregar-carrito, .btn-cart').forEach(btn => {
        btn.addEventListener('click', addItemToCart);
    });

    if (openCartBtn) openCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);


    // --- 4. CHECKOUT MODAL Y PEDIDO WHATSAPP ---
    if (btnPagar) {
        btnPagar.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Tu carrito está vacío 😿', 'bi-exclamation-triangle');
                return;
            }
            closeCart();
            if (checkoutModal) {
                checkoutModal.classList.add('active');
                if (orderForm) orderForm.style.display = 'block';
                if (orderSuccess) orderSuccess.style.display = 'none';
            }
        });
    }

    if (closeCheckoutBtn && checkoutModal) {
        closeCheckoutBtn.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
        });
    }

    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                checkoutModal.classList.remove('active');
            }
        });
    }

    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', () => {
            const name = inputName && inputName.value.trim() ? inputName.value.trim() : 'Cliente';
            const phone = inputPhone ? inputPhone.value.trim() : '';
            const email = inputEmail ? inputEmail.value.trim() : '';

            if (!phone || phone.length < 8) {
                alert('Por favor ingresa un número de teléfono válido para contactarte 📞');
                return;
            }

            let mensaje = `☕ *¡HOLA CATFETERÍA! Deseo realizar el siguiente pedido:*%0A%0A`;
            let total = 0;
            cart.forEach(item => {
                const subtotal = item.price * item.quantity;
                total += subtotal;
                mensaje += `• *${item.quantity}x* ${item.title} ($${subtotal.toFixed(2)})%0A`;
            });

            mensaje += `%0A------------------------------------%0A`;
            mensaje += `💰 *TOTAL A PAGAR: $${total.toFixed(2)}*%0A`;
            mensaje += `------------------------------------%0A`;
            mensaje += `👤 *Cliente:* ${name}%0A`;
            mensaje += `📞 *Teléfono:* ${phone}%0A`;
            if (email) mensaje += `📧 *Email:* ${email}%0A`;
            mensaje += `📍 *Ubicación de entrega / Retiro en Catfetería*`;

            const numeroWhatsApp = '593983958430';
            const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
            window.open(url, '_blank');

            // Guardar en historial local
            try {
                const orderData = {
                    id: Date.now(),
                    date: new Date().toISOString(),
                    total: total.toFixed(2),
                    items: [...cart],
                    client: { name, phone, email }
                };
                const history = JSON.parse(localStorage.getItem('orderHistory')) || [];
                history.unshift(orderData);
                localStorage.setItem('orderHistory', JSON.stringify(history));
            } catch (err) {
                console.error('Error saving order history', err);
            }

            clearCart();
            if (orderForm) orderForm.style.display = 'none';
            if (orderSuccess) orderSuccess.style.display = 'block';
        });
    }

    const closeSuccessBtn = document.getElementById('btn-close-success');
    if (closeSuccessBtn && checkoutModal) {
        closeSuccessBtn.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
        });
    }


    // --- 5. MODAL DE ADOPCIONES PRO ---
    const adoptionModal = document.getElementById('adoption-modal');
    const closeAdoptionBtn = document.getElementById('close-adoption');
    const sendAdoptionBtn = document.getElementById('btn-send-adoption');
    const closeAdoptionSuccess = document.getElementById('btn-close-adoption-success');
    const adoptionForm = document.getElementById('adoption-form');
    const adoptionSuccess = document.getElementById('adoption-success');
    const adoptionTitle = document.getElementById('adoption-title');
    const adoptionCatAvatar = document.getElementById('adoption-cat-avatar');
    const adoptionCatNameSpan = document.getElementById('adoption-cat-name-span');

    const inputAdoptName = document.getElementById('adopt-name');
    const inputAdoptPhone = document.getElementById('adopt-phone');
    const inputAdoptEmail = document.getElementById('adopt-email');
    const inputAdoptReason = document.getElementById('adopt-reason');

    let currentCat = { name: '', image: '', age: '' };

    function openAdoptionModal(e) {
        e.preventDefault();
        const button = e.currentTarget || e.target;
        const card = button.closest('.custom-card, .gato');

        let catName = button.getAttribute('data-nombre');
        let catImage = button.getAttribute('data-imagen');
        let catAge = button.getAttribute('data-edad');

        if (!catName && card) {
            const h3 = card.querySelector('h3');
            if (h3) catName = h3.innerText.trim();
        }
        if (!catImage && card) {
            const img = card.querySelector('img');
            if (img) catImage = img.src;
        }

        currentCat = {
            name: catName || 'un lindo michi',
            image: catImage || '/static/Imagenes/Menu y Promos/Gatitos.png',
            age: catAge || ''
        };

        if (adoptionTitle) adoptionTitle.innerText = `Solicitud para adoptar a ${currentCat.name} 🐾`;
        if (adoptionCatAvatar) adoptionCatAvatar.src = currentCat.image;
        if (adoptionCatNameSpan) adoptionCatNameSpan.innerText = currentCat.name;

        if (adoptionModal) {
            adoptionModal.classList.add('active');
            if (adoptionForm) adoptionForm.style.display = 'block';
            if (adoptionSuccess) adoptionSuccess.style.display = 'none';
        }
    }

    document.querySelectorAll('.Adoptar, .btn-adopt').forEach(btn => {
        btn.addEventListener('click', openAdoptionModal);
    });

    if (closeAdoptionBtn && adoptionModal) {
        closeAdoptionBtn.addEventListener('click', () => {
            adoptionModal.classList.remove('active');
        });
    }

    if (adoptionModal) {
        adoptionModal.addEventListener('click', (e) => {
            if (e.target === adoptionModal) {
                adoptionModal.classList.remove('active');
            }
        });
    }

    if (sendAdoptionBtn) {
        sendAdoptionBtn.addEventListener('click', () => {
            const name = inputAdoptName ? inputAdoptName.value.trim() : '';
            const phone = inputAdoptPhone ? inputAdoptPhone.value.trim() : '';
            const email = inputAdoptEmail ? inputAdoptEmail.value.trim() : '';
            const reason = inputAdoptReason ? inputAdoptReason.value.trim() : '';

            if (!name || !phone) {
                alert('Por favor ingresa al menos tu nombre y número de teléfono 🐱');
                return;
            }

            let mensaje = `🐾 *SOLICITUD DE ADOPCIÓN RESPONSABLE - CATFETERÍA*%0A%0A`;
            mensaje += `🐈 *Gatito de interés:* ${currentCat.name}%0A`;
            mensaje += `------------------------------------%0A`;
            mensaje += `👤 *Postulante:* ${name}%0A`;
            mensaje += `📞 *Teléfono:* ${phone}%0A`;
            if (email) mensaje += `📧 *Email:* ${email}%0A`;
            if (reason) mensaje += `📝 *Motivo / Experiencia:* ${reason}%0A`;
            mensaje += `%0A¡Me encantaría coordinar una visita al Cat Café para conocerlo(a)!`;

            const numeroWhatsApp = '593983958430';
            const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
            window.open(url, '_blank');

            if (adoptionForm) adoptionForm.style.display = 'none';
            if (adoptionSuccess) adoptionSuccess.style.display = 'block';
        });
    }

    if (closeAdoptionSuccess && adoptionModal) {
        closeAdoptionSuccess.addEventListener('click', () => {
            adoptionModal.classList.remove('active');
        });
    }


    // --- 6. FILTRO DE CATEGORÍAS EN MENÚ Y TIENDA ---
    const filterButtons = document.querySelectorAll('.filter-tab-btn');
    const filterCards = document.querySelectorAll('.cards-grid .custom-card');

    if (filterButtons.length > 0 && filterCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');

                const selectedCategory = button.getAttribute('data-filter');

                filterCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-categoria');
                    if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                        card.style.display = 'flex';
                        card.style.animation = 'fadeInUp 0.4s ease forwards';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- 7. BUSCADOR EN VIVO DE PRODUCTOS ---
    const searchInput = document.getElementById('product-search');
    if (searchInput && filterCards.length > 0) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            filterCards.forEach(card => {
                const title = card.querySelector('h3') ? card.querySelector('h3').innerText.toLowerCase() : '';
                const desc = card.querySelector('.card-desc') ? card.querySelector('.card-desc').innerText.toLowerCase() : '';

                if (title.includes(query) || desc.includes(query)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }


    // --- 8. SCROLL REVEAL OBSERVER ---
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal-on-scroll, .content-section, .custom-card').forEach(el => {
            el.classList.add('reveal-on-scroll');
            observer.observe(el);
        });
    }

    // Inicializar carrito
    loadCart();
});
