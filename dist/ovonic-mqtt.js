"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * OvonicPacket:
 * 主要处理 端到端响应，并监听响应结果信息
 */
const events_1 = require("events");
const mqtt_1 = __importDefault(require("mqtt"));
const MAX_TRY_RECONNECT_TIMES = 5;
class OvonicMQTT extends events_1.EventEmitter {
    constructor() {
        super();
        this._tryReconnectTimes = 0;
        this._isConnected = false;
    }
    connect(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this._tryReconnectTimes = 0;
            this._clientId = options.clientId || 'mqtt_unknow_client';
            if (this._isConnected)
                return;
            this._client = mqtt_1.default.connect(url, options);
            this._client.on('reconnect', () => {
                this.emit('reconnect', { tryTimes: this._tryReconnectTimes });
                if (this._tryReconnectTimes++ > MAX_TRY_RECONNECT_TIMES) {
                    // this._client.end()
                    // reject(new Error(`try connect ${url} with ${this._tryReconnectTimes} times error`))
                }
            });
            this._client.on('connect', () => {
                this.emit('connect');
                this._isConnected = true;
            });
            this._client.on('message', this.onReceiveMsg.bind(this));
            this._client.on('error', (error) => {
                this.emit('error', error);
            });
            this._client.subscribe(this._clientId);
            this._client.on('close', () => {
                this._isConnected = false;
                this.emit('close');
            });
            this._client.on('disconnect', () => {
                this._isConnected = false;
                this.emit('disconnect');
            });
            this._client.on('offline', () => {
                this._isConnected = false;
                this.emit('offline');
            });
        });
    }
    get client() {
        return this._client;
    }
    onReceiveMsg(topic, message) {
        // const data = JSON.parse(message.toString()) as OvonicPacket
        // if (data.msgId && this._clientId === data.responseClient) {
        //   this.emit(data.msgId, message.toString())
        // } else {
        //   this.emit(topic, message.toString())
        // }
        this.emit(topic, JSON.parse(message.toString()));
    }
    publish(topic, message, callback) {
        this._client.publish(topic, message, callback);
    }
    request(topic, message, timeout = 10000, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!message.msgId) {
                    this._client.publish(topic, JSON.stringify(message), callback);
                    message.message = JSON.stringify({ status: 0 });
                    resolve(message);
                }
                else {
                    // this._client.publish(topic, JSON.stringify(message), callback)
                    this._client.subscribe(message.msgId, { qos: 1 }, (error) => {
                        if (error) {
                            return reject(error);
                        }
                        this._client.publish(topic, JSON.stringify(message), callback);
                    });
                    this._getApiRecv(message.msgId, timeout).then((data) => {
                        // this.emit('MsgBack', data)
                        resolve(data);
                    });
                }
            });
        });
    }
    _getApiRecv(msgId, timeout = 10000) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const timeOutHandle = setTimeout(() => {
                    this._client.unsubscribe(msgId);
                    clearTimeout(timeOutHandle);
                    reject(new Error(`${msgId} 等待指令操作结果超时！当前超时时间为 ${timeout}`));
                }, timeout);
                this.once(msgId, (data) => {
                    this._client.unsubscribe(msgId);
                    this.removeAllListeners(msgId);
                    resolve(data);
                });
            });
        });
    }
}
exports.default = OvonicMQTT;
//# sourceMappingURL=ovonic-mqtt.js.map