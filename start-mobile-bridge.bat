@echo off
title RentEx Mobile Bridge (Backend + Tunnel)
echo ---------------------------------------------------
echo RentEx Mobile Bridge Baslatiliyor...
echo 1. Backend (Next.js) Vercel DB'ye baglaniyor...
echo 2. Mobile (Expo) Tunnel modunda baslatiliyor...
echo ---------------------------------------------------
echo.

:: Yeni pencerede Next.js Backend'i baslat
start "RentEx-Backend" cmd /c "npm run dev"

:: native-app dizinine git ve Expo'yu tunnel ile baslat
echo Mobil uygulama tüneli hazirlaniyor. Lutfen bekleyin...
cd native-app
npm run dev:tunnel

pause
