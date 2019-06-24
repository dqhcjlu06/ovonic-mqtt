import OvonicMQTT from '../src/ovonic-mqtt'

/**
 * emqx 支持链接登陆认证
 * emqx_auth_clientid: clinetId 认证
 * emqx_auth_username: 用户名、密码认证插件
 * emqx_auth_jwt: JWT 认证/访问控制 本示例为 jwt链接认证 私密: secret
 */

const options1 = {
  connectTimeout: 4000,
   // 认证信息
  username: 'secret',
  password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6ImJhciIsImlhdCI6MTU2MTM2ODcwOSwiZXhwIjoxNTYxNDU1MTA5fQ.wr9MdBHUj01eJKqB4MNNqQIL6cqC4CNoUrNWNJgL-OY',
  clientId: 'a_client_b',
  keepalive: 60,
  clean: true,
}

const options2 = {
  connectTimeout: 4000,
   // 认证信息
  username: 'secret',
  password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6ImJhciIsImlhdCI6MTU2MTM2ODcwOSwiZXhwIjoxNTYxNDU1MTA5fQ.wr9MdBHUj01eJKqB4MNNqQIL6cqC4CNoUrNWNJgL-OY',
  clientId: 'b_client_b',
  keepalive: 60,
  clean: true,
}

const MQTT_URL = process.env.MQTT_URL || 'mqtt://mqtt.ldmxxz.com:1883'

const test = async () => {
  const ovonic1 = new OvonicMQTT()
  const ovonic2 = new OvonicMQTT()
  await ovonic1.connect(MQTT_URL, options1)
  await ovonic2.connect(MQTT_URL, options2)
  try {
    // ovonic1.on('receiveMsg', async (message: Buffer) => {
    //   const data = message.toString()
    //   const packet = JSON.parse(data) as OvonicPacket
    //   // 处理后返回数据结果
    //   await new Promise( r => setTimeout(r, 1000))
    //   ovonic1.client.publish(packet.responseClient, JSON.stringify({
    //     msgId: packet.msgId,
    //     message: 'every this is ok',
    //   }))
    // })
    const result = await ovonic2.request('server_de796ff85ce9a8e412e49996edd56d4e', {
      userId: '1',
      // msgId: 'WXInitialize_Api12',
      message: JSON.stringify({ uuid: '2a2612f6-f64c-4848-bf1f-53c535b139a1e' }),
      apiName: 'WXInitialize',
      responseClient: 'b_client_b',
    })
    console.log('result: ', result)
  } catch (error) {
    console.log('test error', error)
  }
}

test()
