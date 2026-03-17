import React, { useState } from 'react';
import { 
  Plus, MapPin, Bed, Bath, ArrowUpCircle, Car, 
  Video, Image, Check, ChevronDown 
} from 'lucide-react';

const RoyalPropertyForm = () => {
  // بيانات المسوق (بتيجي تلقائي من السيستم)
  const agentInfo = { name: "حسام مصطفى", phone: "01xxxxxxxxx" };

  // أحياء مدينة العبور
  const obourDistricts = [
    "الحي الأول", "الحي الثاني", "الحي الثالث", "الحي الرابع", "الحي الخامس", 
    "الحي السادس", "الحي السابع", "الحي الثامن", "الحي التاسع", "حي الشباب", 
    "الإسكان العائلي", "المنطقة الترفيهية", "جمعية عرابي", "العبور الجديدة"
  ];

  // State للمميزات (الأيقونات العائمة)
  const [features, setFeatures] = useState({
    elevator: false,
    garage: false,
    furnished: false,
    garden: false
  });

  const toggleFeature = (key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans p-4 md:p-8" dir="rtl">
      
      {/* Header الفخم */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f9e498] to-[#d4af37] mb-2">
          إضافة عقار ملكي
        </h1>
        <p className="text-[#888] tracking-widest uppercase text-sm">Al Obour City Luxury Real Estate</p>
      </div>

      <div className="max-w-4xl mx-auto bg-[#111] border border-[#d4af37]/20 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* قسم الميديا (صور وفيديو) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="group relative overflow-hidden bg-[#1a1a1a] border-2 border-dashed border-[#d4af37]/30 hover:border-[#d4af37] rounded-2xl p-8 transition-all cursor-pointer text-center">
            <Image className="mx-auto mb-3 text-[#d4af37] group-hover:scale-110 transition-transform" size={40} />
            <span className="block text-[#d4af37] font-bold">إضافة صور العقار</span>
          </div>
          
          <div className="relative group">
            <input 
              type="text" 
              placeholder="لينك فيديو المعاينة (YouTube / Drive)" 
              className="w-full h-full bg-[#1a1a1a] border border-[#d4af37]/20 rounded-2xl p-6 pr-14 focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-600"
            />
            <Video className="absolute right-6 top-1/2 -translate-y-1/2 text-[#d4af37]/50 group-focus-within:text-[#d4af37]" size={24} />
          </div>
        </div>

        {/* الفورم الأساسي */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* الحي في العبور */}
          <div className="relative">
            <label className="block text-[#d4af37] text-sm mb-2 mr-2">موقع العقار (الحي)</label>
            <select className="w-full bg-[#1a1a1a] border border-[#d4af37]/20 rounded-xl p-4 appearance-none outline-none focus:border-[#d4af37]">
              {obourDistricts.map(district => (
                <option key={district} className="bg-[#111]">{district}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-4 bottom-4 text-[#d4af37]" size={20} />
          </div>

          {/* السعر */}
          <div>
            <label className="block text-[#d4af37] text-sm mb-2 mr-2">السعر المطلوب</label>
            <input type="number" placeholder="000,000 EGP" className="w-full bg-[#1a1a1a] border border-[#d4af37]/20 rounded-xl p-4 outline-none focus:border-[#d4af37]" />
          </div>

          {/* الغرف والحمامات */}
          <div className="flex gap-4">
            <div className="flex-1">
               <label className="flex items-center gap-2 text-[#d4af37] text-sm mb-2"><Bed size={16}/> الغرف</label>
               <input type="number" className="w-full bg-[#1a1a1a] border border-[#d4af37]/20 rounded-xl p-4 outline-none focus:border-[#d4af37]" />
            </div>
            <div className="flex-1">
               <label className="flex items-center gap-2 text-[#d4af37] text-sm mb-2"><Bath size={16}/> الحمامات</label>
               <input type="number" className="w-full bg-[#1a1a1a] border border-[#d4af37]/20 rounded-xl p-4 outline-none focus:border-[#d4af37]" />
            </div>
          </div>

          {/* نوع العملية والتشطيب */}
          <div className="flex gap-4">
            <select className="flex-1 bg-[#1a1a1a] border border-[#d4af37]/20 rounded-xl p-4 outline-none focus:border-[#d4af37]">
              <option>بيع</option>
              <option>إيجار</option>
            </select>
            <select className="flex-1 bg-[#1a1a1a] border border-[#d4af37]/20 rounded-xl p-4 outline-none focus:border-[#d4af37]">
              <option>سوبر لوكس</option>
              <option>نصف تشطيب</option>
              <option>بدون تشطيب</option>
            </select>
          </div>
        </div>

        {/* الأزرار العائمة للمميزات (The Interactive Part) */}
        <div className="mt-12 text-center">
          <p className="text-[#d4af37] font-bold mb-6">المميزات الإضافية (اضغط للتحديد)</p>
          <div className="flex flex-wrap justify-center gap-8">
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
              icon={<Plus />} 
              label="حديقة" 
            />
          </div>
        </div>

        {/* بيانات المسوق (تلقائية) */}
        <div className="mt-12 p-4 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl flex justify-between items-center">
          <div className="text-right">
            <span className="block text-xs text-gray-500 uppercase">المسوق المسؤول</span>
            <span className="text-[#d4af37] font-bold">{agentInfo.name}</span>
          </div>
          <div className="text-left font-mono text-[#d4af37]">{agentInfo.phone}</div>
        </div>

        {/* زر النشر النهائي */}
        <button className="w-full mt-10 py-5 bg-gradient-to-r from-[#d4af37] to-[#f9e498] text-black font-black text-xl rounded-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1">
          إدراج العقار في السوق
        </button>

      </div>
    </div>
  );
};

// Component للأزرار التفاعلية العائمة
const FeatureButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`group flex flex-col items-center gap-2 transition-all duration-500`}
  >
    <div className={`
      w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-500
      ${active 
        ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-[0_0_20px_#d4af37] scale-110' 
        : 'bg-transparent border-gray-700 text-gray-500 hover:border-[#d4af37]/50'}
    `}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <span className={`text-xs font-bold ${active ? 'text-[#d4af37]' : 'text-gray-600'}`}>
      {label}
    </span>
  </button>
);

export default RoyalPropertyForm;