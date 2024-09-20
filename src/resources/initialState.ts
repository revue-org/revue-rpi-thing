import { State } from '@/core/domain/State.js'
import { Capability, CapabilityType, MeasureType, MeasureUnit } from '@/core/domain/Capability.js'
import thingConfig from '@/capabilities.json' with { type: "json" }


const temperature: Capability = {
  type: CapabilityType.SENSOR,
  capturingInterval: 2500,
  measure: {
    type: MeasureType.TEMPERATURE,
    unit: MeasureUnit.CELSIUS
  }
}

const humidity: Capability = {
  type: CapabilityType.SENSOR,
  capturingInterval: 2500,
  measure: {
    type: MeasureType.HUMIDITY,
    unit: MeasureUnit.PERCENTAGE
  }
}

const pressure: Capability = {
  type: CapabilityType.SENSOR,
  capturingInterval: 2500,
  measure: {
    type: MeasureType.PRESSURE,
    unit: MeasureUnit.BAR
  }
}

const video: Capability = {
  type: CapabilityType.VIDEO,
  resolution: '576p'
}

const activeCapabilities: Capability[] = []

if (thingConfig.capabilities.temperature.enabled) {
  temperature.capturingInterval = thingConfig.capabilities.temperature.interval
  activeCapabilities.push(temperature)
}
if (thingConfig.capabilities.humidity.enabled) {
  humidity.capturingInterval = thingConfig.capabilities.humidity.interval
  activeCapabilities.push(humidity)
}
if (thingConfig.capabilities.pressure.enabled) {
  pressure.capturingInterval = thingConfig.capabilities.pressure.interval
  activeCapabilities.push(pressure)
}
if (thingConfig.capabilities.video) {
  activeCapabilities.push(video)
}

export const initialState: State = {
  id: process.env.THING_ID!,
  location: process.env.THING_LOCATION!,
  enabled: true,
  capabilities: activeCapabilities
}
