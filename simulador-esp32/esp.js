const mqtt = require('mqtt');

// ==========================================
// CONFIGURACIÓN (Cambia por la IP)
// ==========================================
const MQTT_SERVER = 'mqtt://localhost'; // 👈 Pon aquí la IP
const MQTT_PORT = 1883;
const TOPIC_DATA = 'sensores/datos';
const TOPIC_STATUS = 'sensores/status';
const CLIENT_ID = 'esp32_simulado_pc';

// Conectar al Broker MQTT remoto o local
const client = mqtt.connect(MQTT_SERVER, {
    clientId: CLIENT_ID,
    username: 'Servidor',
    password: '2wsxcv@SWXC',
    // Cambia si tu broker tiene autenticación
    will: {
        topic: TOPIC_STATUS,
        payload: 'offline',
        qos: 1,
        retain: true
    }
});

// Función para generar números aleatorios con decimales configurables
const randomFloat = (min, max, decimals) => {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
};

// Función principal que arma el JSON igual que el ESP32
const readAndSendData = () => {
    const payload = {
        id_estacion: 1,
        fecha: new Date().toISOString().split('.')[0], // Formato ISO 8601 (YYYY-MM-DDTHH:MM:SS)
        medidas: [
            { id_parametro: 1, valor: randomFloat(0, 14, 3) },       // pH
            { id_parametro: 4, valor: randomFloat(5, 40, 2) },       // Temperatura
            { id_parametro: 2, valor: randomFloat(0, 3000, 1) },     // Turbidez
            { id_parametro: 3, valor: randomFloat(100, 2000, 2) },   // Cond. Eléctrica
            { id_parametro: 5, valor: randomFloat(0, 15, 2) }        // Oxígeno Disuelto
        ]
    };

    const buffer = JSON.stringify(payload);
    
    client.publish(TOPIC_DATA, buffer, (err) => {
        if (err) {
            console.error('❌ Error al publicar datos:', err);
        } else {
            console.log('✅ Datos enviados correctamente al broker:', buffer);
        }
    });
};

// Eventos de conexión
client.on('connect', () => {
    console.log('🚀 Conectado al Broker MQTT con éxito');
    // Publicar estado online
    client.publish(TOPIC_STATUS, 'online', { retain: true });

    // Primer envío inmediato
    readAndSendData();

    // Configurar intervalo (Cada 5 minutos = 300000 ms)
    // Para pruebas rápidas puedes cambiarlo a 5000 (5 segundos)
    setInterval(readAndSendData, 300000); 
});

client.on('error', (err) => {
    console.error('❌ Fallo en la conexión MQTT:', err);
});