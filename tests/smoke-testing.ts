import OvonicMQTT from '../src/ovonic-mqtt'
import { writeFileSync } from 'fs';

/**
 * emqx 支持链接登陆认证
 * emqx_auth_clientid: clinetId 认证
 * emqx_auth_username: 用户名、密码认证插件
 * emqx_auth_jwt: JWT 认证/访问控制 本示例为 jwt链接认证 私密: secret
 */
const clientId = 'a_client_b'
const options1 = {
  connectTimeout: 4000,
   // 认证信息
  username: 'secret',
  password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6ImJhciIsImlhdCI6MTU2MTQyODQ1NiwiZXhwIjoxNTYxNTE0ODU2fQ.3v8b_7tqEhFcTP3T9vN3wVYHeQ_RdmE86GGIutA6ZSg',
  clientId,
  keepalive: 60,
  clean: true,
}
const MQTT_URL = process.env.MQTT_URL || ''
const serverId = 'server_57290af3acbe1be60db61e20ef54f055'
const test = async () => {
  const ovonic1 = new OvonicMQTT()
  await ovonic1.connect(MQTT_URL, options1)
  ovonic1.on(clientId, async (message) => {
    console.log(message)
  })
  try {
    const result = await ovonic1.request(serverId, {
      userId: '1',
      msgId: 'WXInitialize_Api12',
      message: JSON.stringify({ uuid: '2a2612f6-f64c-4848-bf1f-53c535b139a11' }),
      apiName: 'WXInitialize',
      // responseClient: clientId,
    })
    console.log('result: ', result)
    const qrcode = await ovonic1.request(serverId, {
      userId: '1',
      msgId: 'WXGetQRCode_Api12',
      message: '',
      apiName: 'WXGetQRCode',
      // responseClient: clientId,
    })
    const qrData = JSON.parse(qrcode.message)
    writeFileSync('./qrcode.png', Buffer.from(qrData.qr_code || '', 'base64'))
    console.log('qrcode', JSON.parse(qrcode.message))
    const timeId = setInterval(async () => {
      const msgId = 'WXCheckQrCode_Api111' + Math.floor(Math.random() * 100)
      const checkQrcode = await ovonic1.request(serverId, {
        userId: '1',
        msgId,
        message: '',
        apiName: 'WXCheckQRCode',
      })
      const data = JSON.parse(checkQrcode.message)
      switch (data.status) {
        case 0: // 等待扫码
          break;
        case 1: // 已扫码
          break;
        case 2: // 已授权
          clearInterval(timeId)
          const res = await ovonic1.request(serverId, {
            userId: '1',
            msgId: 'WXQRCodeLogin_APi112',
            message: JSON.stringify({
              user_name: data.user_name,
              password: data.password,
            }),
            apiName: 'WXQRCodeLogin',
          })
          console.log(res)
          break;
        case -106:
        case -2007:
        case 3: // 已过期
        case 4: // 取消登陆
          clearInterval(timeId)
          break;
      }
    }, 1000)
  } catch (error) {
    console.log('test error', error)
  }
}

test()
