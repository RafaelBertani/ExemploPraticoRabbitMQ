const amqp = require('amqplib');

async function createOrder() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const exchange = 'orders_fanout';
  const event = {
    orderId: Math.floor(Math.random() * 1000),
    userEmail: 'cliente@email.com',
    total: 99.90
  };

  // Exchange do tipo fanout
  await channel.assertExchange(exchange, 'fanout', { durable: true });

  // Publica mensagem para todas as filas ligadas à exchange
  channel.publish(exchange, '', Buffer.from(JSON.stringify(event)));

  console.log('📦 Pedido criado (fanout):', event);

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
}

createOrder();
