/* اسم الملف: main.js */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

// --- 2. منطق تسجيل الدخول (Google) ---
window.openLoginModal = () => document.getElementById('loginModal').style.display = 'flex';
window.closeLoginModal = () => document.getElementById('loginModal').style.display = 'none';

window.loginWithGoogle = async function() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        closeLoginModal();
    } catch (error) {
        console.error("Login Error:", error);
        alert("حدث خطأ: " + error.message);
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

// --- 3. جلب العقارات ---
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
        console.error("Error fetching:", error);
    }
}

function renderProperties(properties, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = "";
    if (properties.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; grid-column:1/-1; padding:20px;">لا توجد وحدات مطابقة.</p>';
        return;
    }

    properties.forEach(prop => {
        const imgUrl = (prop.images && prop.images.length > 0) ? prop.images[0] : 'logo.png';
        const typeClass = prop.type === 'sale' ? 'sale' : 'rent';
        const typeText = prop.type === 'sale' ? 'تمليك' : 'إيجار';
        const specsText = prop.specs ? prop.specs : `${prop.area || 0} م²`;

        const cardHTML = `
            <div class="prop-card">
                <div class="card-img-wrapper">
                    <img src="${imgUrl}" alt="${prop.title}">
                    <span class="badge ${typeClass}">${typeText}</span>
                    <span class="card-price">${prop.price.toLocaleString()} ج.م</span>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${prop.title}</h3>
                    <div class="card-features">
                        <span><i class="fas fa-map-marker-alt" style="color:#d4af37"></i> ${prop.district}</span>
                        <span><i class="fas fa-ruler-combined" style="color:#d4af37"></i> ${specsText}</span>
                    </div>
                    <div style="margin-top:auto;">
                        <a href="https://wa.me/2${prop.phone}?text=مهتم بالعقار: ${prop.title}" target="_blank" class="btn-primary" style="width:100%; justify-content:center; text-decoration:none;">
                            <i class="fab fa-whatsapp"></i> تواصل واتساب
                        </a>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

// --- 4. الفلاتر والأسعار (محدث) ---
window.updatePriceRanges = function() {
    const offerType = document.getElementById('offerType').value;
    const priceSelect = document.getElementById('priceFilter');
    if(!priceSelect) return;

    priceSelect.innerHTML = '<option value="all">كل الأسعار</option>';
    let ranges = [];

    if (offerType === 'sale') {
        ranges = [
            { v: 'low', t: 'أقل من مليون' },
            { v: '1000000-2500000', t: 'من 1 إلى 2.5 مليون' },
            { v: '2500000-5000000', t: 'من 2.5 إلى 5 مليون' },
            { v: '5000000-8000000', t: 'من 5 إلى 8 مليون' },
            { v: '8000000-15000000', t: 'من 8 إلى 15 مليون' },
            { v: '15000000+', t: 'أكثر من 15 مليون' }
        ];
    } else {
        ranges = [
            { v: 'low', t: 'أقل من 5,000' },
            { v: '5000-10000', t: 'من 5 إلى 10 آلاف' },
            { v: '10000-20000', t: 'من 10 إلى 20 ألف' },
            { v: '20000-40000', t: 'من 20 إلى 40 ألف' },
            { v: '40000+', t: 'أكثر من 40 ألف' }
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
                const limit = offerType === 'sale' ? 1000000 : 5000;
                if(p >= limit) return false;
            } else if(priceRange.includes('+')) {
                if(p < parseInt(priceRange)) return false;
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

document.addEventListener('DOMContentLoaded', () => {
    fetchProperties();
    if(window.updatePriceRanges) window.updatePriceRanges();
    const btn = document.querySelector('.search-btn');
    if(btn) btn.addEventListener('click', window.applyFilters);
});