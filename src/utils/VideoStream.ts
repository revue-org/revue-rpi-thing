import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

export class VideoStream {
    private ffmpegProcess: FfmpegCommand = ffmpeg()
    private rtspStreamUrl: string
    private videoProcess: ChildProcessWithoutNullStreams = {} as ChildProcessWithoutNullStreams

    constructor(mediaServerHost: string, mediaServerRtspPort: string, thingID: string) {
        ffmpeg.setFfmpegPath(ffmpegInstaller.path)
        this.rtspStreamUrl = `rtsp://${mediaServerHost}:${mediaServerRtspPort}/${thingID}/stream`
    }

    public start() {
        this.ffmpegProcess = this.getFfmpegCommand()
        this.ffmpegProcess.run()
    }

    public stop() {
        this.ffmpegProcess.kill('SIGTERM')
        this.videoProcess.kill()
    }

    private getFfmpegCommand(): FfmpegCommand {
        //ffmpeg -re -stream_loop -1 -i path-to-video.mp4 -c:v libx264 -bf 0 -f rtsp -rtsp_transport tcp rtsp://url
        return this.ffmpegProcess = ffmpeg(this.newVideoProcess().stdout)
            .inputFormat('h264')
            .inputOptions(['-re'])
            .addOption("-c:v", "libx264")
            .addOption('-bf', '0')
            .addOption('-strict', 'experimental')
            .outputFormat('rtsp')
            .outputOptions(['-rtsp_transport tcp'])
            .output(this.rtspStreamUrl)
            .on('start', (commandLine) => {
                console.info(`Event: Video is being published to ${this.rtspStreamUrl}`)
                console.debug(`ffmpeg command: ${commandLine}`)
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
    }
    private newVideoProcess(): ChildProcessWithoutNullStreams {
        return spawn("rpicam-vid", ["-t", "0", "--flush", "1", "--bitrate", "2000000", "-g", "50", "--inline", "-o", "-"])
    }
}
