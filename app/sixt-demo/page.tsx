'use client';
import { useState } from 'react';

const categories = [
  { id: 'sedan', label: 'Limousine', icon: '🚗' },
  { id: 'suv', label: 'SUV', icon: '🚙' },
  { id: 'STATION_WAGON', label: 'Kombi', icon: '🚐' },
];

export default function SixtDemo() {
  const [selectedCat, setSelectedCat] = useState('suv');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [dates, setDates] = useState({
    pu: '2026-06-01',
    do: '2026-06-05'
  });

  const isWeekend = (dateString: string) => {
    const day = new Date(dateString).getDay();
    return day === 0 || day === 6; // 0 = Pazar, 6 = Cumartesi
  };

  const hasWeekendSelection = isWeekend(dates.pu) || isWeekend(dates.do);

  const handleSearch = async () => {
    if (hasWeekendSelection) return;
    setLoading(true);
    try {
      // Seçilen tarihleri API'ye gönderiyoruz
      const res = await fetch(`/api/sixt?category=${selectedCat}&puDate=${dates.pu}&doDate=${dates.do}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      alert('Sorgulama sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 flex justify-between items-center border-b pb-8">
          <div>
            <h1 className="text-5xl font-black text-black uppercase italic tracking-tighter leading-none">
              RENT-EX <span className="text-[#ff5f00]">DORNBIRN</span>
            </h1>
            <p className="text-gray-400 mt-2 font-bold uppercase text-[10px] tracking-[0.2em]">Sixt Fleet Integration • Exclusive Branch Access</p>
          </div>
          <div className="text-right">
            <span className="bg-[#ff5f00] text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full italic">Dornbirn Center</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar / Filters */}
          <div className="lg:col-span-1 space-y-8">
            <section>
              <h2 className="text-xs font-black text-black uppercase tracking-widest mb-6 border-l-4 border-[#ff5f00] pl-3">Kategori</h2>
              <div className="flex flex-col gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.id)}
                    className={`p-4 rounded-xl transition-all text-left flex items-center justify-between group ${
                      selectedCat === cat.id 
                      ? 'bg-black text-white shadow-xl translate-x-2' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-bold uppercase text-[10px] tracking-widest">{cat.label}</span>
                    </div>
                    {selectedCat === cat.id && <span className="text-[#ff5f00]">●</span>}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xs font-black text-black uppercase tracking-widest mb-6 border-l-4 border-[#ff5f00] pl-3">Tarih Aralığı</h2>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase">Alış Tarihi</label>
                <input 
                  type="date" 
                  className={`w-full p-3 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-[#ff5f00] ${isWeekend(dates.pu) ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-50 text-black'}`}
                  value={dates.pu}
                  onChange={(e) => setDates({...dates, pu: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase">Dönüş Tarihi</label>
                <input 
                  type="date" 
                  className={`w-full p-3 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-[#ff5f00] ${isWeekend(dates.do) ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-50 text-black'}`}
                  value={dates.do}
                  onChange={(e) => setDates({...dates, do: e.target.value})}
                />
              </div>

              {hasWeekendSelection && (
                <div className="p-3 bg-red-100 rounded-lg text-[9px] font-bold text-red-600 uppercase leading-relaxed">
                  ⚠️ Dornbirn Şubesi Hafta Sonları (Cumartesi-Pazar) Kapalıdır. Lütfen Hafta İçi Bir Tarih Seçin.
                </div>
              )}
            </section>

            <button 
              onClick={handleSearch}
              className="w-full bg-[#ff5f00] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:grayscale"
              disabled={loading || hasWeekendSelection}
            >
              {loading ? 'Sorgulanıyor...' : 'Araçları Getir'}
            </button>
          </div>


          {/* Main Grid */}
          <div className="lg:col-span-3">
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((car, i) => (
                  <div key={i} className="bg-white border-2 border-gray-50 rounded-3xl p-6 hover:border-[#ff5f00] transition-all group">
                    <div className="h-40 mb-6 flex items-center justify-center relative overflow-hidden rounded-2xl bg-gray-50">
                      <img src={car.image} alt={car.model} className="max-h-full object-contain relative z-10 transform group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center text-gray-100 font-black text-6xl opacity-20 pointer-events-none select-none">SIXT</div>
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="mb-6">
                        <h3 className="text-xl font-black text-black uppercase italic group-hover:text-[#ff5f00] transition-colors">{car.model}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{car.transmission} • Klima • 5 Koltuk</p>
                        <p className="text-[9px] text-[#ff5f00] font-black mt-1 uppercase tracking-tighter">{car.group}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase">Toplam</p>
                        <span className="text-2xl font-black text-black">{car.price}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Günlük</p>
                        <span className="text-sm font-bold text-[#ff5f00]">{car.daily}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-gray-50 rounded-3xl border-4 border-dashed border-gray-100">
                <div className="text-8xl mb-6 opacity-20">🔎</div>
                <h3 className="text-2xl font-black text-gray-300 uppercase italic">Arama Bekleniyor</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Soldaki menüden seçim yapıp sorgulayın</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
