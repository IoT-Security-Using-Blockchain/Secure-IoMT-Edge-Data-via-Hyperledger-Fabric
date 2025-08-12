/*
   Copyright 2025 Amartya Roy, Hrishikesh Kumar Chaudhary, Madhu Singh, Anshika

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/*
   ESP32 SPO₂ Sensor Data Publisher
   - Reads SPO₂ sensor data
   - Encrypts using AES-128-CBC + PKCS7 padding (mbedTLS)
   - Base64 encodes before sending
   - Publishes via MQTT over TLS with username/password authentication
   - Uses Wi-Fi for connectivity
*/

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include "mbedtls/aes.h"
#include "mbedtls/base64.h"

// ======== USER CONFIGURATION ========

// Wi-Fi Credentials
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker Configuration
const char* mqtt_server   = "YOUR_MQTT_BROKER_IP_OR_HOST";
const int   mqtt_port     = 8883; // TLS port
const char* mqtt_user     = "YOUR_MQTT_USERNAME";
const char* mqtt_password = "YOUR_MQTT_PASSWORD";

// TLS Certificates (place .crt and .key in sketch data folder if needed)
const char* ca_cert = \
"-----BEGIN CERTIFICATE-----\n" \
"YOUR_CA_CERTIFICATE_CONTENT\n" \
"-----END CERTIFICATE-----\n";

const char* client_cert = \
"-----BEGIN CERTIFICATE-----\n" \
"YOUR_CLIENT_CERTIFICATE_CONTENT\n" \
"-----END CERTIFICATE-----\n";

const char* client_key = \
"-----BEGIN PRIVATE KEY-----\n" \
"YOUR_CLIENT_PRIVATE_KEY_CONTENT\n" \
"-----END PRIVATE KEY-----\n";

// AES Encryption Key (16 bytes for AES-128)
static const unsigned char aes_key[16] = {
    0x00, 0x01, 0x02, 0x03,
    0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0A, 0x0B,
    0x0C, 0x0D, 0x0E, 0x0F
};
static const unsigned char aes_iv[16] = { 0x00 };

// ======== OBJECTS ========
WiFiClientSecure espClient;
PubSubClient client(espClient);

// ======== AES ENCRYPTION FUNCTION ========
String encryptAES_mbedtls(const String &plainText) {
    mbedtls_aes_context aes;
    size_t plain_len = plainText.length();

    // PKCS7 padding
    size_t padded_len = ((plain_len / 16) + 1) * 16;
    unsigned char padded[128];
    memcpy(padded, plainText.c_str(), plain_len);
    uint8_t pad_val = padded_len - plain_len;
    memset(padded + plain_len, pad_val, pad_val);

    // Buffer for encrypted data
    unsigned char encrypted[128];
    unsigned char iv_copy[16];
    memcpy(iv_copy, aes_iv, 16);

    mbedtls_aes_init(&aes);
    mbedtls_aes_setkey_enc(&aes, aes_key, 128);
    mbedtls_aes_crypt_cbc(&aes, MBEDTLS_AES_ENCRYPT, padded_len, iv_copy, padded, encrypted);
    mbedtls_aes_free(&aes);

    // Base64 encode
    unsigned char base64_output[256];
    size_t base64_len = 0;
    mbedtls_base64_encode(base64_output, sizeof(base64_output), &base64_len,
                          encrypted, padded_len);

    return String((char*)base64_output);
}

// ======== MQTT CALLBACK ========
void callback(char* topic, byte* message, unsigned int length) {
  // Optional: handle incoming messages
}

// ======== WIFI CONNECT ========
void setup_wifi() {
  delay(10);
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

// ======== MQTT RECONNECT ========
void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32Client", mqtt_user, mqtt_password)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

// ======== SETUP ========
void setup() {
  Serial.begin(115200);
  setup_wifi();

  espClient.setCACert(ca_cert);
  espClient.setCertificate(client_cert);
  espClient.setPrivateKey(client_key);

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// ======== MAIN LOOP ========
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Simulated SPO₂ reading (replace with actual sensor code)
  int spo2_value = random(95, 100);
  String payload = String(spo2_value);

  // Encrypt data
  String encryptedPayload = encryptAES_mbedtls(payload);

  // Publish
  client.publish("spo2/data", encryptedPayload.c_str());

  Serial.print("Published encrypted SPO2: ");
  Serial.println(encryptedPayload);

  delay(2000);
}
