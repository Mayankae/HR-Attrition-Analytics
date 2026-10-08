@echo off
REM Double-click to open the dashboard in your default browser (Windows). No install needed.
cd /d "%~dp0"
if exist "DWM_Dashboard_Standalone.html" (start "" "%~dp0DWM_Dashboard_Standalone.html") else (start "" "%~dp0website\index.html")
