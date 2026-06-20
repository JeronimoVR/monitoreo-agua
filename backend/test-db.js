const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'admin_agua',
  password: 'InfernapeSinnoh',
  database: 'calidad_agua',
});

client.connect()
  .then(() => {
    console.log('✅ Conexión exitosa a PostgreSQL');
    return client.query('SELECT NOW() as time');
  })
  .then(res => {
    console.log('📅 Hora del servidor:', res.rows[0].time);
    client.end();
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
    client.end();
  });