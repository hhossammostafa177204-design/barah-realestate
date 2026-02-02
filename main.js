// ==========================================
// 1. استيراد مكتبات Firebase
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================================
// 2. إعدادات Firebase (مشروع Barah Realestate)
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
// 3. المتغيرات العامة
// ==========================================
let currentUser = null;
let selectedCar = null;
let allProperties = []; // المخزن الرئيسي للعقارات القادمة من المسوقين
let currentMode = 'sale'; 

// تشغيل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    initFlatpickr();
    renderCars();
    loadProperties(); // ✅ هنا يتم جلب الصور والبيانات
    checkAuthState();
    
    if(typeof switchSearchMode === 'function') {
        switchSearchMode('sale');
    }
});

// إعداد التقويم
function initFlatpickr() {
    if(document.getElementById("vipDate")) {
        flatpickr("#vipDate", {
            enableTime: true, dateFormat: "Y-m-d H:i", minDate: "today",
            theme: "dark", disableMobile: "true", locale: { firstDayOfWeek: 6 }
        });
    }
}

// ==========================================
// 4. جلب البيانات (الربط بين المسوق والزبون)
// ==========================================
async function loadProperties() {
    const grid = document.getElementById("properties-grid");
    if (!grid) return;

    // عرض علامة تحميل شيك
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px;"><i class="fas fa-spinner fa-spin fa-2x" style="color:#d4af37;"></i><p style="color:#fff; margin-top:10px;">جاري تحميل أحدث العروض...</p></div>';
    
    try {
        // جلب العقارات مرتبة من الأحدث للأقدم
        const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        allProperties = [];
        
        querySnapshot.forEach((doc) => {
            // تخزين البيانات (بما فيها رابط الصورة القادم من ImgBB)
            allProperties.push({ id: doc.id, ...doc.data() });
        });

        // لو مفيش عقارات، اعرض رسالة
        if (allProperties.length === 0) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#aaa;">لا توجد عقارات متاحة حالياً.</div>';
            return;
        }

        filterProperties(); // عرض العقارات

    } catch (error) {
        console.error("Error fetching properties:", error);
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:red;">حدث خطأ في تحميل البيانات.</div>';
    }
}

// ==========================================
// 5. الفلترة والعرض
// ==========================================

// التبديل بين بيع وإيجار
window.switchSearchMode = function(mode) {
    currentMode = mode;
    const btnSale = document.getElementById('btnSale');
    const btnRent = document.getElementById('btnRent');
    if(btnSale && btnRent) {
        btnSale.classList.toggle('active', mode === 'sale');
        btnRent.classList.toggle('active', mode === 'rent');
    }
    updatePriceFilter(mode);
    filterProperties();
};

// تحديث قائمة الأسعار
function updatePriceFilter(mode) {
    const priceSelect = document.getElementById('filterPrice');
    if (priceSelect) {
        if (mode === 'sale') {
            priceSelect.innerHTML = `<option value="all">جميع الأسعار</option><option value="cat1">أقل من 3 مليون</option><option value="cat2">من 3 - 6 مليون</option><option value="cat3">من 6 - 10 مليون</option><option value="cat4">أكثر من 10 مليون</option>`;
        } else {
            priceSelect.innerHTML = `<option value="all">جميع الأسعار</option><option value="cat1">أقل من 10,000 ج.م</option><option value="cat2">من 10 - 20 ألف ج.م</option><option value="cat3">من 20 - 40 ألف ج.م</option><option value="cat4">أكثر من 40 ألف ج.م</option>`;
        }
    }
}

// منطق الفلترة
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
            const p = Number(prop.priceVal);
            if (currentMode === 'sale') {
                if (priceRange === "cat1") matchPrice = p < 3000000;
                else if (priceRange === "cat2") matchPrice = p >= 3000000 && p <= 6000000;
                else if (priceRange === "cat3") matchPrice = p > 6000000 && p <= 10000000;
                else if (priceRange === "cat4") matchPrice = p > 10000000;
            } else { 
                if (priceRange === "cat1") matchPrice = p < 10000;
                else if (priceRange === "cat2") matchPrice = p >= 10000 && p <= 20000;
                else if (priceRange === "cat3") matchPrice = p > 20000 && p <= 40000;
                else if (priceRange === "cat4") matchPrice = p > 40000;
            }
        }
        return matchType && matchLocation && matchPrice;
    });

    renderProperties(filtered);
};

// رسم الكروت (HTML)
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

        // ✅ هنا السحر: استخدام الصورة المرفوعة، ولو مش موجودة نستخدم صورة احتياطية
        const bgImage = prop.image ? prop.image : 'https://via.placeholder.com/400x300?text=No+Image';

        htmlContent += `
            <div class="prop-card">
                <div class="prop-img-wrapper">
                    <img src="${bgImage}" alt="${prop.title}" loading="lazy">
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
                        <span><i class="fas fa-map-marker-alt"></i> ${translateLocation(prop.location)}</span>
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

// دالة لترجمة أكواد المناطق إلى أسماء عربية جميلة
function translateLocation(locCode) {
    const locs = {
        'hi1': 'الحي الأول', 'hi2': 'الحي الثاني', 'hi3': 'الحي الثالث', 'hi4': 'الحي الرابع',
        'hi5': 'الحي الخامس', 'hi6': 'الحي السادس', 'hi7': 'الحي السابع', 'hi8': 'الحي الثامن', 'hi9': 'الحي التاسع',
        'golf': 'جولف سيتي', 'orabi': 'جمعية عرابي', 'fun': 'الحي الترفيهي',
        'shabab': 'إسكان الشباب', 'future': 'المستقبل', 'family': 'عائلي',
        'new_obour': 'العبور الجديدة', 'industrial': 'المنطقة الصناعية'
    };
    return locs[locCode] || locCode;
}

// ==========================================
// 6. المصادقة والـ VIP
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
    try { await signInWithPopup(auth, provider); } 
    catch (error) { console.error(error); alert("خطأ في الدخول: " + error.message); }
}

window.logoutUser = async function() {
    try { await signOut(auth); window.location.reload(); } 
    catch (error) { console.error(error); }
}

// --- إعدادات نافذة الحجز ---
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
        html += `<div class="car-option" onclick="selectCar('${car.id}', this)"><i class="fas ${car.icon}"></i><h4>${car.name}</h4><p style="font-size:0.8rem; color:#aaa;">${car.price}</p></div>`;
    });
    container.innerHTML = html;
}

window.selectCar = function(carId, element) {
    selectedCar = carId;
    document.querySelectorAll('.car-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
};

window.openVipModal = function(propTitle) {
    if (!currentUser) { openLoginModal(); return; }
    const titleInput = document.getElementById("vipPropTitle");
    if (titleInput) titleInput.value = propTitle;
    const modal = document.getElementById("vipModal");
    if (modal) modal.classList.add("active");
};

// إرسال الطلب (شامل السعر المحسوب)
window.submitVipRequest = async function() {
    const date = document.getElementById("vipDate").value;
    const phone = document.getElementById("vipPhone").value;
    const propTitle = document.getElementById("vipPropTitle").value;
    const estimatedPrice = document.getElementById("calculatedPrice").value || "لم يحسب";

    if (!selectedCar || !date || !phone) {
        alert("يرجى إكمال جميع البيانات (السيارة، الموعد، الهاتف).");
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
            ride_price: estimatedPrice, // إرسال السعر للإدارة
            status: "pending",
            created_at: serverTimestamp()
        });

        const priceMsg = estimatedPrice !== "لم يحسب" ? `\nالتكلفة التقديرية للمشوار: ${estimatedPrice} ج.م` : "";
        alert(`تم الحجز بنجاح! ${priceMsg}\nسيتصل بك فريقنا قريباً.`);
        
        closeVipModal();
        document.getElementById("vipDate").value = "";
        document.getElementById("vipPhone").value = "";
        document.getElementById("rideResult").style.display = "none";
        selectedCar = null;
        document.querySelectorAll('.car-option').forEach(el => el.classList.remove('selected'));

    } catch (error) {
        console.error(error);
        alert("حدث خطأ في الحجز.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

// ==========================================
// 7. النوافذ المنبثقة & نظام أوبر
// ==========================================
window.openLoginModal = () => { const el = document.getElementById("loginModal"); if(el) el.classList.add("active"); };
window.closeLoginModal = () => { const el = document.getElementById("loginModal"); if(el) el.classList.remove("active"); };
window.closeVipModal = () => { const el = document.getElementById("vipModal"); if(el) el.classList.remove("active"); };

window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
};

// --- Uber Ride Calculator ---
const RIDE_SETTINGS = { pricePerKm: 15, baseFare: 50, companyLat: 30.1691, companyLng: 31.4795 };

window.calculateRideCost = function() {
    const statusElem = document.getElementById('userLocationStatus');
    const btn = document.querySelector('.btn-secondary');
    
    if (!navigator.geolocation) { alert("المتصفح لا يدعم GPS"); return; }

    statusElem.textContent = "جاري تحديد الموقع...";
    if(btn) btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const dist = getDistanceFromLatLonInKm(userLat, userLng, RIDE_SETTINGS.companyLat, RIDE_SETTINGS.companyLng);
            
            const roadFactor = 1.3; 
            const estDist = (dist * roadFactor).toFixed(1);
            const price = Math.ceil((estDist * RIDE_SETTINGS.pricePerKm) + RIDE_SETTINGS.baseFare);

            // عرض النتيجة
            const resBox = document.getElementById('rideResult');
            if(resBox) resBox.style.display = 'block';
            
            const distElem = document.getElementById('distValue');
            if(distElem) distElem.textContent = estDist + ' كم';
            
            const priceElem = document.getElementById('priceValue');
            if(priceElem) priceElem.textContent = price + ' ج.م';
            
            const hiddenInput = document.getElementById('calculatedPrice');
            if(hiddenInput) hiddenInput.value = price;
            
            statusElem.textContent = "تم بنجاح ✅";
            statusElem.style.color = "#4ade80";
            if(btn) btn.disabled = false;
        },
        (error) => {
            statusElem.textContent = "فشل التحديد ❌";
            statusElem.style.color = "#ef4444";
            alert("يرجى تفعيل الـ GPS");
            if(btn) btn.disabled = false;
        }
    );
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
}
function deg2rad(deg) { return deg * (Math.PI/180); }