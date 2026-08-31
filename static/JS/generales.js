//HAMBURGUER
const nav = document.querySelector('#nav');
const abrir = document.querySelector('#abrir');
const cerrar = document.querySelector('#cerrar');

abrir.addEventListener('click', () => {
    nav.classList.add("visible");
})

cerrar.addEventListener('click', () => {
    nav.classList.remove("visible");
})

// Funcionalidad del botón "Ir Arriba"
const btnSubir = document.getElementById('btn-subir');

if(btnSubir) {
    btnSubir.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {
    
// Carrito
    // Elementos del Carrito y Checkout
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart');
    const navCartLink = document.querySelector('a[href="#carrito"]');
    const addToCartButtons = document.querySelectorAll('.agregar-carrito');
    
    const btnPagar = document.querySelector('.btn-checkout');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutBtn = document.getElementById('close-checkout');
    const confirmOrderBtn = document.getElementById('btn-confirm-order');
    const closeSuccessBtn = document.getElementById('btn-close-success');
    
    const inputName = document.getElementById('client-name'); 
    const inputPhone = document.getElementById('client-phone');
    const inputEmail = document.getElementById('client-email');
    
    const orderForm = document.getElementById('order-form');
    const orderSuccess = document.getElementById('order-success');

    const adoptionModal = document.getElementById('adoption-modal');
    const closeAdoptionBtn = document.getElementById('close-adoption');
    const sendAdoptionBtn = document.getElementById('btn-send-adoption');
    const closeAdoptionSuccess = document.getElementById('btn-close-adoption-success');
    const adoptionForm = document.getElementById('adoption-form');
    const adoptionSuccess = document.getElementById('adoption-success');
    const adoptionTitle = document.getElementById('adoption-title'); 

    const inputAdoptName = document.getElementById('adopt-name');
    const inputAdoptPhone = document.getElementById('adopt-phone');
    const inputAdoptEmail = document.getElementById('adopt-email');
    const inputAdoptReason = document.getElementById('adopt-reason');

    const adoptButtons = document.querySelectorAll('.Adoptar');

    let cart = [];
    let selectedCatName = ""; 


    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (userProfile) {
        if(inputName) inputName.value = userProfile.name;
        if(inputPhone) inputPhone.value = userProfile.phone;
        if(inputEmail) inputEmail.value = userProfile.email;

        if(inputAdoptName) inputAdoptName.value = userProfile.name;
        if(inputAdoptPhone) inputAdoptPhone.value = userProfile.phone;
        if(inputAdoptEmail) inputAdoptEmail.value = userProfile.email;
    }



    function loadCart() {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            renderCart();
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function openCart(e) {
        if(e) e.preventDefault();
        cartOverlay.classList.add('active');
        cartSidebar.classList.add('active');
    }

    function closeCart() {
        cartOverlay.classList.remove('active');
        cartSidebar.classList.remove('active');
    }

    function addItem(e) {
        e.preventDefault();
        const button = e.target;
        const parent = button.closest('.suplemento'); 
        
        const id = button.getAttribute('data-id');
        const imageSrc = parent.querySelector('img').src;
        const title = parent.querySelector('h3').innerText;
        const priceText = parent.querySelector('.precio').innerText; 
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, title, price, image: imageSrc, quantity: 1 });
        }
        saveCart();
        renderCart();
        openCart(); 
    }

    function renderCart() {
        cartItemsContainer.innerHTML = ''; 
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p style="color: #777; font-size: 0.9em;">Unitario: $${item.price.toFixed(2)}</p>
                    
                    <div class="qty-controls">
                        <button class="qty-btn minus" data-id="${item.id}">-</button>
                        <span class="qty-number">${item.quantity}</span>
                        <button class="qty-btn plus" data-id="${item.id}">+</button>
                    </div>

                    <p style="font-weight: bold; margin-top: 5px;">Subtotal: $${itemTotal.toFixed(2)}</p>
                </div>
                <span class="remove-item" data-id="${item.id}" style="align-self: flex-start;">&times;</span>
            `;
            cartItemsContainer.appendChild(div);
        });
        cartTotalElement.innerText = total.toFixed(2);
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', removeItem);
        });

        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', changeQuantity);
        });
    }

    function changeQuantity(e) {
        const btn = e.target;
        const id = btn.getAttribute('data-id');
        
        const item = cart.find(prod => prod.id === id);

        if (btn.classList.contains('plus')) {
            item.quantity++;
        } else if (btn.classList.contains('minus')) {
            item.quantity--;
            if (item.quantity < 1) {
                item.quantity = 1; 
            }
        }

        saveCart();
        renderCart();
    }

    function removeItem(e) {
        const id = e.target.getAttribute('data-id');
        cart = cart.filter(item => item.id !== id);
        saveCart();
        renderCart();
    }

    function clearCart() {
        cart = [];
        saveCart();
        renderCart();
    }


    if(btnPagar) {
        btnPagar.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Tu carrito está vacío 😿");
                return;
            }
            closeCart(); 
            checkoutModal.classList.add('active');
            orderForm.style.display = 'block';
            orderSuccess.style.display = 'none';
        });
    }
    if(closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
        });
    }

    if(confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', () => {
            const name = inputName ? inputName.value : "Invitado"; 
            const phone = inputPhone.value;
            const email = inputEmail.value;

            // Validación
            if (phone.length != 10 || email.indexOf('@') == -1) {
                alert("El teléfono debe tener 10 dígitos y el correo debe tener un @");
                return;
            }
            if(phone === '' || email === '') {
                alert("Por favor completa todos los campos 😽");
                return;
            }

            let mensaje = `Hola Catfetería, soy ${name}, quiero realizar el siguiente pedido:%0A%0A`;
            
            let total = 0;
            cart.forEach(item => {
                const subtotal = item.price * item.quantity;
                total += subtotal;
                mensaje += `- ${item.quantity}x ${item.title} ($${subtotal.toFixed(2)})%0A`;
            });

            mensaje += `%0A*Total a Pagar: $${total.toFixed(2)}*%0A`;
            mensaje += `%0A----------------%0A`;
            mensaje += `*Datos del Cliente:*%0A`;
            mensaje += `👤 Nombre: ${name}%0A`;
            mensaje += `📞 Tel: ${phone}%0A`;
            mensaje += `📧 Email: ${email}`;

            const numeroWhatsApp = "593983958430"; 
            const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
            window.open(url, '_blank');

            const nuevoPedido = {
                date: new Date(),
                items: cart,
                total: total.toFixed(2),
                client: { name: name }
            };

            let historial = JSON.parse(localStorage.getItem('orderHistory')) || [];
            historial.push(nuevoPedido);
            localStorage.setItem('orderHistory', JSON.stringify(historial));

            orderForm.style.display = 'none';
            orderSuccess.style.display = 'block';
            clearCart();
        });
    }

    if(closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
        });
    }

// Adopciones
    function openAdoptionModal(e) {
        e.preventDefault();
        
        const button = e.target;
        const parent = button.closest('.gato');
        selectedCatName = parent.querySelector('h3').innerText;

        adoptionTitle.innerText = `¿Quieres adoptar a ${selectedCatName}? 😻`;

        adoptionModal.classList.add('active');
        adoptionForm.style.display = 'block';
        adoptionSuccess.style.display = 'none';
    }

    function sendAdoptionToWhatsapp() {
        const name = inputAdoptName.value;
        const phone = inputAdoptPhone.value;
        const email = inputAdoptEmail.value;
        const reason = inputAdoptReason.value;

        if (phone.length != 10 || email.indexOf('@') == -1) {
            alert("El teléfono debe tener 10 dígitos y el correo debe tener un @");
            return;
        }

        if(name === '' || phone === '' || reason === '') {
            alert("Por favor llena los campos obligatorios 😿");
            return;
        }

        let mensaje = `Hola Catfetería, estoy interesado en una adopción 🐾%0A%0A`;
        mensaje += `🐈 *Gato de interés:* ${selectedCatName}%0A`;
        mensaje += `----------------%0A`;
        mensaje += `👤 *Nombre:* ${name}%0A`;
        mensaje += `📞 *Teléfono:* ${phone}%0A`;
        mensaje += `📧 *Email:* ${email}%0A`;
        mensaje += `📝 *Razón de adopción:* ${reason}`;

        const numeroWhatsApp = "593983958430";
        const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
        window.open(url, '_blank');

        adoptionForm.style.display = 'none';
        adoptionSuccess.style.display = 'block';
        
        inputAdoptName.value = '';
        inputAdoptPhone.value = '';
        inputAdoptEmail.value = '';
        inputAdoptReason.value = '';
    }

    if(adoptButtons) {
        adoptButtons.forEach(btn => {
            btn.addEventListener('click', openAdoptionModal);
        });
    }

    if(closeAdoptionBtn) {
        closeAdoptionBtn.addEventListener('click', () => {
            adoptionModal.classList.remove('active');
        });
    }

    if(sendAdoptionBtn) {
        sendAdoptionBtn.addEventListener('click', sendAdoptionToWhatsapp);
    }

    if(closeAdoptionSuccess) {
        closeAdoptionSuccess.addEventListener('click', () => {
            adoptionModal.classList.remove('active');
        });
    }

    if(adoptionModal) {
        adoptionModal.addEventListener('click', (e) => {
            if(e.target === adoptionModal) {
                adoptionModal.classList.remove('active');
            }
        });
    }

    loadCart();
    addToCartButtons.forEach(btn => btn.addEventListener('click', addItem));
    if (navCartLink) navCartLink.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    clearCartBtn.addEventListener('click', clearCart);

});