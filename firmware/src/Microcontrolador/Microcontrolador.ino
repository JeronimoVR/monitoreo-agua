#include <WiFi.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <time.h>
#include <LittleFS.h>

// ==========================================
// 1. CONFIGURACIÓN DE RED Y BROKER
// ==========================================
const char* ssid = "Velez Rojas 2.4 GHz";
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

// ==========================================
// 2. GESTIÓN DE TIEMPO (ISO 8601)
// ==========================================
String getTimestamp() {
  struct tm timeinfo;

  // Intentar varias veces obtener la hora
  for (int i = 0; i < 5; i++) {
    if (getLocalTime(&timeinfo)) {
      char buffer[30];
      strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%S", &timeinfo);
      return String(buffer);
    }
    delay(500);
  }

  Serial.println("[-] No se pudo obtener la hora, usando fallback");

  // Fallback: usar millis como referencia (no exacto pero evita 0000)
  unsigned long seconds = millis() / 1000;
  return "1970-01-01T00:00:" + String(seconds);
}

// ==========================================
// 3. PERSISTENCIA LOCAL (TOLERANCIA A FALLOS)
// ==========================================
void saveOfflineData(const char* jsonPayload) {
  File file = LittleFS.open(offline_file, FILE_APPEND);
  if (file) {
    file.println(jsonPayload);
    file.close();
    Serial.println("[-] Conexión fallida. Dato guardado en Flash.");
  }
}

void processOfflineData() {
  if (!LittleFS.exists(offline_file)) return;

  Serial.println("[!] Detectados datos offline. Sincronizando...");
  File file = LittleFS.open(offline_file, FILE_READ);

  // Lista temporal para los que sigan fallando (opcional, aquí simplificamos)
  bool success = true;
  while (file.available()) {
    String line = file.readStringUntil('\n');
    if (line.length() > 2) {
      if (!client.publish(topic_data, line.c_str())) {
        success = false;
        break;
      }
      delay(100);  // Evitar saturar el broker
    }
  }
  file.close();

  if (success) {
    LittleFS.remove(offline_file);
    Serial.println("[+] Sincronización completa. Memoria limpia.");
  }
}

// ==========================================
// 4. ENVÍO Y CAPTURA (CU001)
// ==========================================
void readAndSendData() {
  // Crear JSON según el DTO del Backend
  StaticJsonDocument<1024> doc;
  doc["id_estacion"] = 1;
  // Obtener fecha
  String fecha = getTimestamp();

  // Validar fecha antes de enviarla
  if (fecha.startsWith("0000") || fecha.startsWith("1970")) {
    Serial.println("[-] Hora inválida, no se envía dato");
    return;  // Cancela el envío
  }

  doc["fecha"] = fecha;

  JsonArray medidas = doc.createNestedArray("medidas");

  // Simulación de sensores especificados en el Caso de Uso
  // En producción, aquí irían las lecturas analógicas (analogRead)
  struct SensorMap {
    int id;
    float valor;
  };
  SensorMap sensores[] = {
    { 1, (float)random(65, 85) / 10.0 },    // pH
    { 2, (float)random(200, 260) / 10.0 },  // Temp
    { 3, (float)random(0, 1000) / 10.0 },   // Turbidez
    { 4, (float)random(100, 500) },         // Cond. Eléctrica
    { 5, (float)random(50, 95) / 10.0 }     // Oxígeno
  };

  for (int i = 0; i < 5; i++) {
    JsonObject m = medidas.createNestedObject();
    m["id_parametro"] = sensores[i].id;
    m["valor"] = sensores[i].valor;
  }

  char buffer[1024];
  serializeJson(doc, buffer);

  // Intento de envío
  if (WiFi.status() == WL_CONNECTED && client.connected()) {
    if (client.publish(topic_data, buffer)) {
      Serial.println("[+] Enviado al broker:");
      Serial.println(buffer);
      processOfflineData();  // Si envía el actual, intenta enviar los viejos
    } else {
      saveOfflineData(buffer);
    }
  } else {
    saveOfflineData(buffer);
  }
}

// ==========================================
// 5. CONEXIONES (WIFI / MQTT)
// ==========================================
void setup_wifi() {
  delay(10);
  Serial.print("\nConectando a WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conectado IP: " + WiFi.localIP().toString());
  configTime(gmtOffset_sec, daylightOffset_sec,
             "pool.ntp.org", "time.nist.gov", "time.google.com");
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Intentando MQTT...");
    // LWT: Si el ESP32 muere, el broker publica "offline" en sensores/status
    if (client.connect(device_id, topic_status, 1, true, "offline")) {
      Serial.println("¡Conectado!");
      client.publish(topic_status, "online", true);
    } else {
      Serial.print("Falló rc=");
      Serial.print(client.state());
      delay(5000);
    }
  }
}

// ==========================================
// NUEVA FUNCIÓN: ESPERAR HORA REAL
// ==========================================
void waitForTime() {
  Serial.print("Esperando sincronización de hora (NTP)");

  struct tm timeinfo;
  int retry = 0;
  int max_retries = 30;  // ~15 segundos

  while (!getLocalTime(&timeinfo) && retry < max_retries) {
    Serial.print(".");
    delay(500);
    retry++;
  }

  if (retry < max_retries) {
    Serial.println("\n[+] Hora sincronizada correctamente.");

    char buffer[30];
    strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%S", &timeinfo);
    Serial.println("Hora actual: " + String(buffer));
  } else {
    Serial.println("\n[-] Error: No se pudo obtener la hora del servidor NTP.");
  }
}

// ==========================================
// SETUP MODIFICADO
// ==========================================
void setup() {
  Serial.begin(115200);

  // 1. Iniciar Sistema de Archivos (Tolerancia a fallos)
  if (!LittleFS.begin(true)) {
    Serial.println("Error al montar LittleFS");
  }

  // 2. Conectar Red
  setup_wifi();

  // 3. Configurar y Esperar Hora Real (Requisito CU001)
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  waitForTime();

  // 4. Configurar Cliente MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setBufferSize(1024);
}

void loop() {
  // Mantener conexión MQTT activa
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();

  // Envío cada 5 minutos (o primer envío al iniciar)
  if (now - lastMsg > SEND_INTERVAL || lastMsg == 0) {
    lastMsg = now;
    readAndSendData();
  }
}