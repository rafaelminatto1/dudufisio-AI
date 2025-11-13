# Ensure execution from repository root even when invoked via relative path
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

Write-Host "Delegating dependency cleanup to Node script..."

node scripts/clean-node-modules.cjs
$exitCode = $LASTEXITCODE

if ($exitCode -ne 0) {
  Write-Error "Dependency cleanup failed with exit code $exitCode"
  exit $exitCode
}

Write-Host "Cleanup complete."
