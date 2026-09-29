@echo off
title Previu - YouTube Thumbnail Analyzer
cd /d "%~dp0"
echo.
echo  Previu запускается...
echo  Открой в браузере: http://localhost:3000
echo  Чтобы остановить - закрой это окно
echo.
start http://localhost:3000
npm run dev
