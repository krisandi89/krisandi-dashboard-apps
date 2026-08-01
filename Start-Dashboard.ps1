# ========================================
# Krisandi Dashboard - Startup Script (PowerShell)
# Mendukung UNC Path / Network Drive
# ========================================

$Host.UI.RawUI.WindowTitle = "Krisandi Dashboard Server"

# Pindah ke lokasi script ini (mendukung UNC path)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   KRISANDI DASHBOARD - STARTING SERVER" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Lokasi: $ScriptDir" -ForegroundColor Gray
Write-Host ""

# Cek apakah port 3001 sudah digunakan
$portInUse = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "[!] Port 3001 sudah digunakan!" -ForegroundColor Yellow
    Write-Host "    Menghentikan proses yang menggunakan port 3001..." -ForegroundColor Yellow
    $portInUse | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
    Write-Host "[OK] Port 3001 sudah dibersihkan." -ForegroundColor Green
    Write-Host ""
}

# Cek apakah node_modules ada
if (-not (Test-Path "node_modules")) {
    Write-Host "[WAIT] Menginstal dependencies untuk pertama kali..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "[OK] Menjalankan server di http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "    Tekan Ctrl+C pada jendela ini untuk menghentikan server" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Buka browser otomatis setelah 5 detik (di background)
$browserJob = Start-Job -ScriptBlock {
    Start-Sleep -Seconds 5
    Start-Process "http://localhost:3001"
}

# Jalankan development server (langsung via node, bypass cmd.exe yang tidak mendukung UNC path)
node node_modules/next/dist/bin/next dev --port 3001

# Cleanup
Remove-Job $browserJob -Force -ErrorAction SilentlyContinue
