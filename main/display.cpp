#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include "mqtt_handler.h"

#define SCREEN_WIDTH 128 
#define SCREEN_HEIGHT 64 
#define OLED_RESET     -1 
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);


void setupDisplay() {
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); 
  }
    display.clearDisplay();
    display.display();
}

void displayText(String text) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0,0);
    display.println(text);
    display.display();
}


void updateStatusDisplay(bool wifiConnected, const String ipAddress, bool mqttConnected){

    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0, 0);

    if (wifiConnected) {
    display.println("WiFi: Connected");
    display.println("IP: " + ipAddress);
    } else {
        display.println("WiFi: Disconnected");
    }

    if (mqttConnected) {
        display.println("MQTT: Connected");
    } else {
        display.println("MQTT: Disconnected");
    }

  display.display();
}

void updateDisplayIfNeeded() {
    static unsigned long lastUpdate = 0;
    unsigned long now = millis();
    if (now - lastUpdate > 2000) {
        bool wifiConnected = (WiFi.status() == WL_CONNECTED);
        String ip = wifiConnected ? WiFi.localIP().toString() : "";
        bool mqttConnected = client.connected();

        updateStatusDisplay(wifiConnected, ip, mqttConnected);

        lastUpdate = now;
    }
}

