/**
 * OvonicPacket:
 * 主要处理 端到端响应，并监听响应结果信息
 */
import { EventEmitter } from 'events';
import mqtt, { IClientOptions, MqttClient, PacketCallback } from 'mqtt'

const MAX_TRY_RECONNECT_TIMES = 3

export type MqttClientEvent = 'reconnect' | 'connect' | 'close' |'error' | 'message'
  | 'offline' | 'disconnect' | 'end' | 'packetsend' | 'packetreceive'

export interface OvonicPacket {
  apiName: string,
  userId: string,
  message: string,
  msgId?: string,
  responseClient?: string
}

class OvonicMQTT extends EventEmitter {
  private _client: MqttClient
  private _tryReconnectTimes: number
  private _clientId: string
  private _isConnected: boolean
  constructor () {
    super()
    this._tryReconnectTimes = 0
    this._isConnected = false
  }

  public async connect (url: string, options: IClientOptions) {
    this._tryReconnectTimes = 0
    this._clientId = options.clientId || 'mqtt_unknow_client'
    return new Promise((resolve, reject) => {
      if (this._isConnected) resolve()
      this._client = mqtt.connect(url, options)
      this._client.on('reconnect', () => {
        if (this._tryReconnectTimes++ > MAX_TRY_RECONNECT_TIMES) {
          this._client.end()
          reject(new Error(`try connect ${url} with ${this._tryReconnectTimes} times error`))
        }
      })
      this._client.on('connect', () => {
        this.emit('connect')
        this._client.on('message', this.onReceiveMsg.bind(this))
        this._client.on('error', (error) => {
          this.emit('error', error)
        })
        this._client.subscribe(this._clientId)
        resolve()
      })
      this._client.on('close', () => {
        this._isConnected = false
        this.emit('close')
      })
      this._client.on('disconnect', () => {
        this._isConnected = false
        this.emit('disconnect')
      })
      this._client.on('offline', () => {
        this._isConnected = false
        this.emit('offline')
      })
    })
  }
  public get client (): MqttClient {
    return this._client
  }

  private onReceiveMsg (topic: string, message: string | Buffer) {
    // const data = JSON.parse(message.toString()) as OvonicPacket
    // if (data.msgId && this._clientId === data.responseClient) {
    //   this.emit(data.msgId, message.toString())
    // } else {
    //   this.emit(topic, message.toString())
    // }
    this.emit(topic, JSON.parse(message.toString()))
  }

  public publish (topic: string, message: string, callback?: PacketCallback) {
    this._client.publish(topic, message, callback)
  }

  public async request (topic: string, message: OvonicPacket, timeout= 10000, callback?: PacketCallback): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!message.msgId) {
        this._client.publish(topic, JSON.stringify(message), callback)
        resolve({ status: 0 })
      } else {
        // this._client.publish(topic, JSON.stringify(message), callback)
        this._client.subscribe(message.msgId, {qos: 1}, (error) => {
          if (error) {
            return reject(error)
          }
          this._client.publish(topic, JSON.stringify(message), callback)
        })
        this._getApiRecv(message.msgId, timeout).then((data) => {
          // this.emit('MsgBack', data)
          resolve(data)
        })
      }
    })
  }

  private async _getApiRecv (msgId: string, timeout = 10000): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeOutHandle = setTimeout(() => {
        this._client.unsubscribe(msgId)
        clearTimeout(timeOutHandle)
        reject(new Error(`${msgId} 等待指令操作结果超时！当前超时时间为 ${timeout}`))
      }, timeout)

      this.once(msgId, (data: string) => {
        this._client.unsubscribe(msgId)
        this.removeAllListeners(msgId)
        resolve(data)
      })
    })
  }
}

export default OvonicMQTT
