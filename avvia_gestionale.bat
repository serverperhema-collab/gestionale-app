@echo off
title GRUPPO HEMA - Avvio Gestionale
echo ========================================================
echo   AVVIO GESTIONALE IN CORSO - NON CHIUDERE QUESTA FINESTRA
echo ========================================================
echo.
echo 1. Apertura del gestionale nel browser...
timeout /t 2 /nobreak >nul
start http://localhost:5174
echo.
echo 2. Avvio dei server locali...
npm run dev
pause
