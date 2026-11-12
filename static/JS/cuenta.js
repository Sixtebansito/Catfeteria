document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. REFERENCIAS AL DOM ---
    const loginSection = document.getElementById('login-section');
    const profileSection = document.getElementById('profile-section');
    const profileForm = document.getElementById('profile-form');
    
    const nameInput = document.getElementById('user-name');
    const phoneInput = document.getElementById('user-phone');
    const emailInput = document.getElementById('user-email');

    const displayName = document.getElementById('display-name');
    const displayEmail = document.getElementById('display-email');
    const displayPhone = document.getElementById('display-phone');
    const btnLogout = document.getElementById('btn-logout');
    const ordersList = document.getElementById('orders-list');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            if (e.target.value.length > 10) {
                e.target.value = e.target.value.slice(0, 10);
            }
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            limpiarErroresVisuales();

            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            const email = emailInput.value.trim();
            
            let hayErrores = false;

            if (phone.length !== 10) {
                mostrarError(phoneInput, "El teléfono debe tener 10 dígitos exactos");
                hayErrores = true;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                mostrarError(emailInput, "Correo inválido (falta @ o el dominio)");
                hayErrores = true;
            }

            if (hayErrores) return;

            const userProfile = {
                name: name,
                phone: phone,
                email: email
            };

            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            checkUserSession();
        });
    }

    function mostrarError(input, mensaje) {
        input.style.border = "2px solid red";
        input.style.backgroundColor = "#ffebee";

        let errorMsg = input.nextElementSibling;
        if (!errorMsg || !errorMsg.classList.contains('error-text')) {
            errorMsg = document.createElement('small');
            errorMsg.classList.add('error-text');
            errorMsg.style.color = "red";
            errorMsg.style.display = "block";
            errorMsg.style.marginTop = "-10px";
            errorMsg.style.marginBottom = "10px";
            input.parentNode.insertBefore(errorMsg, input.nextSibling);
        }
        errorMsg.innerText = mensaje;
    }

    function limpiarErroresVisuales() {
        [nameInput, phoneInput, emailInput].forEach(input => {
            if (!input) return;
            input.style.border = "";
            input.style.backgroundColor = "";
            
            const nextElement = input.nextElementSibling;
            if (nextElement && nextElement.classList.contains('error-text')) {
                nextElement.remove();
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('userProfile');
            localStorage.removeItem('orderHistory');
            if (loginSection) loginSection.style.display = 'block';
            if (profileSection) profileSection.style.display = 'none';
            if (profileForm) profileForm.reset();
        });
    }

    function checkUserSession() {
        try {
            const storedUser = localStorage.getItem('userProfile');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (loginSection) loginSection.style.display = 'none';
                if (profileSection) profileSection.style.display = 'block';
                
                if (displayName) displayName.innerText = user.name || 'Amigo';
                if (displayEmail) displayEmail.innerText = user.email || '';
                if (displayPhone) displayPhone.innerText = user.phone || '';
                
                loadOrderHistory();
            } else {
                if (loginSection) loginSection.style.display = 'block';
                if (profileSection) profileSection.style.display = 'none';
            }
        } catch (e) {
            if (loginSection) loginSection.style.display = 'block';
            if (profileSection) profileSection.style.display = 'none';
        }
    }

    function loadOrderHistory() {
        if (!ordersList) return;
        try {
            const history = localStorage.getItem('orderHistory');
            if (history) {
                const orders = JSON.parse(history);
                if (!Array.isArray(orders) || orders.length === 0) {
                    ordersList.innerHTML = '<p class="no-orders" style="color: #9c8e84; padding: 15px 0;">Aún no has realizado pedidos.</p>';
                    return;
                }
                ordersList.innerHTML = ''; 
                orders.forEach(order => {
                    const d = new Date(order.date);
                    const dateStr = isNaN(d.getTime()) ? (order.date || 'Reciente') : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                    let itemsHtml = '';
                    if (Array.isArray(order.items)) {
                        order.items.forEach(item => {
                            itemsHtml += `<li><strong>${item.quantity}x</strong> ${item.title} ($${Number(item.price).toFixed(2)})</li>`;
                        });
                    }
                    const orderCard = document.createElement('div');
                    orderCard.classList.add('order-card');
                    orderCard.innerHTML = `
                        <div class="order-header">
                            <span>📅 ${dateStr}</span>
                            <span style="color: #27ae60; font-size: 0.85rem;"><i class="bi bi-whatsapp"></i> Enviado por WhatsApp</span>
                        </div>
                        <div class="order-items"><ul>${itemsHtml}</ul></div>
                        <div class="order-total" style="font-weight: 700; color: #c67d49; margin-top: 8px;">Total: $${order.total}</div>
                    `;
                    ordersList.appendChild(orderCard);
                });
            } else {
                ordersList.innerHTML = '<p class="no-orders" style="color: #9c8e84; padding: 15px 0;">Aún no has realizado pedidos.</p>';
            }
        } catch (e) {
            console.error('Error loading order history', e);
        }
    }
    
    checkUserSession();
});
