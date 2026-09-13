@echo off
setlocal EnableExtensions
title Project Work - applicazione full-stack
set "BPORT=3000"
set "FPORT=4200"
set "ROOT=%~dp0"
if "%WAIT_SECONDS%"=="" set "WAIT_SECONDS=180"
if "%OPEN_BROWSER%"=="" set "OPEN_BROWSER=1"

where node >nul 2>&1
if errorlevel 1 (
  echo ERRORE: Node.js non e disponibile nel PATH.
  echo Apri un prompt in cui "node -v" funziona, oppure installa Node.js 20 o superiore.
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo ERRORE: npm non e disponibile nel PATH.
  exit /b 1
)

for /f "delims=" %%v in ('node -p "process.versions.node.split('.')[0]"') do set "NODE_MAJOR=%%v"
if %NODE_MAJOR% LSS 20 (
  echo ERRORE: serve Node.js 20 o superiore.
  node -v
  exit /b 1
)

if not exist "%ROOT%backend\data" mkdir "%ROOT%backend\data"
if not exist "%ROOT%backend\uploads" mkdir "%ROOT%backend\uploads"
if not exist "%ROOT%backend\.env" if exist "%ROOT%backend\.env.example" (
  copy /Y "%ROOT%backend\.env.example" "%ROOT%backend\.env" >nul
  echo Creato backend\.env da .env.example.
)

echo Installazione dipendenze backend...
pushd "%ROOT%backend"
call npm install --no-audit --no-fund
if errorlevel 1 (
  popd
  echo ERRORE: npm install del backend fallito.
  echo better-sqlite3 richiede i Build Tools per Visual Studio.
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

set "NEED_SEED=1"
if exist "%ROOT%backend\data\policlinico.sqlite" (
  for %%A in ("%ROOT%backend\data\policlinico.sqlite") do (
    if %%~zA GTR 0 set "NEED_SEED=0"
  )
)
if "%NEED_SEED%"=="0" (
  echo Database demo gia presente: non rieseguo il seed.
) else (
  echo Database demo assente: eseguo il seed ^(una sola volta^)...
  pushd "%ROOT%backend"
  call npm run seed
  if errorlevel 1 (
    popd
    echo ERRORE: seed del backend fallito.
    exit /b 1
  )
  popd
)

echo ============================================================
echo   Project Work - applicazione full-stack
echo   Backend : http://localhost:%BPORT%   ^(Swagger: /api-docs^)
echo   Frontend: http://localhost:%FPORT%
echo ============================================================
echo.

powershell -NoProfile -Command "try { $c=New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1',%BPORT%); $c.Close(); exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo [Backend] avvio su %BPORT%...
  start "Project Work - Backend" cmd /k cd /d "%ROOT%backend" ^&^& npm run dev
) else (
  echo [Backend] gia attivo su %BPORT%.
)

powershell -NoProfile -Command "try { $c=New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1',%FPORT%); $c.Close(); exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo [Frontend] avvio su %FPORT%...
  start "Project Work - Frontend" cmd /k cd /d "%ROOT%frontend" ^&^& npm start -- --host 127.0.0.1
) else (
  echo [Frontend] gia attivo su %FPORT%.
)

echo.
echo Monitoraggio: attendo che entrambi i servizi rispondano ^(max %WAIT_SECONDS%s^)...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$deadline=(Get-Date).AddSeconds([int]$env:WAIT_SECONDS); function PortUp([int]$p){ $c=New-Object Net.Sockets.TcpClient; try { $c.Connect('127.0.0.1',$p); return $true } catch { return $false } finally { if($c.Connected){ $c.Close() } } }; while(-not ((PortUp %BPORT%) -and (PortUp %FPORT%))){ if((Get-Date) -ge $deadline){ exit 1 }; Start-Sleep -Seconds 3 }; exit 0"
if errorlevel 1 (
  echo.
  echo ERRORE: i servizi non sono entrambi disponibili entro %WAIT_SECONDS%s.
  call "%ROOT%ferma-portale.bat" /nopause
  exit /b 1
)

echo.
echo Entrambi i servizi sono ATTIVI.
if "%OPEN_BROWSER%"=="1" (
  echo Apro il browser: prima il Frontend, poi il Backend ^(Swagger^)...
  start "" "http://localhost:%FPORT%"
  timeout /t 2 /nobreak >nul
  start "" "http://localhost:%BPORT%/api-docs"
) else (
  echo Apertura browser disabilitata ^(OPEN_BROWSER=0^).
)

set "FERMA=%ROOT%ferma-portale.bat"
echo.
echo ============================================================
echo   Monitoraggio continuo  ^(Ctrl+C ferma backend e frontend^)
echo ============================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { function PortUp([int]$p){ $c=New-Object Net.Sockets.TcpClient; try { $c.Connect('127.0.0.1',$p); return $true } catch { return $false } finally { if($c.Connected){ $c.Close() } } }; while($true){ $bs=if(PortUp %BPORT%){'UP'}else{'DOWN'}; $fs=if(PortUp %FPORT%){'UP'}else{'DOWN'}; Write-Host ((Get-Date -Format 'HH:mm:ss') + ' - Backend: ' + $bs + ' | Frontend: ' + $fs); Start-Sleep -Seconds 5 } } finally { Write-Host ''; Write-Host 'Arresto dei servizi del Project Work...'; if ($env:FERMA) { & $env:FERMA /nopause } }"
exit /b 0
