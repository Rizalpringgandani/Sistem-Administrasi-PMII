@echo off
title Sistem Administrasi PMII Rayon
cd /d "%~dp0"
echo ========================================================
echo   MEMULAI SISTEM ADMINISTRASI PMII RAYON
echo   Aplikasi Web Lokal Luring (Offline)
echo ========================================================
echo.
echo Buka peramban (browser) di alamat: http://localhost:3000
echo Kata sandi default: admin123
echo.
node server.js
pause
