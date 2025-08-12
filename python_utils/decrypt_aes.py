#!/usr/bin/env python3
#
# Copyright 2025 Amartya Roy, Hrishikesh Kumar Chaudhary,
# Madhu Singh, Anshika
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
# either express or implied.  See the License for the specific
# language governing permissions and limitations under the License.
#

import base64
from Crypto.Cipher import AES

# Same AES key and IV as in ESP32 code
AES_KEY = bytes([
    0x00, 0x01, 0x02, 0x03,
    0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0A, 0x0B,
    0x0C, 0x0D, 0x0E, 0x0F
])
AES_IV = bytes([0x00] * 16)

def pkcs7_unpad(data):
    """Remove PKCS7 padding."""
    pad_len = data[-1]
    if pad_len < 1 or pad_len > 16:
        raise ValueError("Invalid padding length")
    return data[:-pad_len]

def decrypt_spo2(base64_ciphertext: str) -> str:
    """Decrypt Base64 AES CBC encrypted SPO₂ data from ESP32."""
    # Base64 decode
    encrypted_bytes = base64.b64decode(base64_ciphertext)

    # AES decrypt
    cipher = AES.new(AES_KEY, AES.MODE_CBC, AES_IV)
    decrypted_padded = cipher.decrypt(encrypted_bytes)

    # Remove PKCS7 padding
    decrypted = pkcs7_unpad(decrypted_padded)

    return decrypted.decode('utf-8')

# Example usage
if __name__ == "__main__":
    # Example encrypted string from ESP (replace with actual MQTT payload)
    encrypted_msg = "YOUR_BASE64_ENCRYPTED_STRING"

    try:
        decrypted_value = decrypt_spo2(encrypted_msg)
        print(f"Decrypted SPO₂ value: {decrypted_value}")
    except Exception as e:
        print(f"Error: {e}")