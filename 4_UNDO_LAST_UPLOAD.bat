@echo off
setlocal enabledelayedexpansion
title UNDO LAST UPLOAD - Safely reverse the last change
color 0C

REM ============================================================
REM  4_UNDO_LAST_UPLOAD.bat
REM  Safely undoes the MOST RECENT upload by creating a new
REM  "undo" commit. This is the friend-safe way: it does NOT
REM  rewrite history, so your friend's copy won't break.
REM  Your old work is never truly lost - it stays in history.
REM ============================================================

set BRANCH=main

echo(
echo  =====================================================
echo   UNDO LAST UPLOAD  (reverse the most recent change)
echo  =====================================================
echo(

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo  [X] This folder is not connected to GitHub yet.
    echo      Run 0_FIRST_TIME_SETUP.bat first. See the guide.
    pause
    exit /b 1
)

REM --- Must have a clean folder to undo safely --------------
set CHANGES=
for /f "delims=" %%i in ('git status --porcelain') do set CHANGES=1
if defined CHANGES (
    echo  [!] You have unsaved changes right now.
    echo      Please deal with those first:
    echo        - To keep them:  run 2_SAVE_AND_UPLOAD.bat
    echo        - Then come back and run this undo.
    echo      (Undo needs a clean folder to work safely.)
    pause
    exit /b 1
)

REM --- Get the latest so we undo the REAL last change -------
echo  Syncing with GitHub first...
git fetch origin >nul 2>&1
git pull origin %BRANCH% >nul 2>&1

REM --- Show the commit that will be undone ------------------
echo(
echo  This is the most recent change (the one to be undone):
echo  -----------------------------------------------------
git log -1 --pretty=format:"  %%h  by %%an%%n  \"%%s\"" 2>nul
echo(
echo  -----------------------------------------------------
echo(
echo  Undoing will create a NEW change that reverses it.
echo  Nothing is permanently deleted - it stays in history.
echo(
set /p GO="Are you sure you want to undo this? (Y/N): "
if /I not "%GO%"=="Y" (
    echo  Cancelled. Nothing was changed.
    pause
    exit /b 0
)

echo(
echo  Creating the undo...
git revert HEAD --no-edit
if errorlevel 1 (
    echo(
    echo  [!] The undo could not be applied cleanly (conflict).
    echo      Ask for help before continuing. To back out safely
    echo      you can run:  git revert --abort
    pause
    exit /b 1
)

echo(
echo  Uploading the undo to GitHub...
git push origin %BRANCH%
if errorlevel 1 (
    echo  [!] Upload failed. Run 1_GET_LATEST.bat then run this
    echo      undo again.
    pause
    exit /b 1
)

echo(
echo  =====================================================
echo   [OK] The last change has been undone and uploaded.
echo   Tell your friend to run 1_GET_LATEST.bat.
echo  =====================================================
echo(
pause
endlocal
