#include <Wire.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

// WiFi credentials
const char* ssid = "Galaxy M35";
const char* password = "12346789";

String latestName = "";
String latestSlot = "";
bool entryMode = false;
bool exitMode = false;

// RFID Pins
#define SS_PIN    5
#define RST_PIN   22
#define SCK_PIN   18
#define MOSI_PIN  19
#define MISO_PIN  21

// OLED I2C Pins
#define OLED_SDA 13
#define OLED_SCL 23
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

// Servo motor pin
#define SERVO_PIN 33
Servo gateServo;

// Ultrasonic sensor pins
#define TRIG1 14
#define ECHO1 12
#define TRIG2 27
#define ECHO2 26

// RFID and OLED
MFRC522 rfid(SS_PIN, RST_PIN);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

bool showWelcome = true;
unsigned long lastActionTime = 0;

void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.println("Connecting WiFi...");
  display.display();

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    display.clearDisplay();
    display.setCursor(0, 0);
    display.setTextSize(1);
    display.println("WiFi Connected");
    display.display();
    delay(2000);
  } else {
    Serial.println("\nWiFi Failed.");
    display.clearDisplay();
    display.setCursor(0, 0);
    display.setTextSize(1);
    display.println("WiFi Failed!");
    display.display();
    delay(2000);
  }
}

void showWelcomeMessage() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 10);
  display.println("Smart Parking System");

  if (latestSlot != "") {
    display.println("");
    display.print("Proceed to Slot ");
    display.println(latestSlot);
  }

  display.display();
  showWelcome = true;
}

void openGate() {
  gateServo.write(90);
}

void closeGate() {
  gateServo.write(0);
}

long measureDistanceCM(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, 30000);
  long distance = duration * 0.034 / 2;
  return distance;
}

void setup() {
  Serial.begin(115200);

  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    while (true);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Booting System...");
  display.display();

  connectToWiFi();

  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);
  rfid.PCD_Init();
  Serial.println("RFID Ready.");

  gateServo.attach(SERVO_PIN);
  gateServo.write(0);  // Initial position

  pinMode(TRIG1, OUTPUT);
  pinMode(ECHO1, INPUT);
  pinMode(TRIG2, OUTPUT);
  pinMode(ECHO2, INPUT);

  showWelcomeMessage();
}

void loop() {
  long dist1 = measureDistanceCM(TRIG1, ECHO1);
  long dist2 = measureDistanceCM(TRIG2, ECHO2);

  // Detect car at entry gate
  if (dist1 < 15 && !entryMode) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 20);
    display.println("Scan RFID Entry");
    display.display();
    entryMode = true;
    exitMode = false;
  }

  // Detect car at exit gate
  if (dist2 < 5 && !exitMode && !entryMode) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 20);
    display.println("Scan RFID Exit");
    display.display();
    exitMode = true;
    entryMode = false;
  }

  // Wait for RFID if needed
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }

  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  Serial.println("UID: " + uid);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected!");
    return;
  }

  HTTPClient http;
  String apiURL = "https://okarusuvo.com/parking/bookings/scan-rfid/" + uid;
  http.begin(apiURL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);

  int httpCode = http.sendRequest("PATCH");
  Serial.println(httpCode);
  Serial.println(apiURL);

  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("Raw API response:");
    Serial.println(payload); // Debug raw response

    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, payload);

    // Add JSON parsing check
    if (error) {
        Serial.print("JSON parsing failed: ");
        Serial.println(error.c_str());
        return;
    }

    String action = doc["action"].as<String>(); // Explicit conversion
    String name = doc["message"].as<String>();
    latestSlot = doc["slotNumber"].as<String>();

    // Debug print parsed values
    Serial.println("Parsed action: " + action);
    Serial.println("Parsed name: " + name);
    Serial.println("Parsed slot: " + latestSlot);

    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);

    if (action == "Entry") {
        Serial.println("Processing Entry"); // Debug
        openGate();
        delay(500); // Add servo movement buffer
        // ... rest of entry code ...
    }
    else if (action == "Exit") {
        Serial.println("Processing Exit"); // Debug
        openGate();
        delay(500); // Add servo movement buffer
        // ... rest of exit code ...
    }
    else {
        Serial.println("Unknown action received: " + action);
    }
}
else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 20);
    display.println("No Reservation");
    display.println("Found!");
    display.display();
    delay(3000);
    showWelcomeMessage();
  }

  http.end();
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  // Reset mode flags
  entryMode = false;
  exitMode = false;
}