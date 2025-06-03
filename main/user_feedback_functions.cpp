#include "esp32-hal.h"



void blinkLED(int repetitions) {
  for (int i = 0; i < repetitions; i++) {
    digitalWrite(2, LOW);
    delay(200);
    digitalWrite(2, HIGH);
    delay(200);
    digitalWrite(2, LOW);
    delay(200);
  }
}
