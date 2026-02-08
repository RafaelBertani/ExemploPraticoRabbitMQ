const amqp = require('amqplib');

async function createOrder() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const exchange = 'orders_topic';

  await channel.assertExchange(exchange, 'topic', { durable: true });

  const events = [
    { orderId: 1, userEmail: 'cliente1@email.com', type: 'new.online' },
    { orderId: 2, userEmail: 'cliente2@email.com', type: 'update.store' },
    { orderId: 3, userEmail: 'cliente3@email.com', type: 'cancel.online' }
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
