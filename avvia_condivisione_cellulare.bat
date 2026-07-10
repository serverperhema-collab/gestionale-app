@echo off
title HEMA WORK & MDI - Condivisione Remota (Cellulari)
echo ========================================================
echo   CONDIVISIONE GESTIONALE PER CELLULARI E SMARTPHONE
echo ========================================================
echo.
echo ATTENZIONE: Assicurati che il file principale "avvia_gestionale" 
echo sia gia stato avviato e sia in esecuzione!
echo.
echo 1. Avvio del tunnel pubblico sicuro in corso...
echo.
echo --------------------------------------------------------
echo NOTA: Al primo avvio, npm potrebbe chiederti di confermare
echo l'installazione di localtunnel. Premi "y" e poi Invio.
echo.
echo Una volta avviato, copia l'indirizzo che termina con ".localtunnel.me"
echo e aggiungi in fondo "/commerciale" per inviarlo al cellulare
echo (Es: https://xxxx.localtunnel.me/commerciale)
echo --------------------------------------------------------
echo.
npx localtunnel --port 3001
pause
