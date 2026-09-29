@echo off
title Previu - YouTube Thumbnail Analyzer
cd /d "%~dp0"
echo.
echo  Previu запускается...
echo  Подожди несколько секунд, потом откроется Chrome
echo  Чтобы остановить - закрой это окно
echo.
set HTTPS_PROXY=http://170.231.250.232:5432
set HTTP_PROXY=http://170.231.250.232:5432
start /B cmd /c "timeout /t 8 /nobreak >nul && start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" http://127.0.0.1:3000"
npm run dev
