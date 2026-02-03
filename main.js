/* ملف الإعدادات العامة للموقع
    يقوم بإضافة زر الرجوع تلقائياً لأي صفحة يتم استدعاؤه فيها
*/

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. إنشاء عنصر الزر
    const backBtn = document.createElement("a");
    
    // 2. إضافة الأيقونة والوظيفة (الرجوع للخلف)
    backBtn.innerHTML = '<i class="fas fa-arrow-right"></i>';
    backBtn.href = "javascript:history.back()";
    backBtn.title = "رجوع للسابق";
    
    // 3. تطبيق التنسيق (CSS) مباشرة من هنا عشان ما تحتاجش ملف CSS
    Object.assign(backBtn.style, {
        position: "fixed",
        top: "25px",
        right: "25px",          // أقصى اليمين
        width: "45px",
        height: "45px",
        background: "rgba(0, 0, 0, 0.8)", // خلفية سوداء شفافة
        color: "#D4AF37",       // اللون الذهبي
        border: "2px solid #D4AF37",
        borderRadius: "50%",    // دائري
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        zIndex: "999999",       // فوق كل العناصر
        fontSize: "1.2rem",
        boxShadow: "0 0 15px rgba(212, 175, 55, 0.3)",
        backdropFilter: "blur(5px)",
        transition: "all 0.3s ease",
        cursor: "pointer"
    });

    // 4. تأثيرات عند مرور الماوس (Hover)
    backBtn.onmouseover = function() {
        this.style.transform = "scale(1.1)";
        this.style.background = "#D4AF37";
        this.style.color = "#000";
        this.style.boxShadow = "0 0 25px rgba(212, 175, 55, 0.6)";
    };

    backBtn.onmouseout = function() {
        this.style.transform = "scale(1)";
        this.style.background = "rgba(0, 0, 0, 0.8)";
        this.style.color = "#D4AF37";
        this.style.boxShadow = "0 0 15px rgba(212, 175, 55, 0.3)";
    };

    // 5. إضافة الزر للصفحة
    document.body.appendChild(backBtn);
});