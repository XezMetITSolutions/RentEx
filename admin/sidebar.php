<div class="sidebar">
    <div class="logo" style="margin-bottom: 2rem;">Luxe<span style="color: #fff;">Admin</span></div>
    <ul class="sidebar-menu">
        <li><a href="index.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : ''; ?>"><i class="fas fa-home"></i> Özet</a></li>
        <li><a href="cars.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'cars.php' ? 'active' : ''; ?>"><i class="fas fa-car"></i> Araçlar</a></li>
        <li><a href="bookings.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'bookings.php' ? 'active' : ''; ?>"><i class="fas fa-calendar-check"></i> Rezervasyonlar</a></li>
        <li><a href="../index.php" target="_blank"><i class="fas fa-external-link-alt"></i> Siteyi Görüntüle</a></li>
        <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i> Çıkış Yap</a></li>
    </ul>
</div>
