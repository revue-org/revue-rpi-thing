import KafkaProducer from '@/handler/events/KafkaProducer.js'
import { MEDIA_SERVER_HOST, MEDIA_SERVER_RTSP_PORT, THING_ID, thingService } from '@/index.js'
import { CapabilityType, MeasureType } from '@/core/domain/Capability.js'
import {
  humidityMeasurement,
  pressureMeasurement,
  temperatureMeasurement
} from '@/resources/sampleMeasurements.js'
import { VideoStream } from '@/utils/VideoStream.js'

class Simulation {
  private intervals: any[] = []
  private videoStream: VideoStream = {} as VideoStream


  private async getMeasureByType(type: MeasureType) {
    if (type == MeasureType.TEMPERATURE) {
      return await temperatureMeasurement()
    } else if (type == MeasureType.HUMIDITY) {
      return await humidityMeasurement()
    } else {
      return pressureMeasurement()
    }
  }

  public start = async (producer: KafkaProducer): Promise<void> => {
    console.log('Simulation started')
    thingService.getState().capabilities.forEach(capability => {
      if (capability.type == CapabilityType.SENSOR) {
        const interval = setInterval(
          async (): Promise<void> => {
            const measure = await this.getMeasureByType(capability.measure.type)
            producer.produce(`measurements.${thingService.getId()}`, measure)
          }, capability.capturingInterval)
        this.intervals.push(interval);
        console.debug(`Event: ${capability.measure.type} measurements are being produced every ${capability.capturingInterval / 1000}s`)
      } else if (capability.type == CapabilityType.VIDEO) {
        this.produceVideo()
      }
    });
  }

  public stop = (): void => {
    this.intervals.forEach(interval => {
      clearInterval(interval)
    })
    this.stop()
  }

  private produceVideo = async (): Promise<void> => {
    this.videoStream = new VideoStream(
      MEDIA_SERVER_HOST as string,
      MEDIA_SERVER_RTSP_PORT as string,
      THING_ID as string)
    this.videoStream.start()

  }
}

export const simulation: Simulation = new Simulation()
