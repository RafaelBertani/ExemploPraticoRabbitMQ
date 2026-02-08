const amqp = require('amqplib');

async function listenNewOrders() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const exchange = 'orders_direct';

  await channel.assertExchange(exchange, 'direct', { durable: true });
  await channel.assertQueue('new_orders', { durable: true });

  // Liga fila à exchange apenas para tipo 'new'
  await channel.bindQueue('new_orders', exchange, 'new');

  console.log('📧 Aguardando pedidos novos (direct)...');

  channel.consume('new_orders', msg => {
    const order = JSON.parse(msg.content.toString());
    console.log(`📨 Email enviado para ${order.userEmail} (pedido ${order.orderId})`);
    channel.ack(msg);
  });
}

listenNewOrders();
