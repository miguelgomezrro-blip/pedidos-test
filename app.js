const express = require('express');
const app = express();
app.use(express.json());

const productos = [
  { id: 1, nombre: 'Hamburguesa', precio: 18000 },
  { id: 2, nombre: 'Papas', precio: 6000 },
  { id: 3, nombre: 'Gaseosa', precio: 4000 },
];
let pedidos = [];
let siguienteId = 1;
const ESTADOS = ['recibido', 'en_preparacion', 'entregado'];

app.get('/productos', (req, res) => res.json(productos));

app.post('/pedidos', (req, res) => {
  const { cliente, items } = req.body;
  if (!cliente || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Datos de pedido inválidos' });
  }
  let total = 0;
  for (const item of items) {
    const p = productos.find(x => x.id === item.productoId);
    if (!p) return res.status(404).json({ error: 'Producto no existe' });
    total += p.precio * item.cantidad;
  }
  const pedido = { id: siguienteId++, cliente, items, total, estado: 'recibido' };
  pedidos.push(pedido);
  res.status(201).json(pedido);
});

app.get('/pedidos', (req, res) => res.json(pedidos));

app.get('/pedidos/:id', (req, res) => {
  const pedido = pedidos.find(p => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ error: 'No encontrado' });
  res.json(pedido);
});

app.patch('/pedidos/:id/estado', (req, res) => {
  const pedido = pedidos.find(p => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ error: 'No encontrado' });
  if (!ESTADOS.includes(req.body.estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  pedido.estado = req.body.estado;
  res.json(pedido);
});

module.exports = app;
if (require.main === module) app.listen(3000, () => console.log('http://localhost:3000'));