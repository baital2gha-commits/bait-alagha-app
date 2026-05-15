
import { getProducts } from './api.js';
import { addToCart, updateCartUI, sendOrderToWhatsApp, getLocation } from './cart.js'; 

// المتغيرات العامة
let allProducts = [];
let currentCategory = 'الكل';

// تشغيل الأبلكيشن عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.getElementById('products-grid');
    
    // استرجاع بيانات العميل المخزنة تلقائياً
    const savedName = localStorage.getItem('cust_name');
    const savedPhone = localStorage.getItem('cust_phone');
    const savedAddress = localStorage.getItem('cust_address');

    if (savedName) document.getElementById('cust-name').value = savedName;
    if (savedPhone) document.getElementById('cust-phone').value = savedPhone;
    if (savedAddress) document.getElementById('cust-location').value = savedAddress;

    updateCartUI();
    
    allProducts = await getProducts();
    
    if (allProducts.length === 0) {
        productsContainer.innerHTML = '<div class="loader">جاري تحميل المنتجات أو تأكد من الاتصال...</div>';
        return;
    }

    renderTabs();
    renderProducts(allProducts);
    setupMainTabs(); // تفعيل التنقل بين الأقسام الرئيسية

    const cartBtn = document.getElementById('cart-floating-btn');
    const modal = document.getElementById('cart-modal');
    const closeBtn = document.querySelector('.close-modal');
    const submitBtn = document.getElementById('submit-order-btn');
    const locBtn = document.getElementById('get-loc-btn');
    
    if (cartBtn) {
        cartBtn.onclick = () => {
            modal.style.display = "block";
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = "none";
        };
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    if (locBtn) {
        locBtn.onclick = () => {
            getLocation();
        };
    }

    if (submitBtn) {
        submitBtn.onclick = () => {
            sendOrderToWhatsApp();
        };
    }
});

// --- دالة التحكم في التبويبات والسلايدر المتوافق مع العربية ---
function setupMainTabs() {
    const mainTabButtons = document.querySelectorAll('.main-tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const sliderTrack = document.querySelector('.slider-track');

    mainTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');

            mainTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === target) panel.classList.add('active');
            });

            // تحكم ذكي: يبدأ السلايدر فقط عند فتح تبويب "بيت الآغا"
            if (target === 'about-section') {
                startAutoSlider();
            } else {
                stopAutoSlider();
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // التوقف عند الضغط أو اللمس
    if (sliderTrack) {
        sliderTrack.addEventListener('touchstart', stopAutoSlider);
        sliderTrack.addEventListener('mousedown', stopAutoSlider);
        
        // إعادة التشغيل بعد 5 ثوانٍ من ترك الشاشة (فقط إذا كان التبويب لا يزال مفتوحاً)
        sliderTrack.addEventListener('touchend', () => {
            setTimeout(() => {
                const aboutActive = document.getElementById('about-section').classList.contains('active');
                if (aboutActive) startAutoSlider();
            }, 5000);
        });
    }
}

function renderTabs() {
    const tabsContainer = document.getElementById('category-nav');
    if (!tabsContainer) return;
    
    const categories = ['الكل', ...new Set(allProducts.map(p => p.Category))];

    tabsContainer.innerHTML = categories.map(cat => `
        <button class="tab-item ${cat === currentCategory ? 'active' : ''}" 
                data-category="${cat}">
            ${cat}
        </button>
    `).join('');

    document.querySelectorAll('.tab-item').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            filterByCategory(button.getAttribute('data-category'));
        });
    });
}

function filterByCategory(category) {
    if (category === 'الكل') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.Category === category);
        renderProducts(filtered);
    }
}

function renderProducts(products) {
    const productsContainer = document.getElementById('products-grid');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.ImageURL || 'https://via.placeholder.com/150'}" alt="${p.Name}">
            <div class="product-info">
                <h3 class="product-name">${p.Name}</h3>
                <span class="product-price">${p.Price} ج.م</span>
            </div>
            <button class="add-to-cart-btn" data-id="${p.ID}" aria-label="إضافة للسلة">
                🛒
            </button>
        </div>
    `).join('');

    attachAddEvents();
}

function attachAddEvents() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-id');
            const product = allProducts.find(p => p.ID == productId);
            if (product) {
                addToCart(product);
                const originalContent = button.innerHTML;
                button.innerHTML = "✓";
                button.style.background = "#28a745";
                setTimeout(() => {
                    button.innerHTML = originalContent;
                    button.style.background = "var(--gold)";
                }, 800);
            }
        });
    });
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('✅ Service Worker تم تسجيله بنجاح'))
            .catch(err => console.log('❌ فشل تسجيل Service Worker:', err));
    });
}

// --- منطق السلايدر التلقائي المطور (RTL) ---
let sliderInterval;
let currentIndex = 0;

function startAutoSlider() {
    stopAutoSlider(); // مسح أي عداد قديم
    const sliderTrack = document.querySelector('.slider-track');
    const images = document.querySelectorAll('.slider-track img');
    
    if (!sliderTrack || images.length === 0) return;

    sliderInterval = setInterval(() => {
        currentIndex++;
        if (currentIndex >= images.length) {
            currentIndex = 0;
        }
        
        const width = sliderTrack.clientWidth;
        
        // في وضع العربي (RTL)، التمرير لليسار (للصورة التالية) يتطلب قيمة سالبة في معظم المتصفحات
        sliderTrack.scrollTo({
            left: -(width * currentIndex),
            behavior: 'smooth'
        });
    }, 3000); // التحرك كل 3 ثوانٍ
}

function stopAutoSlider() {
    if (sliderInterval) clearInterval(sliderInterval);
}
