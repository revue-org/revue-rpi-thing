import KafkaProducer from '@/handler/events/KafkaProducer.js'
import { MEDIA_SERVER_HOST, MEDIA_SERVER_RTSP_PORT, THING_ID, thingService } from '@/index.js'
import { CapabilityType, MeasureType, SensoringCapability } from '@/core/domain/Capability.js'
import {
  humidityMeasurement,
  pressureMeasurement,
  temperatureMeasurement
} from '@/resources/sampleMeasurements.js'
import path from 'path'

import { spawn } from 'node:child_process'

import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

class Simulation {
  private ffmpegProcess: FfmpegCommand = ffmpeg()
  private intervals: any[] = []


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
            producer.produce(`measurements.${thingService.getId()}`, this.getMeasureByType(capability.measure.type))
          }, capability.capturingInterval)
        this.intervals.push(interval);
        console.log(`Event: ${capability.measure.type} measurements are being produced every ${capability.capturingInterval / 1000}s`)
      } else if (capability.type == CapabilityType.VIDEO) {
        this.produceVideo()
      }
    });
  }

  public stop = (): void => {
    this.intervals.forEach(interval => {
      clearInterval(interval)
    })
    this.ffmpegProcess.kill('SIGINT')
  }

  private produceVideo = async (): Promise<void> => {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path)
    const inputFilePath: string = 'video.mp4'
    const rtspStreamUrl: string = `rtsp://${MEDIA_SERVER_HOST}:${MEDIA_SERVER_RTSP_PORT}/${THING_ID}/stream`

    const video = spawn("rpicam-vid", ["-t", "0", "--flush", "1", "--bitrate", "2000000", "-g", "50", "--inline", "-o", "-"])
    if (video.stdout && video.stderr) {
      video.stderr.on("data", (chunck) => {
        // console.log(chunck)
      })
      this.ffmpegProcess = ffmpeg(video.stdout)
        .inputFormat('h264')
        .inputOptions(['-re'])
        .addOption("-c:v", "libx264")
        .addOption('-bf', '0')
        .addOption('-strict', 'experimental')
        .outputFormat('rtsp')
        .outputOptions(['-rtsp_transport tcp'])
        .output(rtspStreamUrl)
        .on('start', (commandLine) => {
          console.log(`Event: Video conversion and publishing started at RTSP Stream URL: ${rtspStreamUrl}`)
          console.log(`FFmpeg command: ${commandLine}`)
        })
        .on('end', () => {
          console.log('Video conversion and publishing ended')
        })
        .on('error', (err, stdout, stderr): void => {
          if (err) {
            console.log('stdout:\n' + stdout)
            console.log('stderr:\n' + stderr)
          }
        })
      this.ffmpegProcess.run()
    }
    //command line corresponding command:
    //ffmpeg -re -stream_loop -1 -i path-to-video.mp4 -c:v libx264 -bf 0 -f rtsp -rtsp_transport tcp rtsp://localhost:8554/${THING_ID}/stream
  }
}

export const simulation: Simulation = new Simulation()
