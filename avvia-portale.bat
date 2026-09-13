@echo off
setlocal
title Project Work - applicazione full-stack
set "BPORT=3000"
set "FPORT=4200"
set "ROOT=%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  echo ERRORE: npm non e disponibile nel PATH.
  exit /b 1
)

echo Installazione dipendenze backend...
pushd "%ROOT%backend"
call npm install --no-audit --no-fund
if errorlevel 1 (
  popd
  echo ERRORE: npm install del backend fallito.
  exit /b 1
)
popd

echo Installazione dipendenze frontend...
pushd "%ROOT%frontend"
call npm install --no-audit --no-fund
if errorlevel 1 (
  popd
  echo ERRORE: npm install del frontend fallito.
  exit /b 1
)
popd

echo ============================================================
echo   Project Work - applicazione full-stack
echo   Backend : http://localhost:%BPORT%   (Swagger: /api-docs)
echo   Frontend: http://localhost:%FPORT%
echo ============================================================
echo.

REM --- Avvio Backend (solo se non gia attivo) ---
powershell -NoProfile -Command "if((Test-NetConnection -ComputerName localhost -Port %BPORT%).TcpTestSucceeded){exit 1}else{exit 0}"
if errorlevel 1 (
  echo [Backend] gia attivo su %BPORT%.
) else (
  echo [Backend] avvio su %BPORT%...
  start "Project Work - Backend" cmd /k cd /d "%ROOT%backend" ^&^& npm run dev
)

REM --- Avvio Frontend (solo se non gia attivo) ---
powershell -NoProfile -Command "if((Test-NetConnection -ComputerName localhost -Port %FPORT%).TcpTestSucceeded){exit 1}else{exit 0}"
if errorlevel 1 (
  echo [Frontend] gia attivo su %FPORT%.
) else (
  echo [Frontend] avvio su %FPORT%...
  start "Project Work - Frontend" cmd /k cd /d "%ROOT%frontend" ^&^& npm start -- --host 127.0.0.1
)

echo.
echo Monitoraggio: attendo che entrambi i servizi rispondano...
:wait
powershell -NoProfile -Command "$b=(Test-NetConnection -ComputerName localhost -Port %BPORT%).TcpTestSucceeded; $f=(Test-NetConnection -ComputerName localhost -Port %FPORT%).TcpTestSucceeded; if($b -and $f){exit 0}else{exit 1}"
if errorlevel 1 (
  timeout /t 3 /nobreak >nul
  goto wait
)

echo.
echo Entrambi i servizi sono ATTIVI.
echo Apro il browser: prima il Frontend, poi il Backend (Swagger)...
start "" "http://localhost:%FPORT%"
timeout /t 2 /nobreak >nul
start "" "http://localhost:%BPORT%/api-docs"

echo.
echo ============================================================
echo   Monitoraggio continuo  (premi Ctrl+C per fermare)
echo ============================================================
:monitor
powershell -NoProfile -Command "$b=(Test-NetConnection -ComputerName localhost -Port %BPORT%).TcpTestSucceeded; $f=(Test-NetConnection -ComputerName localhost -Port %FPORT%).TcpTestSucceeded; $bs=if($b){'UP'}else{'DOWN'}; $fs=if($f){'UP'}else{'DOWN'}; Write-Host (Get-Date -Format 'HH:mm:ss') '- Backend:' $bs '| Frontend:' $fs"
timeout /t 5 /nobreak >nul
goto monitor
