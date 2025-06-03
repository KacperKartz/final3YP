#ifndef DISPLAY_H
#define DISPLAY_H

void setupDisplay();
void displayText(String text);
void updateStatusDisplay(bool wifiConnected, const String ipAddress, bool mqttConnected);
void updateDisplayIfNeeded();


#endif

