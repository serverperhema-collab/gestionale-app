const { execSync } = require('child_process');

const ports = [3002, 5174];

for (const port of ports) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano`).toString();
      const lines = output.split('\n');
      const pids = new Set();
      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0' && !isNaN(pid)) {
              pids.add(pid);
            }
          }
        }
      }
      for (const pid of pids) {
        console.log(`[Port Cleaner] Trovato processo ${pid} sulla porta ${port}. Terminazione...`);
        try {
          execSync(`taskkill /F /PID ${pid}`);
        } catch (e) {
          // ignore
        }
      }
    } else {
      try {
        const output = execSync(`lsof -t -i:${port}`).toString();
        const pids = output.split('\n').map(p => p.trim()).filter(Boolean);
        for (const pid of pids) {
          console.log(`[Port Cleaner] Trovato processo ${pid} sulla porta ${port}. Terminazione...`);
          execSync(`kill -9 ${pid}`);
        }
      } catch (e) {
        // ignore
      }
    }
  } catch (err) {
    // ignore
  }
}
