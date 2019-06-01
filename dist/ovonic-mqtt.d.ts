/// <reference types="node" />
import { EventEmitter } from 'events';
import { IClientOptions, MqttClient, PacketCallback } from 'mqtt';
export declare type MqttClientEvent = 'reconnect' | 'connect' | 'close' | 'error' | 'message' | 'offline' | 'disconnect' | 'end' | 'packetsend' | 'packetreceive';
export interface OvonicPacket {
    apiName: string;
    userId: string;
    msgId: string;
    responseClient: string;
    message: string;
}
declare class OvonicMQTT extends EventEmitter {
    private _client;
    private _tryReconnectTimes;
    private _clientId;
    private _isConnected;
    constructor();
    connect(url: string, options: IClientOptions): Promise<unknown>;
    readonly client: MqttClient;
    private onReceiveMsg;
    request(topic: string, message: OvonicPacket, callback?: PacketCallback): Promise<any>;
    private _getApiRecv;
}
export default OvonicMQTT;
