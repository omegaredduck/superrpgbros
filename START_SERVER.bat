@echo off
REM ============================================================
REM  START_SERVER.bat - local web server for Super RPG Bros
REM  Needed from M3 onward (Tiled maps + PNG assets require http;
REM  the M0-M2 game runs fine by double-clicking game\index.html).
REM  Tries Python first, then Node. Serves this folder on :8000.
REM ============================================================
cd /d "%~dp0"
where py >nul 2>nul && ( start "" http://localhost:8000/game/ & py -m http.server 8000 & goto :eof )
where python >nul 2>nul && ( start "" http://localhost:8000/game/ & python -m http.server 8000 & goto :eof )
where npx >nul 2>nul && ( start "" http://localhost:8000/game/ & npx --yes serve -l 8000 . & goto :eof )
echo Could not find Python or Node. Install either one, or just
echo double-click game\index.html (works until Tiled maps arrive at M3).
pause
