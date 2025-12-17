<?php include 'includes/header.php'; ?>

<style>
.page-header {
    padding: 100px 0 60px;
    background: #000;
    color: #fff;
    text-align: center;
}

.contact-section {
    padding: 80px 0;
}

.contact-card {
    background: #fff;
    padding: 40px;
    border-radius: 30px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
    border: 1px solid #f0f0f0;
}

.contact-info-item {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
}

.contact-icon {
    width: 60px;
    height: 60px;
    background: rgba(227,30,36,0.05);
    color: #E31E24;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.form-group-modern {
    margin-bottom: 20px;
}

.form-group-modern label {
    display: block;
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: #333;
}

.form-group-modern input,
.form-group-modern textarea {
    width: 100%;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 12px;
    background: #f9f9f9;
    outline: none;
    transition: all 0.3s;
}

.form-group-modern input:focus,
.form-group-modern textarea:focus {
    border-color: #E31E24;
    background: #fff;
    box-shadow: 0 5px 15px rgba(227,30,36,0.05);
}
</style>

<div class="page-header">
    <div class="container">
        <h1 style="font-size: 3.5rem; font-weight: 900;">Bize <span style="color: #E31E24;">Ulaşın</span></h1>
        <p style="color: rgba(255,255,255,0.6);">Sorularınız için her zaman buradayız. Size yardımcı olmaktan mutluluk duyarız.</p>
    </div>
</div>

<section class="contact-section">
    <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
            
            <!-- Contact Info -->
            <div class="contact-card">
                <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 40px;">İletişim Bilgileri</h2>
                
                <div class="contact-info-item">
                    <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
                    <div>
                        <h4 style="margin-bottom: 5px;">Adres</h4>
                        <p style="color: #666;">Rentex e.U.<br>Illstraße 75a<br>6800 Feldkirch</p>
                    </div>
                </div>

                <div class="contact-info-item">
                    <div class="contact-icon"><i class="fas fa-phone"></i></div>
                    <div>
                        <h4 style="margin-bottom: 5px;">Telefon</h4>
                        <p style="color: #666;">+43 123 456 7890</p>
                    </div>
                </div>

                <div class="contact-info-item">
                    <div class="contact-icon"><i class="fas fa-envelope"></i></div>
                    <div>
                        <h4 style="margin-bottom: 5px;">E-posta</h4>
                        <p style="color: #666;">info@rentex.com</p>
                    </div>
                </div>

                <div style="width: 100%; height: 250px; background: #eee; border-radius: 20px; overflow: hidden; margin-top: 20px;">
                    <!-- Google Maps Placeholder -->
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2707.4124977465!2d9.5932!3d47.2372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDE0JzEzLjMiTiA5wrAzNSczNS41IkU!5e0!3m2!1str!2str!4v1639730000000!5m2!1str!2str" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
                </div>
            </div>

            <!-- Contact Form -->
            <div class="contact-card">
                <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 40px;">Mesaj Gönderin</h2>
                <form action="send_contact.php" method="POST">
                    <div class="form-group-modern">
                        <label>Adınız Soyadınız</label>
                        <input type="text" name="name" placeholder="Örn: Ahmet Yılmaz" required>
                    </div>
                    <div class="form-group-modern">
                        <label>E-posta Adresiniz</label>
                        <input type="email" name="email" placeholder="Örn: ahmet@example.com" required>
                    </div>
                    <div class="form-group-modern">
                        <label>Konu</label>
                        <input type="text" name="subject" placeholder="Nasıl yardımcı olabiliriz?" required>
                    </div>
                    <div class="form-group-modern">
                        <label>Mesajınız</label>
                        <textarea name="message" rows="5" placeholder="Mesajınızı buraya yazın..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 18px; font-size: 1rem; border-radius: 12px; margin-top: 10px;">MESAJI GÖNDER</button>
                </form>
            </div>

        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
