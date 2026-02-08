const amqp = require('amqplib');

async function listenOrders() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const exchange = 'orders';

  await channel.assertExchange(exchange, 'fanout', { durable: true });

  const q = await channel.assertQueue('', { exclusive: true });

  await channel.bindQueue(q.queue, exchange, '');

  console.log('📧 Aguardando pedidos...');

  channel.consume(q.queue, msg => {
    const order = JSON.parse(msg.content.toString());

    console.log(
      `📨 Email enviado para ${order.userEmail} (pedido ${order.orderId})`
    );

    channel.ack(msg);
  });
}

listenOrders();
