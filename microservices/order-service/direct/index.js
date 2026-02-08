const amqp = require('amqplib');

async function createOrder() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const exchange = 'orders_direct';

  await channel.assertExchange(exchange, 'direct', { durable: true });

  const events = [
    { orderId: 1, userEmail: 'cliente1@email.com', type: 'new' },
    { orderId: 2, userEmail: 'cliente2@email.com', type: 'update' }
  ];

  events.forEach(event => {
    channel.publish(exchange, event.type, Buffer.from(JSON.stringify(event)));
    console.log(`📦 Pedido ${event.type} criado:`, event);
  });

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
}

createOrder();
