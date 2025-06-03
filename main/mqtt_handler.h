#ifndef MQTT_HANDLER_H
#define MQTT_HANDLER_H

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include "secrets.h"  

extern WiFiClientSecure espClient;
extern PubSubClient client;
extern String deviceID;

void connectToWiFi();
void setupMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void publishStatus(const char* message);
void processReadingRules();

#endif 
