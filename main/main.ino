#include "mqtt_handler.h"
#include <WiFi.h>
#include "display.h"


unsigned long lastStatusUpdate = 0;

void setup() {

    Serial.begin(9600);
    setupDisplay();
    pinMode(2, OUTPUT); // ON BOARD LED
    connectToWiFi();   // Connect to WiFi
    updateDisplayIfNeeded();
    setupMQTT();       // Connect to MQTT Broker
    delay(2000);


}

void loop() {

    updateDisplayIfNeeded();

    if (!client.connected()) {
        setupMQTT(); 
    }
    client.loop();
    processReadingRules();

}
