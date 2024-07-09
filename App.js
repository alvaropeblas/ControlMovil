import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

export default function App() {
  const [intervalId, setIntervalId] = useState(null);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control Remoto</Text>

      {/* Sección de Controles de Volumen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controles de Volumen</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPressIn={() => startMoving('volume_up')}
            onPressOut={() => stopMoving()}
          >
            <Image source={require('./assets/volume_up.png')} style={styles.icon} />
            <Text>Subir Volumen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPressIn={() => startMoving('volume_down')}
            onPressOut={() => stopMoving()}
          >
            <Image source={require('./assets/volume_down.png')} style={styles.icon} />
            <Text>Bajar Volumen</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sección de Controles de Ratón */}
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
            onPress={() => sendCommand('click_mouse')}
          >
            <Text>Hacer Clic</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Indicador de Estado o Feedback Visual */}
      {/* Puedes añadir aquí un componente para mostrar el estado actual del PC */}
    </View>
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
