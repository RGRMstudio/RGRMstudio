// RGRMstudio - E-commerce functionality
class RGRMStudioStore {
    constructor() {
        this.products = [];
        this.cart = [];
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.initializeCart();
        this.setupSmoothScrolling();
        this.updateCartDisplay(); // Initialize cart display
    }

    loadProducts() {
        // Sample products - Replace with your actual Printful products later
        this.products = [
            {
                id: 1,
                name: "Signature T-Shirt",
                price: 29.99,
                image: "👕",
                description: "Premium cotton t-shirt with exclusive RGRMstudio design"
            },
            {
                id: 2,
                name: "Art Print Collection",
                price: 39.99,
                image: "🖼️",
                description: "Set of 3 high-quality art prints for your space"
            },
            {
                id: 3,
                name: "Designer Hoodie",
                price: 59.99,
                image: "🧥",
                description: "Comfortable hoodie featuring unique RGRMstudio artwork"
            },
            {
                id: 4,
                name: "Limited Edition Poster",
                price: 24.99,
                image: "📰",
                description: "Exclusive limited run poster with numbered certificate"
            },
            {
                id: 5,
                name: "Premium Sticker Pack",
                price: 14.99,
                image: "⭐",
                description: "Collection of 10 high-quality vinyl stickers"
            },
            {
                id: 6,
                name: "Custom Mug",
                price: 19.99,
                image: "☕",
                description: "Ceramic mug with your favorite RGRMstudio design"
            }
        ];

        this.displayProducts();
    }

    displayProducts() {
        const grid = document.getElementById('products-grid');
        
        if (this.products.length === 0) {
            grid.innerHTML = '<div class="loading">Coming soon! New products launching shortly.</div>';
            return;
        }

        grid.innerHTML = this.products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    ${product.image}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">$${product.price}</div>
                    <button class="buy-button" onclick="store.addToCart(${product.id})">
                        Add to Cart 🛒
                    </button>
                </div>
            </div>
        `).join('');
    }

    initializeCart() {
        if (!localStorage.getItem('rgrstudio_cart')) {
            localStorage.setItem('rgrstudio_cart', JSON.stringify([]));
        } else {
            this.cart = JSON.parse(localStorage.getItem('rgrstudio_cart'));
        }
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        
        if (product) {
            this.cart.push({
                ...product,
                cartId: Date.now()
            });
            localStorage.setItem('rgrstudio_cart', JSON.stringify(this.cart));
            this.showNotification(`🎉 ${product.name} added to cart!`);
            this.updateCartDisplay();
        }
    }

    updateCartDisplay() {
        // Update cart count
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.cart.length;
        }

        // Update cart items
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        if (this.cart.length === 0) {
            if (cartItems) cartItems.innerHTML = '<p>Your cart is empty</p>';
            if (cartTotal) cartTotal.textContent = 'Total: $0.00';
        } else {
            if (cartItems) {
                cartItems.innerHTML = this.cart.map(item => `
                    <div class="cart-item">
                        <div>
                            <strong>${item.name}</strong>
                            <br>
                            <small>$${item.price}</small>
                        </div>
                        <button onclick="store.removeFromCart(${item.cartId})" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Remove</button>
                    </div>
                `).join('');
            }

            const total = this.cart.reduce((sum, item) => sum + item.price, 0);
            if (cartTotal) cartTotal.textContent = `Total: $${total.toFixed(2)}`;
        }
    }

    removeFromCart(cartId) {
        this.cart = this.cart.filter(item => item.cartId !== cartId);
        localStorage.setItem('rgrstudio_cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
        this.showNotification('Item removed from cart');
    }

    openCart() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }

    closeCart() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!');
            return;
        }
        this.showNotification('🚀 Checkout functionality coming soon!');
        // Here you would integrate with Stripe or another payment processor
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--secondary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 1001;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    setupEventListeners() {
        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = e.target.querySelector('input[type="email"]').value;
                this.handleNewsletterSignup(email);
            });
        }

        // Cart icon click
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                this.openCart();
            });
        }

        // Overlay click to close cart
        const overlay = document.getElementById('cart-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeCart();
            });
        }

        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    handleScroll() {
        const navbar = document.querySelector('.navbar');
        if (navbar && window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else if (navbar) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        }
    }

    handleNewsletterSignup(email) {
        this.showNotification('📧 Welcome to RGRMstudio! Thanks for subscribing.');
        const form = document.getElementById('newsletter-form');
        if (form) form.reset();
        console.log('New RGRMstudio subscriber:', email);
    }
}

// Initialize the store when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.store = new RGRMStudioStore();
});
