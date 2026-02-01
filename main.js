// ==========================================
// 1. استيراد مكتبات Firebase (تأكد من الإنترنت)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================================
// 2. إعدادات Firebase (يجب استبدالها ببيانات مشروعك)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDxxxxxxxxx-xxxxxxxx", // ضع مفتاح API الخاص بك هنا
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:xxxxxxxxx"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ==========================================
// 3. المتغيرات العامة وإعدادات الصفحة
// ==========================================
let currentUser = null;
let selectedCar = null;

// تشغيل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    initFlatpickr();
    renderCars();
    loadProperties();
    checkAuthState();
});

// إعداد تقويم اختيار التاريخ (Flatpickr)
function initFlatpickr() {
    flatpickr("#vipDate", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: "today",
        theme: "dark",
        disableMobile: "true",
        locale: {
            firstDayOfWeek: 6 // يبدأ الأسبوع السبت
        }
    });
}

// ==========================================
// 4. إدارة المستخدمين (تسجيل الدخول/الخروج)
// ==========================================

// مراقبة حالة المستخدم
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        const authSection = document.getElementById("authSection");
        const userMenu = document.getElementById("userMenu");
        const userName = document.getElementById("userName");

        if (user) {
            currentUser = user;
            // إخفاء زر تسجيل الدخول وإظهار قائمة المستخدم
            authSection.innerHTML = '';
            userMenu.style.display = "flex";
            userName.textContent = `أهلاً، ${user.displayName.split(' ')[0]}`; // عرض الاسم الأول فقط
            closeLoginModal();
        } else {
            currentUser = null;
            // إظهار زر تسجيل الدخول
            authSection.innerHTML = '<a href="#" onclick="openLoginModal()" class="login-link"><i class="fas fa-user"></i> دخول</a>';
            userMenu.style.display = "none";
        }
    });
}

// دالة تسجيل الدخول بجوجل
async function loginWithGoogle() {
    try {
        await signInWithPopup(auth, provider);
        // سيقوم onAuthStateChanged بتحديث الواجهة تلقائياً
    } catch (error) {
        console.error("Error logging in:", error);
        alert("حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.");
    }
}

// دالة تسجيل الخروج
async function logoutUser() {
    try {
        await signOut(auth);
        window.location.reload();
    } catch (error) {
        console.error("Error logging out:", error);
    }
}

// ==========================================
// 5. إدارة العقارات (عرض الوحدات)
// ==========================================

// بيانات وهمية للعرض (في حالة عدم وجود بيانات في فايربيس حالياً)
// بمجرد إضافة بيانات لقاعدة البيانات، سيتم جلبها بدلاً من هذه المصفوفة
const dummyProperties = [
    {
        title: "فيلا مستقلة - الحي الخامس",
        price: "8,500,000 ج.م",
        area: "450م",
        rooms: "5",
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
        title: "شقة دوبلكس - الحي التاسع",
        price: "4,200,000 ج.م",
        area: "280م",
        rooms: "4",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
        title: "بنتهاوس - جاردينيا",
        price: "3,100,000 ج.م",
        area: "200م",
        rooms: "3",
        image: "https://images.unsplash.com/photo-1600596542815-2495db9dc2c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    }
];

async function loadProperties() {
    const grid = document.getElementById("properties-grid");
    grid.innerHTML = '<p style="text-align:center; color:#fff;">جاري التحميل...</p>';
    
    try {
        // محاولة جلب البيانات من فايربيس
        const querySnapshot = await getDocs(collection(db, "properties"));
        
        let htmlContent = "";
        
        // دمج البيانات الوهمية مع بيانات فايربيس (لغرض العرض فقط إذا كانت القاعدة فارغة)
        let properties = [];
        querySnapshot.forEach((doc) => {
            properties.push(doc.data());
        });

        if (properties.length === 0) {
            properties = dummyProperties; // استخدام البيانات الوهمية إذا كانت القاعدة فارغة
        }

        properties.forEach(prop => {
            htmlContent += `
                <div class="prop-card">
                    <div class="prop-img-wrapper">
                        <img src="${prop.image}" alt="${prop.title}">
                        <span class="prop-badge">للبيع</span>
                    </div>
                    <div class="prop-details">
                        <h3 class="prop-title">${prop.title}</h3>
                        <p class="prop-price">${prop.price}</p>
                        <div class="prop-features">
                            <span><i class="fas fa-bed"></i> ${prop.rooms} غرف</span>
                            <span><i class="fas fa-ruler-combined"></i> ${prop.area}</span>
                        </div>
                        <button onclick="openVipModal('${prop.title}')" class="btn-gold-outline" style="width:100%; margin-top:15px;">
                            <i class="fas fa-eye"></i> طلب معاينة
                        </button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = htmlContent;

    } catch (error) {
        console.error("Error fetching properties:", error);
        grid.innerHTML = '<p style="text-align:center; color:red;">حدث خطأ في تحميل البيانات</p>';
    }
}

// ==========================================
// 6. نظام VIP (السيارات والمعاينة)
// ==========================================

const cars = [
    { id: 'mercedes', name: 'Mercedes S500', icon: 'fa-car', price: 'مجاني للعملاء' },
    { id: 'bmw', name: 'BMW 7 Series', icon: 'fa-car-alt', price: 'مجاني للعملاء' },
    { id: 'range', name: 'Range Rover', icon: 'fa-shuttle-van', price: 'مجاني للعملاء' }
];

function renderCars() {
    const container = document.getElementById("carSelection");
    let html = "";
    cars.forEach(car => {
        html += `
            <div class="car-option" onclick="selectCar('${car.id}', this)">
                <i class="fas ${car.icon}" style="font-size:2rem; margin-bottom:10px; color:var(--gold)"></i>
                <h4>${car.name}</h4>
                <p style="font-size:0.8rem; color:#aaa;">${car.price}</p>
            </div>
        `;
    });
    container.innerHTML = html;
}

// دالة يتم استدعاؤها عند الضغط على سيارة
window.selectCar = function(carId, element) {
    selectedCar = carId;
    
    // إزالة التحديد من الجميع
    document.querySelectorAll('.car-option').forEach(el => el.classList.remove('selected'));
    
    // إضافة التحديد للعنصر الحالي
    element.classList.add('selected');
};

// فتح نافذة VIP وتمرير اسم العقار
window.openVipModal = function(propTitle) {
    if (!currentUser) {
        openLoginModal();
        return;
    }
    document.getElementById("vipPropTitle").value = propTitle;
    document.getElementById("vipModal").classList.add("active");
};

// إرسال طلب المعاينة
window.submitVipRequest = async function() {
    const date = document.getElementById("vipDate").value;
    const phone = document.getElementById("vipPhone").value;
    const propTitle = document.getElementById("vipPropTitle").value;

    if (!selectedCar || !date || !phone) {
        alert("يرجى اختيار السيارة، الموعد، وإدخال رقم الهاتف.");
        return;
    }

    const btn = document.querySelector("#vipModal .gold-glow-btn");
    const originalText = btn.innerText;
    btn.innerText = "جاري الإرسال...";
    btn.disabled = true;

    try {
        await addDoc(collection(db, "vip_requests"), {
            user_uid: currentUser.uid,
            user_name: currentUser.displayName,
            user_email: currentUser.email,
            property: propTitle,
            car_choice: selectedCar,
            date: date,
            phone: phone,
            status: "pending",
            created_at: serverTimestamp()
        });

        alert("تم استلام طلب المعاينة بنجاح! سيتصل بك فريقنا قريباً.");
        closeVipModal();
        
        // إعادة تعيين النموذج
        document.getElementById("vipDate").value = "";
        document.getElementById("vipPhone").value = "";
        selectedCar = null;
        document.querySelectorAll('.car-option').forEach(el => el.classList.remove('selected'));

    } catch (error) {
        console.error("Error submitting request:", error);
        alert("حدث خطأ، يرجى المحاولة مرة أخرى.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

// ==========================================
// 7. دوال مساعدة (للنوافذ المنبثقة)
// ==========================================

// تصدير الدوال للـ Window لتشغيلها من HTML
window.openLoginModal = () => document.getElementById("loginModal").classList.add("active");
window.closeLoginModal = () => document.getElementById("loginModal").classList.remove("active");
window.closeVipModal = () => document.getElementById("vipModal").classList.remove("active");
window.loginWithGoogle = loginWithGoogle;
window.logoutUser = logoutUser;

// إغلاق النوافذ عند الضغط خارجها
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
};