@echo off
setlocal enabledelayedexpansion
title FIRST TIME SETUP - Original Commit
color 0B

REM ============================================================
REM  0_FIRST_TIME_SETUP.bat
REM  Run this ONCE, by ONE person, to put this folder on GitHub.
REM  Your friend should NOT run this - they use "Clone" instead
REM  (see the guide).
REM ============================================================

set BRANCH=main

echo(
echo  =====================================================
echo   FIRST TIME SETUP  (makes the very first commit)
echo  =====================================================
echo(

REM --- Make sure Git is installed ---------------------------
git --version >nul 2>&1
if errorlevel 1 (
    echo  [X] Git is not installed, or not found.
    echo      Install it from https://git-scm.com/download/win
    echo      then run this file again.
    echo(
    pause
    exit /b 1
)

REM --- Warn if this folder is ALREADY a git repo ------------
if exist ".git" (
    echo  [!] This folder already looks like a Git project.
    echo      If you already set it up, you do NOT need this file.
    echo      Use 2_SAVE_AND_UPLOAD.bat instead.
    echo(
    set /p GO="Type YES to set it up again anyway: "
    if /I not "!GO!"=="YES" (
        echo  Cancelled. Nothing changed.
        pause
        exit /b 0
    )
)

REM --- Ask for the GitHub repo address ----------------------
echo(
echo  Create an EMPTY repository on GitHub first (no README).
echo  Then copy its address, it looks like:
echo      https://github.com/YourName/your-game.git
echo(
set /p REPO="Paste your GitHub repo address here: "
if "%REPO%"=="" (
    echo  [X] No address entered. Cancelled.
    pause
    exit /b 1
)

REM --- Optional: set your name/email for commits ------------
git config user.name >nul 2>&1
if errorlevel 1 (
    set /p GNAME="Your name (for commit history): "
    set /p GMAIL="Your email: "
    git config --global user.name "!GNAME!"
    git config --global user.email "!GMAIL!"
)

echo(
echo  Setting things up...
git init
git branch -M %BRANCH%

REM --- Add remote (replace if it already exists) -----------
git remote remove origin >nul 2>&1
git remote add origin "%REPO%"

REM --- Make a .gitignore if none exists --------------------
if not exist ".gitignore" (
    echo  Creating a starter .gitignore ...
    > .gitignore echo # Files Git should ignore
    >> .gitignore echo Thumbs.db
    >> .gitignore echo desktop.ini
    >> .gitignore echo *.tmp
    >> .gitignore echo *.log
)

echo(
echo  Saving the first version...
git add -A
git commit -m "Initial commit"
if errorlevel 1 (
    echo  [X] Nothing to commit, or commit failed. Stopping.
    pause
    exit /b 1
)

echo(
echo  Uploading to GitHub for the first time...
git push -u origin %BRANCH%
if errorlevel 1 (
    echo(
    echo  [X] Upload failed.
    echo      - Check the repo address is correct and EMPTY.
    echo      - A login window may have appeared - finish signing in
    echo        and run this file again.
    pause
    exit /b 1
)

echo(
echo  =====================================================
echo   [OK] Done!  Your game is now on GitHub.
echo   From now on everyone uses:
echo     1_GET_LATEST      before you start working
echo     2_SAVE_AND_UPLOAD when you want to save your work
echo  =====================================================
echo(
pause
endlocal
