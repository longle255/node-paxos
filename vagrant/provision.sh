#!/bin/bash

# Install nodejs
apt-get update
apt-get install -y python-software-properties python g++ make build-essential curl
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
apt-get update
sudo apt-get install -y nodejs
