const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;

// Ruta completa al ejecutable de nircmd.exe
const nircmdPath = 'C:\\nircmd\\nircmd.exe';

app.use(express.json());

app.post('/', (req, res) => {
  const { command, x, y } = req.body;

  switch (command) {
    case 'volume_up':
      exec(`${nircmdPath} changesysvolume 2000`, (error) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
      });
      break;
    case 'volume_down':
      exec(`${nircmdPath} changesysvolume -2000`, (error) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
      });
      break;
    case 'play_pause':
      exec(`${nircmdPath} sendkeypress media_play_pause`, (error) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
      });
      break;
    case 'move_mouse':
      exec(`${nircmdPath} movecursor ${x} ${y}`, (error) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
      });
      break;
    case 'click_mouse':
      exec(`${nircmdPath} sendmouse left click`, (error) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
      });
      break;
    default:
      console.log('Comando no reconocido');
  }

  res.send('Comando recibido');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
