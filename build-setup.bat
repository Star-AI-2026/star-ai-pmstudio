@echo off
setlocal
title Star-AI 2.202.0 Builder
cd /d "%~dp0"

echo ==========================================
echo Star-AI 2.202.0 - Local Desktop Build
echo ==========================================
echo.
echo [1/3] Installing Electron dependencies...
call npm install
if errorlevel 1 goto error

echo.
echo [2/3] Building frozen website and x64/x86 apps...
call npm run release
if errorlevel 1 goto error

echo.
echo [3/3] Looking for Inno Setup compiler...
set "ISCC="
where ISCC.exe >nul 2>nul
if not errorlevel 1 set "ISCC=ISCC.exe"
if not defined ISCC if exist "%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" set "ISCC=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
if not defined ISCC if exist "%ProgramFiles%\Inno Setup 6\ISCC.exe" set "ISCC=%ProgramFiles%\Inno Setup 6\ISCC.exe"

if defined ISCC (
  if not exist "Installer" mkdir "Installer"
  call "%ISCC%" "Star-AI-Setup.iss"
  if errorlevel 1 goto error
  echo.
  echo SUCCESS: Installer\Star-AI-Setup-2.202.0.exe
) else (
  echo.
  echo The EXE builds are ready in release\x64 and release\x86.
  echo Inno Setup 6 was not found. Install it, then compile Star-AI-Setup.iss.
)
pause
exit /b 0

:error
echo.
echo BUILD FAILED. Read the error above.
pause
exit /b 1
