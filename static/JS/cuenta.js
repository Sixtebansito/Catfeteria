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
    
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        if (e.target.value.length > 10) {
            e.target.value = e.target.value.slice(0, 10);
        }
    });

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
            mostrarError(emailInput, "Correo inválido (falta @ o el punto)");
            hayErrores = true;
        }

        if (hayErrores) {
            return;
        }

        const userProfile = {
            name: name,
            phone: phone,
            email: email
        };

        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        alert("¡Datos guardados correctamente! ✅");
        checkUserSession();
    });

    
    function mostrarError(input, mensaje) {
        input.style.border = "2px solid red";
        input.style.backgroundColor = "#ffebee";

        let errorMsg = input.nextElementSibling;
        
        if (!errorMsg || !errorMsg.classList.contains('error-text')) {
            errorMsg = document.createElement('small');
            errorMsg.classList.add('error-text');
            errorMsg.style.color = "red";
            errorMsg.style.display = "block";
            errorMsg.style.marginTop = "-15px";
            errorMsg.style.marginBottom = "15px";
            input.parentNode.insertBefore(errorMsg, input.nextSibling);
        }
        errorMsg.innerText = mensaje;
    }

    function limpiarErroresVisuales() {
        [nameInput, phoneInput, emailInput].forEach(input => {
            input.style.border = "1px solid #ddd";
            input.style.backgroundColor = "white";
            
            const nextElement = input.nextElementSibling;
            if (nextElement && nextElement.classList.contains('error-text')) {
                nextElement.remove();
            }
        });
    }

    
    btnLogout.addEventListener('click', () => {

        localStorage.removeItem('userProfile');
        localStorage.removeItem('orderHistory');
        loginSection.style.display = 'block';
        profileSection.style.display = 'none';
        
        const user = JSON.parse(localStorage.getItem('userProfile'));
        if(user) {
            nameInput.value = user.name;
            phoneInput.value = user.phone;
            emailInput.value = user.email;
        }
    });

    function checkUserSession() {
        const storedUser = localStorage.getItem('userProfile');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            loginSection.style.display = 'none';
            profileSection.style.display = 'block';
            
            displayName.innerText = user.name;
            displayEmail.innerText = user.email;
            displayPhone.innerText = user.phone;
            
            loadOrderHistory();
        } else {
            loginSection.style.display = 'block';
            profileSection.style.display = 'none';
        }
    }

    function loadOrderHistory() {
        const history = localStorage.getItem('orderHistory');
        if (history) {
            const orders = JSON.parse(history);
            if(orders.length === 0) {
                ordersList.innerHTML = '<p class="no-orders">Aún no has realizado pedidos.</p>';
                return;
            }
            ordersList.innerHTML = ''; 
            orders.reverse().forEach(order => {
                const date = new Date(order.date).toLocaleDateString();
                let itemsHtml = '';
                order.items.forEach(item => {
                    itemsHtml += `<li>${item.quantity}x ${item.title} ($${item.price})</li>`;
                });
                const orderCard = document.createElement('div');
                orderCard.classList.add('order-card');
                orderCard.innerHTML = `
                    <div class="order-header">
                        <span>📅 ${date}</span>
                        <span style="color: green;">Completado</span>
                    </div>
                    <div class="order-items"><ul>${itemsHtml}</ul></div>
                    <div class="order-total">Total: $${order.total}</div>
                `;
                ordersList.appendChild(orderCard);
            });
        }
    }
    
    checkUserSession();
});