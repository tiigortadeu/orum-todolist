const { exec } = require('child_process');

console.log('Iniciando o servidor MCP Chart...');

// Usar o Smithery CLI instalado localmente
const command = 'npx @smithery/cli run @antvis/mcp-server-chart --key b1c547b7-aa58-4e27-81bd-462afb618cfa --port 3333';

// Executar o comando
const mcpProcess = exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao iniciar o servidor MCP: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`MCP stderr: ${stderr}`);
  }
  if (stdout) {
    console.log(`MCP stdout: ${stdout}`);
  }
});

// Exibir saída em tempo real
mcpProcess.stdout.on('data', (data) => {
  console.log(`MCP SERVER: ${data}`);
});

mcpProcess.stderr.on('data', (data) => {
  console.log(`MCP SERVER: ${data}`);
});

mcpProcess.on('close', (code) => {
  console.log(`Servidor MCP encerrado com código: ${code}`);
});

// Manter o script rodando
process.stdin.resume();

// Lidar com encerramento do processo
process.on('SIGINT', () => {
  console.log('Encerrando o servidor MCP...');
  mcpProcess.kill();
  process.exit();
}); 