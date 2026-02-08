const amqp = require('amqplib');

async function createOrder() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const exchange = 'orders';
  const event = {
    orderId: Math.floor(Math.random() * 1000),
    userEmail: 'cliente@email.com',
    total: 99.90
  };

  await channel.assertExchange(exchange, 'fanout', { durable: true });

  channel.publish(
    exchange,
    '',
    Buffer.from(JSON.stringify(event))
  );

  console.log('📦 Pedido criado:', event);

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
}

createOrder();
