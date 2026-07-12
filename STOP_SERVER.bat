@echo off
REM ============================================================
REM  STOP_SERVER.bat - stops the local web server on :8000
REM  Finds whatever is listening on port 8000 (Python or Node,
REM  however START_SERVER.bat launched it), ends the process,
REM  then re-checks the port to confirm the server is gone.
REM ============================================================
setlocal enabledelayedexpansion
set FOUND=0
set KILLED=,
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /c:"LISTENING" ^| findstr /c:":8000 "') do (
    echo !KILLED! | findstr /c:",%%P," >nul || (
        set FOUND=1
        set KILLED=!KILLED!%%P,
        echo Stopping server process %%P ...
        taskkill /PID %%P /F >nul 2>nul
    )
)
if !FOUND!==0 (
    echo No server is running on port 8000 - nothing to stop.
    goto :done
)

REM --- verify: give Windows a moment, then re-check the port ---
timeout /t 2 /nobreak >nul
netstat -ano | findstr /c:"LISTENING" | findstr /c:":8000 " >nul
if errorlevel 1 (
    echo.
    echo SUCCESS: Server stopped. Port 8000 is now free.
) else (
    echo.
    echo WARNING: Something is still listening on port 8000.
    echo Try closing the server window manually, or run this again.
)

:done
echo.
pause
