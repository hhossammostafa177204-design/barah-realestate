/* اسم الملف: main.js - النسخة الكاملة (VIP Calendar + Smart Filters) */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 1. إعدادات Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyDBRcr-Np9SwYRR-cBqJDZ7FZmwk6VWLJU",
    authDomain: "barah-realestate-c7095.firebaseapp.com",
    projectId: "barah-realestate-c7095",
    storageBucket: "barah-realestate-c7095.firebasestorage.app",
    messagingSenderId: "491079034147",
    appId: "1:491079034147:web:bdfd6fa4d09b409aa8d896"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- 2. نظام تسجيل الدخول (Auth Logic) ---
window.openLoginModal = () => document.getElementById('loginModal').style.display = 'flex';
window.closeLoginModal = () => document.getElementById('loginModal').style.display = 'none';

window.loginWithGoogle = async function() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        closeLoginModal();
    } catch (error) {
        console.error("Login Error:", error);
        alert("حدث خطأ أثناء تسجيل الدخول: " + error.message);
    }
}

window.logoutUser = async function() {
    try {
        await signOut(auth);
        document.getElementById('userMenu').classList.remove('active');
    } catch (error) { console.error(error); }
}

onAuthStateChanged(auth, (user) => {
    const authSection = document.getElementById('authSection');
    const userName = document.getElementById('userName');

    if (user && authSection) {
        const photo = user.photoURL || 'logo.png';
        authSection.innerHTML = `<img src="${photo}" onclick="toggleUserMenu()" style="width:40px; height:40px; border-radius:50%; cursor:pointer; border:2px solid #d4af37; object-fit:cover;">`;
        if(userName) userName.innerHTML = `أهلاً، <span style="color:#d4af37">${user.displayName}</span>`;
    } else if (authSection) {
        authSection.innerHTML = `<button onclick="openLoginModal()" class="btn-secondary" style="padding: 8px 20px; font-size: 0.9rem;"><i class="fas fa-user"></i> دخول</button>`;
    }
});

window.toggleUserMenu = () => {
    const menu = document.getElementById('userMenu');
    if(menu) menu.classList.toggle('active');
}

// --- 3. نظام الفيديو (YouTube Logic) ---
function getYouTubeID(url) {
    if (!url) return null;
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[2].length == 11) ? match[2] : null;
}

window.openVideo = function(url) {
    const videoId = getYouTubeID(url);
    if(videoId) {
        let videoModal = document.getElementById('videoModalOverlay');
        if(!videoModal) {
            const div = document.createElement('div');
            div.id = 'videoModalOverlay';
            div.className = 'modal-overlay';
            div.innerHTML = `
                <div class="modal-box" style="width: 90%; max-width: 800px; padding: 0; background: #000; overflow:hidden;">
                    <i class="fas fa-times" onclick="document.getElementById('videoModalOverlay').style.display='none'; document.getElementById('ytFrame').src='';" 
                       style="color:white; position: absolute; top: 10px; right: 15px; font-size: 25px; cursor: pointer; z-index:10;"></i>
                    <div style="position: relative; padding-bottom: 56.25%; height: 0;">
                        <iframe id="ytFrame" src="" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;" allowfullscreen></iframe>
                    </div>
                </div>
            `;
            document.body.appendChild(div);
            videoModal = div;
        }
        document.getElementById('ytFrame').src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        videoModal.style.display = 'flex';
    } else {
        alert("رابط الفيديو غير صحيح");
    }
}

// --- 4. نظام خدمة VIP (مع التقويم الأنيق Flatpickr) ---
let selectedCarName = "";

// دالة فتح نافذة الـ VIP
window.openVipModal = async function(propTitle) {
    const modal = document.getElementById('vipModal');
    if(!modal) return;

    modal.style.display = 'flex';
    document.getElementById('vipPropTitle').value = propTitle;
    
    // تصفير البيانات القديمة
    selectedCarName = "";
    document.getElementById('vipPhone').value = "";
    
    // >>> تفعيل التقويم الأنيق على خانة التاريخ <<<
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#vipDate", {
            enableTime: true,
            dateFormat: "d/m/Y h:i K", // الصيغة: 30/01/2026 04:30 PM
            minDate: "today",
            disableMobile: "true", // لإجبار الشكل الأنيق على الموبايل
            time_24hr: false
        });
        document.getElementById('vipDate').value = ""; // تصفير القيمة
    }

    // تحميل السيارات من قاعدة البيانات
    const carGrid = document.getElementById('carSelection');
    carGrid.innerHTML = '<p style="color:#aaa; font-size:0.8rem; text-align:center; grid-column:1/-1;">جاري تحميل الأسطول...</p>';

    try {
        const q = query(collection(db, "vip_cars"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        carGrid.innerHTML = ""; // مسح رسالة التحميل

        if (querySnapshot.empty) {
            carGrid.innerHTML = '<p style="color:#aaa; grid-column:1/-1; text-align:center;">لا توجد سيارات متاحة حالياً.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const car = doc.data();
            
            // قيم افتراضية لو البيانات ناقصة
            const year = car.year || '2026';
            const color = car.color || 'ملكي';
            const seats = car.seats || '4';

            // إنشاء كارت السيارة
            const carDiv = document.createElement('div');
            carDiv.className = 'car-option';
            carDiv.onclick = function() { selectCar(this, car.name); };
            
            carDiv.innerHTML = `
                <img src="${car.image}" alt="${car.name}">
                <h4 style="margin-bottom:5px; font-size: 0.9rem;">${car.name}</h4>
                <div style="display:flex; justify-content:center; gap:8px; font-size:0.7rem; color:#aaa; border-top:1px solid rgba(255,255,255,0.1); padding-top:5px;">
                    <span title="الموديل"><i class="fas fa-calendar" style="color:var(--gold)"></i> ${year}</span>
                    <span title="اللون"><i class="fas fa-palette" style="color:var(--gold)"></i> ${color}</span>
                    <span title="الركاب"><i class="fas fa-users" style="color:var(--gold)"></i> ${seats}</span>
                </div>
            `;
            carGrid.appendChild(carDiv);
        });

    } catch (error) {
        console.error("Error fetching cars:", error);
        carGrid.innerHTML = '<p style="color:red; grid-column:1/-1; text-align:center;">حدث خطأ في تحميل السيارات.</p>';
    }
}

window.closeVipModal = function() {
    document.getElementById('vipModal').style.display = 'none';
}

window.selectCar = function(element, carName) {
    document.querySelectorAll('.car-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedCarName = carName;
}

window.submitVipRequest = async function() {
    const propTitle = document.getElementById('vipPropTitle').value;
    const date = document.getElementById('vipDate').value;
    const phone = document.getElementById('vipPhone').value;

    if(!selectedCarName) { alert("من فضلك اختر السيارة أولاً"); return; }
    if(!date) { alert("من فضلك حدد موعد المعاينة"); return; }
    if(phone.length < 10) { alert("من فضلك اكتب رقم هاتفك للتواصل"); return; }

    const btn = document.querySelector('#vipModal button');
    const originalText = btn.innerHTML;
    btn.innerHTML = "جاري الحجز...";
    btn.disabled = true;

    try {
        // حفظ الطلب في Firebase
        await addDoc(collection(db, "vip_requests"), {
            property: propTitle,
            car: selectedCarName,
            appointment: date,
            clientPhone: phone,
            createdAt: Date.now(),
            status: "pending"
        });

        // فتح الواتساب للتأكيد
        // (تم استبدال المسافات والرموز لضمان عمل الرابط)
        const msg = `مرحباً، أرغب في حجز معاينة VIP 👑\n🏠 العقار: ${propTitle}\n🚗 السيارة: ${selectedCarName}\n📅 الموعد: ${date}`;
        const encodedMsg = encodeURIComponent(msg);
        
        window.open(`https://wa.me/201000000000?text=${encodedMsg}`, '_blank');
        
        closeVipModal();
        alert("تم استلام طلبك بنجاح!");

    } catch (error) {
        console.error(error);
        alert("حدث خطأ، حاول مرة أخرى.");
    }

    btn.innerHTML = originalText;
    btn.disabled = false;
}

// --- 5. جلب وعرض العقارات (Fetch & Render) ---
let allPropertiesData = [];

async function fetchProperties() {
    const gridProps = document.getElementById('propertiesGrid');
    const gridHome = document.getElementById('properties-grid');

    try {
        const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        allPropertiesData = [];
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            allPropertiesData.push(data);
        });

        if (gridProps) renderProperties(allPropertiesData, 'propertiesGrid');
        if (gridHome) renderProperties(allPropertiesData.slice(0, 6), 'properties-grid');

    } catch (error) {
        console.error("Error fetching properties:", error);
    }
}

function renderProperties(properties, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = "";
    if (properties.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; grid-column:1/-1; padding:20px; color:#aaa;">لا توجد وحدات مطابقة حالياً.</p>';
        return;
    }

    properties.forEach(prop => {
        const imgUrl = (prop.images && prop.images.length > 0) ? prop.images[0] : 'logo.png';
        const typeClass = prop.type === 'sale' ? 'sale' : 'rent';
        const typeText = prop.type === 'sale' ? 'تمليك' : 'إيجار';
        
        const rooms = prop.rooms || '-';
        const baths = prop.bathrooms || '-';
        const floor = prop.floor || '-';
        const area = prop.area || 0;

        let youtubeBtnHTML = '';
        if(prop.youtube && prop.youtube.length > 10) {
            youtubeBtnHTML = `
                <button onclick="openVideo('${prop.youtube}')" class="btn-video" title="شاهد فيديو">
                    <i class="fab fa-youtube"></i>
                </button>
            `;
        }

        const cardHTML = `
            <div class="prop-card">
                <div class="card-img-wrapper">
                    <img src="${imgUrl}" alt="${prop.title}">
                    <span class="badge ${typeClass}">${typeText}</span>
                    <span class="card-price">${prop.price.toLocaleString()} ج.م</span>
                </div>
                
                <div class="card-body">
                    <h3 class="card-title">${prop.title}</h3>
                    
                    <div class="card-features-grid">
                        <div class="feat-item" title="المساحة"><i class="fas fa-ruler-combined"></i> <span>${area} م²</span></div>
                        <div class="feat-item" title="الغرف"><i class="fas fa-bed"></i> <span>${rooms}</span></div>
                        <div class="feat-item" title="الحمامات"><i class="fas fa-bath"></i> <span>${baths}</span></div>
                        <div class="feat-item" title="الدور"><i class="fas fa-layer-group"></i> <span>${floor}</span></div>
                    </div>
                    
                    <div class="card-location">
                         <i class="fas fa-map-marker-alt" style="color:#d4af37"></i> ${prop.district}
                    </div>

                    <div class="card-actions">
                         <button onclick="openVipModal('${prop.title}')" class="btn-vip" title="حجز معاينة VIP">
                            <i class="fas fa-crown"></i> VIP
                        </button>

                        ${youtubeBtnHTML}
                        
                        <a href="https://wa.me/2${prop.phone}?text=السلام عليكم، مهتم بالعقار: ${prop.title}" target="_blank" class="btn-whatsapp">
                            <i class="fab fa-whatsapp"></i> واتساب
                        </a>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

// --- 6. الفلاتر الذكية (Smart Filters) ---
window.updatePriceRanges = function() {
    const offerType = document.getElementById('offerType').value;
    const priceSelect = document.getElementById('priceFilter');
    if(!priceSelect) return;

    priceSelect.innerHTML = '<option value="all">كل الأسعار</option>';
    let ranges = [];

    if (offerType === 'sale') {
        // أسعار البيع
        ranges = [
            { v: 'low', t: 'أقل من 500,000' },
            { v: '500000-1000000', t: 'من 500 ألف إلى مليون' },
            { v: '1000000-2500000', t: 'من 1 إلى 2.5 مليون' },
            { v: '2500000-5000000', t: 'من 2.5 إلى 5 مليون' },
            { v: '5000000-10000000', t: 'من 5 إلى 10 مليون' },
            { v: '10000000+', t: 'أكثر من 10 مليون' }
        ];
    } else {
        // أسعار الإيجار
        ranges = [
            { v: 'low', t: 'أقل من 3,000' },
            { v: '3000-5000', t: 'من 3,000 إلى 5,000' },
            { v: '5000-10000', t: 'من 5,000 إلى 10,000' },
            { v: '10000-20000', t: 'من 10,000 إلى 20,000' },
            { v: '20000-35000', t: 'من 20,000 إلى 35,000' },
            { v: '35000+', t: 'أكثر من 35,000' }
        ];
    }

    ranges.forEach(r => {
        const op = document.createElement('option');
        op.value = r.v; op.innerText = r.t; priceSelect.appendChild(op);
    });
}

window.applyFilters = function() {
    const offerType = document.getElementById('offerType').value;
    const area = document.getElementById('areaFilter').value;
    const priceRange = document.getElementById('priceFilter').value;
    const propType = document.getElementById('propType').value;

    const filtered = allPropertiesData.filter(item => {
        if(item.type !== offerType) return false;
        if(area !== 'all' && item.district !== area) return false;
        
        if(priceRange !== 'all') {
            const p = Number(item.price);
            if(priceRange === 'low') {
                const limit = offerType === 'sale' ? 500000 : 3000;
                if(p >= limit) return false;
            } else if(priceRange.includes('+')) {
                const limit = parseInt(priceRange);
                if(p < limit) return false;
            } else {
                const [min, max] = priceRange.split('-').map(Number);
                if(p < min || p > max) return false;
            }
        }

        if(propType !== 'all') {
            const title = item.title.toLowerCase();
            let k = '';
            if(propType === 'apartment') k = 'شقة';
            if(propType === 'villa') k = 'فيلا';
            if(propType === 'store') k = 'محل';
            if(k && !title.includes(k)) return false;
        }
        return true;
    });
    renderProperties(filtered, 'propertiesGrid');
}

// --- 7. التحميل الأولي ---
document.addEventListener('DOMContentLoaded', () => {
    fetchProperties();
    if(window.updatePriceRanges) window.updatePriceRanges();
    const btn = document.querySelector('.search-btn');
    if(btn) btn.addEventListener('click', window.applyFilters);
});