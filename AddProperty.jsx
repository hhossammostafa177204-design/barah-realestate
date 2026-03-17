import React, { useState } from 'react';
import { 
  Plus, MapPin, Bed, Bath, ArrowUpCircle, Car, 
  Video, Image, Check, ChevronDown, Layers, Home
} from 'lucide-react';

const AddProperty = () => {
  // بيانات المسوق (تُسحب تلقائياً من نظام تسجيل الدخول)
  const agentInfo = { name: "حسام مصطفى", phone: "01xxxxxxxxx" };

  // قائمة أحياء مدينة العبور كاملة للفلاتر
  const obourDistricts = [
    "الحي الأول", "الحي الثاني", "الحي الثالث", "الحي الرابع", "الحي الخامس", 
    "الحي السادس", "الحي السابع", "الحي الثامن", "الحي التاسع", "حي الشباب", 
    "الإسكان العائلي", "المنطقة الترفيهية", "جمعية عرابي", "العبور الجديدة", "حي الروضة"
  ];

  // حالة الخصائص (الأزرار العائمة)
  const [features, setFeatures] = useState({
    elevator: false,
    garage: false,
    garden: false,
    balcony: false
  });

  const toggleFeature = (key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans p-6" dir="rtl">
      
      {/* العنوان الملوكي */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f9e498] to-[#d4af37]">
          إضافة عقار جديد
        </h1>
        <div className="h-1 w-24 bg-[#d4af37] mx-auto mt-2 rounded-full shadow-[0_0_10px_#d4af37]"></div>
      </div>

      <div className="max-w-4xl mx-auto bg-[#111] border border-[#d4af37]/20 rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.7)]">
        
        {/* قسم الميديا العائم */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="group bg-[#161616] border-2 border-dashed border-[#d4af37]/30 hover:border-[#d4af37] rounded-3xl p-10 transition-all cursor-pointer text-center relative overflow-hidden">
            <Image className="mx-auto mb-4 text-[#d4af37] group-hover:scale-110 transition-transform" size={48} />
            <span className="text-[#d4af37] font-bold block">إضافة صور العقار الملكية</span>
            <div className="absolute inset-0 bg-[#d4af37]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="relative group flex-1">
              <input 
                type="text" 
                placeholder="رابط فيديو المعاينة" 
                className="w-full h-full bg-[#161616] border border-[#d4af37]/20 rounded-2xl p-6 pr-14 focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-700"
              />
              <Video className="absolute right-6 top-1/2 -translate-y-1/2 text-[#d4af37]" size={24} />
            </div>
          </div>
        </div>

        {/* تفاصيل العقار */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* الحي في العبور */}
          <div className="relative group">
            <label className="text-[#d4af37] text-xs font-bold mb-2 block mr-4">موقع العقار (أحياء العبور)</label>
            <div className="relative">
              <select className="w-full bg-[#161616] border border-[#d4af37]/20 rounded-2xl p-5 appearance-none outline-none focus:border-[#d4af37] transition-all cursor-pointer">
                {obourDistricts.map(district => (
                  <option key={district} className="bg-[#111]">{district}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-6 top-1/2 -translate-y-1/2 text-[#d4af37]" size={20} />
            </div>
          </div>

          {/* السعر */}
          <div>
            <label className="text-[#d4af37] text-xs font-bold mb-2 block mr-4">السعر المطلوب (EGP)</label>
            <input type="number" placeholder="0.00" className="w-full bg-[#161616] border border-[#d4af37]/20 rounded-2xl p-5 outline-none focus:border-[#d4af37] transition-all placeholder:text-gray-800 font-mono text-xl" />
          </div>

          {/* الغرف والحمامات والدور */}
          <div className="grid grid-cols-3 gap-4 md:col-span-2">
            <div className="bg-[#161616] border border-[#d4af37]/10 rounded-2xl p-4 text-center">
              <Bed className="mx-auto text-[#d4af37] mb-2" size={20} />
              <input type="number" placeholder="الغرف" className="w-full bg-transparent text-center outline-none" />
            </div>
            <div className="bg-[#161616] border border-[#d4af37]/10 rounded-2xl p-4 text-center">
              <Bath className="mx-auto text-[#d4af37] mb-2" size={20} />
              <input type="number" placeholder="الحمامات" className="w-full bg-transparent text-center outline-none" />
            </div>
            <div className="bg-[#161616] border border-[#d4af37]/10 rounded-2xl p-4 text-center">
              <Layers className="mx-auto text-[#d4af37] mb-2" size={20} />
              <input type="number" placeholder="الدور" className="w-full bg-transparent text-center outline-none" />
            </div>
          </div>
        </div>

        {/* المميزات الإضافية (الأزرار العائمة المبهرة) */}
        <div className="mb-12">
          <h3 className="text-center text-[#d4af37] font-bold mb-8 tracking-widest uppercase text-sm">المميزات والخدمات</h3>
          <div className="flex flex-wrap justify-center gap-10">
            <FeatureButton 
              active={features.elevator} 
              onClick={() => toggleFeature('elevator')} 
              icon={<ArrowUpCircle />} 
              label="أسانسير" 
            />
            <FeatureButton 
              active={features.garage} 
              onClick={() => toggleFeature('garage')} 
              icon={<Car />} 
              label="جراج" 
            />
            <FeatureButton 
              active={features.garden} 
              onClick={() => toggleFeature('garden')} 
              icon={<Home />} 
              label="حديقة" 
            />
          </div>
        </div>

        {/* بيانات المسوق الآلية */}
        <div className="bg-gradient-to-l from-[#161616] to-transparent border-r-4 border-[#d4af37] p-6 rounded-2xl flex justify-between items-center mb-10">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">المسوق المعتمد</p>
            <h4 className="text-lg font-bold text-[#d4af37]">{agentInfo.name}</h4>
          </div>
          <p className="text-[#d4af37] font-mono tracking-tighter text-lg">{agentInfo.phone}</p>
        </div>

        {/* زر الإدراج الفخم */}
        <button className="w-full py-6 bg-gradient-to-r from-[#d4af37] via-[#f9e498] to-[#d4af37] text-black font-black text-xl rounded-2xl shadow-[0_15px_40px_rgba(212,175,55,0.3)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.5)] transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest">
          إدراج العقار في المعرض
        </button>

      </div>
    </div>
  );
};

// مكون الزر العائم التفاعلي
const FeatureButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className="group flex flex-col items-center gap-3"
  >
    <div className={`
      w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-700 relative
      ${active 
        ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-[0_0_25px_#d4af37] scale-110 rotate-[360deg]' 
        : 'bg-transparent border-gray-800 text-gray-600 hover:border-[#d4af37]/40'}
    `}>
      {React.cloneElement(icon, { size: 32 })}
      {active && <Check className="absolute -top-1 -right-1 bg-black text-[#d4af37] rounded-full p-1" size={20} />}
    </div>
    <span className={`text-xs font-bold tracking-widest transition-colors ${active ? 'text-[#d4af37]' : 'text-gray-700'}`}>
      {label}
    </span>
  </button>
);

export default AddProperty;