@echo off
title Setup Tombol Aktivasi Desktop

echo =================================================================
echo.
echo    Membuat Tombol Aktivasi "Krisandi Dashboard" di Desktop...
echo.
echo =================================================================

rem Pindah ke lokasi script ini
pushd "%~dp0"
set SCRIPT_DIR=%CD%\

set VBS_SCRIPT="%TEMP%\CreateShortcutDashboard.vbs"

rem Membuat script VBS untuk generate shortcut di Desktop pengguna
echo Set oWS = WScript.CreateObject("WScript.Shell") > %VBS_SCRIPT%
echo sLinkFile = oWS.ExpandEnvironmentStrings("%%USERPROFILE%%\Desktop\Mulai Krisandi Dashboard.lnk") >> %VBS_SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %VBS_SCRIPT%
echo oLink.TargetPath = "%SCRIPT_DIR%Start-Dashboard.bat" >> %VBS_SCRIPT%
echo oLink.WorkingDirectory = "%SCRIPT_DIR%" >> %VBS_SCRIPT%
echo oLink.Description = "Klik 2x untuk menyalakan server dan masuk ke aplikasi" >> %VBS_SCRIPT%
echo oLink.IconLocation = "shell32.dll, 13" >> %VBS_SCRIPT%
echo oLink.Save >> %VBS_SCRIPT%

rem Eksekusi pembuat shortcut
cscript /nologo %VBS_SCRIPT%

rem Hapus file temp
del %VBS_SCRIPT%

echo.
echo [OK] BERHASIL!
echo.
echo Silakan cek Desktop / Layar Utama Windows Anda.
echo Cukup klik dua kali (double click) tombol:
echo "Mulai Krisandi Dashboard"
echo.
echo Tombol tersebut akan otomatis menyalakan server sekaligus
echo membuka aplikasinya di browser Anda.
echo =================================================================

rem Langsung jalankan aplikasinya sekarang
echo.
echo Menjalankan aplikasi untuk pertama kali...
call "%SCRIPT_DIR%Start-Dashboard.bat"

popd
