<?php include 'includes/header.php'; ?>

<section class="section-premium" style="padding-top: 12rem; min-height: 100vh;">
    <div class="container">
        <div style="display: flex; gap: 3rem;">
            <!-- Sidebar -->
            <div class="glass" style="width: 300px; padding: 2rem; border-radius: 20px; height: fit-content;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; background: #333; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user" style="font-size: 2rem; color: #fff;"></i>
                    </div>
                    <h3>Max Mustermann</h3>
                    <p style="color: #888; font-size: 0.9rem;">Mitglied seit 2024</p>
                </div>
                <ul style="list-style: none;">
                    <li style="margin-bottom: 1rem;"><a href="#" style="color: var(--primary-color); font-weight: 700;"><i class="fas fa-car" style="margin-right: 10px;"></i> Meine Buchungen</a></li>
                    <li style="margin-bottom: 1rem;"><a href="#" style="color: #ccc;"><i class="fas fa-user-cog" style="margin-right: 10px;"></i> Einstellungen</a></li>
                    <li><a href="index.php" style="color: var(--danger);"><i class="fas fa-sign-out-alt" style="margin-right: 10px;"></i> Abmelden</a></li>
                </ul>
            </div>

            <!-- Content -->
            <div style="flex: 1;">
                <h2 style="margin-bottom: 2rem;">Aktuelle <span class="text-primary">Buchungen</span></h2>
                
                <!-- Booking Item -->
                <div class="glass" style="padding: 2rem; border-radius: 20px; margin-bottom: 1.5rem; display: flex; gap: 2rem; align-items: center;">
                    <div style="width: 150px; height: 100px; border-radius: 10px; overflow: hidden;">
                        <img src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <h3 style="font-size: 1.2rem;">Mercedes-Benz S-Class</h3>
                            <span style="color: var(--success); background: rgba(40, 167, 69, 0.1); padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.8rem;">Bestätigt</span>
                        </div>
                        <p style="color: #888; margin-bottom: 0.5rem;"><i class="fas fa-calendar-alt"></i> 20.12.2025 - 25.12.2025</p>
                        <p style="font-weight: 700; color: #fff;">5.000 ₺ / Tag</p>
                    </div>
                    <div>
                        <button class="btn btn-outline" style="font-size: 0.8rem;">Details</button>
                    </div>
                </div>

                <!-- Booking Item -->
                <div class="glass" style="padding: 2rem; border-radius: 20px; margin-bottom: 1.5rem; display: flex; gap: 2rem; align-items: center;">
                    <div style="width: 150px; height: 100px; border-radius: 10px; overflow: hidden;">
                        <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <h3 style="font-size: 1.2rem;">BMW M4 Competition</h3>
                            <span style="color: #888; background: rgba(255, 255, 255, 0.1); padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.8rem;">Abgeschlossen</span>
                        </div>
                        <p style="color: #888; margin-bottom: 0.5rem;"><i class="fas fa-calendar-alt"></i> 10.11.2025 - 12.11.2025</p>
                        <p style="font-weight: 700; color: #fff;">4.500 ₺ / Tag</p>
                    </div>
                    <div>
                        <button class="btn btn-outline" style="font-size: 0.8rem;">Rechnung</button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
