<?php
require_once 'header.php';
require_once '../includes/db.php';

// Handle Save Settings (Mock)
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $success = "Systemkonfiguration erfolgreich aktualisiert.";
}
?>

<?php if (isset($success)): ?>
<div style="background:#ecfdf5; color:#065f46; padding:1.5rem; border-radius:20px; margin-bottom:2rem; border:1px solid #a7f3d0; display: flex; align-items: center; gap: 15px; font-weight: 600;">
    <i class="fas fa-check-circle" style="font-size: 1.5rem;"></i> <?php echo $success; ?>
</div>
<?php endif; ?>

<div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem;">
    <div class="table-container">
        <div class="table-header">
            <h2>Allgemeine Konfiguration</h2>
        </div>
        <form method="POST" style="padding: 10px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Firmenname</label>
                    <input type="text" name="company_name" value="RENTEX" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Steuer-ID</label>
                    <input type="text" name="uid" value="ATU12345678" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Firmensitz / Adresse</label>
                <input type="text" name="address" value="Illstraße 75a, 6800 Feldkirch, Österreich" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Support Email</label>
                    <input type="email" name="email" value="info@rentex.at" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Währung</label>
                    <select name="currency" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar ($)</option>
                    </select>
                </div>
            </div>

            <button type="submit" class="btn btn-primary">Konfiguration speichern</button>
        </form>
    </div>

    <div class="table-container">
        <div class="table-header">
            <h2>Benutzerverwaltung</h2>
            <button class="btn" style="background: #f1f5f9; color: #475569; padding: 8px 12px; font-size: 0.8rem;"><i class="fas fa-plus"></i></button>
        </div>
        <div style="padding: 10px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1.2rem 0; border-bottom:1px solid #f5f5f5;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 35px; height: 35px; background: var(--secondary); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800;">AD</div>
                    <div>
                        <div style="font-weight:700; font-size: 0.95rem;">Admin User</div>
                        <div style="font-size:0.75rem; color:var(--text-muted);">admin@rentex.at</div>
                    </div>
                </div>
                <span class="status-pill status-active" style="font-size: 0.65rem;">Admin</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1.2rem 0; border-bottom:none;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 35px; height: 35px; background: #f1f5f9; color: #475569; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800;">M1</div>
                    <div>
                        <div style="font-weight:700; font-size: 0.95rem;">Mitarbeiter 1</div>
                        <div style="font-size:0.75rem; color:var(--text-muted);">staff@rentex.at</div>
                    </div>
                </div>
                <span class="status-pill" style="font-size: 0.65rem; background: #f1f5f9; color: #475569;">Staff</span>
            </div>
        </div>
    </div>
</div>

<?php require_once 'footer.php'; ?>
