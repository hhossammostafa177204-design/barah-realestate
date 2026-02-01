// ==========================================
// 1. استيراد مكتبات Firebase (CDN)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================================
// 2. إعدادات Firebase (مشروعك: Barah Realestate)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDBRcr-Np9SwYRR-cBqJDZ7FZmwk6VWLJU",
    authDomain: "barah-realestate-c7095.firebaseapp.com",
    projectId: "barah-realestate-c7095",
    storageBucket: "barah-realestate-c7095.firebasestorage.app",
    messagingSenderId: "491079034147",
    appId: "1:491079034147:web:05dd6f5ba900a2c8a8d896"
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
let allProperties = []; 
let currentMode = 'sale'; 

// تشغيل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    initFlatpickr();
    renderCars();
    loadProperties();
    checkAuthState();
    
    if(typeof switchSearchMode === 'function') {
        switchSearchMode('sale');
    }
});

// إعداد تقويم اختيار التاريخ (Flatpickr)
function initFlatpickr() {
    if(document.getElementById("vipDate")) {
        flatpickr("#vipDate", {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            minDate: "today",
            theme: "dark",
            disableMobile: "true",
            locale: { firstDayOfWeek: 6 }
        });
    }
}

// ==========================================
// 4. إدارة المستخدمين (تسجيل الدخول/الخروج)
// ==========================================

function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        const authSection = document.getElementById("authSection");
        const userMenu = document.getElementById("userMenu");
        const userName = document.getElementById("userName");

        if (!authSection) return;

        if (user) {
            currentUser = user;
            authSection.innerHTML = '';
            if(userMenu) userMenu.style.display = "flex";
            if(userName) userName.textContent = `أهلاً، ${user.displayName.split(' ')[0]}`;
            closeLoginModal();
        } else {
            currentUser = null;
            authSection.innerHTML = '<a href="#" onclick="openLoginModal()" class="login-link"><i class="fas fa-user"></i> دخول</a>';
            if(userMenu) userMenu.style.display = "none";
        }
    });
}

window.loginWithGoogle = async function() {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error logging in:", error);
        alert("حدث خطأ أثناء تسجيل الدخول: " + error.message);
    }
}

window.logoutUser = async function() {
    try {
        await signOut(auth);
        window.location.reload();
    } catch (error) {
        console.error("Error logging out:", error);
    }
}

// ==========================================
// 5. إدارة العقارات والفلترة
// ==========================================

const dummyProperties = [
    { id: 1, title: "فيلا قصر - الحي التاسع", status: "sale", type: "villa", location: "hi9", priceVal: 18000000, price: "18,000,000 ج.م", area: "1200م", rooms: "9", image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" },
    { id: 2, title: "شقة لوكس - الحي الخامس", status: "sale", type: "apartment", location: "hi5", priceVal: 4500000, price: "4,500,000 ج.م", area: "200م", rooms: "3", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" },
    { id: 3, title: "دوبلكس - جولف سيتي", status: "sale", type: "duplex", location: "golf", priceVal: 8000000, price: "8,000,000 ج.م", area: "400م", rooms: "5", image: "https://images.unsplash.com/photo-1600596542815-2495db9dc2c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }
];

async function loadProperties() {
    const grid = document.getElementById("properties-grid");
    if (!grid) return;

    grid.innerHTML = '<p style="text-align:center; color:#fff;">جاري التحميل...</p>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "properties"));
        allProperties = [];
        querySnapshot.forEach((doc) => {
            allProperties.push({ id: doc.id, ...doc.data() });
        });

        if (allProperties.length === 0) {
            allProperties = dummyProperties;
        }
        filterProperties();

    } catch (error) {
        console.error("Error fetching properties:", error);
        allProperties = dummyProperties;
        filterProperties();
    }
}

window.switchSearchMode = function(mode) {
    currentMode = mode;
    const btnSale = document.getElementById('btnSale');
    const btnRent = document.getElementById('btnRent');
    if(btnSale && btnRent) {
        btnSale.classList.toggle('active', mode === 'sale');
        btnRent.classList.toggle('active', mode === 'rent');
    }
    const priceSelect = document.getElementById('filterPrice');
    if (priceSelect) {
        if (mode === 'sale') {
            priceSelect.innerHTML = `<option value="all">جميع الأسعار</option><option value="cat1">أقل من 3 مليون</option><option value="cat2">من 3 - 6 مليون</option><option value="cat3">من 6 - 10 مليون</option><option value="cat4">أكثر من 10 مليون</option>`;
        } else {
            priceSelect.innerHTML = `<option value="all">جميع الأسعار</option><option value="cat1">أقل من 10,000 ج.م</option><option value="cat2">من 10 - 20 ألف ج.م</option><option value="cat3">من 20 - 40 ألف ج.م</option><option value="cat4">أكثر من 40 ألف ج.م</option>`;
        }
    }
    filterProperties();
};

window.filterProperties = function() {
    const grid = document.getElementById("properties-grid");
    if (!grid) return;

    const type = document.getElementById("filterType") ? document.getElementById("filterType").value : "all";
    const location = document.getElementById("filterLocation") ? document.getElementById("filterLocation").value : "all";
    const priceRange = document.getElementById("filterPrice") ? document.getElementById("filterPrice").value : "all";

    const filtered = allProperties.filter(prop => {
        if (prop.status && prop.status !== currentMode) return false;
        const matchType = (type === "all") || (prop.type === type);
        const matchLocation = (location === "all") || (prop.location === location);

        let matchPrice = true;
        if (priceRange !== "all" && prop.priceVal) {
            const price = prop.priceVal;
            if (currentMode === 'sale') {
                if (priceRange === "cat1") matchPrice = price < 3000000;
                else if (priceRange === "cat2") matchPrice = price >= 3000000 && price <= 6000000;
                else if (priceRange === "cat3") matchPrice = price > 6000000 && price <= 10000000;
                else if (priceRange === "cat4") matchPrice = price > 10000000;
            } else { 
                if (priceRange === "cat1") matchPrice = price < 10000;
                else if (priceRange === "cat2") matchPrice = price >= 10000 && price <= 20000;
                else if (priceRange === "cat3") matchPrice = price > 20000 && price <= 40000;
                else if (priceRange === "cat4") matchPrice = price > 40000;
            }
        }
        return matchType && matchLocation && matchPrice;
    });

    renderProperties(filtered);
};

function renderProperties(propsList) {
    const grid = document.getElementById("properties-grid");
    if (!grid) return;

    if (propsList.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 50px; background: rgba(255,255,255,0.02); border-radius: 15px; border:1px dashed #334155;"><i class="fas fa-search" style="font-size: 3rem; color: #555; margin-bottom: 20px;"></i><h3 style="color:#fff;">لا توجد نتائج</h3><p style="color:#aaa">جرب تغيير المنطقة أو السعر</p></div>`;
        return;
    }

    let htmlContent = "";
    propsList.forEach(prop => {
        const isSale = prop.status === 'sale';
        const badgeClass = isSale ? 'sale' : 'rent';
        const badgeText = isSale ? 'للبيع' : 'للإيجار';

        htmlContent += `
            <div class="prop-card">
                <div class="prop-img-wrapper">
                    <img src="${prop.image}" alt="${prop.title}">
                    <span class="prop-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="prop-details">
                    <div class="prop-info-top">
                        <h3 class="prop-title">${prop.title}</h3>
                        <p class="prop-price">${prop.price}</p>
                    </div>
                    <div class="prop-features">
                        <span><i class="fas fa-bed"></i> ${prop.rooms}</span>
                        <span><i class="fas fa-ruler-combined"></i> ${prop.area}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${prop.location}</span>
                    </div>
                    <button onclick="openVipModal('${prop.title}')" class="btn-view">
                        <i class="fas fa-eye"></i> تفاصيل ومعاينة
                    </button>
                </div>
            </div>
        `;
    });
    grid.innerHTML = htmlContent;
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
    if (!container) return;

    let html = "";
    cars.forEach(car => {
        html += `
            <div class="car-option" onclick="selectCar('${car.id}', this)">
                <i class="fas ${car.icon}"></i>
                <h4>${car.name}</h4>
                <p style="font-size:0.8rem; color:#aaa;">${car.price}</p>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.selectCar = function(carId, element) {
    selectedCar = carId;
    document.querySelectorAll('.car-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
};

window.openVipModal = function(propTitle) {
    if (!currentUser) {
        openLoginModal();
        return;
    }
    const titleInput = document.getElementById("vipPropTitle");
    if (titleInput) titleInput.value = propTitle;
    
    const modal = document.getElementById("vipModal");
    if (modal) modal.classList.add("active");
};

// ==========================================
// 🔴 دالة الإرسال المحدثة (تشمل السعر)
// ==========================================
window.submitVipRequest = async function() {
    const date = document.getElementById("vipDate").value;
    const phone = document.getElementById("vipPhone").value;
    const propTitle = document.getElementById("vipPropTitle").value;
    
    // 🆕 الحصول على السعر المحسوب من الحقل المخفي
    const estimatedPrice = document.getElementById("calculatedPrice").value || "لم يحسب";

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
            estimated_ride_price: estimatedPrice, // 🆕 إرسال السعر لقاعدة البيانات
            status: "pending",
            created_at: serverTimestamp()
        });

        // رسالة نجاح توضح السعر
        const priceMsg = estimatedPrice !== "لم يحسب" ? `التكلفة التقديرية: ${estimatedPrice} ج.م` : "سيتم تحديد التكلفة لاحقاً";
        alert(`تم استلام طلب المعاينة بنجاح! \n${priceMsg} \nسيتصل بك فريقنا قريباً.`);
        
        closeVipModal();
        
        // إعادة تعيين الحقول
        document.getElementById("vipDate").value = "";
        document.getElementById("vipPhone").value = "";
        document.getElementById("rideResult").style.display = "none"; // إخفاء نتيجة المشوار
        document.getElementById("calculatedPrice").value = ""; // تصفير السعر
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
// 7. دوال النوافذ المنبثقة
// ==========================================

window.openLoginModal = () => {
    const el = document.getElementById("loginModal");
    if(el) el.classList.add("active");
};
window.closeLoginModal = () => {
    const el = document.getElementById("loginModal");
    if(el) el.classList.remove("active");
};
window.closeVipModal = () => {
    const el = document.getElementById("vipModal");
    if(el) el.classList.remove("active");
};

window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
};

// ==========================================
// 8. نظام "أوبر" لحساب التكلفة والمسافة
// ==========================================

const RIDE_SETTINGS = {
    pricePerKm: 15, // سعر الكيلو
    baseFare: 50,   // فتح العداد
    companyLat: 30.1691, // خط عرض العبور
    companyLng: 31.4795  // خط طول العبور
};

window.calculateRideCost = function() {
    const statusElem = document.getElementById('userLocationStatus');
    const btn = document.querySelector('.btn-secondary'); // زر الحساب الموجود في المودال
    
    if (!navigator.geolocation) {
        alert("المتصفح لا يدعم تحديد الموقع الجغرافي.");
        return;
    }

    statusElem.textContent = "جاري تحديد الموقع...";
    if(btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحساب...';
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // 1. حساب المسافة
            const distanceKm = getDistanceFromLatLonInKm(userLat, userLng, RIDE_SETTINGS.companyLat, RIDE_SETTINGS.companyLng);
            
            // 2. حساب السعر
            const roadFactor = 1.3; 
            const estimatedDist = (distanceKm * roadFactor).toFixed(1);
            const totalPrice = Math.ceil((estimatedDist * RIDE_SETTINGS.pricePerKm) + RIDE_SETTINGS.baseFare);

            // 3. عرض النتائج
            const resultDiv = document.getElementById('rideResult');
            if(resultDiv) resultDiv.style.display = 'block';
            
            const distElem = document.getElementById('distValue');
            if(distElem) distElem.textContent = estimatedDist + ' كم';
            
            const priceElem = document.getElementById('priceValue');
            if(priceElem) priceElem.textContent = totalPrice + ' ج.م';
            
            // حفظ السعر في الحقل المخفي
            const hiddenPriceInput = document.getElementById('calculatedPrice');
            if(hiddenPriceInput) hiddenPriceInput.value = totalPrice;
            
            statusElem.textContent = "تم تحديد الموقع بنجاح ✅";
            statusElem.style.color = "#4ade80";
            
            if(btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sync-alt"></i> تحديث الموقع';
            }
        },
        (error) => {
            console.error("Error:", error);
            statusElem.textContent = "فشل تحديد الموقع ❌";
            statusElem.style.color = "#ef4444";
            alert("يرجى السماح للموقع بالوصول للـ GPS لحساب التكلفة.");
            if(btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-location-arrow"></i> محاولة مرة أخرى';
            }
        }
    );
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; 
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}