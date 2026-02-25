#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <LittleFS.h>
#include "time.h"

// =====================
// CONFIGURACIÓN DE RED
// =====================
const char* ssid = "Velez Rojas 2.4 GHz";
const char* password = "1007544340JVR";

const char* serverURL = "http://192.168.110.87:3001/sensors/upload";
const char* mqtt_server = "192.168.110.158";
const int mqtt_port = 1883;

// =====================
// CONFIGURACIÓN NTP
// =====================
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -18000;  // Colombia UTC-5
const int daylightOffset_sec = 0;

const char* device_id = "1";
const char* topic_data = "sensores/lecturas";
const char* topic_status = "sensores/status";

const unsigned long SEND_INTERVAL = 300000;  // 5 minutos

const int PIN_HUMEDAD = 34;

struct WaterData {
  float ph;
  float turbidity;
  float temperature;
  float conductivity;
  float dissolved_oxygen;
  float humidity_provisional;
};

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;


void setupTime() {

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  Serial.println("Sincronizando hora con NTP...");

  struct tm timeinfo;
  int retries = 0;

  while (!getLocalTime(&timeinfo) && retries < 20) {
    Serial.print(".");
    delay(500);
    retries++;
  }

  if (retries < 20) {
    Serial.println("\nHora sincronizada correctamente");
  } else {
    Serial.println("\nNo se pudo sincronizar NTP, continuará sin hora precisa");
  }
}

// =====================
// SETUP
// =====================
void setup() {

  Serial.begin(115200);

  // Inicializar sistema de archivos
  if (!LittleFS.begin(true)) {
    Serial.println("Error montando LittleFS");
  }

  setup_wifi();
  setupTime();

  client.setServer(mqtt_server, mqtt_port);
  client.setKeepAlive(60);
}

// =====================
// WIFI
// =====================
void setup_wifi() {

  Serial.println("\nConectando a WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi OK - IP: " + WiFi.localIP().toString());
}

// =====================
// RECONEXIÓN MQTT + LWT
// =====================
void reconnect() {

  while (!client.connected()) {

    Serial.print("Intentando conexión MQTT...");

    if (client.connect(
          device_id,
          topic_status,
          1,
          true,
          "offline")) {

      Serial.println("Conectado a MQTT");
      client.publish(topic_status, "online", true);

    } else {
      Serial.print("Fallo, rc=");
      Serial.print(client.state());
      Serial.println(" reintentando en 5 segundos");
      delay(5000);
    }
  }
}


// =====================
// GUARDAR EN BUFFER
// =====================
void saveToBuffer(String data) {

  File file = LittleFS.open("/buffer.txt", FILE_APPEND);

  if (file) {
    file.println(data);
    file.close();
    Serial.println("Dato guardado en buffer");
  }
}

// =====================
// REENVIAR DATOS GUARDADOS
// =====================
void resendBufferedData() {

  if (!LittleFS.exists("/buffer.txt")) return;

  File file = LittleFS.open("/buffer.txt", FILE_READ);
  if (!file) return;

  Serial.println("Reenviando datos pendientes...");

  while (file.available()) {

    String line = file.readStringUntil('\n');
    line.trim();

    if (line.length() > 0) {

      if (!sendNow(line)) {
        file.close();
        return;  // Si falla, salir y reintentar luego
      }
    }
  }

  file.close();
  LittleFS.remove("/buffer.txt");  // Si todo salió bien, borrar buffer
  Serial.println("Buffer limpiado");
}

// =====================
// ENVÍO INMEDIATO (HTTP + MQTT)
// =====================
bool sendNow(String jsonString) {

  bool httpOK = false;
  bool mqttOK = false;

  // HTTP
  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(jsonString);
    http.end();

    if (httpCode >= 200 && httpCode < 300) {
  httpOK = true;
  Serial.println("HTTP enviado correctamente");
} else {
  Serial.printf("HTTP error: %d\n", httpCode);
}
  }

  // MQTT
  if (client.connected()) {
    mqttOK = client.publish(topic_data, jsonString.c_str(), false);
  }

  return (httpOK || mqttOK);
}

// =====================
// LECTURA DE SENSORES
// =====================
WaterData readSensors() {

  WaterData data;

  int rawHumedad = analogRead(PIN_HUMEDAD);
  float moisture_percent = 100.0 - ((float)rawHumedad / 4095.0 * 100.0);

  if (moisture_percent > 100) moisture_percent = 100;
  if (moisture_percent < 0) moisture_percent = 0;

  data.humidity_provisional = moisture_percent;

  data.ph = random(65, 85) / 10.0;
  data.turbidity = random(0, 100) / 10.0;
  data.temperature = random(200, 280) / 10.0;
  data.conductivity = random(50, 500);
  data.dissolved_oxygen = random(50, 90) / 10.0;

  return data;
}

// =====================
// ENVÍO DE DATOS
// =====================
void sendData(WaterData data) {

  StaticJsonDocument<512> doc;
  doc["device_id"] = device_id;
  time_t now = time(NULL);
  doc["timestamp"] = now;

  // Fecha legible opcional
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    char buffer[25];
    strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", &timeinfo);
    doc["datetime"] = buffer;
  }
  JsonObject values = doc.createNestedObject("values");
  values["ph"] = data.ph;
  values["turbidity"] = data.turbidity;
  values["temperature"] = data.temperature;
  values["conductivity"] = data.conductivity;
  values["dissolved_oxygen"] = data.dissolved_oxygen;
  values["humidity"] = data.humidity_provisional;


  String jsonString;
  serializeJson(doc, jsonString);

  if (!sendNow(jsonString)) {
    Serial.println("No se pudo enviar, guardando en buffer...");
    saveToBuffer(jsonString);
  }
}

// =====================
// LOOP PRINCIPAL
// =====================
void loop() {

  if (WiFi.status() == WL_CONNECTED && !client.connected()) {
    reconnect();
  }

  client.loop();

  // Intentar reenviar datos pendientes primero
  resendBufferedData();

  unsigned long now = millis();

  if (now - lastMsg > SEND_INTERVAL) {

    lastMsg = now;

    Serial.println("Leyendo sensores y enviando datos...");

    WaterData currentData = readSensors();
    sendData(currentData);
  }
}