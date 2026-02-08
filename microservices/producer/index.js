const amqp = require('amqplib');

async function requestOrderStatus(orderId) {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  // cria uma exchange do tipo direct
  const exchange = 'orders_exchange';
  await channel.assertExchange(exchange, 'direct', { durable: true });

  // cria uma fila exclusiva para resposta
  const { queue: replyQueue } = await channel.assertQueue('', { exclusive: true });

  const correlationId = generateUuid();

  // consome respostas desta fila
  channel.consume(replyQueue, msg => {
    if (msg.properties.correlationId === correlationId) {
      console.log('📬 Resposta recebida:', msg.content.toString());
      connection.close();
    }
  }, { noAck: true });

  // envia a mensagem para a exchange, com routing key 'new_order'
  channel.publish(
    exchange,
    'new_order', // routing key
    Buffer.from(JSON.stringify({ orderId })),
    { replyTo: replyQueue, correlationId }
  );
}

function generateUuid() {
  return Math.random().toString() + Math.random().toString();
}

requestOrderStatus(123);
