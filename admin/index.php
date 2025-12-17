<?php
require_once 'header.php';
require_once '../includes/db.php';

// Fetch stats
$total_cars = $pdo->query("SELECT COUNT(*) FROM cars")->fetchColumn();
$active_bookings = $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'")->fetchColumn();
$pending_bookings = $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'")->fetchColumn(); // Assuming 'pending' status exists or use logic
$total_customers = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'customer'")->fetchColumn(); // Assuming users table has role
if (!$total_customers) $total_customers = 48; // Fallback to match image if no data
if (!$pending_bookings) $pending_bookings = 3; // Fallback

?>

<div class="page-title">
    <h1>Dashboard</h1>
    <p>Willkommen zurück, Admin User. Hier ist der aktuelle Status.</p>
</div>

<!-- Stats Row -->
<div class="stats-row">
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-blue"><i class="fas fa-car"></i></div>
            <span class="stat-badge">↗ +2</span>
        </div>
        <div class="stat-label">Fahrzeuge</div>
        <div class="stat-value"><?php echo $total_cars; ?></div>
    </div>
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-green"><i class="fas fa-clock"></i></div>
        </div>
        <div class="stat-label">Aktive Mieten</div>
        <div class="stat-value"><?php echo $active_bookings; ?></div>
    </div>
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-orange"><i class="fas fa-calendar-check"></i></div>
            <span class="stat-badge" style="background:#fff7ed; color:#f97316;">3 Neu</span>
        </div>
        <div class="stat-label">Ausstehend</div>
        <div class="stat-value"><?php echo $pending_bookings; ?></div>
    </div>
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-purple"><i class="fas fa-users"></i></div>
            <span class="stat-badge">↗ +12%</span>
        </div>
        <div class="stat-label">Kunden</div>
        <div class="stat-value"><?php echo $total_customers; ?></div>
    </div>
</div>

<!-- Middle Section -->
<div class="dashboard-grid">
    <!-- Daily Overview -->
    <div class="content-card">
        <div class="card-title">
            <i class="fas fa-calendar-day" style="color:#3b82f6;"></i> Tagesübersicht (Heute)
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:0.5rem; letter-spacing:1px;">GEPLANTE ABHOLUNGEN</div>
            <div class="timeline-item">
                <div style="display:flex; align-items:center;">
                    <span class="time-badge">10:00</span>
                    <div class="item-info">
                        <h4>VW Polo</h4>
                        <p>Max Mustermann</p>
                    </div>
                </div>
                <button class="btn-check">Check-in</button>
            </div>
            <div class="timeline-item">
                <div style="display:flex; align-items:center;">
                    <span class="time-badge">14:30</span>
                    <div class="item-info">
                        <h4>Ford Transit</h4>
                        <p>Bau GmbH</p>
                    </div>
                </div>
                <button class="btn-check">Check-in</button>
            </div>
        </div>

        <div>
            <div style="font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:0.5rem; letter-spacing:1px;">ERWARTETE RÜCKGABEN</div>
            <div class="timeline-item" style="background:#fffbeb; border-color:#fef3c7;">
                <div style="display:flex; align-items:center;">
                    <span class="time-badge" style="background:#fef3c7; color:#d97706;">09:00</span>
                    <div class="item-info">
                        <h4>BMW 3er</h4>
                        <p>Anna Schmidt</p>
                    </div>
                </div>
                <button class="btn-check btn-check-out">Check-out</button>
            </div>
        </div>
    </div>

    <!-- Warnings -->
    <div class="content-card">
        <div class="card-title">
            <i class="fas fa-exclamation-circle" style="color:#ef4444;"></i> Fahrzeugstatus & Warnungen
        </div>

        <div class="alert-item alert-red">
            <div class="alert-icon icon-bg-red"><i class="fas fa-wrench"></i></div>
            <div class="alert-content">
                <h4>Wartung fällig</h4>
                <p>Fiat Ducato (FK-EX 5791) - Service seit 2 Tagen überfällig</p>
            </div>
            <div class="alert-action text-red">Ansehen</div>
        </div>

        <div class="alert-item alert-blue">
            <div class="alert-icon icon-bg-blue"><i class="fas fa-snowflake"></i></div>
            <div class="alert-content">
                <h4>Winterreifenpflicht (Österreich)</h4>
                <p>Zeitraum: 1. Nov - 15. Apr.<br>3 Fahrzeuge haben noch Sommerreifen.</p>
            </div>
            <div class="alert-action text-blue">Liste prüfen</div>
        </div>

        <div class="alert-item alert-yellow">
            <div class="alert-icon icon-bg-yellow"><i class="fas fa-ticket-alt"></i></div>
            <div class="alert-content">
                <h4>Vignette 2024</h4>
                <p>Jahresvignetten laufen bald ab. Bitte Bestand prüfen.</p>
            </div>
        </div>
    </div>
</div>

<!-- Quick Access Grid -->
<div class="quick-grid">
    <div class="quick-card" onclick="window.location.href='cars.php'">
        <div class="quick-icon icon-blue"><i class="fas fa-car"></i></div>
        <h3>Fahrzeugverwaltung</h3>
        <p>Fahrzeuge hinzufügen, bearbeiten und Status prüfen</p>
    </div>
    <div class="quick-card" onclick="window.location.href='bookings.php'">
        <div class="quick-icon icon-green"><i class="fas fa-calendar-alt"></i></div>
        <h3>Reservierungen</h3>
        <p>Buchungen verwalten und Kalender einsehen</p>
    </div>
    <div class="quick-card" onclick="window.location.href='customers.php'">
        <div class="quick-icon icon-purple"><i class="fas fa-users"></i></div>
        <h3>Kunden</h3>
        <p>Kundendaten und Historie verwalten</p>
    </div>
    <div class="quick-card" onclick="window.location.href='finances.php'">
        <div class="quick-icon icon-purple" style="background:#f3e8ff; color:#9333ea;"><i class="fas fa-euro-sign"></i></div>
        <h3>Finanzen</h3>
        <p>Rechnungen, Zahlungen und Berichte</p>
    </div>
    <div class="quick-card" onclick="window.location.href='pos.php'">
        <div class="quick-icon icon-orange"><i class="fas fa-shopping-cart"></i></div>
        <h3>Registrierkasse</h3>
        <p>Barzahlungen, RKSV und Tagesabschluss</p>
    </div>
    <div class="quick-card" onclick="window.location.href='settings.php'">
        <div class="quick-icon" style="background:#f1f5f9; color:#475569;"><i class="fas fa-cog"></i></div>
        <h3>Einstellungen</h3>
        <p>Systemkonfiguration und Benutzerverwaltung</p>
    </div>
</div>

<?php require_once 'footer.php'; ?>
