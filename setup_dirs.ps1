# Script para criar a estrutura de diretórios
$basedir = "orumaiv"

# Cria o diretório base e src
New-Item -ItemType Directory -Path "$basedir\src" -Force

# Cria os diretórios principais
$dirs = @(
    "src\api",
    "src\agents",
    "src\core",
    "src\infrastructure",
    "src\config",
    "src\domain",
    "src\domain\models",
    "src\domain\repositories",
    "src\domain\services",
    "src\utils"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path "$basedir\$dir" -Force
    Write-Host "Criado diretório: $basedir\$dir"
}

# Cria os arquivos iniciais importantes
$initFiles = @(
    "src\__init__.py",
    "src\api\__init__.py",
    "src\agents\__init__.py",
    "src\core\__init__.py",
    "src\infrastructure\__init__.py",
    "src\config\__init__.py",
    "src\domain\__init__.py",
    "src\domain\models\__init__.py",
    "src\domain\repositories\__init__.py",
    "src\domain\services\__init__.py",
    "src\utils\__init__.py"
)

foreach ($file in $initFiles) {
    New-Item -ItemType File -Path "$basedir\$file" -Force
    Write-Host "Criado arquivo: $basedir\$file"
}

Write-Host "Estrutura de diretórios criada com sucesso!" 