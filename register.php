<?php include 'includes/header.php'; ?>

<section class="section-premium" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding-top: 5rem;">
    <div class="glass" style="padding: 3rem; border-radius: 20px; width: 100%; max-width: 500px;">
        <h2 style="text-align: center; margin-bottom: 2rem;">Konto <span class="text-primary">Erstellen</span></h2>
        
        <form action="profile.php"> <!-- Mock Action -->
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label>Vollständiger Name</label>
                <input type="text" placeholder="Max Mustermann" style="width: 100%;">
            </div>
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label>E-Mail Adresse</label>
                <input type="email" placeholder="email@example.com" style="width: 100%;">
            </div>
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label>Passwort</label>
                <input type="password" placeholder="********" style="width: 100%;">
            </div>
            <div class="form-group" style="margin-bottom: 2rem;">
                <label>Passwort bestätigen</label>
                <input type="password" placeholder="********" style="width: 100%;">
            </div>
            
            <button class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">Registrieren</button>
            
            <p style="text-align: center; font-size: 0.9rem; color: #888;">
                Bereits ein Konto? <a href="admin/login.php" style="color: var(--primary-color);">Anmelden</a>
            </p>
        </form>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
