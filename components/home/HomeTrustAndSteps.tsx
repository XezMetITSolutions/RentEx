'use client';

import React, { useState } from 'react';
import { 
    Calendar, 
    Car, 
    Key, 
    Star, 
    ChevronDown, 
    ChevronUp,
    Quote
} from 'lucide-react';

export default function HomeTrustAndSteps() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const steps = [
        {
            icon: <Car className="w-8 h-8 text-red-500" />,
            title: "1. Aracını Seç",
            desc: "Geniş filomuzdan ihtiyacına en uygun binek araç veya panelvanı kolayca filtrele."
        },
        {
            icon: <Calendar className="w-8 h-8 text-red-500" />,
            title: "2. Tarihleri Belirle",
            desc: "Alış ve iade tarihlerini seç, ihtiyacın olan ek paket ve sigorta seçeneklerini ekle."
        },
        {
            icon: <Key className="w-8 h-8 text-red-500" />,
            title: "3. Teslim Al",
            desc: "Güvenli online ödemeni tamamla, aracını seçtiğin şubeden hızlıca teslim al."
        }
    ];

    const testimonials = [
        {
            name: "Maximilian Müller",
            role: "İş İnsanı",
            text: "Feldkirch şubesinden Fiat Ducato kiraladım. Taşıma sürecim o kadar pürüzsüz geçti ki! Araç temizdi, teslimat 5 dakika sürdü. Kesinlikle tavsiye ederim.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
        },
        {
            name: "Sarah Lindt",
            role: "Gezgin",
            text: "Hafta sonu tatili için Ford Mustang kiraladık. Hem fiyatlar çok makuldü hem de müşteri hizmetleri çok ilgiliydi. Online ödeme sistemi harika çalışıyor.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80"
        },
        {
            name: "Alexander K.",
            role: "Düzenli Müşteri",
            text: "RentEx'i iş seyahatlerimde sürekli kullanıyorum. Araçlarının bakımları tam ve yeni model. Fatura süreçleri ve şeffaflıkları çok başarılı.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80"
        }
    ];

    const faqs = [
        {
            q: "Minimum kiralama yaşı ve ehliyet gereksinimleri nelerdir?",
            a: "Binek araçlar için minimum yaş 21'dir ve en az 1 yıllık geçerli bir ehliyete sahip olmanız gerekmektedir. Lüks araçlar veya büyük ticari araçlar için bu sınır 25 yaş ve en az 3 yıllık ehliyet olarak değişiklik gösterebilir."
        },
        {
            q: "Kiralama esnasında depozito alınıyor mu?",
            a: "Evet, her kiralama işleminde araca göre değişen tutarlarda bir depozito (güvence bedeli) geçici olarak bloke edilir. Araç hasarsız olarak teslim edildiğinde bu tutar kartınıza anında iade edilir."
        },
        {
            q: "Yakıt politikası nasıl işliyor?",
            a: "RentEx standart olarak 'Dolu Al - Dolu Ver' politikasıyla çalışır. Aracı teslim alırken deposu doludur; sizden de teslim ederken deposunu doldurarak getirmeniz beklenir."
        },
        {
            q: "Rezervasyonumu iptal edebilir veya değiştirebilir miyim?",
            a: "Evet, planlanan alış saatinden 24 saat öncesine kadar yapılan iptallerde herhangi bir ücret kesintisi olmadan %100 iade alabilirsiniz. Değişiklik talepleriniz için destek ekibimizle iletişime geçebilirsiniz."
        }
    ];

    return (
        <div className="space-y-32 py-20 bg-white dark:bg-black">
            
            {/* 1. HOW IT WORKS SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                    <span className="text-xs font-black tracking-widest text-red-500 uppercase">Kolaylık</span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Nasıl Kiralayabilirim?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-sm">
                        3 basit adımda dilediğiniz aracı rezerve edin, yola koyulun.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-zinc-900/40 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800/80 hover:border-red-500/20 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
                            <div className="mb-6 inline-block p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700/50">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. TESTIMONIALS SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                    <span className="text-xs font-black tracking-widest text-red-500 uppercase">Müşteri Deneyimi</span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Müşterilerimiz Ne Diyor?
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-zinc-900/30 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800/50 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex items-center gap-1">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>
                                <div className="relative">
                                    <Quote className="w-10 h-10 text-gray-200 dark:text-zinc-800 absolute -top-4 -left-2 -z-10" />
                                    <p className="text-gray-600 dark:text-zinc-300 text-sm italic leading-relaxed relative z-10">{t.text}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800/80">
                                <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t.name}</h4>
                                    <p className="text-xs text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. FAQ SECTION */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                    <span className="text-xs font-black tracking-widest text-red-500 uppercase">Destek</span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Sıkça Sorulan Sorular
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                            <div key={idx} className="bg-gray-50 dark:bg-zinc-900/30 border border-gray-100 dark:border-zinc-800/80 rounded-2xl overflow-hidden transition-all">
                                <button
                                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                                    className="w-full flex items-center justify-between p-6 text-left font-bold text-gray-900 dark:text-white focus:outline-none hover:text-red-500 transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    {isOpen ? <ChevronUp className="w-5 h-5 text-red-500" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {isOpen && (
                                    <div className="p-6 pt-0 border-t border-gray-100 dark:border-zinc-800/40 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed animate-in fade-in slide-in-from-top-1">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

        </div>
    );
}
