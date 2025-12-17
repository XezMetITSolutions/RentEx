<?php
require_once 'header.php';
require_once '../includes/db.php';

// Fetch stats with error handling
$total_cars = 0;
$active_bookings = 0;
$pending_bookings = 0;
$total_customers = 0;

try {
    $total_cars = $pdo->query("SELECT COUNT(*) FROM cars")->fetchColumn();
    $active_bookings = $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'")->fetchColumn();
    $pending_bookings = $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'")->fetchColumn();
    
    // Check if customers table exists, otherwise fallback to users
    $stmt = $pdo->query("SHOW TABLES LIKE 'customers'");
    if ($stmt->rowCount() > 0) {
        $total_customers = $pdo->query("SELECT COUNT(*) FROM customers")->fetchColumn();
    } else {
        $total_customers = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    }
} catch (Exception $e) {
    // Silent fail or log
}

// Fallback for demo if no data
if (!$total_customers) $total_customers = 0;
if (!$pending_bookings) $pending_bookings = 0;

?>

<!-- Dashboard Header -->
<div style="margin-bottom: 2.5rem;">
    <h1 style="font-size: 2.2rem; font-weight: 900; letter-spacing: -1.5px; color: var(--secondary);">Dashboard</h1>
    <p style="color: var(--text-muted); font-size: 1.1rem;">Willkommen im Rentex Management System.</p>
</div>

<!-- Stats Row -->
<div class="stats-row">
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-blue"><i class="fas fa-car"></i></div>
            <span class="stat-badge">Aktiv</span>
        </div>
        <div class="stat-label">Gesamt Fuhrpark</div>
        <div class="stat-value"><?php echo $total_cars; ?></div>
    </div>
    
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-green"><i class="fas fa-key"></i></div>
        </div>
        <div class="stat-label">Aktive Mieten</div>
        <div class="stat-value"><?php echo $active_bookings; ?></div>
    </div>

    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-orange"><i class="fas fa-hourglass-half"></i></div>
            <?php if($pending_bookings > 0): ?>
                <span class="stat-badge" style="background:#fff7ed; color:#f97316;"><?php echo $pending_bookings; ?> Neu</span>
            <?php endif; ?>
        </div>
        <div class="stat-label">Offene Anfragen</div>
        <div class="stat-value"><?php echo $pending_bookings; ?></div>
    </div>

    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-purple"><i class="fas fa-users"></i></div>
        </div>
        <div class="stat-label">Kundenstamm</div>
        <div class="stat-value"><?php echo $total_customers; ?></div>
    </div>
</div>

<!-- Main Dashboard Grid -->
<div class="dashboard-grid">
    <!-- Tagesübersicht -->
    <div class="content-card">
        <div class="card-title">
            <i class="fas fa-calendar-alt" style="color:#3b82f6;"></i> Heutige Aktivitäten
        </div>
        
        <div style="margin-bottom: 2rem;">
            <div style="font-size:0.7rem; font-weight:800; color:#94a3b8; margin-bottom:1rem; letter-spacing:1.5px; text-transform: uppercase;">GEPLANTE ÜBERGABEN</div>
            <div class="timeline-item">
                <div style="display:flex; align-items:center;">
                    <span class="time-badge">Demodaten</span>
                    <div class="item-info">
                        <h4>Beispiel Übergabe</h4>
                        <p>Noch keine realen Daten heute</p>
                    </div>
                </div>
                <button class="btn-check">Protokoll</button>
            </div>
        </div>

        <div>
            <div style="font-size:0.7rem; font-weight:800; color:#94a3b8; margin-bottom:1rem; letter-spacing:1.5px; text-transform: uppercase;">ERWARTETE RÜCKNAHMEN</div>
            <div style="padding: 20px; text-align: center; background: #f8fafc; border-radius: 15px; color: #94a3b8; font-size: 0.9rem;">
                Keine Rücknahmen für heute geplant.
            </div>
        </div>
    </div>

    <!-- Warnings / Info -->
    <div class="content-card">
        <div class="card-title">
            <i class="fas fa-info-circle" style="color:var(--primary);"></i> Systemhinweise
        </div>

        <div class="alert-item alert-blue">
            <div class="alert-icon icon-bg-blue"><i class="fas fa-snowflake"></i></div>
            <div class="alert-content">
                <h4>Winterreifenpflicht</h4>
                <p>Erinnerung: In Österreich gilt vom 1. Nov. bis 15. April die Winterreifenpflicht bei winterlichen Bedingungen.</p>
            </div>
        </div>

        <div class="alert-item alert-yellow">
            <div class="alert-icon icon-bg-yellow"><i class="fas fa-shield-alt"></i></div>
            <div class="alert-content">
                <h4>Pickerl & Versicherung</h4>
                <p>Bitte prüfen Sie regelmäßig die §57a-Begutachtungstermine Ihrer Fahrzeuge im System.</p>
            </div>
        </div>
    </div>
</div>

<!-- Quick Actions -->
<div class="quick-grid">
    <a href="cars.php" class="quick-card">
        <div class="quick-icon icon-blue"><i class="fas fa-car-side"></i></div>
        <h3>Fahrzeuge</h3>
        <p>Bestand verwalten & neue Autos anlegen</p>
    </a>
    <a href="bookings.php" class="quick-card">
        <div class="quick-icon icon-green"><i class="fas fa-calendar-check"></i></div>
        <h3>Buchungen</h3>
        <p>Reservierungen prüfen & bestätigen</p>
    </a>
    <a href="pos.php" class="quick-card">
        <div class="quick-icon icon-orange"><i class="fas fa-cash-register"></i></div>
        <h3>Kasse</h3>
        <p>Einnahmen & Ausgaben erfassen</p>
    </a>
    <a href="settings.php" class="quick-card">
        <div class="quick-icon" style="background:#f1f5f9; color:#475569;"><i class="fas fa-tools"></i></div>
        <h3>System</h3>
        <p>Einstellungen & Nutzerverwaltung</p>
    </a>
</div>

<?php require_once 'footer.php'; ?>
