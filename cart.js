// cart.js - نظام السلة المطور
let cart = JSON.parse(localStorage.getItem('bait_alagha_cart')) || [];

export function addToCart(product) {
    cart.push(product);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('bait_alagha_cart', JSON.stringify(cart));
}

export function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.innerText = cart.length;
    renderCartItems();
}

// عرض المنتجات داخل نافذة السلة
function renderCartItems() {
    const listContainer = document.getElementById('cart-items-list');
    if (!listContainer) return;

    if (cart.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; padding:20px;">السلة فارغة حالياً</p>';
        return;
    }

    let total = 0;
    let html = cart.map((item, index) => {
        total += parseFloat(item.Price);
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:#222; padding:10px; border-radius:8px;">
                <span>${item.Name}</span>
                <span style="color:#d4af37;">${item.Price} ج.م</span>
                <button onclick="window.removeItem(${index})" style="background:none; border:none; color:#ff4444; cursor:pointer;">✕</button>
            </div>
        `;
    }).join('');

    html += `<div style="text-align:left; font-weight:bold; margin-top:15px; color:#d4af37;">الإجمالي: ${total} ج.م</div>`;
    listContainer.innerHTML = html;
}

// حذف منتج من السلة
window.removeItem = (index) => {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
};

export function sendOrderToWhatsApp() {
    if (cart.length === 0) {
        alert("السلة فارغة!");
        return;
    }

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const location = document.getElementById('cust-location').value;

    if (!name || !phone || !location) {
        alert("يرجى إكمال بيانات التوصيل");
        return;
    }

    let message = `*طلب جديد من بيت الآغا*%0A`;
    message += `--------------------------%0A`;
    message += `*الاسم:* ${name}%0A`;
    message += `*الهاتف:* ${phone}%0A`;
    message += `*الموقع:* ${location}%0A`;
    message += `--------------------------%0A`;
    message += `*المنتجات:*%0A`;
    
    let total = 0;
    cart.forEach((item, index) => {
        message += `${index + 1}- ${item.Name} (${item.Price} ج.م)%0A`;
        total += parseFloat(item.Price);
    });

    message += `--------------------------%0A`;
    message += `*الإجمالي:* ${total} ج.م%0A`;

    const whatsappNumber = "201112050354"; 
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    
    // اختياري: تفريغ السلة بعد نجاح الإرسال
    // cart = []; saveCart(); updateCartUI();
}
