const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

/*
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',     
  database: 'ad_monitoring',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
*/

const pool = mysql.createPool({
  host: 'bsajaicbtmtpdh9xsvz2-mysql.services.clever-cloud.com',
  user: 'udknrx8lbhmu7w1b',
  password: 'DdNNDT36dydnXCT9a2OG',
  database: 'bsajaicbtmtpdh9xsvz2',
  port: 3306
});

app.post('/api/track-slot', async (req, res) => {
  const { path, slot_id, ad_unit, delivered_size, unit_sizes, prebid_won } = req.body;

  console.log('REQ BODY:', req.body);

  try {
    const conn = await pool.getConnection();

    await conn.execute(
      `INSERT INTO ad_slot_views (path, slot_id, ad_unit, delivered_size, unit_sizes, prebid_won)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [path, slot_id, ad_unit, delivered_size, JSON.stringify(unit_sizes), prebid_won ? 1 : 0]
    );

    await conn.execute(
      `INSERT INTO ad_unit_views (ad_unit, count)
       VALUES (?, 1)
       ON DUPLICATE KEY UPDATE count = count + 1`,
      [ad_unit]
    );

    conn.release();

    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao inserir no banco:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/script-monitoramento.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'script-monitoramento.js'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
