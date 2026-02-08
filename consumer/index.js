const amqp = require('amqplib');

async function startConsumer() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue('order_queue', { durable: true });

  channel.consume('order_queue', async msg => {
    const request = JSON.parse(msg.content.toString());
    console.log('📦 Pedido recebido:', request);

    // processa a query (fake)
    const status = { orderId: request.orderId, status: 'shipped' };

    // envia a resposta para a fila indicada em replyTo
    channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(JSON.stringify(status)),
      { correlationId: msg.properties.correlationId }
    );

    channel.ack(msg);
  });
}

startConsumer();
