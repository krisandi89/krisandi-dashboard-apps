@echo off
title Krisandi Dashboard Server

rem ========================================
rem Krisandi Dashboard - Startup Script
rem Wrapper yang memanggil PowerShell script
rem ========================================

rem Jalankan PowerShell script yang mendukung UNC Path
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-Dashboard.ps1"

pause
