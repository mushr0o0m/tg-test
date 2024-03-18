const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
const express = require('express');
const app = express();
const generateTableHtml = require('./tableTemplate');


const pool = new Pool({
  user: 'postgres',
  password: 'admin',
  host: 'localhost',
  database: 'node_postgres',
  port: 5432,
});


async function createTable() {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        nickname VARCHAR(255),
        email VARCHAR(255),
        registered INTEGER,
        status VARCHAR(10)
      )
    `);
    client.release();
    console.log('Table created successfully');
  } catch (err) {
    console.error('Error creating table - ', err);
  }
}

async function importData() {
  try {
    const client = await pool.connect();

    fs.createReadStream('players.csv')
      .pipe(csv({
        separator: ';',
        mapHeaders: ({header}) => header.trim(),
        mapValues: ({ value }) => value.trim()
      }))
      .on('data', async (row) => {
        const [day, month, year, hours, minutes] = row['Зарегистрирован'].split(/[.: ]/);
        const date = new Date(year, month - 1, day, hours, minutes);
        const registered = date.getTime() / 1000;
        await client.query(`
          INSERT INTO players (nickname, email, registered, status)
          VALUES ($1, $2, $3, $4)
        `, [row['Ник'], row['Email'], registered, row['Статус']]);
      })
      .on('end', () => {
        console.log('Data imported successfully');
        client.release();
        displayPlayers();
      });
  } catch (error) {
    console.error('Error importing data - ', error);
  }
}

async function checkTable() {
  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT COUNT(*) FROM players`);
    client.release();
    return parseInt(result.rows[0].count) === 0;
  } catch (error) {
    console.error('Error checking table is empty:', error);
    throw error;
  }
}

async function displayPlayers() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT *, TO_CHAR(TO_TIMESTAMP(registered), 'DD.MM.YYYY HH24:MI') AS registered_date
      FROM players
      WHERE status = 'On'
      ORDER BY registered
    `);
    client.release();
    return result.rows;
  } catch (err) {
    console.error('Error displaying players - ', err);
  }
}

app.get('/', async (req, res) => {
  const isTableEmpty = await checkTable();
  if (isTableEmpty){
    await createTable();
    await importData();
  }
  const players = await displayPlayers();
  const html = generateTableHtml(players); 
  res.send(html);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

