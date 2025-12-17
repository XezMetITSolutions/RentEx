<?php include 'includes/header.php'; ?>

<section class="section-premium" style="min-height: 80vh; padding-top: 15rem;">
    <div class="container">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;">
            <!-- Contact Info -->
            <div class="glass" style="padding: 3rem; border-radius: 20px;">
                <h1 class="title-lg" style="font-size: 2.5rem; margin-bottom: 2rem;">Kontaktieren Sie <span class="text-primary">Uns</span></h1>
                
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 0.5rem;"><i class="fas fa-map-marker-alt text-primary"></i> Adresse</h3>
                    <p style="color: #ccc;">Rent-Ex e.U.<br>Illstraße 75a<br>6800 Feldkirch</p>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 0.5rem;"><i class="fas fa-phone text-primary"></i> Telefon</h3>
                    <p style="color: #ccc;">+43 123 456 7890</p>
                </div>

                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 0.5rem;"><i class="fas fa-envelope text-primary"></i> E-Mail</h3>
                    <p style="color: #ccc;">info@rent-ex.com</p>
                </div>
                
                <!-- Simple Map Placeholder -->
                <div style="width: 100%; height: 200px; background: #222; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #555;">
                    <p><i class="fas fa-map"></i> Google Maps Integration</p>
                </div>
            </div>

            <!-- Contact Form -->
            <div class="glass" style="padding: 3rem; border-radius: 20px;">
                <h2 style="margin-bottom: 2rem;">Schreiben Sie uns</h2>
                <form>
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label>Name</label>
                        <input type="text" placeholder="Ihr Name">
                    </div>
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label>E-Mail</label>
                        <input type="email" placeholder="Ihre E-Mail">
                    </div>
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label>Nachricht</label>
                        <textarea style="width: 100%; height: 150px; padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.4); color: #fff; outline: none; font-family: var(--font-body);" placeholder="Ihre Nachricht..."></textarea>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;">Nachricht Senden</button>
                </form>
            </div>
        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
