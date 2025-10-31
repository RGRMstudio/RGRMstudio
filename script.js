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
                cartId: Date.now() // Unique ID for cart item
            });
            localStorage.setItem('rgrstudio_cart', JSON.stringify(this.cart));
            this.showNotification(`🎉 ${product.name} added to cart!`);
            this.updateCartCounter();
        }
    }

    updateCartCounter() {
        // You can add a cart counter in the navigation later
        console.log('Cart items:', this.cart.length);
    }

    showNotification(message) {
        // Create a stylish notification
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
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
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

        // Navbar scroll effect
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
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        }
    }

    handleNewsletterSignup(email) {
        // Show success message
        this.showNotification('📧 Welcome to RGRMstudio! Thanks for subscribing.');
        document.getElementById('newsletter-form').reset();
        
        // In a real scenario, you would send this to your email service
        console.log('New RGRMstudio subscriber:', email);
        
        // You can integrate with Mailchimp, ConvertKit, etc. here
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the store when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.store = new RGRMStudioStore();
});
