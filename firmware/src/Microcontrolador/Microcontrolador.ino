#include <WiFi.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <time.h>
#include <LittleFS.h>

// ==========================================
// 1. CONFIGURACIÓN DE RED Y BROKER
// ==========================================
const char* ssid = "Familia_Velez";
const char* password = "1007544340JVR";
const char* mqtt_server = "192.168.110.87";
const int mqtt_port = 1883;

// Configuración de Tópicos e ID
const char* device_id = "01";
const char* topic_data = "sensores/datos";
const char* topic_status = "sensores/status";
const char* offline_file = "/pending.jsonl";

// Configuración NTP (Colombia UTC-5)
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -18000;
const int daylightOffset_sec = 0;

// Intervalo de envío: 5 minutos
const unsigned long SEND_INTERVAL = 300000;
unsigned long lastMsg = 0;

WiFiClient espClient;
PubSubClient client(espClient);

void logStep(const char* step, const String& message) {
  Serial.print("[TRACE] ");
  Serial.print(step);
  Serial.print(" - ");
  Serial.println(message);
}

// ==========================================
// 2. GESTIÓN DE TIEMPO (ISO 8601)
// ==========================================
String getTimestamp() {
  struct tm timeinfo;

  logStep("TIME", "Iniciando obtencion de timestamp");

  // Intentar varias veces obtener la hora
  for (int i = 0; i < 5; i++) {
    logStep("TIME", "Intento " + String(i + 1) + " de 5 para obtener hora local");
    if (getLocalTime(&timeinfo)) {
      char buffer[30];
      strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%S", &timeinfo);
      logStep("TIME", String("Hora obtenida correctamente: ") + buffer);
      return String(buffer);
    }
    delay(500);
  }

  logStep("TIME", "No se pudo obtener la hora, usando fallback");

  // Fallback: usar millis como referencia (no exacto pero evita 0000)
  unsigned long seconds = millis() / 1000;
  String fallback = "1970-01-01T00:00:" + String(seconds);
  logStep("TIME", String("Timestamp fallback generado: ") + fallback);
  return fallback;
}

// ==========================================
// 3. PERSISTENCIA LOCAL (TOLERANCIA A FALLOS)
// ==========================================
void saveOfflineData(const char* jsonPayload) {
  logStep("OFFLINE", "Guardando dato en LittleFS");
  File file = LittleFS.open(offline_file, FILE_APPEND);
  if (file) {
    file.println(jsonPayload);
    file.close();
    logStep("OFFLINE", "Conexion fallida. Dato guardado en Flash.");
  } else {
    logStep("OFFLINE", "No se pudo abrir el archivo offline para escritura");
  }
}

void processOfflineData() {
  logStep("OFFLINE", "Verificando datos pendientes en LittleFS");
  if (!LittleFS.exists(offline_file)) {
    logStep("OFFLINE", "No hay datos pendientes para sincronizar");
    return;
  }

  logStep("OFFLINE", "Detectados datos offline. Sincronizando...");
  File file = LittleFS.open(offline_file, FILE_READ);

  if (!file) {
    logStep("OFFLINE", "No se pudo abrir el archivo offline para lectura");
    return;
  }

  // Lista temporal para los que sigan fallando (opcional, aquí simplificamos)
  bool success = true;
  int lineNumber = 0;
  while (file.available()) {
    String line = file.readStringUntil('\n');
    if (line.length() > 2) {
      lineNumber++;
      logStep("OFFLINE", "Reenviando linea " + String(lineNumber));
      if (!client.publish(topic_data, line.c_str())) {
        logStep("OFFLINE", "Fallo el reenvio de la linea " + String(lineNumber));
        success = false;
        break;
      }
      logStep("OFFLINE", "Linea " + String(lineNumber) + " reenviada correctamente");
      delay(100);  // Evitar saturar el broker
    }
  }
  file.close();

  if (success) {
    LittleFS.remove(offline_file);
    logStep("OFFLINE", "Sincronizacion completa. Memoria limpia.");
  }
}

// ==========================================
// 4. ENVÍO Y CAPTURA (CU001)
// ==========================================
void readAndSendData() {
  logStep("SEND", "Iniciando construccion del payload de sensores");
  // Crear JSON según el DTO del Backend
  StaticJsonDocument<1024> doc;
  doc["id_estacion"] = 1;
  // Obtener fecha
  String fecha = getTimestamp();

  logStep("SEND", String("Fecha recibida para payload: ") + fecha);

  // Validar fecha antes de enviarla
  if (fecha.startsWith("0000") || fecha.startsWith("1970")) {
    logStep("SEND", "Hora invalida, no se envia dato");
    return;  // Cancela el envío
  }

  doc["fecha"] = fecha;
  logStep("SEND", "Campo fecha agregado al JSON");

  JsonArray medidas = doc.createNestedArray("medidas");
  logStep("SEND", "Array medidas creado");

  // Simulación de sensores especificados en el Caso de Uso
  // En producción, aquí irían las lecturas analógicas (analogRead)
  struct SensorMap {
    int id;
    float valor;
  };

  SensorMap sensores[] = {
    // 1. pH (Atlas Scientific EZO-pH): Rango 0.001 − 14.000. Precisión de 3 decimales.
    { 1, (float)random(0, 14000) / 1000.0 },

    // 2. Temp (DFRobot DS18B20): Rango -55 a 125°C. Precisión típica de 0.1°C o 0.0625°C.
    // Simulamos un rango de agua líquida común (5°C a 40°C) con 2 decimales.
    { 2, (float)random(500, 4000) / 100.0 },

    // 3. Turbidez (DFRobot SEN0189): Sensor Analógico (0 a 4.5V).
    // Rango 0 a 3000 NTU. Su precisión es menor, usualmente se maneja con 1 o 2 decimales.
    { 3, (float)random(0, 30000) / 10.0 },

    // 4. Cond. Eléctrica (Atlas Scientific EZO-EC): Rango 0.07 − 500,000+ μS/cm.
    // Precisión de 2 decimales. Simulamos un rango de agua dulce (100 a 2000 μS/cm).
    { 4, (float)random(10000, 200000) / 100.0 },

    // 5. Oxígeno Disuelto (Atlas Scientific EZO-DO): Rango 0.01 − 100 mg/L.
    // Precisión de 2 decimales. El agua saturada suele estar entre 7 y 10 mg/L.
    { 5, (float)random(0, 1500) / 100.0 }
  };

  for (int i = 0; i < 5; i++) {
    JsonObject m = medidas.createNestedObject();
    m["id_parametro"] = sensores[i].id;
    m["valor"] = sensores[i].valor;
    logStep("SEND", "Medida agregada: id_parametro=" + String(sensores[i].id) + ", valor=" + String(sensores[i].valor, 3));
  }

  char buffer[1024];
  serializeJson(doc, buffer);
  logStep("SEND", String("JSON serializado. Tamano=") + String(strlen(buffer)));
  Serial.println(buffer);

  // Intento de envío
  wl_status_t wifiStatus = WiFi.status();
  logStep("SEND", String("Estado WiFi actual: ") + String(wifiStatus));
  logStep("SEND", String("Estado MQTT actual: ") + (client.connected() ? "conectado" : "desconectado"));

  if (wifiStatus == WL_CONNECTED && client.connected()) {
    logStep("SEND", "Intentando publicar en MQTT");
    if (client.publish(topic_data, buffer)) {
      logStep("SEND", "Publicado correctamente en el broker");
      processOfflineData();  // Si envía el actual, intenta enviar los viejos
    } else {
      logStep("SEND", "Fallo publish. Guardando dato offline");
      saveOfflineData(buffer);
    }
  } else {
    logStep("SEND", "WiFi o MQTT no disponibles. Guardando dato offline");
    saveOfflineData(buffer);
  }
}

// ==========================================
// 5. CONEXIONES (WIFI / MQTT)
// ==========================================
void setup_wifi() {
  delay(10);
  logStep("WIFI", "Conectando a WiFi");
  WiFi.begin(ssid, password);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    retry++;
    logStep("WIFI", "Intento " + String(retry) + ": aun sin conexion");
  }
  logStep("WIFI", "WiFi conectado. IP: " + WiFi.localIP().toString());
  logStep("WIFI", "Configurando NTP");
  configTime(gmtOffset_sec, daylightOffset_sec,
             "pool.ntp.org", "time.nist.gov", "time.google.com");
}

void reconnect() {
  while (!client.connected()) {
    logStep("MQTT", "Intentando conexion MQTT");
    // LWT: Si el ESP32 muere, el broker publica "offline" en sensores/status
    if (client.connect(device_id, topic_status, 1, true, "offline")) {
      logStep("MQTT", "Conexion MQTT exitosa");
      client.publish(topic_status, "online", true);
      logStep("MQTT", "Estado online publicado");
    } else {
      logStep("MQTT", "Fallo conexion MQTT, rc=" + String(client.state()));
      delay(5000);
    }
  }
}

// ==========================================
// NUEVA FUNCIÓN: ESPERAR HORA REAL
// ==========================================
void waitForTime() {
  logStep("TIME", "Esperando sincronizacion de hora (NTP)");

  struct tm timeinfo;
  int retry = 0;
  int max_retries = 30;  // ~15 segundos

  while (!getLocalTime(&timeinfo) && retry < max_retries) {
    logStep("TIME", "NTP aun no disponible, reintentando");
    delay(500);
    retry++;
  }

  if (retry < max_retries) {
    logStep("TIME", "Hora sincronizada correctamente");

    char buffer[30];
    strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%S", &timeinfo);
    logStep("TIME", String("Hora actual: ") + buffer);
  } else {
    logStep("TIME", "Error: No se pudo obtener la hora del servidor NTP");
  }
}

// ==========================================
// SETUP MODIFICADO
// ==========================================
void setup() {
  Serial.begin(115200);
  logStep("BOOT", "Serial iniciado a 115200");

  // 1. Iniciar Sistema de Archivos (Tolerancia a fallos)
  if (!LittleFS.begin(true)) {
    logStep("BOOT", "Error al montar LittleFS");
  } else {
    logStep("BOOT", "LittleFS montado correctamente");
  }

  // 2. Conectar Red
  logStep("BOOT", "Iniciando conexion WiFi");
  setup_wifi();

  // 3. Configurar y Esperar Hora Real (Requisito CU001)
  logStep("BOOT", "Configurando NTP principal");
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  waitForTime();

  // 4. Configurar Cliente MQTT
  logStep("BOOT", "Configurando cliente MQTT");
  client.setServer(mqtt_server, mqtt_port);
  client.setBufferSize(1024);
  logStep("BOOT", String("Broker configurado en ") + mqtt_server + ":" + String(mqtt_port));
}

void loop() {
  // Mantener conexión MQTT activa
  if (!client.connected()) {
    logStep("LOOP", "MQTT desconectado, intentando reconectar");
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  logStep("LOOP", "Tick del loop. millis=" + String(now) + ", delta=" + String(now - lastMsg));

  // Envío cada 5 minutos (o primer envío al iniciar)
  if (now - lastMsg > SEND_INTERVAL || lastMsg == 0) {
    logStep("LOOP", "Se cumple intervalo de envio, preparando lectura y envio");
    lastMsg = now;
    readAndSendData();
  } else {
    logStep("LOOP", "Aun no vence el intervalo de envio");
  }
}