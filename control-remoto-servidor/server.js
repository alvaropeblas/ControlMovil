const express = require('express');
const { exec } = require('child_process');
const si = require('systeminformation');
const app = express();
const port = 3000;
const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:19000', // Reemplaza con el origen de tu aplicación React Native
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  };
  
  app.use(cors(corsOptions));
app.use(express.json());

// Ruta completa al ejecutable de nircmd.exe
const nircmdPath = 'C:\\nircmd\\nircmd.exe';

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

app.get('/system-info', (req, res) => {
    // Comando para obtener la temperatura de la CPU usando wmic
    const command = 'wmic /namespace:\\\\root\\wmi PATH MSAcpi_ThermalZoneTemperature get CurrentTemperature';

    // Ejecutar el comando
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error al ejecutar el comando:', error);
            res.status(500).json({ error: 'Error al obtener la temperatura' });
            return;
        }
        
        // Verificar si stdout contiene la información esperada
        if (!stdout || typeof stdout !== 'string') {
            console.error('Error: La salida del comando no es válida');
            res.status(500).json({ error: 'No se pudo obtener la temperatura' });
            return;
        }

        // Obtener la temperatura de la salida del comando
        const temperatureMatch = stdout.match(/\d+/); // Buscar un número en la salida
        if (!temperatureMatch) {
            console.error('Error: No se pudo extraer la temperatura de la salida del comando');
            res.status(500).json({ error: 'No se pudo obtener la temperatura' });
            return;
        }

        // Convertir la temperatura a grados Celsius
        const temperatureRaw = parseInt(temperatureMatch[0]);
        const celsiusTemp = (temperatureRaw / 10) - 273.15;

        // Enviar la temperatura como respuesta JSON
        res.json({ temperature: celsiusTemp });
    });
});



app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
