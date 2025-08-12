# 📦 Prerequisites

Before starting the setup, install the following tools/packages:

## 🖥️ System Requirements
- Recommended OS: **Linux (Ubuntu/Debian preferred)**  
  *(Windows users can use WSL2 for Linux support)*

## 📌 Required Packages
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install MQTT Broker
sudo apt install mosquitto mosquitto-clients -y

# Install JQ for JSON parsing
sudo apt install jq -y

# Install Node.js & npm
sudo apt install nodejs npm -y

# Install Python & pip
sudo apt install python3 python3-pip -y

# Install Python cryptodome library
pip3 install pycryptodome

# Install Docker & Docker Compose
sudo apt install docker.io docker-compose -y

# Install Git
sudo apt install git -y
