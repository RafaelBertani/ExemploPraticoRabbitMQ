const amqp = require('amqplib');

async function requestOrderStatus(orderId) {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  // cria uma fila exclusiva para resposta
  const { queue } = await channel.assertQueue('', { exclusive: true });

  const correlationId = generateUuid();

  // consome respostas desta fila
  channel.consume(queue, msg => {
    if (msg.properties.correlationId === correlationId) {
      console.log('📬 Resposta recebida:', msg.content.toString());
      connection.close();
    }
  }, { noAck: true });

  // envia a mensagem de request
  channel.sendToQueue(
    'order_queue',
    Buffer.from(JSON.stringify({ orderId })),
    { replyTo: queue, correlationId }
  );
}

function generateUuid() {
  return Math.random().toString() + Math.random().toString();
}

requestOrderStatus(123);
