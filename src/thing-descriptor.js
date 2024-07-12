import { config } from 'dotenv'
config({ path: process.cwd() + '/.env' })

const thingId = process.env.THING_ID_1;

export const td = {
  context: ['https://www.w3.org/2022/wot/td/v1.1', {
    'cred': 'https://www.w3.org/2018/credentials#',
    'sec': 'https://w3id.org/security#'
  }],
  id: 'urn:dev:wot:' + thingId,
  type: 'Device',
  title: 'Device-' + thingId,
  description: 'Thing Descriptor for a Revue Device',
  securityDefinitions: {
    extendedBearer: {
      scheme: 'bearer',
      format: 'jwt'
    }
  },
  security: 'extendedBearer',
  schemaDefinitions: {
    capabilities: {
      anyOf: [
        {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['sensor']
            },
            capturingInterval: {
              type: 'number'
            },
            measure: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['temperature', 'humidity', 'pressure']
                },
                unit: {
                  type: 'string',
                  enum: ['celsius', 'fahrenheit', 'percentage', 'pascal', 'bar']
                }
              }
            }
          }
        },
        {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['camera']
            },
            resolution: {
              type: 'string',
              enum: ['720p', '1080p', '4k']
            }
          }
        }
      ]
    }
  },
  properties: {
    status: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        location: {
          type: 'string'
        },
        capabilities: {
          type: 'array',
          items: {
            $ref: '#/schemaDefinitions/capabilities'
          }
        }
      },
      forms: [
        {
          href: 'http://localhost:8080/properties/status',
          contentType: 'application/json'
        }
      ]
    }
  },
  actions: {
    toggle: {
      output: {
        type: 'string'
      },
      forms: [
        {
          op: 'invokeaction',
          href: 'https://sensor.example.com/api/toggle',
          contentType: 'application/json'
        }
      ]
    },
    capabilities: {
      output: {
        type: 'array',
        items: {
          $ref: '#/schemaDefinitions/capabilities'
        }
      },
      forms: [
        {
          op: 'invokeaction',
          href: 'https://sensor.example.com/api/capabilities',
          contentType: 'application/json'
        }
      ]
    },
    updateLocation: {
      input: {
        type: 'object',
        properties: {
          location: {
            type: 'string'
          }
        },
        required: ['location']
      },
      output: {
        type: 'string'
      },
      forms: [
        {
          op: 'invokeaction',
          href: 'https://sensor.example.com/api/updateLocation',
          contentType: 'application/json'
        }
      ]
    }
  },
  events: {
    produce: {
      data: { type: 'object' },
      forms: [
        {
          href: 'kafka://broker.kafka.example.com:9092/sensor1234',
          subprotocol: 'kafka'
        }
      ]
    }
  }
};
