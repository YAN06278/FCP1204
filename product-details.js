document.addEventListener('DOMContentLoaded', function() {
    // Notification system
function showNotification(title, message, type = 'success', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.innerHTML = `
        <div class="cart-notification-icon">🛒</div>
        <div class="cart-notification-content">
            <div class="cart-notification-title">${title}</div>
            <div class="cart-notification-message">${message}</div>
        </div>
        <div class="cart-notification-close">&times;</div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Close button handler
    notification.querySelector('.cart-notification-close').addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Auto-hide after duration
    if (duration > 0) {
        setTimeout(() => {
            hideNotification(notification);
        }, duration);
    }
    
    return notification;
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        notification.remove();
    }, 300);
}
    // Track scroll position
    let scrollPosition = 0;
    let currentPopup = null;
    
    // Cart functionality
    let cart = [];
    const cartIcon = document.getElementById('cart-icon');
    const cartDropdown = document.getElementById('cart-dropdown');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCount = document.querySelector('.cart-count');
    
    // Text truncation function
    function truncateTextToLines(element, lineCount) {
        const lineHeight = parseInt(getComputedStyle(element).lineHeight);
        const maxHeight = lineHeight * lineCount;
        
        element.style.height = 'auto';
        element.textContent = element.getAttribute('data-full-text') || element.textContent;
        element.setAttribute('data-full-text', element.textContent);
        
        if (element.scrollHeight > maxHeight) {
            let text = element.textContent;
            while (element.scrollHeight > maxHeight && text.length > 0) {
                text = text.substring(0, text.length - 1);
                element.textContent = text + '...';
            }
        }
    }

    // Toggle cart dropdown
    cartIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        cartDropdown.classList.toggle('show');
    });
    
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        if (!cartIcon.contains(e.target) && !cartDropdown.contains(e.target)) {
            cartDropdown.classList.remove('show');
        }
    });
    
    // Update cart display
    function updateCartDisplay() {
        // Update count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Update items list
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        } else {
            cartItemsList.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name.replace('RMRM', 'RM')}</div>
                        <div class="cart-item-price">RM${item.price.replace('RM', '')}</div>
                        <div class="cart-item-quantity">Qty: ${item.quantity}</div>
                        <div class="cart-item-remove" data-id="${item.id}">Remove</div>
                    </div>
                </div>
            `).join('');
            
            setTimeout(() => {
                document.querySelectorAll('.cart-item-title').forEach(title => {
                    truncateTextToLines(title, 2);
                });
            }, 0);
            
            document.querySelectorAll('.cart-item-remove').forEach(button => {
                button.addEventListener('click', function() {
                    const itemId = this.getAttribute('data-id');
                    removeFromCart(itemId);
                });
            });
        }
        
        // CORRECTED total price calculation
        const totalPrice = cart.reduce((sum, item) => {
            const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
            return sum + (price * item.quantity);
        }, 0);
        cartTotalPrice.textContent = totalPrice.toFixed(2);

        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (cart.length > 0) {
                    window.location.href = 'checkout.html';
                } else {
                    alert('Your cart is empty!');
                }
            });
        }
    }
    
    // Add to cart function
    function addToCart(product) {
        const existingItem = cart.find(item => item.name === product.name);
    
        if (existingItem) {
            existingItem.quantity += product.quantity;
            showNotification(
                'Cart Updated', 
                `Added ${product.quantity} more × ${product.name} to your cart`, 
                'success'
            );
        } else {
            product.id = Date.now().toString();
            cart.push(product);
            showNotification(
                'Added to Cart', 
                `${product.quantity} × ${product.name} added to your cart`, 
                'success'
            );
        }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}
    
    // Remove from cart function
    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }
    
    // Load cart from localStorage
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartDisplay();
        }
    }
    
    // Initialize cart
    loadCart();
    
    // ===== POPUP FUNCTIONS =====
    function closeAllPopups() {
        document.querySelectorAll('.product-popup-overlay').forEach(popup => {
            popup.style.display = 'none';
        });
        currentPopup = null;
        history.replaceState(null, null, ' ');
        window.scrollTo(0, scrollPosition);
    }

    function openPopup(popupId) {
        scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        closeAllPopups();
        
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.style.display = 'flex';
            currentPopup = popup;
            window.location.hash = popupId;
        }
    }

    // ===== CLICK HANDLERS =====
    // Handle popup open clicks
    document.querySelectorAll('[href^="#popup-"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const popupId = this.getAttribute('href').substring(1);
            openPopup(popupId);
        });
    });

    // Handle close button clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-popup') || 
            e.target.classList.contains('product-popup-overlay')) {
            e.preventDefault();
            closeAllPopups();
        }
    });

    // Quantity button functionality
    document.querySelectorAll('.quantity-selector').forEach(selector => {
        const minusBtn = selector.querySelector('.minus');
        const plusBtn = selector.querySelector('.plus');
        const input = selector.querySelector('.qty-input');
        
        const min = parseInt(input.getAttribute('min')) || 1;
        const max = 10;
        
        minusBtn.addEventListener('click', function(e) {
            e.preventDefault();
            let currentValue = parseInt(input.value) || min;
            if (currentValue > min) {
                input.value = currentValue - 1;
            }
        });
        
        plusBtn.addEventListener('click', function(e) {
            e.preventDefault();
            let currentValue = parseInt(input.value) || min;
            if (currentValue < max) {
                input.value = currentValue + 1;
            }
        });
        
        input.addEventListener('change', function() {
            let value = parseInt(this.value) || min;
            if (value < min) {
                this.value = min;
            } else if (value > max) {
                this.value = max;
            } else {
                this.value = value;
            }
        });
    });

    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const popup = this.closest('.product-popup');
            const productName = popup.querySelector('.product-title').textContent;
            const price = popup.querySelector('.price').textContent;
            const quantity = parseInt(popup.querySelector('.qty-input').value) || 1;
            const image = popup.querySelector('.product-image-container img').src;
            
            const cartItem = {
                name: productName,
                price: price,
                quantity: quantity,
                image: image
            };
            
            addToCart(cartItem);
            closeAllPopups();
        });
    });

    // Prevent form submission
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    });

    // Handle initial page load with hash
    if (window.location.hash) {
        const popupId = window.location.hash.substring(1);
        if (popupId.startsWith('popup-')) {
            openPopup(popupId);
        }
    }
});