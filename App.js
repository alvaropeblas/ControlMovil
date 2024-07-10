import React, { useState, useEffect, createContext, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import config from './config';

// Contexto para el estado global
const AppContext = createContext();

// Componente para el control remoto del ratón
const ControlRemoto = () => {
  const { startMoving, stopMoving, sendCommand, sendVolumeCommand } = useContext(AppContext);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Controles de Ratón</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => startMoving('move_mouse', 45, 0)}
          onPressOut={() => stopMoving()}
        >
          <Image source={require('./assets/right_arrow.png')} style={styles.icon} />
          <Text>Mover Derecha</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => startMoving('move_mouse', -45, 0)}
          onPressOut={() => stopMoving()}
        >
          <Image source={require('./assets/left_arrow.png')} style={styles.icon} />
          <Text>Mover Izquierda</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => startMoving('move_mouse', 0, -45)}
          onPressOut={() => stopMoving()}
        >
          <Image source={require('./assets/up_arrow.png')} style={styles.icon} />
          <Text>Mover Arriba</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => startMoving('move_mouse', 0, 45)}
          onPressOut={() => stopMoving()}
        >
          <Image source={require('./assets/down_arrow.png')} style={styles.icon} />
          <Text>Mover Abajo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => sendVolumeCommand('volume_up')}
        >
          <Image source={require('./assets/volume_up.png')} style={styles.icon} />
          <Text>Subir Volumen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => sendVolumeCommand('volume_down')}
        >
          <Image source={require('./assets/volume_down.png')} style={styles.icon} />
          <Text>Bajar Volumen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => sendCommand('click_mouse')}
        >
          <Text>Hacer Clic</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Componente para mostrar la información del sistema
const SystemInfo = ({ systemInfo }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Información del Sistema</Text>
    <Text>Temperatura CPU: {systemInfo.temperature.toFixed(2)}ºC</Text>
    <Text>Carga de la CPU: {systemInfo.cpuLoad.toFixed(2)}%</Text>
    <Text>Memoria Total: {(systemInfo.memory.total / (1024 ** 3)).toFixed(2)} GB</Text>
    <Text>Memoria Libre: {(systemInfo.memory.free / (1024 ** 3)).toFixed(2)} GB</Text>
    <Text>Memoria Usada: {(systemInfo.memory.used / (1024 ** 3)).toFixed(2)} GB</Text>
    <Text>Memoria Activa: {(systemInfo.memory.active / (1024 ** 3)).toFixed(2)} GB</Text>
    <Text>Memoria Disponible: {(systemInfo.memory.available / (1024 ** 3)).toFixed(2)} GB</Text>
    <Text>Disco:</Text>
    {systemInfo.disk.map((disk, index) => (
      <View key={index}>
        <Text>  - {disk.fs} ({disk.type}): {(disk.used / (1024 ** 3)).toFixed(2)} GB usados de {(disk.size / (1024 ** 3)).toFixed(2)} GB</Text>
      </View>
    ))}
  </View>
);

// Componente para las acciones (Apagar, Suspender, Encender)
const Actions = ({ handleTurnOff, handleTurnSuspend, handleTurnOn }) => (
  <View style={styles.actionsContainer}>
    <TouchableOpacity style={styles.actionButton} onPress={handleTurnOff}>
      <Image source={require('./assets/power_off.png')} style={styles.icon} />
      <Text>Apagar</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={handleTurnOn}>
      <Image source={require('./assets/restart.png')} style={styles.icon} />
      <Text>Reiniciar</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={handleTurnSuspend}>
      <Image source={require('./assets/suspend.png')} style={styles.icon} />
      <Text>Suspender</Text>
    </TouchableOpacity>
  </View>
);

// Componente principal de la aplicación
export default function App() {
  const [intervalId, setIntervalId] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [showControlView, setShowControlView] = useState(true);
  const [showSystemInfoView, setShowSystemInfoView] = useState(false);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = () => {
    const urls = [`${config.serverUrl}/system-info`, `${config.serverUrl}/cpu-load`, `${config.serverUrl}/memory-info`, `${config.serverUrl}/disk-info`];

    Promise.all(urls.map(url => fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).then(response => {
      if (!response.ok) {
        throw new Error('Respuesta no exitosa');
      }
      return response.json();
    }))).then(data => {
      const [systemInfo, cpuLoad, memoryInfo, diskInfo] = data;
      setSystemInfo({
        ...systemInfo,
        cpuLoad: cpuLoad.load,
        memory: memoryInfo,
        disk: diskInfo
      });
    }).catch(error => {
      console.log('Error al obtener la información del sistema:', error);
    });
  };

  const sendCommand = (command, x, y) => {
    fetch(config.serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command, x, y }),
    }).catch(error => console.error(error));
  };

  const startMoving = (command, x, y) => {
    if (intervalId === null) {
      const id = setInterval(() => {
        sendCommand(command, x, y);
      }, 100);
      setIntervalId(id);
    }
  };

  const stopMoving = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const sendVolumeCommand = (command) => {
    sendCommand(command);
  };

  const handleTurnOff = () => {
    fetch(config.serverUrl + '/turn-off', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

    }).catch(error => console.error(error));
  };

  const handleTurnSuspend = () => {
    fetch(config.serverUrl + '/suspend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

    }).catch(error => console.error(error));
  };

  const handleTurnOn = () => {
    fetch(config.serverUrl + '/restart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

    }).catch(error => console.error(error));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <AppContext.Provider value={{ systemInfo, startMoving, stopMoving, sendCommand, sendVolumeCommand }}>
        <View style={styles.container}>
          {/* Menú de Navegación */}
          <View style={styles.menu}>
            <TouchableOpacity
              style={[styles.menuItem, showControlView && styles.activeMenuItem]}
              onPress={() => {
                setShowControlView(true);
                setShowSystemInfoView(false);
              }}
            >
              <Text style={styles.menuText}>Control Remoto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, showSystemInfoView && styles.activeMenuItem]}
              onPress={() => {
                setShowControlView(false);
                setShowSystemInfoView(true);
                fetchSystemInfo();
              }}
            >
              <Text style={styles.menuText}>Información del Sistema</Text>
            </TouchableOpacity>
          </View>

          {/* Renderizado condicional de vistas */}
          {showControlView && <ControlRemoto />}
          {showSystemInfoView && systemInfo && <SystemInfo systemInfo={systemInfo} />}

          {/* Vista de Acciones */}
          <Actions
            handleTurnOff={handleTurnOff}
            handleTurnOn={handleTurnOn}
            handleTurnSuspend={handleTurnSuspend}
          />
        </View>
      </AppContext.Provider>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    minHeight: '100%', // Asegura que el ScrollView tenga al menos el tamaño de la pantalla
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30, // Aumenta el espacio horizontal
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  menu: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 30, // Aumenta el espacio entre el menú y el contenido
    width: '100%',
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 15, // Aumenta el espacio vertical en cada ítem del menú
    marginBottom: 15, // Aumenta el espacio entre ítems de menú
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  menuText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activeMenuItem: {
    backgroundColor: 'lightblue',
  },
  section: {
    marginBottom: 30,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, // Añade un poco de espacio arriba de los botones
  },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    margin: 10, // Aumenta el espacio alrededor de los botones
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 130, // Aumenta un poco el tamaño de los botones
    height: 130,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
