import { getProducts } from './api.js';

// المتغيرات العامة
let allProducts = [];
let currentCategory = 'الكل';

// تشغيل الأبلكيشن عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.getElementById('products-grid');
    
    // 1. جلب البيانات من Google Sheets
    allProducts = await getProducts();
    
    if (allProducts.length === 0) {
        productsContainer.innerHTML = '<div class="loader">لا توجد منتجات حالياً أو هناك خطأ في الاتصال.</div>';
        return;
    }

    // 2. تجهيز الأقسام (Tabs)
    renderTabs();

    // 3. عرض المنتجات لأول مرة
    renderProducts(allProducts);
});

// وظيفة عرض الأقسام
function renderTabs() {
    const tabsContainer = document.getElementById('category-nav');
    const categories = ['الكل', ...new Set(allProducts.map(p => p.Category))];

    tabsContainer.innerHTML = categories.map(cat => `
        <button class="tab-item ${cat === currentCategory ? 'active' : ''}" 
                data-category="${cat}">
            ${cat}
        </button>
    `).join('');

    // إضافة مستمع للأحداث عند الضغط على قسم
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
    
    productsContainer.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.ImageURL || 'https://via.placeholder.com/150'}" class="product-image" alt="${p.Name}">
            <div class="product-details">
                <h3 style="font-size: 1rem; margin: 10px 0;">${p.Name}</h3>
                <p class="price">${p.Price} ج.م</p>
            </div>
            <button class="add-btn" onclick="alert('سيتم تفعيل السلة في الخطوة القادمة')">إضافة للسلة</button>
        </div>
    `).join('');
}
