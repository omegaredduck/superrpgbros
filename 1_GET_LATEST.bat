@echo off
setlocal enabledelayedexpansion
title GET LATEST - Download your friend's changes
color 0A

REM ============================================================
REM  1_GET_LATEST.bat
REM  Run this BEFORE you start working each session.
REM  It downloads whatever your friend uploaded so you both
REM  stay in sync and avoid conflicts.
REM ============================================================

set BRANCH=main

echo(
echo  =====================================================
echo   GET LATEST  (download the newest version)
echo  =====================================================
echo(

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo  [X] This folder is not connected to GitHub yet.
    echo      Someone needs to run 0_FIRST_TIME_SETUP.bat first,
    echo      or you need to clone the project. See the guide.
    pause
    exit /b 1
)

REM --- Warn about unsaved work before pulling ---------------
for /f "delims=" %%i in ('git status --porcelain') do set DIRTY=1
if defined DIRTY (
    echo  [!] You have changes that are NOT saved/uploaded yet.
    echo      It is safer to run 2_SAVE_AND_UPLOAD.bat first.
    echo(
    echo      If you continue, Git will try to blend the new
    echo      version with your changes. Usually fine, but if
    echo      you both edited the SAME file it may complain.
    echo(
    set /p GO="Continue getting the latest anyway? (Y/N): "
    if /I not "!GO!"=="Y" (
        echo  Cancelled. Nothing changed.
        pause
        exit /b 0
    )
)

echo(
echo  Checking GitHub for updates...
git pull origin %BRANCH%
if errorlevel 1 (
    echo(
    echo  [!] Git could not merge automatically.
    echo      This usually means you and your friend edited the
    echo      same part of the same file (a "conflict").
    echo      Ask for help before saving over it, or run
    echo      3_CHECK_STATUS.bat to see what's going on.
    pause
    exit /b 1
)

echo(
echo  =====================================================
echo   [OK] You now have the latest version. Happy building!
echo  =====================================================
echo(
pause
endlocal
