import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mercadopago from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

app.post('/create_preference', async (req, res) => {
  try {
    const { amount, description } = req.body;
    const preference = {
      items: [
        {
          title: description,
          quantity: 1,
          unit_price: amount,
          currency_id: 'ARS',
        },
      ],
    };
    const result = await mercadopago.preferences.create(preference);
    res.json({ preferenceId: result.body.id });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
