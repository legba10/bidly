$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repositoryRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')).Path
$securityRoot = Join-Path $repositoryRoot '.tools\security'
$downloadRoot = Join-Path $securityRoot 'downloads'
$binaryRoot = Join-Path $securityRoot 'bin'

New-Item -ItemType Directory -Force -Path $downloadRoot, $binaryRoot | Out-Null

function Get-Sha256Hex {
  param([Parameter(Mandatory = $true)][string]$Path)

  $algorithm = [System.Security.Cryptography.SHA256]::Create()
  $stream = [System.IO.File]::OpenRead($Path)
  try {
    $bytes = $algorithm.ComputeHash($stream)
    return ([System.BitConverter]::ToString($bytes)).Replace('-', '').ToLowerInvariant()
  }
  finally {
    $stream.Dispose()
    $algorithm.Dispose()
  }
}

function Get-VerifiedFile {
  param(
    [Parameter(Mandatory = $true)][string]$Uri,
    [Parameter(Mandatory = $true)][string]$Destination,
    [Parameter(Mandatory = $true)][string]$Sha256
  )

  Invoke-WebRequest -Uri $Uri -OutFile $Destination -UseBasicParsing
  $actualHash = Get-Sha256Hex -Path $Destination
  if ($actualHash -ne $Sha256.ToLowerInvariant()) {
    Remove-Item -LiteralPath $Destination -Force
    throw "Checksum verification failed for $Destination"
  }
}

function Expand-VerifiedTool {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Uri,
    [Parameter(Mandatory = $true)][string]$Sha256,
    [Parameter(Mandatory = $true)][string]$ExecutableName
  )

  $archivePath = Join-Path $downloadRoot "$Name.zip"
  $extractPath = Join-Path $securityRoot $Name
  Get-VerifiedFile -Uri $Uri -Destination $archivePath -Sha256 $Sha256
  New-Item -ItemType Directory -Force -Path $extractPath | Out-Null
  Expand-Archive -LiteralPath $archivePath -DestinationPath $extractPath -Force
  Copy-Item -LiteralPath (Join-Path $extractPath $ExecutableName) -Destination (Join-Path $binaryRoot $ExecutableName) -Force
}

Expand-VerifiedTool `
  -Name 'gitleaks-8.30.1' `
  -Uri 'https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_windows_x64.zip' `
  -Sha256 'd29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e' `
  -ExecutableName 'gitleaks.exe'

$osvPath = Join-Path $binaryRoot 'osv-scanner.exe'
Get-VerifiedFile `
  -Uri 'https://github.com/google/osv-scanner/releases/download/v2.5.1/osv-scanner_windows_amd64.exe' `
  -Destination $osvPath `
  -Sha256 '25e42f5ef6711fd8c0fb45390972205891dd44c6bd02ac93f0f63e8e98d9bfb6'

Expand-VerifiedTool `
  -Name 'trivy-0.74.0' `
  -Uri 'https://github.com/aquasecurity/trivy/releases/download/v0.74.0/trivy_0.74.0_windows-64bit.zip' `
  -Sha256 '94c40e0696e4b907a74b7b2e1438d5d72ebaca83115817407f568a002d520842' `
  -ExecutableName 'trivy.exe'

$semgrepEnvironment = Join-Path $securityRoot 'semgrep'
if (-not (Test-Path -LiteralPath (Join-Path $semgrepEnvironment 'Scripts\python.exe'))) {
  python -m venv $semgrepEnvironment
}
& (Join-Path $semgrepEnvironment 'Scripts\python.exe') -m pip install --disable-pip-version-check --no-input 'semgrep==1.173.0'

& (Join-Path $binaryRoot 'gitleaks.exe') version
& $osvPath --version
& (Join-Path $securityRoot 'semgrep\Scripts\semgrep.exe') --version
& (Join-Path $binaryRoot 'trivy.exe') --version

Write-Output "Verified security tools are installed under $securityRoot"
