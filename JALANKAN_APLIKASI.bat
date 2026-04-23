@echo off
echo ===================================================
echo   SISTEM ABSENSI PESANTREN - SETUP DAN RUN
echo ===================================================

echo [1/3] Mengambil dependensi Backend...
cd backend
call npm install
echo [2/3] Menyiapkan Database (Migrasi ^& Seed)...
call npx prisma migrate dev --name init
echo [3/3] Mengambil dependensi Frontend...
cd ../frontend
call npm install

echo ===================================================
echo   SEMUA BERHASIL DISIAPKAN!
echo ===================================================
echo Membuka Terminal baru untuk Backend...
start cmd /k "cd ../backend && npm run dev"
echo Membuka Terminal baru untuk Frontend...
start cmd /k "npm run dev"

echo Aplikasi akan segera berjalan di:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:5000
pause
