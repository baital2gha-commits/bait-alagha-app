import { getProducts } from './api.js';
import { addToCart, updateCartUI, sendOrderToWhatsApp, getLocation } from './cart.js'; 

// المتغيرات العامة
let allProducts = [];
let currentCategory = 'الكل';

// تشغيل الأبلكيشن عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.getElementById('products-grid');
    
    // تحديث عداد السلة من التخزين المحلي عند الفتح
    updateCartUI();
    
    // 1. جلب البيانات من Google Sheets
    allProducts = await getProducts();
    
    if (allProducts.length === 0) {
        productsContainer.innerHTML = '<div class="loader">جاري تحميل المنتجات أو تأكد من الاتصال...</div>';
        return;
    }

    // 2. تجهيز الأقسام (Tabs)
    renderTabs();

    // 3. عرض المنتجات لأول مرة
    renderProducts(allProducts);

    // --- منطق التحكم في نافذة السلة (Modal) والعناصر التفاعلية ---
    const cartBtn = document.getElementById('cart-floating-btn');
    const modal = document.getElementById('cart-modal');
    const closeBtn = document.querySelector('.close-modal');
    const submitBtn = document.getElementById('submit-order-btn');
    const locBtn = document.getElementById('get-loc-btn');
    
    // فتح السلة
    if (cartBtn) {
        cartBtn.onclick = () => {
            modal.style.display = "block";
        };
    }

    // إغلاق السلة عند الضغط على (X)
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = "none";
        };
    }

    // إغلاق السلة عند الضغط خارج النافذة
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // ربط زر الموقع بوظيفة الـ GPS
    if (locBtn) {
        locBtn.onclick = () => {
            getLocation();
        };
    }

    // ربط زر الإرسال بوظيفة الواتساب
    if (submitBtn) {
        submitBtn.onclick = () => {
            sendOrderToWhatsApp();
        };
    }
});

// وظيفة عرض الأقسام
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

// وظيفة فلترة المنتجات
function filterByCategory(category) {
    if (category === 'الكل') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.Category === category);
        renderProducts(filtered);
    }
}

// وظيفة عرض المنتجات في الشبكة
function renderProducts(products) {
    const productsContainer = document.getElementById('products-grid');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.ImageURL || 'https://via.placeholder.com/150'}" class="product-image" alt="${p.Name}">
            <div class="product-details">
                <h3 style="font-size: 1rem; margin: 10px 0;">${p.Name}</h3>
                <p class="price">${p.Price} ج.م</p>
            </div>
            <button class="add-btn" data-id="${p.ID}">إضافة للسلة</button>
        </div>
    `).join('');

    attachAddEvents();
}

// ربط أحداث الضغط بأزرار الإضافة
function attachAddEvents() {
    document.querySelectorAll('.add-btn').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            const product = allProducts.find(p => p.ID == productId);
            if (product) {
                addToCart(product);
                button.innerText = "تمت الإضافة ✓";
                button.style.background = "#28a745";
                setTimeout(() => {
                    button.innerText = "إضافة للسلة";
                    button.style.background = "#d4af37";
                }, 1000);
            }
        });
    });
}
