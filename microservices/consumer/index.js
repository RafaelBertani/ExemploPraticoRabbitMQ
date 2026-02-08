const amqp = require('amqplib');

async function startConsumer() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const exchange = 'orders_exchange';
  const routingKey = 'new_order';

  // cria a exchange do mesmo tipo do producer
  await channel.assertExchange(exchange, 'direct', { durable: true });

  // cria uma fila e vincula à exchange com a routing key
  const { queue } = await channel.assertQueue('order_queue', { durable: true });
  await channel.bindQueue(queue, exchange, routingKey);

  // consome mensagens
  channel.consume(queue, async msg => {
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
