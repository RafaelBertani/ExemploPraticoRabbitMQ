const amqp = require('amqplib');

async function listenOnlineOrders() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const exchange = 'orders_topic';

  await channel.assertExchange(exchange, 'topic', { durable: true });

  const q = await channel.assertQueue('online_orders', { durable: true });

  // Liga fila a todas mensagens com routing key terminando em '.online'
  await channel.bindQueue(q.queue, exchange, '*.online');

  console.log('📧 Aguardando pedidos online (topic)...');

  channel.consume(q.queue, msg => {
    const order = JSON.parse(msg.content.toString());
    console.log(`📨 Email enviado para ${order.userEmail} (pedido ${order.orderId})`);
    channel.ack(msg);
  });
}

listenOnlineOrders();
