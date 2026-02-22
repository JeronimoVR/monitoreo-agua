#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

// --- CONFIGURACIÓN DE RED ---
const char* ssid = "Velez Rojas 2.4 GHz";
const char* password = "1007544340JVR";
const char* serverURL = "http://192.168.110.87:3001/sensors/upload"; 
const char* mqtt_server = "192.168.110.87";

// --- MAPEO DE PINES (Según arquitectura propuesta) ---
const int PIN_HUMEDAD    = 34; // Tu sensor actual
const int PIN_PH         = 35; 
const int PIN_TURBIDEZ   = 32;
const int PIN_CONDUCT    = 33;

// Estructura compatible con el IRCA (Resolución 2115/2007)
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

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
}

void setup_wifi() {
  delay(10);
  Serial.println("\nConectando a WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi OK - IP: " + WiFi.localIP().toString());
}



WaterData readSensors() {
  WaterData data;
  
  // 1. Lectura REAL (Sensor de humedad actual)
  int rawHumedad = analogRead(PIN_HUMEDAD);
  data.humidity_provisional = map(rawHumedad, 4095, 0, 0, 100);

  // 2. Lecturas SIMULADAS (Para probar el sistema completo hasta tener los sensores)
  // Estos rangos siguen los criterios de calidad del agua
  data.ph = random(65, 85) / 10.0;             // Rango 6.5 - 8.5
  data.turbidity = random(0, 100) / 10.0;      // Rango 0.0 - 10.0 NTU
  data.temperature = random(200, 280) / 10.0;  // Rango 20.0 - 28.0 °C
  data.conductivity = random(50, 500);         // µS/cm
  data.dissolved_oxygen = random(50, 90) / 10.0; // mg/L

  return data;
}

void sendData(WaterData data) {
  StaticJsonDocument<512> doc;
  doc["device_id"] = "ESP32_UNIAJC_SUR_001";
  
  // Payload estructurado para la IA y el Backend
  JsonObject values = doc.createNestedObject("values");
  values["ph"] = data.ph;
  values["turbidity"] = data.turbidity;
  values["temperature"] = data.temperature;
  values["conductivity"] = data.conductivity;
  values["dissolved_oxygen"] = data.dissolved_oxygen;
  values["humidity"] = data.humidity_provisional;

  String jsonString;
  serializeJson(doc, jsonString);

  // Envío HTTP
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL); 
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.POST(jsonString);
    Serial.printf("[HTTP] POST... code: %d\n", httpCode);
    http.end();
  }

  // Envío MQTT
  if (client.connect("ESP32_UNIAJC_SUR_001")) {
    client.publish("sensores/arca/raw", jsonString.c_str());
  }
}

void loop() {
  unsigned long now = millis();
  if (now - lastMsg > 100000) { // Envío cada 10 seg para pruebas iniciales
    lastMsg = now;
    WaterData currentData = readSensors();
    sendData(currentData);
  }
  client.loop();
}