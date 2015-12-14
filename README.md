# Node Paxos

Node implementation of (Multi)Paxos

## Project status
[![Travis build status](http://img.shields.io/travis/longle255/node-paxos.svg?style=flat)](https://travis-ci.org/longle255/node-paxos)
[![Code Climate](https://codeclimate.com/github/longle255/node-paxos/badges/gpa.svg)](https://codeclimate.com/github/longle255/node-paxos)
[![Test Coverage](https://codeclimate.com/github/longle255/node-paxos/badges/coverage.svg)](https://codeclimate.com/github/longle255/node-paxos)

## Features

- Multi instance (multi-paxos)
- Leader Election
- Log Replication
- Learner Catchup
- Throughput/latency benchmark

## System Preparations

- NodeJS v4.0.0 or higher. Example installing NodeJS v5.x

  ```sh
  # Install nodejs. Run with root
  apt-get update
  apt-get install -y python-software-properties python g++ make build-essential
  wget -qO- https://deb.nodesource.com/setup_5.x | bash -
  apt-get update
  apt-get install -y nodejs
  ```

- Install dependency

  ```sh
  # Install project's dependencies
  cd ./NODE-PAXOS-ROOT
  npm install
  ```


## Configuration

### System configuration

`./config/system.yml`

Notable configuration:

**acceptorQuorum**: number of majority of acceptors for phase 1B, 2B

**proposerQuorum**: number of majority of proposers for leader election

proposers, acceptors, learners, clients: number of each each role in auto-start

### Log configuration

`./config/logger.yml`

Could be overridden with flag `-l <level>`

### Multicast

`./config/logger.yml`

Could be overridden with flag `-c <config file>`


## Usage

### Run proposer

Could be started in two ways:

+ Use bash command

```sh
# start proposer id 1 with provided multicast config file
./proposer.sh 1 <multicast config file>
```

+ Use NodeJS command

```sh
./index.js --role proposers --id 1 --mode test # start proposer 1 in testing mode
# or
./index.js --role proposers --id 1 --log debug # start proposer 1 with debug logging
```


### Run acceptor

Could be started in two ways:

+ Use bash command

```sh
# start acceptor id 1 with provided multicast config file
./acceptor.sh 1 <multicast config file>
```

+ Use NodeJS command

```sh
./index.js --role acceptors --id 1 --mode test # start acceptor 1 in testing mode
# or
./index.js --role acceptors --id 1 --log debug # start acceptor 1 with debug logging
```


### Run learner

Could be started in two ways:

+ Use bash command

```sh
# start learner id 1 with provided multicast config file
./learner.sh 1 <multicast config file>
```

+ Use NodeJS command

```sh
./index.js --role learners --id 1 --mode test # start learner 1 in testing mode
# or
./index.js --role learners --id 1 --log debug # start learner 1 with debug logging
```


### Run client

Could be started in two ways:

+ Use bash command

```sh
# start client id 1 with provided multicast config file
./client.sh 1 <multicast config file>
```

+ Use NodeJS command

```sh
./index.js --role clients --id 1 --mode test # start client 1 in testing mode
# or
./index.js --role clients --id 1 --log debug # start client 1 with debug logging
```

