@echo off
echo ==========================================
echo   Locaith Studio - Deploy Functions
echo ==========================================
echo.
echo Deploying 'deploy-website' function...
call supabase functions deploy deploy-website --no-verify-jwt

echo.
echo Deploying 'github-auth' function...
call supabase functions deploy github-auth --no-verify-jwt

echo.
echo ==========================================
echo   Deployment Complete!
echo ==========================================
pause
