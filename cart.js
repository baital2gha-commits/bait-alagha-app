// cart.js - النسخة الاحترافية
let cart = JSON.parse(localStorage.getItem('bait_alagha_cart')) || [];
let userLocation = "";

// جلب الموقع الجغرافي
export function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
            alert("📍 تم تحديد موقعك بنجاح وسيتم إرفاقه مع الطلب");
            const locBtn = document.getElementById('get-loc-btn');
            if(locBtn) { locBtn.innerText = "✅ تم تحديد الموقع"; locBtn.style.background = "#28a745"; }
        }, () => {
            alert("تعذر جلب الموقع، يرجى كتابة العنوان يدوياً");
        });
    }
}

export function addToCart(product) {
    const existingProduct = cart.find(item => item.ID === product.ID);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('bait_alagha_cart', JSON.stringify(cart));
}

export function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = totalItems;
    }
    renderCartItems();
}

function renderCartItems() {
    const listContainer = document.getElementById('cart-items-list');
    if (!listContainer) return;
    if (cart.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:#888;">السلة فارغة.. املأ بيتك بالخير ✨</p>';
        return;
    }

    let total = 0;
    let html = cart.map((item, index) => {
        const itemTotal = parseFloat(item.Price) * item.quantity;
        total += itemTotal;
        return `
            <div style="background:#222; padding:12px; border-radius:10px; margin-bottom:10px; border-right:4px solid #d4af37;">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="font-weight:bold;">${item.Name} (كود: ${item.ID})</span>
                    <button onclick="removeItemFromCart(${index})" style="background:none; border:none; color:#ff4444; cursor:pointer;">✕</button>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:10px; background:#333; padding:5px 10px; border-radius:20px;">
                        <button onclick="changeQty(${index}, -1)" style="background:none; border:none; color:#d4af37; font-size:1.2rem; cursor:pointer;">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)" style="background:none; border:none; color:#d4af37; font-size:1.2rem; cursor:pointer;">+</button>
                    </div>
                    <span style="color:#d4af37; font-weight:bold;">${itemTotal} ج.م</span>
                </div>
            </div>
        `;
    }).join('');

    html += `<div style="text-align:left; font-size:1.2rem; font-weight:bold; margin-top:15px; color:#d4af37;">إجمالي الفاتورة: ${total} ج.م</div>`;
    listContainer.innerHTML = html;
}

window.changeQty = (index, delta) => {
    cart[index].quantity += delta;
    if (cart[index].quantity < 1) cart.splice(index, 1);
    saveCart();
    updateCartUI();
};

window.removeItemFromCart = (index) => {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
};

export function sendOrderToWhatsApp() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const manualLocation = document.getElementById('cust-location').value;

    if (!name || !phone) { alert("يرجى كتابة الاسم ورقم الهاتف"); return; }

    let message = `*📦 طلب جديد - بيت الآغا*%0A`;
    message += `━━━━━━━━━━━━━━━%0A`;
    message += `*👤 العميل:* ${name}%0A`;
    message += `*📱 هاتف:* ${phone}%0A`;
    message += `*📍 الموقع:* ${userLocation ? 'مرفق بالأسفل' : manualLocation}%0A`;
    message += `━━━━━━━━━━━━━━━%0A`;
    message += `*🛍️ المنتجات المطلوبة:*%0A`;
    
    let total = 0;
    cart.forEach((item) => {
        const lineTotal = parseFloat(item.Price) * item.quantity;
        message += `🔹 *${item.Name}*%0A      الكمية: ${item.quantity} | الكود: ${item.ID}%0A      السعر: ${lineTotal} ج.م%0A`;
        total += lineTotal;
    });

    message += `━━━━━━━━━━━━━━━%0A`;
    message += `*💰 الإجمالي النهائي:* ${total} ج.م%0A`;
    if(userLocation) message += `%0A*📍 موقع العميل على الخريطة:*%0A${userLocation}`;

    window.open(`https://wa.me/201112050354?text=${message}`, '_blank');
}
