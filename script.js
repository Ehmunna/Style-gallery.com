// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const orderModal = document.getElementById('orderModal');
const orderForm = document.getElementById('orderForm');
const closeModal = document.querySelector('.close-modal');
const successToast = document.getElementById('successToast');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Global Firebase variables
let db = null;
let currentProductCode = '';

// Wait for Firebase to be ready
window.addEventListener('firebaseReady', () => {
    console.log('🔥 Firebase is ready, initializing...');
    if (window.firebaseDb) {
        db = window.firebaseDb;
        loadProducts();
    }
});

// Also try to initialize after a delay
setTimeout(() => {
    if (!db && window.firebaseDb) {
        db = window.firebaseDb;
        loadProducts();
    } else if (!db) {
        console.log('⚠️ Firebase not ready, trying direct initialization...');
        initializeFirebaseDirectly();
    }
}, 1000);

// Direct Firebase initialization if needed
async function initializeFirebaseDirectly() {
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        
        const firebaseConfig = {
            apiKey: "AIzaSyC2Bsd-HqfhhC8i5cQUF2ZmofUJaFIcvDs",
            authDomain: "lamim-754aa.firebaseapp.com",
            projectId: "lamim-754aa",
            storageBucket: "lamim-754aa.firebasestorage.app",
            messagingSenderId: "1087897423283",
            appId: "1:1087897423283:web:10a57c0acf8879fc1e4fc6",
            measurementId: "G-R5SNM13YMG"
        };
        
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log('✅ Firebase initialized directly');
        loadProducts();
        
    } catch (error) {
        console.error('❌ Direct Firebase init failed:', error);
        showError('Failed to connect to server. Please refresh the page.');
    }
}

// Load products from Firestore
async function loadProducts() {
    if (!db) {
        console.log('Database not ready, waiting...');
        setTimeout(loadProducts, 1000);
        return;
    }
    
    try {
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);
        
        productsGrid.innerHTML = '';
        
        if (snapshot.empty) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open" style="font-size: 3rem; color: #9ca3af; margin-bottom: 1rem;"></i>
                    <p>No products available at the moment.</p>
                    <p class="small-text">Please check back later or contact admin.</p>
                </div>
            `;
            return;
        }
        
        let productCount = 0;
        snapshot.forEach(doc => {
            const product = doc.data();
            createProductCard(product);
            productCount++;
        });
        
        console.log(`✅ Loaded ${productCount} products`);
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showError('Failed to load products. Please try again later.');
    }
}

// Create product card
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    const discount = product.discount || 0;
    const originalPrice = parseFloat(product.price) || 0;
    const discountedPrice = discount > 0 ? originalPrice - (originalPrice * discount / 100) : originalPrice;
    
    productCard.innerHTML = `
        <div class="product-image">
            <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}" 
                 alt="${product.name}" 
                 onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name || 'Product Name'}</h3>
            <div class="product-price">
                <span class="current-price">$${discountedPrice.toFixed(2)}</span>
                ${discount > 0 ? `
                    <span class="original-price">$${originalPrice.toFixed(2)}</span>
                    <span class="discount">${discount}% OFF</span>
                ` : ''}
            </div>
            <p class="product-code">Product Code: <span>${product.productCode || 'N/A'}</span></p>
            <button class="btn-primary order-btn" 
                    data-product-code="${product.productCode}"
                    data-product-name="${product.name}">
                <i class="fas fa-shopping-cart"></i> Order Now
            </button>
        </div>
    `;
    
    productsGrid.appendChild(productCard);
}

// Show error message
function showError(message) {
    productsGrid.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
            <h3 style="color: #374151; margin-bottom: 1rem;">Oops! Something went wrong</h3>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">${message}</p>
            <button onclick="location.reload()" class="btn-primary" style="margin-top: 1rem;">
                <i class="fas fa-redo"></i> Reload Page
            </button>
        </div>
    `;
}

// Order button click handler
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('order-btn') || e.target.closest('.order-btn')) {
        const button = e.target.classList.contains('order-btn') ? e.target : e.target.closest('.order-btn');
        const productCode = button.dataset.productCode;
        const productName = button.dataset.productName;
        
        if (productCode) {
            openOrderModal(productCode, productName);
        } else {
            alert('Product information is missing. Please try another product.');
        }
    }
});

// Open order modal
function openOrderModal(productCode, productName) {
    console.log('Opening order modal for:', productCode, productName);
    
    // Set product code
    document.getElementById('productCode').value = productCode;
    
    // Optional: Show product name in modal
    const modalTitle = document.querySelector('#orderModal h2');
    if (modalTitle && productName) {
        modalTitle.textContent = `Order: ${productName}`;
    }
    
    // Show modal with animation
    orderModal.style.display = 'flex';
    orderModal.style.opacity = '0';
    orderModal.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        orderModal.style.opacity = '1';
    }, 10);
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('customerName')?.focus();
    }, 300);
}

// Close modal
closeModal.addEventListener('click', () => {
    closeModalFunction();
});

// Close modal function
function closeModalFunction() {
    orderModal.style.opacity = '0';
    setTimeout(() => {
        orderModal.style.display = 'none';
        orderForm.reset();
    }, 300);
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        closeModalFunction();
    }
});

// Form submission
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const location = document.getElementById('location').value.trim();
    const productCode = document.getElementById('productCode').value.trim();
    
    // Validate phone number (Bangladeshi format)
    const phoneRegex = /^(?:\+88|01)?\d{11}$/;
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
        alert('Please enter a valid Bangladeshi phone number (11 digits, e.g., 01712345678)');
        document.getElementById('phoneNumber').focus();
        return;
    }
    
    // Validate other fields
    if (!name || !location || !productCode) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Show loading state
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Submit order
    try {
        const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        
        if (!db) {
            throw new Error('Database not connected');
        }
        
        const orderData = {
            name: name,
            phone: cleanPhone,
            location: location,
            productCode: productCode,
            orderTime: serverTimestamp(),
            status: 'Pending',
            createdAt: new Date().toISOString()
        };
        
        console.log('Submitting order:', orderData);
        
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        
        console.log('✅ Order submitted with ID:', docRef.id);
        
        // Show success message
        showToast(`Order placed successfully! Order ID: ${docRef.id.substring(0, 8)}`);
        
        // Close modal and reset form
        closeModalFunction();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('❌ Error submitting order:', error);
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        alert(`Failed to place order: ${error.message}\n\nPlease try again or contact support.`);
    }
});

// Show toast notification
function showToast(message = 'Order placed successfully!') {
    successToast.querySelector('span').textContent = message;
    successToast.style.display = 'flex';
    
    // Add animation
    successToast.style.animation = 'toastSlide 0.3s ease';
    
    setTimeout(() => {
        successToast.style.display = 'none';
    }, 5000);
}

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.querySelector('i').classList.toggle('fa-bars');
    menuToggle.querySelector('i').classList.toggle('fa-times');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.querySelector('i').classList.remove('fa-times');
        menuToggle.querySelector('i').classList.add('fa-bars');
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Contact form submission
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will contact you soon.');
    e.target.reset();
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('User website loaded');
    
    // Check if Firebase is already initialized
    if (window.firebaseDb) {
        db = window.firebaseDb;
        loadProducts();
    } else if (window.firebaseApp) {
        // Import Firestore and get db
        import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js')
            .then(({ getFirestore }) => {
                db = getFirestore(window.firebaseApp);
                loadProducts();
            })
            .catch(error => {
                console.error('Firestore import error:', error);
                initializeFirebaseDirectly();
            });
    }
    
    // Add CSS for small text
    const style = document.createElement('style');
    style.textContent = `
        .small-text {
            font-size: 0.9rem;
            color: #6b7280;
            margin-top: 0.5rem;
        }
        .order-btn i {
            margin-right: 8px;
        }
    `;
    document.head.appendChild(style);
});