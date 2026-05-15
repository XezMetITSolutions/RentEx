# RentEx — Kapsamlı Güvenlik Değerlendirmesi (Re-Audit)

**Tarih:** 2026-05-15
**Branch:** `claude/loving-euclid-ec39d2`
**Önceki Rapor:** `security-report/SECURITY-REPORT.md` (Risk: 0.5/10, “Tüm bulgular giderildi” iddiası)
**Bu Rapor — Risk Skoru:** **8.7 / 10 (CRITICAL)**

---

## Yönetici Özeti

Önceki raporun yedi bulgusu doğrulandı: **çoğu giderilmiş**. Ancak bağımsız bir yeniden inceleme, **30+ yeni veya daha önce gözden kaçmış güvenlik açığı** ortaya çıkardı; bunlardan **8'i Kritik** seviyede. En önemlisi:

1. **Müşteri oturum çerezi hâlâ imzasız** (admin için VULN-003 düzeltilmiş ama aynı hata `lib/auth.ts`'de duruyor).
2. **Birden fazla admin/locations endpoint'i kimlik doğrulamasız** (PII ve finansal veri sızıntısı).
3. **Yansıyan XSS** ödeme dönüş sayfasında.
4. **Yetkisiz Server Action'lar** veritabanı şema değişikliği ve toplu silme yapabiliyor.
5. **Üretimde sırların düşmesi durumunda yedek imzalama anahtarları kaynak kodda** (HMAC bypass).

### Önceki Bulguların Doğrulama Durumu

| # | Önceki Bulgu | Önceki Durum | Doğrulama |
|---|---|---|---|
| VULN-001 | `runDebugQuery` Unsafe SQL | FIXED | ✅ Doğrulandı (fonksiyon kaldırılmış) — ama [diagnostics.ts](app/actions/diagnostics.ts) hâlâ yetkisiz DDL çalıştırıyor (bkz. NEW-005). |
| VULN-002 | Admin müşteri PUT/DELETE auth eksik | FIXED | ✅ [customers/[id]/route.ts](app/api/admin/customers/[id]/route.ts) `getAdminSession` kullanıyor. |
| VULN-003 | Sahte admin oturum çerezi | FIXED | ✅ HMAC imzası eklenmiş ([adminAuth.ts:14](lib/adminAuth.ts:14)) — **AMA aynı problem müşteri tarafında devam ediyor (NEW-001)**. |
| VULN-004 | Hardcoded admin parolası | FIXED | (script doğrulanmadı; düzeltildiği varsayıldı.) |
| VULN-005 | Staff RBAC eksik | PARTIAL | ⚠ Sadece `POST /api/admin/staff` SUPERADMIN ister; iade (refund), silme, finansal dışa aktarım vb. hâlâ rol kontrolü yapmıyor (NEW-008). |
| VULN-006 | xlsx zafiyetli sürüm | FIXED | ✅ [package.json:44](package.json:44) `0.20.2` kullanıyor. |
| VULN-007 | Permissive CORS | MOSTLY FIXED | ⚠ [middleware.ts:18](middleware.ts:18) `origin.includes('localhost:')` hâlâ gevşek bir substring kontrolü — küçük risk (NEW-024). |

---

## Yeni / Doğrulanmış Bulgular (Önem Sırasına Göre)

### CRITICAL

#### NEW-001 — Müşteri oturum çerezi imzasız (oturum kimliği taklidi)
- **Konum:** [lib/auth.ts:21](lib/auth.ts:21) — `setSession(customerId)` çerezi düz integer olarak yazıyor.
- **Etki:** Tarayıcıda `rentex_customer=1` ayarlayan herhangi biri herhangi bir müşteri olarak oturum açabiliyor. Bu, **VULN-003 ile aynı kusur** — admin için düzeltilmiş, müşteri için unutulmuş.
- **Düzeltme:** `lib/adminAuth.ts` içindeki `sign/verify` HMAC modelini buraya da uygula; rollout sırasında mevcut çerezleri geçersiz kıl.
- **CWE-287 / OWASP A07:2021** — Critical.

#### NEW-002 — Yetkisiz finansal CSV dışa aktarımı (PII + para verileri sızıntısı)
- **Konum:** [app/api/admin/finance-export/route.ts:16](app/api/admin/finance-export/route.ts:16) — `GET` çağrısında auth kontrolü yok.
- **Etki:** İnternetteki herhangi biri tüm müşterilerin ad/soyad/e-posta + kira sözleşme numarası + tutar + ödeme durumu CSV'sini indirebilir. GDPR ihlali.
- **Düzeltme:** `getAdminSession()` ekle; SUPERADMIN/MANAGER rolüyle kısıtla; ekspozeyi audit log'a yaz.
- **OWASP A01:2021** — Critical.

#### NEW-003 — Yetkisiz fahrtenbuch CSV dışa aktarımı
- **Konum:** [app/api/admin/fahrtenbuch-export/route.ts:14](app/api/admin/fahrtenbuch-export/route.ts:14)
- **Etki:** Plaka, km'ler, sürüş amacı vs. yetkisiz olarak indirilebilir.
- **Düzeltme:** Yukarıdaki ile aynı.
- **Critical.**

#### NEW-004 — Yetkisiz strafzettel (trafik cezası) PUT/DELETE
- **Konum:** [app/api/admin/strafzettel/[id]/route.ts:5](app/api/admin/strafzettel/[id]/route.ts:5) — PUT ve DELETE auth çağırmıyor.
- **Etki:** Saldırgan, herhangi bir trafik cezası kaydını değiştirip silebilir. Kayıt manipülasyonu / muhasebe bütünlüğü ihlali.
- **Bonus:** Aynı dizindeki [cars/route.ts](app/api/admin/strafzettel/cars/route.ts:4) ve [lookup/route.ts](app/api/admin/strafzettel/lookup/route.ts:4) de yetkisiz — `lookup` tarih + saat parametrelerine göre hangi müşterinin hangi araçta olduğunu sızdırıyor.
- **Critical.**

#### NEW-005 — Server Action ile yetkisiz DDL & test yazma
- **Konum:** [app/actions/diagnostics.ts:9](app/actions/diagnostics.ts:9) (`fixDatabaseSchema`), [diagnostics.ts:53](app/actions/diagnostics.ts:53) (`runDiagnostics`), [diagnostics.ts:89](app/actions/diagnostics.ts:89) (`testUpdateCarAction`).
- **Etki:** Server Action'lar `'use server'` ile dışa aktarılmış ama hiçbir auth check yok. Saldırgan, geliştirilmiş bir POST gövdesiyle `ALTER TABLE` çalıştırabilir, şema bilgisi ve stack trace sızdırabilir, herhangi bir araç kaydını güncelleyebilir.
- **Düzeltme:** Dosyanın tamamına `getAdminSession()` ön kontrolü koy veya production build'ten kaldır.
- **CWE-862** — Critical.

#### NEW-006 — `/api/locations/**` toplu kimlik doğrulamasız yazma
- **Konum:** [app/api/locations/route.ts:30](app/api/locations/route.ts:30) (POST), [locations/[id]/route.ts](app/api/locations/[id]/route.ts) (PUT/DELETE), [locations/init-feldkirch/route.ts](app/api/locations/init-feldkirch/route.ts), [locations/assign-to-feldkirch/route.ts](app/api/locations/assign-to-feldkirch/route.ts).
- **Etki:** Sahte/silinmiş lokasyon kayıtları, toplu araç ataması, denial-of-service.
- **Critical.**

#### NEW-007 — Yansıyan XSS, ödeme dönüş sayfasında
- **Konum:** [app/api/mobile/bookings/[id]/checkout/return/route.ts:10-44](app/api/mobile/bookings/[id]/checkout/return/route.ts:10)
- **Detay:** `app` ve `status` query parametreleri sanitizasyon olmadan HTML/Script gövdesine enjekte ediliyor. Örnek payload: `?app=</script><script>alert(document.cookie)</script>`.
- **Etki:** Ödeme dönüş URL'i e-postayla kullanıcılara gönderiliyorsa müşteri çerezleri çalınabilir.
- **Düzeltme:** `scheme` ve `status`'ı bir whitelist'le kontrol et; HTML'i `escapeHTML` ile inşa et; deep-link şemasını sabit yap (örn. yalnızca `rentex`).
- **CWE-79** — Critical.

#### NEW-008 — KM transfer endpoint'i kimlik doğrulaması olmadan
- **Konum:** [app/api/admin/km-transfer/route.ts:5](app/api/admin/km-transfer/route.ts:5) (GET ve POST).
- **Etki:** Saldırgan herhangi iki müşteri arasında KM bakiyesini transfer edebilir veya tüm bakiyeleri sızdırabilir. Müşteriye atfedilen sahte borçlandırma + reputasyon hasarı.
- **Critical.**

---

### HIGH

#### NEW-009 — Yedek auth sırları kaynak kodda (HMAC bypass riski)
- **Konum:** [lib/adminAuth.ts:11](lib/adminAuth.ts:11) (`'fallback-secret-123-replace-me'`), [lib/mobileAuth.ts:9](lib/mobileAuth.ts:9) (`'fallback-secret-do-not-use-in-prod-...'`).
- **Etki:** Eğer `ADMIN_SESSION_SECRET` / `MOBILE_TOKEN_SECRET` / `JWT_SECRET` env değişkenleri prod'da yanlışlıkla boş gelirse, repoyu okuyan herkes sınırsız admin/customer/mobile token üretebilir.
- **Düzeltme:** Modül yüklenirken `if (!process.env.X) throw new Error(...)` ile fail-fast. Yedek string'leri kaldır.
- **CWE-798/CWE-1188** — High.

#### NEW-010 — `/api/admin/migrate` ve `/api/seed`: kimlik doğrulamalı ama GET ile DESTRUCTIVE (CSRF + GET-write)
- **Konum:** [app/api/seed/route.ts:46](app/api/seed/route.ts:46) `GET` istek **tüm araçları siliyor** (`deleteMany({})`), sonra yeniden ekliyor. Aynı şey [migrate/route.ts](app/api/admin/migrate/route.ts:5) için DDL.
- **Etki:** Admin'in tarayıcısında oturum açıkken, dış bir sayfanın `<img src="/api/seed">` etiketi tüm araçları sıfırlar. SameSite=Lax üst düzey GET'leri engellemez.
- **Düzeltme:** Tüm mutate eden endpoint'ler `POST` olmalı + state-changing GET'leri kaldır.
- **CWE-352** — High.

#### NEW-011 — Mass-assignment, müşteri server action'larında
- **Konum:** [app/actions/customers.ts:24](app/actions/customers.ts:24) — `updateCustomer(id, formData)` herhangi bir auth kontrolü yapmıyor ve `parsed.data` (form'dan gelen tüm alanlar) doğrudan `prisma.customer.update`'e veriliyor.
- **Etki:** Saldırgan, başka müşterinin e-posta adresini kendi adresiyle değiştirebilir → parola sıfırlama → hesap ele geçirme. Aynı kalıp [app/actions/booking.ts](app/actions/booking.ts) ve [app/actions/rental-updates.ts](app/actions/rental-updates.ts) içinde de.
- **Düzeltme:** Server Action başında session kontrolü + hangi alanların değişebileceğini açıkça allowlist.
- **CWE-915** — High.

#### NEW-012 — Cron secret düz string karşılaştırması + boş env tehlikesi
- **Konum:** [app/api/cron/daily-unified/route.ts:7](app/api/cron/daily-unified/route.ts:7) — `if (authHeader !== \`Bearer ${process.env.CRON_SECRET}\`)`.
- **Etki:** `CRON_SECRET` set edilmemişse karşılaştırma `Bearer undefined` ile yapılır — saldırgan `Authorization: Bearer undefined` ile geçer. Aynı pattern dört cron rotasında: [birthday-coupons](app/api/cron/birthday-coupons/route.ts), [cart-cleanup](app/api/cron/cart-cleanup/route.ts), [daily-unified](app/api/cron/daily-unified/route.ts), [mahnwesen](app/api/cron/mahnwesen/route.ts).
- **Düzeltme:** Modül yüklenirken `CRON_SECRET` zorunlu olsun + `timingSafeEqual` kullan.
- **CWE-321** — High.

#### NEW-013 — Yetkisiz/eksik korumalı PDF üretici endpoint'leri
- **Konum:** [app/api/dashboard/damage-report-pdf/route.ts](app/api/dashboard/damage-report-pdf/route.ts), [app/api/unfallbericht-pdf/route.ts](app/api/unfallbericht-pdf/route.ts).
- **Etki:** Saldırgan bu endpoint'leri kontrolsüz form verisiyle çağırarak sahte resmi belgeler üretebilir; ayrıca file-system path kullanımı sorgulanabilir.
- **High.**

#### NEW-014 — `/api/sixt` herkese açık scraper (SSRF benzeri + DoS)
- **Konum:** [app/api/sixt/route.ts:4](app/api/sixt/route.ts:4) — auth yok; her istek headless Chromium başlatıyor.
- **Etki:** Saldırgan paralel isteklerle hem CPU/RAM tüketir hem 3. taraf siteye sizin IP'nizden istek yapar — botnet aracı haline gelebilir.
- **Düzeltme:** Auth + rate-limit + IP allowlist.
- **High.**

#### NEW-015 — `competitor-pricing/**` endpoint ailesi yetkisiz
- **Konum:** [app/api/admin/competitor-pricing/companies/route.ts](app/api/admin/competitor-pricing/companies/route.ts), [.../[id]/route.ts](app/api/admin/competitor-pricing/companies/[id]/route.ts), [.../prices/route.ts](app/api/admin/competitor-pricing/prices/route.ts) — auth check yok.
- **Etki:** Rakip fiyat verisi okunup yazılabilir.
- **High.**

#### NEW-016 — Refund endpoint'i auth ediyor, rol kontrol etmiyor
- **Konum:** [app/api/admin/rentals/[id]/refund/route.ts:10](app/api/admin/rentals/[id]/refund/route.ts:10) — sadece `getAdminSession()` çağrılıyor.
- **Etki:** En düşük yetkili AGENT veya DRIVER rolü Stripe iadeleri başlatabilir → finansal kayıp ve iç tehdit.
- **Düzeltme:** `if (session.role !== 'SUPERADMIN' && session.role !== 'MANAGER') return 403`.
- **High.**

#### NEW-017 — `check-in-images/[...path]` kimlik doğrulamasız PII teslimi
- **Konum:** [app/api/check-in-images/[...path]/route.ts:5](app/api/check-in-images/[...path]/route.ts:5)
- **Etki:** Klasör path geçişi engelli (✅), ama dosya adlarını tahmin edebilen biri her müşterinin check-in fotoğrafına (ehliyet, imza vb.) erişebilir.
- **Düzeltme:** İlgili rental sahibi veya admin yetkisi gerektir.
- **High.**

---

### MEDIUM

#### NEW-018 — Müşteri `pdf-mapping` admin endpoint'i kimlik doğrulamasız
- **Konum:** [app/api/admin/pdf-mapping/route.ts:9](app/api/admin/pdf-mapping/route.ts:9) — GET ve POST auth çağırmıyor.
- **Etki:** Sözleşme PDF'lerinin field eşleştirmesini değiştirme → sahte fiyat/isim üretebilir. **High'a da çekilebilir** çünkü dolaylı dolandırıcılık imkanı.
- **Medium.**

#### NEW-019 — Stripe webhook yanıtı hata mesajını yansıtıyor
- **Konum:** [app/api/webhook/stripe/route.ts:23](app/api/webhook/stripe/route.ts:23) — `Webhook Error: ${err.message}` raw hata mesajını dışarı veriyor.
- **Etki:** Saldırgan endpoint'i sondalayarak Stripe SDK iç hatalarını ifşa edebilir. Webhook'un kendisi imza doğruluyor (iyi), bu sadece bilgi sızıntısı.
- **Medium.**

#### NEW-020 — Login endpoint'i debug `step` adlarını client'a sızdırıyor
- **Konum:** [app/api/mobile/auth/login/route.ts:63](app/api/mobile/auth/login/route.ts:63) — Hata yanıtı `[${step}] ${err?.message}` formatında dönüyor; saldırgana auth pipeline durumunu açıklar.
- **Düzeltme:** Production'da yalnızca generic mesaj döndür; `step`'i sadece server log'una yaz.
- **Medium.**

#### NEW-021 — Rate limiter in-memory (Vercel'de etkisiz)
- **Konum:** [lib/rateLimit.ts:13](lib/rateLimit.ts:13)
- **Etki:** Serverless ortamda her Lambda kopyası kendi `Map`'ine sahip — 5 istek limiti aslında "her Lambda örneği başına 5 istek". Üstelik `getClientIp` "unknown" fallback'i tüm anonim trafiği aynı kovaya atıyor, kollateral hasarı yüksek.
- **Düzeltme:** Upstash Redis veya Vercel KV ile shared store.
- **Medium.**

#### NEW-022 — Logout `POST` ama CSRF token yok
- **Konum:** [app/api/admin/logout/route.ts](app/api/admin/logout/route.ts), `setSession` çerezi `SameSite=Lax`. CSRF düşük ama state-changing POST'lar için **CSRF token** veya origin doğrulaması yok.
- **Etki:** Bir saldırgan kullanıcıyı zorla logout yapabilir (low impact); fakat aynı boşluk diğer POST endpoint'leri için de geçerli.
- **Düzeltme:** Double-submit cookie veya Origin header doğrulaması.
- **Medium.**

#### NEW-023 — Güvenlik başlıkları eksik
- `middleware.ts`'de **CSP / HSTS / X-Content-Type-Options / X-Frame-Options / Referrer-Policy / Permissions-Policy** ayarlanmıyor. XSS, clickjacking ve MIME sniffing'e karşı katmanlı savunma yok.
- **Düzeltme:** `next.config.ts headers()` veya middleware'de güvenli başlıkları ekle.
- **Medium.**

#### NEW-024 — CORS allowlist'i `localhost:` substring kontrolü
- **Konum:** [middleware.ts:18](middleware.ts:18) — `origin.includes('localhost:')`. Uzak saldırgan için pratikte sömürülebilir değil ama gevşek bir desen.
- **Düzeltme:** Production'da yalnızca explicit allowlist; dev kontrolünü `NODE_ENV === 'development'` arkasına sakla.
- **Medium.**

#### NEW-025 — Mass-assignment, customer update API'sinde
- **Konum:** [app/api/admin/customers/[id]/route.ts:18](app/api/admin/customers/[id]/route.ts:18) — `body.isActive`, `body.email` vs. Zod ile doğrulanmıyor; admin endpoint olmasına rağmen veri bütünlüğü için zayıf.
- **Medium.**

---

### LOW

#### NEW-026 — Hata mesajları olarak Prisma `error.message` döndürme
- Bir çok dosyada `catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }) }` deseni Prisma iç hata detaylarını (column adları, constraint adları) leak ediyor.
- **Örnekler:** [customers/[id]/route.ts:32](app/api/admin/customers/[id]/route.ts:32), [uploads/*](app/api/admin/cars/upload/route.ts), [diagnostics.ts:117-119](app/actions/diagnostics.ts:117) (stack + code).
- **Low.**

#### NEW-027 — `verifyPassword` `timingSafeEqual` farklı uzunlukta crash
- **Konum:** [lib/auth.ts:18](lib/auth.ts:18) — corrupted hash kaydı uzunluğu yanlışsa atılan exception yakalanmıyor, login işlemi 500'le bitiyor.
- **Düzeltme:** `if (Buffer.from(hash, 'hex').length !== derived.length) return false;`
- **Low.**

#### NEW-028 — Müşteri çerezi `Secure` flag yalnızca `NODE_ENV === 'production'` koşulunda
- Standart pattern ama staging/preview ortamı `production` değilse, HTTPS'de çerez Secure olmadan gönderilir — MITM riski. Vercel preview ortamları için ayarı zorla `true` yap.
- **Low.**

#### NEW-029 — `images.remotePatterns` `*.r2.dev` çok geniş
- **Konum:** [next.config.ts:17](next.config.ts:17) — herhangi bir Cloudflare R2 hesabından görsel yüklenebilir.
- **Etki:** Düşük (sadece görsel), ancak SSRF/data:url polyglot riskini biraz artırır.
- **Low.**

#### NEW-030 — `scripts/migrate-options.ts:13` `queryRawUnsafe`
- **Konum:** [scripts/migrate-options.ts:13](scripts/migrate-options.ts:13) — script doğrudan production'da çalıştırılırsa sorun olmaz ama, kaynak ağacında raw SQL pattern'i koruyor; gelecekteki copy-paste hatalarına davet.
- **Low.**

---

## Risk Skoru Hesabı

| Şiddet | Sayı | Ağırlık | Puan |
|---|---|---|---|
| Critical | 8 | 0.9 | 7.2 |
| High | 9 | 0.15 | 1.35 |
| Medium | 8 | 0.02 | 0.16 |
| Low | 5 | 0.004 | 0.02 |
| **Toplam** | **30** | | **~8.7 / 10** |

---

## Düzeltme Yol Haritası

### Bugün (Acil)
1. **Müşteri çerezini HMAC ile imzala** (NEW-001) — admin patch'ini aynı şekilde uygula.
2. **`finance-export`, `fahrtenbuch-export`, `strafzettel/**`, `km-transfer`, `competitor-pricing/**`, `locations/**`, `pdf-mapping`, `sixt` rotalarına `getAdminSession()` ekle** (NEW-002,003,004,006,008,015,018,014).
3. **`app/actions/diagnostics.ts` içindeki tüm Server Action'lara auth ekle veya production build'inden çıkar** (NEW-005).
4. **Yansıyan XSS**'i ödeme dönüş sayfasında düzelt — `scheme` whitelist + HTML escape (NEW-007).
5. **Yedek auth secret'larını kaldır**; env yoksa boot-time hata (NEW-009).

### 1-3 Gün
6. **Mass-assignment** desenlerini server action'larda Zod-allowlist'e geçir (NEW-011, NEW-025).
7. **GET-write endpoint'lerini POST'a çevir** (`/api/seed`, `/api/admin/migrate`) (NEW-010).
8. **Cron secret** kontrolünü timing-safe ve env-required yap (NEW-012).
9. **Refund** + diğer kritik admin endpoint'lerine SUPERADMIN/MANAGER rol kontrolü (NEW-016).
10. **Check-in image** servisine ownership kontrolü (NEW-017).

### 1 Hafta
11. **CSRF token** veya Origin doğrulaması cookie-auth'lu POST'larda (NEW-022).
12. **Güvenlik başlıkları** (CSP/HSTS/X-Frame-Options vb.) ekle (NEW-023).
13. **Distributed rate limiter** (Upstash Redis) (NEW-021).
14. **Hata yanıtlarını** sterilize et — Prisma `error.message`'ı dışarıya verme (NEW-026, NEW-019, NEW-020).
15. CORS dev-only kontrolünü `NODE_ENV` arkasına gizle (NEW-024).

---

## Metodoloji & Kapsam

- **Manuel statik analiz:** 30+ route, middleware, lib auth, server action, cron rotaları tek tek okundu.
- **Pattern-bazlı tarama:** `queryRawUnsafe`, `executeRawUnsafe`, `dangerouslySetInnerHTML`, fetch'te kullanıcı input'u, fallback secret stringleri.
- **Test edilmeyen:** Çalışan test/penetrasyon test'i, doğrudan db deneme. Tüm bulgular kod okumaya dayanır.

## Sorumluluk Reddi
Bu rapor otomatik destekli ama manuel doğrulanmış bir nokta-zaman değerlendirmesidir; profesyonel pentest yerine geçmez. Aktif zafiyetleri sömürmeden önce yetkiliyle koordine olun.
