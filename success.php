<?php include 'includes/header.php'; ?>

<section class="section-premium" style="height: 100vh; display: flex; align-items: center; justify-content: center;">
    <div class="glass" style="padding: 4rem; border-radius: 20px; text-align: center; max-width: 600px;">
        <div style="width: 100px; height: 100px; background: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 0 30px rgba(40, 167, 69, 0.5);">
            <i class="fas fa-check" style="font-size: 3rem; color: #fff;"></i>
        </div>
        
        <h1 class="title-lg" style="margin-bottom: 1rem;">Buchung <span style="color: var(--success);">Bestätigt!</span></h1>
        <p style="color: #ccc; font-size: 1.2rem; margin-bottom: 2rem;">Vielen Dank für Ihre Reservierung. Wir haben Ihnen eine Bestätigungs-E-Mail gesendet.</p>
        
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem;">
            <p style="color: #888; font-size: 0.9rem; margin-bottom: 0.5rem;">BESTÄTIGUNGSCODE</p>
            <h2 style="font-family: monospace; letter-spacing: 5px; color: #fff;">XR-<?php echo rand(10000, 99999); ?></h2>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center;">
            <a href="profile.php" class="btn btn-outline">Meine Buchungen</a>
            <a href="index.php" class="btn btn-primary">Zur Startseite</a>
        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
