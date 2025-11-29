<?php
require_once 'header.php';
require_once '../includes/db.php';

// Handle Save Settings (Mock)
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $success = "Einstellungen wurden gespeichert.";
}
?>

<div class="page-title">
    <div style="display:flex; align-items:center; gap:1rem;">
        <div style="background:#64748b; color:white; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
            <i class="fas fa-cog"></i>
        </div>
        <h1 style="margin:0; color:#64748b;">Einstellungen</h1>
    </div>
    <p style="margin-left: 3.5rem; margin-top: 0.2rem;">Systemkonfiguration und Benutzerverwaltung</p>
</div>

<?php if (isset($success)): ?>
<div style="background:#ecfdf5; color:#065f46; padding:1rem; border-radius:8px; margin-bottom:2rem; border:1px solid #a7f3d0;">
    <i class="fas fa-check-circle"></i> <?php echo $success; ?>
</div>
<?php endif; ?>

<div class="dashboard-grid">
    <div class="content-card">
        <div class="card-title">Allgemeine Einstellungen</div>
        <form method="POST">
            <div style="margin-bottom:1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Firmenname</label>
                <input type="text" name="company_name" value="RENT-EX" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>
            <div style="margin-bottom:1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Adresse</label>
                <input type="text" name="address" value="Musterstraße 1, 1010 Wien" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>
            <div style="margin-bottom:1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">UID-Nummer</label>
                <input type="text" name="uid" value="ATU12345678" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>
            <button type="submit" class="btn btn-primary" style="background-color:#64748b; border-color:#64748b;">Speichern</button>
        </form>
    </div>

    <div class="content-card">
        <div class="card-title">Benutzerverwaltung</div>
        <div style="margin-bottom:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; border-bottom:1px solid var(--border);">
                <div>
                    <div style="font-weight:600;">Admin User</div>
                    <div style="font-size:0.8rem; color:#64748b;">admin@rentex.at</div>
                </div>
                <span class="badge badge-available">Admin</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; border-bottom:1px solid var(--border);">
                <div>
                    <div style="font-weight:600;">Mitarbeiter 1</div>
                    <div style="font-size:0.8rem; color:#64748b;">staff1@rentex.at</div>
                </div>
                <span class="badge badge-maintenance">Staff</span>
            </div>
        </div>
        <button class="btn btn-primary" style="background-color:#64748b; border-color:#64748b;"><i class="fas fa-plus"></i> Benutzer hinzufügen</button>
    </div>
</div>

<?php require_once 'footer.php'; ?>
