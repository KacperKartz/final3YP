#include "WiFiType.h"
#include <DHT.h>
#include "mqtt_handler.h"
#include "secrets.h"
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <vector>
#include "display.h"
#include "user_feedback_functions.h"

#include <map>
std::map<int, DHT*> dhtSensors;

std::map<int, bool> dhtInitialized;



WiFiClientSecure espClient;
PubSubClient client(espClient);

String deviceID;
int wifi_Attempts = 0;

struct ConditionalRule {
    String topic;
    String condition;
    int pin;
    String action;
};

struct ReadingRule {
  String topic;
  String sensor;
  int pin;
  unsigned long interval;
  unsigned long lastSent = 0;
};


std::vector<ConditionalRule> rules;
std::vector<ReadingRule> readingRules;

String configTopic;

void connectToWiFi() {
    Serial.print("Connecting to WiFi...");
    WiFi.begin(WIFI_SSID2, WIFI_PASSWORD2);

    WiFi.setSleep(false);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        wifi_Attempts++;
    }
    // if (WiFi.status() == WL_CONNECTED){
    //     String ip = WiFi.localIP().toString();
    //     displayText("WiFi Connected!\nIP: " + ip);
    // }


    Serial.println("\nWiFi connected!");
}

void setupMQTT() {
    deviceID = WiFi.macAddress();
    deviceID.replace(":", "");

    Serial.print("Device ID: ");
    Serial.println(deviceID);

    espClient.setInsecure();
    client.setServer(MQTT_SERVER, MQTT_PORT);
    client.setCallback(mqttCallback);
    client.setBufferSize(4096); 

    String statusTopic = "iot/device/status/" + deviceID;

    String commandTopic = "iot/device/command/" + deviceID;


    StaticJsonDocument<256> lwtDoc;
    lwtDoc["id"] = deviceID;
    lwtDoc["status"] = "offline";
    char lwtMessage[256];
    serializeJson(lwtDoc, lwtMessage);

    client.setKeepAlive(5);

    while (!client.connected()) {
        Serial.print("Connecting to MQTT...");
        if (client.connect(deviceID.c_str(), MQTT_USERNAME, MQTT_PASSWORD, statusTopic.c_str(), 1, true, lwtMessage)) {
            Serial.println("Connected to MQTT!");

            StaticJsonDocument<256> onlineDoc;
            onlineDoc["id"] = deviceID;
            onlineDoc["status"] = "online";

            char onlineMessage[256];
            serializeJson(onlineDoc, onlineMessage);

            client.publish(statusTopic.c_str(), onlineMessage, true);
            Serial.println("Published 'online' status");
        } else {
             Serial.print("Failed, rc=");
            Serial.print(client.state());
            Serial.println(" Retrying in 5 seconds...");
            delay(5000);
        }
    }

    configTopic = "iot/device/config/" + deviceID;
    Serial.print("Subscribing to config topic: ");
    Serial.println(configTopic);
    client.subscribe(configTopic.c_str());
    client.subscribe(commandTopic.c_str());

}




bool evaluateCondition(String condition, float value) {
    condition.trim();

    if (condition.indexOf(">=") != -1) {
        float target = condition.substring(condition.indexOf(">=") + 2).toFloat();
        return value >= target;
    }
    if (condition.indexOf("<=") != -1) {
        float target = condition.substring(condition.indexOf("<=") + 2).toFloat();
        return value <= target;
    }
    if (condition.indexOf("==") != -1) {
        float target = condition.substring(condition.indexOf("==") + 2).toFloat();
        return value == target;
    }
    if (condition.indexOf(">") != -1) {
        float target = condition.substring(condition.indexOf(">") + 1).toFloat();
        return value > target;
    }
    if (condition.indexOf("<") != -1) {
        float target = condition.substring(condition.indexOf("<") + 1).toFloat();
        return value < target;
    }
    if (condition.indexOf("!=") != -1) {
        float target = condition.substring(condition.indexOf("!=") + 2).toFloat();
        return value < target;
    }

    return false;
}

void handleCommand(const String& command) {


    if (command == "reboot") {
        Serial.println("Received reboot command");
        ESP.restart();
    }
    else if (command == "rename") {
        displayText("rename successful"); 
        blinkLED(3); 
    }
    else if (command == "blink") {
        blinkLED(1); 
    }
    else if (command == "tripleBlink") {
        blinkLED(3); 
    }
    else if (command == "ledOn") {
        digitalWrite(2, HIGH);
    }
    else if (command == "ledOff") {
        digitalWrite(2, LOW);
    } else {
        Serial.print("Unknown command received: ");
        Serial.println(command);
    }
}


float readSensor(const String& sensorType, int pin) {
    if (sensorType == "dht11") {
        if (dhtSensors.find(pin) == dhtSensors.end()) {
            DHT* sensor = new DHT(pin, DHT11);
            sensor->begin();
            dhtSensors[pin] = sensor;
        }

        float temp = dhtSensors[pin]->readTemperature();
        if (isnan(temp)) {
            Serial.println("Failed to read DHT11 Temp");
            return -999;
        }
        return temp;
    }

    if (sensorType == "analog") {
        return analogRead(pin);
    }

    Serial.println("Unknown sensor.");
    return -999;
}



void mqttCallback(char* topic, byte* payload, unsigned int length) {
    String topicStr = String(topic);
    String message;

    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    message.trim();

    if (topicStr == "iot/device/command/" + deviceID) {
        handleCommand(message);
        return;
    }
    if (topicStr == "iot/device/control/" + deviceID) {
        handleCommand(message);
        return;
    }



    if (topicStr == configTopic) {
        rules.clear();
        readingRules.clear();

        DynamicJsonDocument doc(8192);
        DeserializationError error = deserializeJson(doc, message);

        if (error) {
            Serial.print("JSON parse failed: ");
            Serial.println(error.f_str());
            return;
        }

        JsonArray ruleArray = doc["rules"].as<JsonArray>();
        Serial.print("Number of rules received: ");
        Serial.println(ruleArray.size());
        for (JsonVariant r : ruleArray) {
            String type = r["type"] | "control";

                Serial.print("Parsing rule of type: ");
                Serial.println(type);

                serializeJsonPretty(r, Serial);

            if (type == "control") {
                ConditionalRule rule;
                rule.topic = r["topic"].as<String>();
                rule.condition = r["condition"].as<String>();
                rule.pin = r["pin"];
                rule.action = r["action"].as<String>();

                pinMode(rule.pin, OUTPUT);
                client.subscribe(rule.topic.c_str());
                rules.push_back(rule);

                Serial.print("Rule added - Topic: ");
                Serial.print(rule.topic);
                Serial.print(" | Condition: ");
                Serial.print(rule.condition);
                Serial.print(" | Pin: ");
                Serial.print(rule.pin);
                Serial.print(" | Action: ");
                Serial.println(rule.action);
            }

            else if (type == "reading") {
                ReadingRule rr;
                rr.topic = r["topic"].as<String>();
                rr.sensor = r.containsKey("sensor") ? r["sensor"].as<String>() : "generic";
                rr.pin = r["pin"];
                rr.interval = r["interval"].as<unsigned long>();
                rr.lastSent = millis();
                readingRules.push_back(rr);

                Serial.print("Reading rule added - Topic: ");
                Serial.print(rr.topic);
                Serial.print(", Sensor: ");
                Serial.print(rr.sensor);
                Serial.print(", Pin: ");
                Serial.print(rr.pin);
                Serial.print(", Interval: ");
                Serial.println(rr.interval);
            }
        }


        return;
    }

    StaticJsonDocument<256> dataDoc;
    DeserializationError dataError = deserializeJson(dataDoc, message);

    if (dataError) {
      Serial.println("Failed to parse incoming data JSON");
      return;
    }

    float value = dataDoc["value"];

    for (auto& rule : rules) {
        if (rule.topic == topicStr && evaluateCondition(rule.condition, value)) {
            if (rule.action == "on") {
                digitalWrite(rule.pin, HIGH);
                Serial.println("Action: ON");
            } else if (rule.action == "off") {
                digitalWrite(rule.pin, LOW);
                Serial.println("Action: OFF");
            } else if (rule.action == "pwm") {
                ledcWrite(0, value); 
                Serial.print("PWM set to: ");
                Serial.println(value);
            }
        }
    }
}


void publishStatus(const char* message) {
    StaticJsonDocument<256> doc;
    doc["id"] = deviceID;
    doc["status"] = message;

    char buffer[256];
    serializeJson(doc, buffer);

    String topic = "iot/device/status/" + deviceID;
    client.publish(topic.c_str(), buffer);

    Serial.print("Published status to: ");
    Serial.println(topic);
}



void processReadingRules() {
  unsigned long now = millis();

  for (auto& rr : readingRules) {
    if (now - rr.lastSent >= rr.interval) {
      float value = readSensor(rr.sensor, rr.pin);
      if (value != -999) {
        StaticJsonDocument<128> doc;
        doc["id"] = deviceID;
        doc["sensor"] = rr.sensor;
        doc["value"] = value;

        
        char buffer[128];
        serializeJson(doc, buffer);


        String fullTopic = "iot/device/data/" + deviceID + rr.topic;

        client.publish(fullTopic.c_str(), buffer);
        Serial.printf("Published JSON to %s: %s\n", fullTopic.c_str(), buffer);
      }
      rr.lastSent = now;
    }
  }
}


