@echo off
chcp 65001 >nul
title 开学能量站 · 本地服务器（关闭此窗口 = 停止）
cd /d "%~dp0"
set PORT=8770

where python >nul 2>nul && (set PY=python) || (where py >nul 2>nul && (set PY=py) || (
  echo.
  echo  [x] 没有检测到 Python，无法启动本地服务器。
  echo      小魔星需要麦克风，只能通过本地服务器或线上网址打开。
  echo      详见同目录的「使用说明.md」。
  echo.
  pause
  exit /b
))

echo.
echo  正在启动开学能量站……浏览器会自动打开，稍等一两秒。
echo  ★ 玩好后，关掉这个黑色窗口就会停止服务。
echo.
start "" /min cmd /c "timeout /t 2 >nul & explorer http://localhost:%PORT%/index.html"
%PY% -m http.server %PORT% --bind 127.0.0.1
