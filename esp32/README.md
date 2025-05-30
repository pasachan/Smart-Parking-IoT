# Smart Parking IoT System

A smart parking system using ESP32 with RFID authentication, ultrasonic sensors for vehicle detection, servo motor for gate control, and OLED display for user interface.

## Hardware Components

- ESP32 Development Board
- MFRC522 RFID Reader Module
- SSD1306 OLED Display (128x64, I2C)
- SG90 Servo Motor
- 2x HC-SR04 Ultrasonic Sensors
- Jumper wires and breadboard

## Pin Connections

### RFID Module (MFRC522)
```
MFRC522 Pin  →  ESP32 Pin
VCC          →  3.3V
GND          →  GND
RST          →  GPIO 22
IRQ          →  Not connected
MISO         →  GPIO 21
MOSI         →  GPIO 19
SCK          →  GPIO 18
SDA/SS       →  GPIO 5
```

### OLED Display (SSD1306 I2C)
```
OLED Pin     →  ESP32 Pin
VCC          →  3.3V
GND          →  GND
SDA          →  GPIO 13
SCL          →  GPIO 23
```

### Servo Motor (SG90)
```
Servo Pin    →  ESP32 Pin
VCC (Red)    →  5V
GND (Brown)  →  GND
Signal (Orange) → GPIO 33
```

### Ultrasonic Sensors (HC-SR04)

#### Sensor 1 (Entry Gate)
```
HC-SR04 Pin  →  ESP32 Pin
VCC          →  5V
GND          →  GND
TRIG         →  GPIO 14
ECHO         →  GPIO 12
```

#### Sensor 2 (Exit Gate)
```
HC-SR04 Pin  →  ESP32 Pin
VCC          →  5V
GND          →  GND
TRIG         →  GPIO 27
ECHO         →  GPIO 26
```

## Wiring Diagram (Text Format)

```
ESP32 Development Board
┌─────────────────────────────┐
│                             │
│  3.3V ──┬── RFID VCC       │
│         └── OLED VCC       │
│                             │
│  5V ────┬── Servo VCC      │
│         ├── US1 VCC        │
│         └── US2 VCC        │
│                             │
│  GND ───┬── RFID GND       │
│         ├── OLED GND       │
│         ├── Servo GND      │
│         ├── US1 GND        │
│         └── US2 GND        │
│                             │
│  GPIO 5  ── RFID SS        │
│  GPIO 18 ── RFID SCK       │
│  GPIO 19 ── RFID MOSI      │
│  GPIO 21 ── RFID MISO      │
│  GPIO 22 ── RFID RST       │
│                             │
│  GPIO 13 ── OLED SDA       │
│  GPIO 23 ── OLED SCL       │
│                             │
│  GPIO 33 ── Servo Signal   │
│                             │
│  GPIO 14 ── US1 TRIG       │
│  GPIO 12 ── US1 ECHO       │
│  GPIO 27 ── US2 TRIG       │
│  GPIO 26 ── US2 ECHO       │
│                             │
└─────────────────────────────┘
```

## Software Requirements

### Arduino IDE Libraries
Install the following libraries through Library Manager:

1. **MFRC522** by GithubCommunity
2. **Adafruit GFX Library** by Adafruit
3. **Adafruit SSD1306** by Adafruit
4. **ArduinoJson** by Benoit Blanchon
5. **ESP32Servo** by Kevin Harrington

### WiFi Configuration
Update the following variables in the code:
```cpp
const char* ssid = "Your_WiFi_SSID";
const char* password = "Your_WiFi_Password";
```

## Setup Instructions

1. **Hardware Assembly:**
   - Connect all components according to the pin diagram above
   - Ensure proper power supply (5V for sensors and servo, 3.3V for RFID and OLED)
   - Double-check all connections before powering on

2. **Software Setup:**
   - Install Arduino IDE
   - Install ESP32 board package
   - Install required libraries
   - Upload the code to ESP32

3. **API Configuration:**
   - The system connects to: `https://localhost:3433/parking/bookings/scan-rfid/` (the nest.js server you need to deploy it somewhere for the esp to use this endpoint, or you can use the PC's ip if both esp and the pc are connected to the same wi-fi)

## System Operation

### Entry Process:
1. Vehicle approaches entry gate (Ultrasonic Sensor 1 detects distance < 15cm)
2. OLED displays "Scan RFID Entry"
3. User scans RFID card
4. System sends PATCH request to API with UID
5. If valid reservation found, gate opens and displays slot number
6. Vehicle passes through and gate closes

### Exit Process:
1. Vehicle approaches exit gate (Ultrasonic Sensor 2 detects distance < 5cm)
2. OLED displays "Scan RFID Exit"
3. User scans RFID card
4. System processes exit request
5. Gate opens for vehicle to exit

## Troubleshooting

### Common Issues:

**RFID Not Reading:**
- Check SPI connections (pins 5, 18, 19, 21, 22)
- Ensure RFID module is powered with 3.3V
- Verify RFID card compatibility

**OLED Not Displaying:**
- Check I2C connections (pins 13, 23)
- Verify OLED address (0x3C)
- Ensure proper power supply

**Servo Not Moving:**
- Check signal connection to GPIO 33
- Ensure 5V power supply for servo
- Verify servo is not mechanically stuck

**WiFi Connection Issues:**
- Check SSID and password
- Ensure WiFi network is accessible
- Monitor serial output for connection status

**Ultrasonic Sensors Not Working:**
- Verify trigger and echo pin connections
- Check 5V power supply
- Ensure sensors are not obstructed

### Serial Monitor Output
Enable Serial Monitor at 115200 baud rate to view:
- WiFi connection status
- RFID card UIDs
- API response codes
- System status messages

## Physical Installation

1. Mount ultrasonic sensors at appropriate heights for vehicle detection
2. Position RFID reader within easy reach of drivers
3. Install servo motor to control physical gate mechanism
4. Place OLED display for clear visibility
5. Ensure ESP32 is protected from weather if used outdoors

## Power Considerations

- Total current consumption: ~500mA (including all peripherals)
- Use adequate power supply (5V, 1A minimum recommended)
- Consider backup power for continuous operation
