@echo off
REM Fix Vite cache issues

echo Cleaning Vite cache...

REM Remove node_modules/.vite
if exist node_modules\.vite rmdir /s /q node_modules\.vite

REM Remove dist
if exist dist rmdir /s /q dist

echo Cache cleaned!
echo Now run: npm run dev
