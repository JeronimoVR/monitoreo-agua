#include <WiFi.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <LittleFS.h>

// =====================
// CONFIGURACIÓN DE RED
// =====================
const char* ssid = "Velez Rojas 2.4 GHz";
const char* password = "1007544340JVR";
const char* mqtt_server = "192.168.110.87";
const int mqtt_port = 1883;

// Tópicos configurados para NestJS
const char* device_id = "1";
const char* topic_data = "sensores/datos";
const char* topic_status = "sensores/status";

// Intervalo: 5 minutos (300000 ms)
const unsigned long SEND_INTERVAL = 300000;

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;

// =====================
// SETUP WIFI
// =====================
void setup_wifi() {
  delay(10);
  Serial.println("\nConectando a WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conectado - IP: " + WiFi.localIP().toString());
}

// =====================
// RECONEXIÓN MQTT
// =====================
void reconnect() {
  while (!client.connected()) {
    Serial.print("Intentando conexión MQTT...");
    // LWT (Last Will and Testament) para avisar si el sensor se apaga
    if (client.connect(device_id, topic_status, 1, true, "offline")) {
      Serial.println("¡Conectado!");
      client.publish(topic_status, "online", true);
    } else {
      Serial.print("Error rc=");
      Serial.print(client.state());
      Serial.println(" reintentando en 5s");
      delay(5000);
    }
  }
}

// =====================
// ENVÍO DE DATOS (JSON OPTIMIZADO)
// =====================
void sendRandomData() {
  // 1. Crear el documento JSON (ajusta el tamaño según tu librería)
  StaticJsonDocument<768> doc; 

  // 2. Coincidir con 'id_estacion' del DTO
  doc["id_estacion"] = 1; 

  // 3. Crear el array 'medidas'
  JsonArray medidas = doc.createNestedArray("medidas");

  // Datos simulados
  struct Param { int id; float val; };
  Param params[] = {
    {1, (float)random(65, 85) / 10.0},
    {2, (float)random(0, 50) / 10.0},
    {3, (float)random(100, 800)},
    {4, (float)random(200, 260) / 10.0},
    {5, (float)random(60, 95) / 10.0}
  };

  for (int i = 0; i < 5; i++) {
    JsonObject m = medidas.createNestedObject();
    // 4. Coincidir con 'id_parametro' y 'valor' del MedidaDto
    m["id_parametro"] = params[i].id;
    m["valor"] = params[i].val;
  }

  // 5. Serializar y publicar
  char buffer[512];
  serializeJson(doc, buffer);
  client.publish("sensores/datos", buffer);
  
  Serial.println("Datos enviados al broker:");
  Serial.println(buffer);
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setBufferSize(512);  // Aumentamos el buffer para el JSON
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  // Envío cada 5 minutos
  if (now - lastMsg > SEND_INTERVAL || lastMsg == 0) {
    lastMsg = now;
    sendRandomData();
  }
}