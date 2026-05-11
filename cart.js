// cart.js - النسخة الاحترافية المحدثة (واتساب + سجل الطلبات الرقمي)
let cart = JSON.parse(localStorage.getItem('bait_alagha_cart')) || [];
let userLocation = "";

// جلب الموقع الجغرافي (GPS)
export function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
            alert("📍 تم تحديد موقعك بنجاح وسيتم إرفاقه مع الطلب");
            const locBtn = document.getElementById('get-loc-btn');
            if(locBtn) { 
                locBtn.innerText = "✅ تم تحديد الموقع"; 
                locBtn.style.background = "#28a745"; 
            }
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
    const cartBtn = document.getElementById('cart-floating-btn'); // عنصر زر السلة العائم
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // تحديث عداد السلة
    if (cartCount) {
        cartCount.innerText = totalItems;
    }

    // إضافة أو إزالة تأثير "النبض" بناءً على وجود منتجات
    if (cartBtn) {
        if (totalItems > 0) {
            cartBtn.classList.add('has-items');
        } else {
            cartBtn.classList.remove('has-items');
        }
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
        alert("يرجى إدخال الاسم، رقم الهاتف، والعنوان بالتفصيل 🏠"); 
        return; 
    }

    // حفظ البيانات للمرة القادمة
    localStorage.setItem('cust_name', name);
    localStorage.setItem('cust_phone', phone);
    localStorage.setItem('cust_address', manualLocation);

    // ترقيم الفاتورة
    let orderNumber = localStorage.getItem('last_order_number') || 1000;
    orderNumber = parseInt(orderNumber) + 1;
    localStorage.setItem('last_order_number', orderNumber);

    const totalPrice = cart.reduce((sum, item) => sum + (parseFloat(item.Price) * item.quantity), 0);
    const orderSummary = cart.map(item => `${item.Name} (${item.quantity})`).join(' - ');

    const submitBtn = document.getElementById('submit-order-btn');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "جاري الحفظ... ⏳";
    submitBtn.disabled = true;

    try {
        const scriptURL = 'https://script.google.com/macros/s/AKfycbxs_0TERa9UWyIyBclBBz-sssriSu2KfCnCocw9wi-OpGV82Qaf4rdWvM_QRFEKj4h7CQ/exec';
        
        const formData = new FormData();
        formData.append('OrderID', `#${orderNumber}`); 
        formData.append('CustomerName', name);
        formData.append('Phone', phone);
        formData.append('Location', manualLocation);
        formData.append('Items', orderSummary);
        formData.append('TotalAmount', totalPrice);

        await fetch(scriptURL, { 
            method: 'POST', 
            body: formData, 
            mode: 'no-cors' 
        });
        console.log("تم تسجيل الطلب في الشيت بنجاح");
    } catch (e) { 
        console.error("خطأ في التسجيل:", e); 
    }

    // --- بناء رسالة الواتساب الاحترافية المنسقة ---
    let message = `*🧾 فاتورة طلب جديدة - بيت الآغا*\n`;
    message += `*رقم الطلب: #${orderNumber}*\n`;
    message += `━━━━━━━━━━━━━━━\n`;
    message += `*👤 العميل:* ${name}\n`;
    message += `*📱 الهاتف:* ${phone}\n`;
    message += `*🏠 العنوان:* ${manualLocation}\n`;
    
    // إذا كان هناك إحداثيات GPS من دالة getLocation
    if (typeof userLocation !== 'undefined' && userLocation) {
        message += `*📍 رابط الموقع:* مرفق بالأسفل 👇\n`;
    }
    
    message += `━━━━━━━━━━━━━━━\n`;
    message += `*📦 المنتجات:*\n\n`;
    
    cart.forEach((item, index) => {
        const lineTotal = parseFloat(item.Price) * item.quantity;
        message += `${index + 1}. *${item.Name}*\n`;
        message += `   الكمية: ${item.quantity} | السعر: ${lineTotal} ج.م\n\n`;
    });

    message += `━━━━━━━━━━━━━━━\n`;
    message += `*💰 الإجمالي النهائي: ${totalPrice} ج.م*\n`;
    message += `━━━━━━━━━━━━━━━\n`;

    if (typeof userLocation !== 'undefined' && userLocation) {
        message += `\n*📍 لوكيشن العميل (GPS):*\n${userLocation}\n`;
    }

    message += `✨ شكراً لطلبكم من بيت الآغا ✨`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "201112050354"; 
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // إعادة تعيين واجهة المستخدم
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
    cart = []; 
    saveCart(); 
    updateCartUI();
    document.getElementById('cart-modal').style.display = "none";
}
