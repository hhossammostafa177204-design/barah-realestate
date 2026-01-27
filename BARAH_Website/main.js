// --- 1. دالة تغيير الأسعار الديناميكية ---
function updatePriceRanges() {
    const offerType = document.getElementById('offerType').value;
    const priceSelect = document.getElementById('priceFilter');
    
    // تفريغ القائمة الحالية
    priceSelect.innerHTML = '<option value="all">كل الأسعار</option>';

    if (offerType === 'sale') {
        // === أسعار التمليك (بالملايين) ===
        const saleRanges = [
            { val: 'low', text: 'أقل من 500 ألف' },
            { val: '500-750', text: 'من 500 ألف إلى 750 ألف' },
            { val: '750-1000', text: 'من 750 ألف إلى 1 مليون' },
            { val: '1000-1500', text: 'من 1 مليون إلى 1.5 مليون' },
            { val: '1500-2000', text: 'من 1.5 مليون إلى 2 مليون' },
            { val: '2000-3000', text: 'من 2 مليون إلى 3 مليون' },
            { val: '3000+', text: 'أكثر من 3 مليون' }
        ];
        // إضافة الخيارات للقائمة
        saleRanges.forEach(range => {
            let option = document.createElement('option');
            option.value = range.val;
            option.innerText = range.text;
            priceSelect.appendChild(option);
        });

    } else {
        // === أسعار الإيجار (بالألوف) ===
        const rentRanges = [
            { val: 'low', text: 'أقل من 3,000 ج.م' },
            { val: '3000-5000', text: 'من 3,000 إلى 5,000 ج.م' },
            { val: '5000-7000', text: 'من 5,000 إلى 7,000 ج.م' },
            { val: '7000-10000', text: 'من 7,000 إلى 10,000 ج.م' },
            { val: '10000-15000', text: 'من 10,000 إلى 15,000 ج.م' },
            { val: '15000+', text: 'أكثر من 15,000 ج.م' }
        ];
        // إضافة الخيارات للقائمة
        rentRanges.forEach(range => {
            let option = document.createElement('option');
            option.value = range.val;
            option.innerText = range.text;
            priceSelect.appendChild(option);
        });
    }
}