    <footer>
        <div class="footer-content">
            <div class="footer-col">
                <h4>Rentex</h4>
                <p>Ayrıcalıklı araç kiralama deneyimi. Konfor ve güvenin adresi.</p>
            </div>
            <div class="footer-col">
                <h4>Hızlı Bağlantılar</h4>
                <ul>
                    <li><a href="about.php">Hakkımızda</a></li>
                    <li><a href="fleet.php">Araç Filosu</a></li>
                    <li><a href="terms.php">Kiralama Koşulları</a></li>
                    <li><a href="contact.php">İletişim</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>İletişim</h4>
                <ul>
                    <li><i class="fas fa-phone"></i> +90 555 123 45 67</li>
                    <li><i class="fas fa-envelope"></i> info@rentex.com</li>
                    <li><i class="fas fa-map-marker-alt"></i> Illstraße 75a, 6800 Feldkirch</li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Yasal</h4>
                <ul>
                    <li><a href="privacy.php">Gizlilik Politikası</a></li>
                    <li><a href="faq.php">Sıkça Sorulan Sorular (SSS)</a></li>
                    <li><a href="terms.php">Şartlar ve Koşullar</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Bülten</h4>
                <p style="color: var(--text-muted); margin-bottom: 1rem; font-size: 0.9rem;">Özel tekliflerden haberdar olun.</p>
                <form style="display: flex; gap: 0.5rem;">
                    <input type="email" placeholder="E-posta" style="padding: 0.8rem; border-radius: 5px; border: none; background: rgba(255,255,255,0.1); color: #fff; width: 100%;">
                    <button class="btn btn-primary" style="padding: 0 1rem; border-radius: 5px;"><i class="fas fa-paper-plane"></i></button>
                </form>
            </div>
        </div>
        <div class="copyright">
            <p>&copy; 2025 Rentex. Tüm Hakları Saklıdır. | <a href="terms.php" style="color: var(--text-muted);">Künye</a></p>
        </div>
    </footer>

    <!-- Cookie Consent -->
    <div id="cookie-banner" style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.9); padding: 1.5rem; text-align: center; border-top: 1px solid var(--primary-color); z-index: 9999; transform: translateY(100%); transition: transform 0.5s;">
        <p style="color: #fff; margin-bottom: 1rem; display: inline-block;">Deneyiminizi iyileştirmek için çerezleri kullanıyoruz.</p>
        <button onclick="document.getElementById('cookie-banner').style.transform='translateY(100%)'" class="btn btn-primary" style="margin-left: 1rem; padding: 0.5rem 1.5rem; font-size: 0.9rem;">Kabul Et</button>
    </div>

    <script>
        setTimeout(() => {
            document.getElementById('cookie-banner').style.transform = 'translateY(0)';
        }, 1000);
    </script>
</body>
</html>
