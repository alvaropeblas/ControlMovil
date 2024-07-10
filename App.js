import React, { useState, useEffect, createContext, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

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

    {/* Agregar más información según sea necesario */}
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
    fetch('http://192.168.1.15:3000/system-info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Respuesta no exitosa');
        }
        return response.json(); // Devuelve el cuerpo de la respuesta como JSON
      })
      .then(data => {
        console.log('Datos del sistema recibidos:', data);
        // Aquí puedes actualizar el estado de tu componente React Native con los datos recibidos
        setSystemInfo(data);
      })
      .catch(error => {
        console.log('Error al obtener la información del sistema:', error);
      });
  };



  const sendCommand = (command, x, y) => {
    fetch('http://192.168.1.15:3000', {
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

  return (
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
            }}
          >
            <Text style={styles.menuText}>Información del Sistema</Text>
          </TouchableOpacity>
        </View>

        {/* Renderizado condicional de vistas */}
        {showControlView && <ControlRemoto />}
        {showSystemInfoView && systemInfo && <SystemInfo systemInfo={systemInfo} />}

      </View>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  menu: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activeMenuItem: {
    borderBottomWidth: 2,
    borderColor: 'blue',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
});
