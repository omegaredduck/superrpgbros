@echo off
setlocal enabledelayedexpansion
title SAVE AND UPLOAD - Send your work to GitHub
color 0E

REM ============================================================
REM  2_SAVE_AND_UPLOAD.bat
REM  Saves your work and uploads it to GitHub.
REM  SAFETY: it first checks whether your friend uploaded
REM  something new. If so, it stops and tells you to run
REM  1_GET_LATEST first, so you never overwrite their work.
REM ============================================================

set BRANCH=main

echo(
echo  =====================================================
echo   SAVE AND UPLOAD  (save your work to GitHub)
echo  =====================================================
echo(

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo  [X] This folder is not connected to GitHub yet.
    echo      Run 0_FIRST_TIME_SETUP.bat first. See the guide.
    pause
    exit /b 1
)

REM --- Is there anything to save? ---------------------------
set CHANGES=
for /f "delims=" %%i in ('git status --porcelain') do set CHANGES=1
if not defined CHANGES (
    echo  Nothing has changed since your last upload.
    echo  Nothing to do here. :)
    pause
    exit /b 0
)

REM --- SAFETY CHECK: did your friend upload first? ----------
echo  Checking GitHub for your friend's changes first...
git fetch origin >nul 2>&1
if errorlevel 1 (
    echo  [!] Could not reach GitHub. Check your internet
    echo      or finish any login window, then try again.
    pause
    exit /b 1
)

set BEHIND=0
for /f %%i in ('git rev-list HEAD..origin/%BRANCH% --count 2^>nul') do set BEHIND=%%i

if not "%BEHIND%"=="0" (
    echo(
    echo  =====================================================
    echo   [STOP] Your friend uploaded %BEHIND% new change(s)!
    echo(
    echo   To stay safe and not overwrite their work:
    echo     1^) Close this window.
    echo     2^) Run  1_GET_LATEST.bat  to download their changes.
    echo     3^) Run  2_SAVE_AND_UPLOAD.bat  again to upload yours.
    echo  =====================================================
    echo(
    pause
    exit /b 1
)

REM --- Show what will be saved ------------------------------
echo(
echo  These files will be saved:
echo  -----------------------------------------------------
git status --short
echo  -----------------------------------------------------
echo(

REM --- Ask for a short message ------------------------------
set MSG=
set /p MSG="Describe what you did (e.g. 'added player jump'): "
if "%MSG%"=="" set MSG=Update

echo(
echo  Saving your work...
git add -A
git commit -m "%MSG%"
if errorlevel 1 (
    echo  [X] Save failed. Nothing was uploaded.
    pause
    exit /b 1
)

echo(
echo  Uploading to GitHub...
git push origin %BRANCH%
if errorlevel 1 (
    echo(
    echo  [!] Upload failed. Someone may have uploaded at the
    echo      same moment. Run 1_GET_LATEST.bat, then run this
    echo      SAVE AND UPLOAD again.
    pause
    exit /b 1
)

echo(
echo  =====================================================
echo   [OK] Saved and uploaded!  "%MSG%"
echo   Your friend can now run 1_GET_LATEST to get it.
echo  =====================================================
echo(
pause
endlocal
