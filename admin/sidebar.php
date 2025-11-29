<div class="sidebar">
    <div class="logo" style="margin-bottom: 2rem;">Luxe<span style="color: #fff;">Admin</span></div>
    <ul class="sidebar-menu">
        <li><a href="index.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : ''; ?>"><i class="fas fa-home"></i> Übersicht</a></li>
        <li><a href="cars.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'cars.php' ? 'active' : ''; ?>"><i class="fas fa-car"></i> Fahrzeuge</a></li>
        <li><a href="bookings.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'bookings.php' ? 'active' : ''; ?>"><i class="fas fa-calendar-check"></i> Buchungen</a></li>
        <li><a href="../index.php" target="_blank"><i class="fas fa-external-link-alt"></i> Website anzeigen</a></li>
        <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i> Abmelden</a></li>
    </ul>
</div>
