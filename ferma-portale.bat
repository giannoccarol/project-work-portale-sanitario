@echo off
setlocal
title Project Work - stop servizi
set "PROJECT_ROOT=%~dp0"

echo ============================================================
echo   Project Work - arresto backend e frontend
echo ============================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$root=$env:PROJECT_ROOT; $procs=Get-CimInstance Win32_Process; $targets=@(); $targets += @($procs ^| Where-Object { $_.CommandLine -and $_.CommandLine -notlike '*ferma-portale.bat*' -and (($_.CommandLine -like ('*'+$root+'*')) -or ($_.CommandLine -like '*ng serve --port 4200*') -or ($_.CommandLine -like '*node --watch dist/index.js*')) } ^| Select-Object -ExpandProperty ProcessId); $targets += @(Get-NetTCPConnection -State Listen -LocalPort 3000,4200 -ErrorAction SilentlyContinue ^| Select-Object -ExpandProperty OwningProcess); $targets ^| Sort-Object -Unique ^| ForEach-Object { taskkill /F /T /PID $_ 2^>$null ^| Out-Null }; Write-Host ('Processi terminati: ' + (($targets ^| Sort-Object -Unique).Count))"

echo.
echo Arresto completato.
pause
