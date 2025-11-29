# LuxeDrive Araç Kiralama Sistemi

Modern ve profesyonel bir araç kiralama web sitesi altyapısı.

## Kurulum

1. **Veritabanı Oluşturma:**
   - MySQL veritabanı sunucunuzda `car_rental_db` adında bir veritabanı oluşturun (veya `database/schema.sql` dosyasını içe aktarın, bu dosya veritabanını otomatik oluşturur).
   - `database/schema.sql` dosyasını veritabanınıza import edin.

2. **Veritabanı Bağlantısı:**
   - `includes/db.php` dosyasını açın.
   - Veritabanı kullanıcı adı (`username`) ve şifrenizi (`password`) kendi sunucu ayarlarınıza göre güncelleyin.

3. **Admin Girişi:**
   - Admin paneline `/admin` klasöründen erişebilirsiniz.
   - **Kullanıcı Adı:** admin
   - **Şifre:** password

## Özellikler

- **Modern Anasayfa:** Şık, karanlık mod temalı, responsive tasarım.
- **Araç Listeleme:** Veritabanından çekilen araçlar (Veritabanı boşsa örnek veriler gösterilir).
- **Admin Paneli:**
  - Dashboard (Özet istatistikler)
  - Araç Yönetimi (Ekle/Düzenle/Sil)
  - Rezervasyon Yönetimi
- **Teknolojiler:** PHP, PDO, HTML5, CSS3 (Modern Flexbox/Grid).

## Dosya Yapısı

- `index.php`: Anasayfa
- `admin/`: Yönetim paneli dosyaları
- `assets/`: CSS ve JS dosyaları
- `includes/`: Ortak kullanılan PHP parçaları (Header, Footer, DB)
- `database/`: SQL şema dosyası
