@echo off
SETLOCAL ENABLEEXTENSIONS

:: ====== Ubah ini sesuai kebutuhan ======
set NSSM_PATH=C:\Tools\nssm\nssm.exe
set SERVICE_NAME=BotWAAlterUnion
set NODE_PATH=C:\Program Files\nodejs\node.exe
set BOT_DIR=D:\Alter Union\botgrup
set ENTRY_FILE=index.js
:: =======================================

:: Tambahkan NSSM ke PATH jika belum
echo Adding NSSM to PATH...
setx PATH "%PATH%;%~dp0"

:: Membuat service menggunakan NSSM
echo Creating service %SERVICE_NAME%...
"%NSSM_PATH%" install %SERVICE_NAME% "%NODE_PATH%" "%BOT_DIR%\%ENTRY_FILE%"

:: Set working directory
"%NSSM_PATH%" set %SERVICE_NAME% AppDirectory "%BOT_DIR%"

:: Set agar auto restart saat crash
"%NSSM_PATH%" set %SERVICE_NAME% AppRestartDelay 5000
"%NSSM_PATH%" set %SERVICE_NAME% AppExit Default Restart

:: Set agar service auto start saat boot
"%NSSM_PATH%" set %SERVICE_NAME% Start SERVICE_AUTO_START

:: Jalankan servicenya
echo Starting service...
net start %SERVICE_NAME%

echo.
echo ✅ Bot service berhasil dipasang dan dijalankan!
pause
