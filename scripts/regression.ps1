# =============================================================================
# FuBanking -- Script de Pruebas de Regresion (PowerShell)
# Ejecuta todas las pruebas del backend y frontend antes de hacer git push.
#
# Uso:
#   .\scripts\regression.ps1
#   .\scripts\regression.ps1 -Coverage       # Incluye reporte de cobertura
#   .\scripts\regression.ps1 -Only backend   # Solo backend
#   .\scripts\regression.ps1 -Only frontend  # Solo frontend
# =============================================================================

param(
    [switch]$Coverage,
    [ValidateSet("backend", "frontend", "both")]
    [string]$Only = "both"
)

# Forzar UTF-8 para caracteres especiales en la consola
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# -- Funciones de salida coloreada --------------------------------------------
function Write-Header  { param($msg)
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
}
function Write-Step    { param($msg) Write-Host "" ; Write-Host ">> $msg" -ForegroundColor Yellow }
function Write-Success { param($msg) Write-Host "[OK]  $msg" -ForegroundColor Green }
function Write-Failure { param($msg) Write-Host "[ERR] $msg" -ForegroundColor Red }
function Write-Info    { param($msg) Write-Host "      $msg" -ForegroundColor Gray }

# -- Variables globales -------------------------------------------------------
$Root        = Split-Path -Parent $PSScriptRoot
$BackendDir  = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"
$StartTime   = Get-Date

$BackendPassed  = $false
$FrontendPassed = $false

# -- Seleccionar comando segun flag -Coverage ----------------------------------
if ($Coverage) {
    $TestCmd = "test:coverage"
    $ModoLabel = "Con cobertura"
} else {
    $TestCmd = "test"
    $ModoLabel = "Sin cobertura"
}

# -- Banner -------------------------------------------------------------------
Write-Header "FuBanking -- Pruebas de Regresion"
Write-Info "Inicio : $($StartTime.ToString('HH:mm:ss'))"
Write-Info "Modo   : $ModoLabel | Alcance: $Only"

# -- Funcion: ejecutar pruebas en un directorio --------------------------------
function Invoke-Tests {
    param(
        [string]$Label,
        [string]$Dir,
        [string]$Command
    )

    Write-Step "Ejecutando pruebas de $Label..."
    Write-Info "Directorio : $Dir"
    Write-Info "Comando    : npm run $Command"
    Write-Host ""

    Push-Location $Dir
    try {
        npm run $Command
        $exitCode = $LASTEXITCODE
    } finally {
        Pop-Location
    }

    if ($exitCode -eq 0) {
        Write-Success "$Label -- TODAS LAS PRUEBAS PASARON"
        return $true
    } else {
        Write-Failure "$Label -- FALLARON ALGUNAS PRUEBAS (exit code: $exitCode)"
        return $false
    }
}

# -- Ejecutar Backend ---------------------------------------------------------
if ($Only -eq "backend" -or $Only -eq "both") {
    $BackendPassed = Invoke-Tests -Label "Backend" -Dir $BackendDir -Command $TestCmd
}

# -- Ejecutar Frontend --------------------------------------------------------
if ($Only -eq "frontend" -or $Only -eq "both") {
    $FrontendPassed = Invoke-Tests -Label "Frontend" -Dir $FrontendDir -Command $TestCmd
}

# -- Resumen final ------------------------------------------------------------
$EndTime = Get-Date
$Elapsed = [math]::Round(($EndTime - $StartTime).TotalSeconds, 1)

Write-Header "Resumen de Regresion"
Write-Info "Duracion total: ${Elapsed}s"
Write-Host ""

if ($Only -eq "backend" -or $Only -eq "both") {
    if ($BackendPassed) {
        Write-Success "Backend  -- PASO"
    } else {
        Write-Failure "Backend  -- FALLO"
    }
}

if ($Only -eq "frontend" -or $Only -eq "both") {
    if ($FrontendPassed) {
        Write-Success "Frontend -- PASO"
    } else {
        Write-Failure "Frontend -- FALLO"
    }
}

Write-Host ""

# -- Decision final -----------------------------------------------------------
$allPassed = $false
if ($Only -eq "backend")  { $allPassed = $BackendPassed }
if ($Only -eq "frontend") { $allPassed = $FrontendPassed }
if ($Only -eq "both")     { $allPassed = $BackendPassed -and $FrontendPassed }

if ($allPassed) {
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "  REGRESION EXITOSA -- Seguro hacer push" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "=============================================" -ForegroundColor Red
    Write-Host "  REGRESION FALLIDA -- Corrige los errores antes del push" -ForegroundColor Red
    Write-Host "=============================================" -ForegroundColor Red
    exit 1
}
