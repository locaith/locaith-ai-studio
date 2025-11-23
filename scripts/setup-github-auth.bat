@echo off
echo ==========================================
echo   Locaith Studio - GitHub Auth Setup
echo ==========================================
echo.
echo This script will configure your Supabase project with GitHub OAuth credentials
echo and deploy the necessary Edge Function.
echo.
echo [IMPORTANT] You must be logged into Supabase CLI first (run 'supabase login').
echo.

set /p CLIENT_ID="Enter GitHub Client ID: "
set /p CLIENT_SECRET="Enter GitHub Client Secret: "

echo.
echo Setting Supabase Secrets...
call supabase secrets set GITHUB_CLIENT_ID=%CLIENT_ID%
call supabase secrets set GITHUB_CLIENT_SECRET=%CLIENT_SECRET%

echo.
echo Deploying 'github-auth' Function...
call supabase functions deploy github-auth --no-verify-jwt

echo.
echo ==========================================
echo   Setup Complete!
echo ==========================================
pause
