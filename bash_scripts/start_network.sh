#!/bin/bash
#
# Copyright 2025 Amartya Roy, Hrishikesh Kumar Chaudhary, Madhu Singh, Anshika
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

#######################################
# Environment Setup
#######################################
export PATH="${PWD}/../bin:$PATH"
export FABRIC_CFG_PATH="$PWD/../config/"
echo "FABRIC_CFG_PATH is set to: $FABRIC_CFG_PATH"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE="${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export CORE_PEER_MSPCONFIGPATH="${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_ADDRESS="localhost:7051"

CHAINCODE_NAME="health"
CHAINCODE_PATH="../asset-transfer-basic/chaincode-go"
CHAINCODE_LANG="go"
CHANNEL_NAME="spo2data"
SEQUENCE=2

#######################################
# Step 1: Start Network if Not Running
#######################################
if docker ps | grep -q "orderer.example.com"; then
    echo "✅ Hyperledger Fabric network is already running."
else
    echo "🔄 No running network found. Starting a fresh network..."
    ./network.sh down
    ./network.sh up createChannel -c "${CHANNEL_NAME}"
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to start the network or create the channel."
        exit 1
    fi
fi

#######################################
# Step 2: Deploy Chaincode if Needed
#######################################
if peer lifecycle chaincode querycommitted --channelID "${CHANNEL_NAME}" | grep -q "${CHAINCODE_NAME}"; then
    echo "✅ Chaincode '${CHAINCODE_NAME}' is already committed."
else
    echo "🚀 Deploying the chaincode..."
    ./network.sh deployCC -ccn "${CHAINCODE_NAME}" -ccp "${CHAINCODE_PATH}" -ccl "${CHAINCODE_LANG}" -c "${CHANNEL_NAME}"
    if [ $? -ne 0 ]; then
        echo "❌ Error: Chaincode deployment failed."
        exit 1
    fi
fi

#######################################
# Step 3: Subscribe to Sensor Data via MQTT (TLS)
#######################################
MQTT_HOST="192.168.0.108"
MQTT_PORT=8883
MQTT_TOPIC="spo2/health"
MQTT_USER="amartya"
MQTT_PASS="amartya12"
CA_FILE="/etc/mosquitto/certs/ca.crt"
CLIENT_CERT="/etc/mosquitto/certs/client3.crt"
CLIENT_KEY="/etc/mosquitto/certs/client3.key"

echo "📡 Listening for MQTT messages from $MQTT_HOST:$MQTT_PORT..."
mosquitto_sub -h "$MQTT_HOST" -p "$MQTT_PORT" \
    --cafile "$CA_FILE" \
    --cert "$CLIENT_CERT" \
    --key "$CLIENT_KEY" \
    -u "$MQTT_USER" -P "$MQTT_PASS" \
    -t "$MQTT_TOPIC" | while read -r line; do

    echo "📦 Received encrypted data: $line"

    # Decrypt message
    decrypted_data=$(echo "$line" | python3 decrypt_aes.py)
    if [ $? -ne 0 ] || [ -z "$decrypted_data" ]; then
        echo "❌ Decryption failed. Skipping..."
        continue
    fi

    echo "🔓 Decrypted data: $decrypted_data"

    # Extract JSON fields
    heart_rate=$(echo "$decrypted_data" | jq -r '.heart_rate')
    spo2=$(echo "$decrypted_data" | jq -r '.spo2')
    id=$(cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 8 | head -n 1)
    timestamp=$(echo "$decrypted_data" | jq -r '.timestamp')

    # Validate extracted values
    if [[ -z "$id" || -z "$heart_rate" || -z "$spo2" || -z "$timestamp" ]]; then
        echo "⚠️ Invalid or incomplete data. Skipping..."
        continue
    fi
    if ! [[ "$heart_rate" =~ ^[0-9]+(\.[0-9]+)?$ && "$spo2" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
        echo "⚠️ Invalid numeric values. Skipping..."
        continue
    fi

    echo "📝 Storing to blockchain: ID=$id | HR=$heart_rate | SpO2=$spo2 | Timestamp=$timestamp"

    # Invoke chaincode
    peer chaincode invoke \
        -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls \
        --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
        -C "${CHANNEL_NAME}" \
        -n "${CHAINCODE_NAME}" \
        --peerAddresses localhost:7051 \
        --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
        --peerAddresses localhost:9051 \
        --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
        -c '{"function":"CreateSensorData","Args":["'"$id"'", "'"$heart_rate"'", "'"$spo2"'", "'"$timestamp"'"]}'

    if [ $? -ne 0 ]; then
        echo "❌ Chaincode invoke failed!"
    else
        echo "✅ Data successfully committed to blockchain!"
    fi

done
