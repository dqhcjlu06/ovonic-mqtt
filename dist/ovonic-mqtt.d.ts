/// <reference types="node" />
/**
 * OvonicPacket:
 * 主要处理 端到端响应，并监听响应结果信息
 */
import { EventEmitter } from 'events';
import { IClientOptions, MqttClient, PacketCallback } from 'mqtt';
export declare type MqttClientEvent = 'reconnect' | 'connect' | 'close' | 'error' | 'message' | 'offline' | 'disconnect' | 'end' | 'packetsend' | 'packetreceive';
export interface OvonicPacket {
    apiName: string;
    userId: string;
    message: string;
    msgId?: string;
}
declare class OvonicMQTT extends EventEmitter {
    private _client;
    private _tryReconnectTimes;
    private _clientId;
    private _isConnected;
    constructor();
    connect(url: string, options: IClientOptions): Promise<void>;
    readonly client: MqttClient;
    private onReceiveMsg;
    publish(topic: string, message: string, callback?: PacketCallback): void;
    request(topic: string, message: OvonicPacket, timeout?: number, callback?: PacketCallback): Promise<OvonicPacket>;
    private _getApiRecv;
}
export default OvonicMQTT;
