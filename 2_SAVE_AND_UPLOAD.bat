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
REM  After uploading it VERIFIES against GitHub that the upload
REM  really landed, and lets you attach a note to the log
REM  (UPLOAD_LOG.md - uploaded together with your work).
REM ============================================================

set BRANCH=main
cd /d "%~dp0"

echo(
echo  =====================================================
echo   SAVE AND UPLOAD  (save your work to GitHub)
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

REM --- Clear a stale lock left by a crashed/interrupted git --
if exist ".git\index.lock" (
    tasklist /FI "IMAGENAME eq git.exe" 2>nul | find /I "git.exe" >nul
    if errorlevel 1 (
        del /f ".git\index.lock" >nul 2>&1
        echo  [i] Cleared a leftover git lock file from an
        echo      interrupted run. Continuing normally.
        echo(
    )
)

REM --- Is there anything to save? ---------------------------
set CHANGES=
for /f "delims=" %%i in ('git status --porcelain') do set CHANGES=1
if not defined CHANGES (
    echo  Nothing has changed since your last upload.
    echo  Nothing to do here. :^)
    pause
    exit /b 0
)

REM --- SAFETY CHECK: did your friend upload first? ----------
echo  Checking GitHub for your friend's changes first...
git fetch origin
if errorlevel 1 (
    echo(
    echo  [!] Could not reach GitHub. The exact error is printed
    echo      above this line. Usual causes: no internet, or a
    echo      GitHub login window is waiting somewhere.
    pause
    exit /b 1
)

set BEHIND=0
for /f %%i in ('git rev-list HEAD..origin/%BRANCH% --count 2^>nul') do set BEHIND=%%i

if not "%BEHIND%"=="0" (
    echo(
    echo  =====================================================
    echo   [STOP] Your friend uploaded %BEHIND% new change^(s^)!
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

REM --- Ask for a short message + an optional note -----------
set MSG=
set /p MSG="Describe what you did (e.g. 'added player jump'): "
if "%MSG%"=="" set MSG=Update
REM quotes inside the message would break the commit command
set MSG=%MSG:"=%

set NOTE=
set /p NOTE="Optional note for the log (details, todos - Enter to skip): "
if not "%NOTE%"=="" set NOTE=%NOTE:"=%

REM --- Write this upload into UPLOAD_LOG.md (rides along) ---
if not exist "UPLOAD_LOG.md" (
    >"UPLOAD_LOG.md" echo # UPLOAD LOG - one line per upload, newest at the bottom
    >>"UPLOAD_LOG.md" echo(
)
>>"UPLOAD_LOG.md" echo - !date! !time:~0,8!  -  "!MSG!"
if not "%NOTE%"=="" >>"UPLOAD_LOG.md" echo   - note: !NOTE!

echo(
echo  Saving your work...
git add -A
if errorlevel 1 (
    echo(
    echo  [X] Could not stage the files. The exact error is
    echo      printed above this line. Nothing was uploaded.
    pause
    exit /b 1
)
git commit -m "!MSG!"
if errorlevel 1 (
    echo(
    echo  [X] Save failed. The exact error is printed above
    echo      this line. Nothing was uploaded.
    echo      ^(If it mentions "user.name" or "user.email", run:
    echo        git config --global user.name  "YourName"
    echo        git config --global user.email "you@example.com"
    echo       then run this file again.^)
    pause
    exit /b 1
)

echo(
echo  Uploading to GitHub...
git push origin %BRANCH%
if errorlevel 1 (
    echo(
    echo  [!] Upload failed - BUT your work IS saved locally.
    echo      The exact error is printed above this line.
    echo      - If it mentions login/authentication: finish the
    echo        GitHub login window and run this file again.
    echo      - If it mentions "rejected": run 1_GET_LATEST.bat,
    echo        then run this SAVE AND UPLOAD again.
    pause
    exit /b 1
)

REM --- VERIFY: ask GitHub back what it now has ---------------
REM  (independent double-check: re-download GitHub's state and
REM   confirm it is EXACTLY the version we just uploaded)
echo(
echo  Verifying the upload with GitHub...
git fetch origin >nul 2>&1
set LOCAL=
set REMOTE=
for /f %%i in ('git rev-parse HEAD 2^>nul') do set LOCAL=%%i
for /f %%i in ('git rev-parse origin/%BRANCH% 2^>nul') do set REMOTE=%%i

if not "%LOCAL%"=="%REMOTE%" (
    color 0C
    echo(
    echo  =====================================================
    echo   [!] VERIFICATION FAILED
    echo(
    echo   The push command reported success, but GitHub's copy
    echo   does not match this folder yet.
    echo     your computer: %LOCAL%
    echo     GitHub:        %REMOTE%
    echo   Wait a minute, then run 3_CHECK_STATUS.bat.
    echo   If it still disagrees, run this SAVE AND UPLOAD again.
    echo  =====================================================
    echo(
    pause
    exit /b 1
)

color 0A
echo(
echo  =====================================================
echo   [VERIFIED] UPLOAD SUCCESSFUL
echo(
for /f "delims=" %%i in ('git log -1 --pretty^=format:"   what:    %%s"') do echo %%i
for /f "delims=" %%i in ('git log -1 --pretty^=format:"   version: %%h  by %%an"') do echo %%i
if not "%NOTE%"=="" echo   note:    !NOTE!
echo(
echo   GitHub's copy now matches this folder EXACTLY
echo   (checked back with GitHub, not just assumed).
echo   Your note is saved in UPLOAD_LOG.md.
echo   Your friend can now run 1_GET_LATEST to get it.
echo  =====================================================
echo(
pause
endlocal
