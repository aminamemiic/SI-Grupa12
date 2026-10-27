$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot 'PROJEKAT/BACKEND'
$frontendPath = Join-Path $projectRoot 'PROJEKAT/FRONTEND'

function Assert-CommandSucceeded([string] $message) {
    if ($LASTEXITCODE -ne 0) { throw $message }
}

docker info --format '{{.ServerVersion}}'
Assert-CommandSucceeded 'Pokrenite Docker Desktop i sacekajte da engine bude spreman.'

$localEnvPath = Join-Path $backendPath '.env'
if (!(Test-Path -LiteralPath $localEnvPath)) {
    $localDbPassword = [guid]::NewGuid().ToString('N')
    $localSessionSecret = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
    @(
        "POSTGRES_PASSWORD=$localDbPassword"
        "SESSION_SECRET=$localSessionSecret"
        'GEMINI_API_KEY='
        'GEMINI_MODEL=gemini-2.5-flash'
    ) | Set-Content -LiteralPath $localEnvPath -Encoding utf8
}

Push-Location $backendPath
try {
    docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
    Assert-CommandSucceeded 'Pokretanje Docker servisa nije uspjelo.'
} finally {
    Pop-Location
}

Push-Location $frontendPath
try {
    if (!(Test-Path 'node_modules/.bin/ng.cmd')) {
        npm.cmd ci --no-audit --no-fund
        Assert-CommandSucceeded 'Instalacija frontend zavisnosti nije uspjela.'
    }
    Write-Host 'Aplikacija: http://localhost:4200/ (Ctrl+C za zaustavljanje frontenda)'
    npm.cmd run dev
    Assert-CommandSucceeded 'Frontend server je zavrsio s greskom.'
} finally {
    Pop-Location
}
