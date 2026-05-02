// cart.js - النسخة الاحترافية (واتساب + سجل الطلبات الرقمي)
let cart = JSON.parse(localStorage.getItem('bait_alagha_cart')) || [];
let userLocation = "";

// جلب الموقع الجغرافي (GPS)
export function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            // الرابط الذي يعمل بشكل صحيح كما طلبت
            userLocation = `http://maps.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
            alert("📍 تم تحديد موقعك بنجاح وسيتم إرفاقه مع الطلب");
            const locBtn = document.getElementById('get-loc-btn');
            if(locBtn) { 
                locBtn.innerText = "✅ تم تحديد الموقع"; 
                locBtn.style.background = "#28a745"; 
            }
        }, () => {
            alert("تعذر جلب الموقع، يرجى كتابة العنوان يدوياً بالتفصيل");
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

export async function sendOrderToWhatsApp() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const manualLocation = document.getElementById('cust-location').value;

    if (!name || !phone || !manualLocation) { 
        alert("فضلاً، أدخل الاسم ورقم الهاتف وتفاصيل العنوان (المحافظة/الحي/الشارع) 🏠"); 
        return; 
    }

    const totalPrice = cart.reduce((sum, item) => sum + (parseFloat(item.Price) * item.quantity), 0);
    const orderSummary = cart.map(item => `${item.Name} (${item.quantity})`).join(' - ');

    // --- 1. إرسال البيانات لجوجل شيت (تلقائي) ---
    const submitBtn = document.getElementById('submit-order-btn');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "جاري حفظ الطلب... ⏳";
    submitBtn.disabled = true;

    try {
        const scriptURL = 'https://script.google.com/macros/s/AKfycbwn15TPDsuwz6Jouf5GRwyomtOd9hMcF6oC9hCGTz_i0pJL6irfP_eDsTtMDzE4cKsZbA/exec';
        
        // تجهيز البيانات كـ FormData لضمان وصولها للشيت
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('address', manualLocation);
        formData.append('locationUrl', userLocation || "لم يحدد");
        formData.append('order', orderSummary);
        formData.append('total', totalPrice);

        await fetch(scriptURL, { 
            method: 'POST', 
            body: formData, 
            mode: 'no-cors' 
        });
        console.log("Order saved to Sheet");
    } catch (e) {
        console.error("Sheet Error:", e);
    }

    // --- 2. تجهيز رسالة الواتساب الاحترافية ---
    let message = `*📦 طلب جديد من متجر بيت الآغا*%0A`;
    message += `━━━━━━━━━━━━━━━%0A`;
    message += `*👤 العميل:* ${name}%0A`;
    message += `*📱 هاتف:* ${phone}%0A`;
    message += `*🏠 تفاصيل العنوان:*%0A${manualLocation}%0A`;
    
    if (userLocation) {
        message += `*📍 موقع الـ GPS:* مرفق بالأسفل 👇%0A`;
    }
    
    message += `━━━━━━━━━━━━━━━%0A`;
    message += `*🛍️ السلة:*%0A`;
    
    cart.forEach((item) => {
        const lineTotal = parseFloat(item.Price) * item.quantity;
        message += `🔹 *${item.Name}*%0A      الكمية: ${item.quantity} | الكود: ${item.ID}%0A      السعر: ${lineTotal} ج.م%0A`;
    });

    message += `━━━━━━━━━━━━━━━%0A`;
    message += `*💰 الإجمالي النهائي:* ${totalPrice} ج.م%0A`;

    if (userLocation) {
        message += `%0A*📍 لوكيشن العميل على الخريطة:*%0A${userLocation}`;
    }

    // فتح الواتساب
    const whatsappNumber = "201112050354"; 
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    
    // إعادة ضبط الواجهة وتفريغ السلة
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
    cart = []; 
    saveCart(); 
    updateCartUI();
    document.getElementById('cart-modal').style.display = "none";
}
