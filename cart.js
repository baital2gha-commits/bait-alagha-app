// cart.js - نظام السلة وإرسال الطلبات
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
}

export function sendOrderToWhatsApp(customerData) {
    let message = `*طلب جديد من بيت الآغا*%0A`;
    message += `--------------------------%0A`;
    message += `*الاسم:* ${customerData.name}%0A`;
    message += `*الهاتف:* ${customerData.phone}%0A`;
    message += `*الموقع:* ${customerData.location}%0A`;
    message += `--------------------------%0A`;
    message += `*المنتجات:*%0A`;
    
    let total = 0;
    cart.forEach((item, index) => {
        message += `${index + 1}- ${item.Name} (${item.Price} ج.م)%0A`;
        total += parseFloat(item.Price);
    });

    message += `--------------------------%0A`;
    message += `*الإجمالي:* ${total} ج.م%0A`;

    const phoneNumber = "201XXXXXXXXX"; // ضع رقم واتساب البراند هنا بدون أصفار أو علامة +
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    
    // تفريغ السلة بعد الطلب
    cart = [];
    saveCart();
    updateCartUI();
}
