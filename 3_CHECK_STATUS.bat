@echo off
setlocal enabledelayedexpansion
title CHECK STATUS - What's going on?
color 0F

REM ============================================================
REM  3_CHECK_STATUS.bat
REM  A safe, read-only look at where things stand.
REM  Changes NOTHING. Great when you're unsure what to do.
REM ============================================================

set BRANCH=main
cd /d "%~dp0"

echo(
echo  =====================================================
echo   CHECK STATUS  (read-only, nothing gets changed)
echo  =====================================================
echo(

REM --- Is Git even installed? (its own message, 2026-07-12) --
where git >nul 2>&1
if errorlevel 1 (
    echo  [X] Git is not installed, or Windows can't find it.
    echo      Install it from  https://git-scm.com/download/win
    echo      ^(all default options are fine^), close this window,
    echo      and run this file again.
    pause
    exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo  [X] This folder is not connected to GitHub yet.
    echo      Run 0_FIRST_TIME_SETUP.bat first. See the guide.
    pause
    exit /b 1
)

echo  Checking GitHub...
git fetch origin >nul 2>&1

REM --- Unsaved local changes -------------------------------
set CHANGES=
for /f "delims=" %%i in ('git status --porcelain') do set CHANGES=1
echo(
if defined CHANGES (
    echo  YOUR UNSAVED CHANGES:
    echo  -----------------------------------------------------
    git status --short
    echo  -----------------------------------------------------
    echo  ^> Run 2_SAVE_AND_UPLOAD.bat when you want to save these.
) else (
    echo  You have no unsaved changes. Everything is saved.
)

REM --- Ahead / behind the remote ---------------------------
set AHEAD=0
set BEHIND=0
for /f %%i in ('git rev-list HEAD..origin/%BRANCH% --count 2^>nul') do set BEHIND=%%i
for /f %%i in ('git rev-list origin/%BRANCH%..HEAD --count 2^>nul') do set AHEAD=%%i

echo(
echo  COMPARED TO GITHUB:
if not "%BEHIND%"=="0" (
    echo   - Your friend has %BEHIND% change^(s^) you don't have yet.
    echo     ^> Run 1_GET_LATEST.bat to download them.
)
if not "%AHEAD%"=="0" (
    echo   - You have %AHEAD% saved change^(s^) not uploaded yet.
    echo     ^> Run 2_SAVE_AND_UPLOAD.bat to upload them.
)
if "%BEHIND%"=="0" if "%AHEAD%"=="0" (
    echo   - You are perfectly in sync with GitHub.
)

REM --- Recent history --------------------------------------
echo(
echo  LAST 5 UPLOADS (newest first):
echo  -----------------------------------------------------
git log -5 --pretty=format:"  %%h  %%an  -  %%s" 2>nul
echo(
echo  -----------------------------------------------------
echo(
pause
endlocal
