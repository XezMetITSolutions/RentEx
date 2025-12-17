<?php include 'includes/header.php'; ?>

<style>
.page-header {
    padding: 100px 0 60px;
    background: #000;
    color: #fff;
    text-align: center;
}

.about-section {
    padding: 80px 0;
}

.about-card {
    background: #fff;
    padding: 60px;
    border-radius: 40px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.05);
    border: 1px solid #f0f0f0;
}

.stat-grid-modern {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 40px;
    margin-top: 50px;
    padding-top: 50px;
    border-top: 1px solid #eee;
}

.stat-box {
    text-align: center;
}

.stat-val {
    font-size: 3rem;
    font-weight: 900;
    color: #E31E24;
    display: block;
    margin-bottom: 5px;
}

.stat-tit {
    color: #666;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 1px;
}
</style>

<div class="page-header">
    <div class="container">
        <h1 style="font-size: 3.5rem; font-weight: 900;">Hakkımızda <span style="color: #E31E24;">Rentex</span></h1>
        <p style="color: rgba(255,255,255,0.6);">Lüks ve konforun buluştuğu nokta. Bizimle yolculuğun tadını çıkarın.</p>
    </div>
</div>

<section class="about-section">
    <div class="container">
        <div class="about-card">
            <div style="max-width: 800px;">
                <h2 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 30px; line-height: 1.2;">Ayrıcalıklı Mobilite Deneyiminde <span style="color: #E31E24;">Güvenilir Ortağınız</span></h2>
                
                <p style="font-size: 1.15rem; color: #555; line-height: 1.8; margin-bottom: 25px;">
                    Rentex, premium araç kiralama sektöründe yenilikçi ve müşteri odaklı yaklaşımıyla öne çıkan bir markadır. Geniş ve her geçen gün büyüyen lüks araç filomuzla, sadece bir ulaşım aracı değil, unutulmaz bir deneyim sunuyoruz.
                </p>
                
                <p style="font-size: 1.15rem; color: #555; line-height: 1.8; margin-bottom: 25px;">
                    Merkezimiz ve stratejik noktalarımızla, iş seyahatlerinizden tatil kaçamaklarınıza kadar her türlü yolculuğunuzda size en yüksek standartlarda hizmet vermeyi amaçlıyoruz. Güvenlik, konfor ve şıklık Rentex'in temel taşlarıdır.
                </p>
            </div>

            <div class="stat-grid-modern">
                <div class="stat-box">
                    <span class="stat-val">45+</span>
                    <span class="stat-tit">Lüks Araç</span>
                </div>
                <div class="stat-box">
                    <span class="stat-val">12</span>
                    <span class="stat-tit">Yıllık Tecrübe</span>
                </div>
                <div class="stat-box">
                    <span class="stat-val">7/24</span>
                    <span class="stat-tit">Müşteri Desteği</span>
                </div>
                <div class="stat-box">
                    <span class="stat-val">%100</span>
                    <span class="stat-tit">Müşteri Memnuniyeti</span>
                </div>
            </div>
        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
