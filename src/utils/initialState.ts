import { State } from '@/core/domain/State.js'
import { CapabilityType, MeasureType, MeasureUnit } from '@/core/domain/Capability.js'

export const initialState: State = {
  id: process.env.THING_ID_1!,
  location: process.env.THING_LOCATION_1!,
  enabled: true,
  capabilities: [{
    type: CapabilityType.SENSOR,
    capturingInterval: 2500,
    measure: {
      type: MeasureType.TEMPERATURE,
      unit: MeasureUnit.CELSIUS
    }
  }]
}