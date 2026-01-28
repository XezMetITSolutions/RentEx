u@echo off
title RentEx Gelistirme Sunucusu
echo ---------------------------------------------------
echo RentEx Projesi Baslatiliyor...
echo Tarayiciniz otomatik olarak acilacaktir.
echo Durdurmak icin bu pencereyi kapatin veya Ctrl+C yapin.
echo ---------------------------------------------------
echo.

:: Tarayiciyi baslat (biraz gecikme ile serverin hazir olmasini umuyoruz, ya da nextjs refresh eder)
start "" "http://localhost:3000"

:: Sunucuyu baslat
npm run dev

pause
