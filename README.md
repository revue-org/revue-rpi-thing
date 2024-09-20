# Raspberry PI Revue Thing

## Prerequisites

### Software

- [Docker](https://docker.com)

### Hardware

- [DHT11 sensor]() if you want to enable temperature and/or humidity measurements
- [RPi camera]() if you want to enable video streaming capability

## Getting Started

### Configure the thing capability file

```json
{
  "DHT_PIN": 23,
  "capabilities": {
    "temperature": true,
    "humidity": true,
    "video": false,
    "pressure": false
  }
}
```

To set up a new thing in Revue, you can just run the following command

```bash
docker run -d \
  --name revue-thing \
  --restart on-failure \
  --network revue-network \
  --env THING_ID=<THING_ID> \
  --env THING_PORT=<THING_PORT> \
  --env THING_LOCATION=<THING_LOCATION> \
  --env KAFKA_HOST_1=localhost \
  --env KAFKA_PORT_1=9094 \
  --env KAFKA_HOST_2=localhost \
  --env KAFKA_PORT_2=9095 \
  -p <THING_PORT>:<THING_PORT> \
  letsdothisshared/revue-thing
```

where `<THING_ID>` is the ID of the thing, `<THING_PORT>` is the port on which the thing will be listening,
and `<THING_LOCATION>` is the location of the thing.

It will pull the image from the Docker Hub and run the container with the specified configuration.

You can create many things by running the command multiple times with different configurations.

To use the thing within Revue, refer to the [Revue README](https://github.com/revue-org/revue).
