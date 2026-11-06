const request = require('supertest');
const app = require('../app');

describe('Pruebas funcionales', () => {
  test('CP-01 crear pedido válido calcula el total', async () => {
    const res = await request(app).post('/pedidos').send({
      cliente: 'Ana',
      items: [{ productoId: 1, cantidad: 2 }, { productoId: 3, cantidad: 1 }],
    });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(40000);
    expect(res.body.estado).toBe('recibido');
  });

  test('CP-02 rechaza pedido sin items', async () => {
    const res = await request(app).post('/pedidos').send({ cliente: 'Ana', items: [] });
    expect(res.status).toBe(400);
  });

  test('CP-03 cambia el estado de un pedido', async () => {
    const crear = await request(app).post('/pedidos').send({
      cliente: 'Luis', items: [{ productoId: 2, cantidad: 1 }],
    });
    const res = await request(app)
      .patch(`/pedidos/${crear.body.id}/estado`)
      .send({ estado: 'en_preparacion' });
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('en_preparacion');
  });
});

describe('Pruebas de seguridad', () => {
  test('SEC-01 rechaza cantidad negativa', async () => {
    const res = await request(app).post('/pedidos').send({
      cliente: 'Atacante', items: [{ productoId: 1, cantidad: -5 }],
    });
    expect(res.status).toBe(400);
  });

  test('SEC-02 listado de pedidos requiere autenticación', async () => {
    const res = await request(app).get('/pedidos');
    expect(res.status).toBe(401);
  });

  test('SEC-03 no almacena scripts en el nombre del cliente', async () => {
    const res = await request(app).post('/pedidos').send({
      cliente: '<script>alert(1)</script>',
      items: [{ productoId: 2, cantidad: 1 }],
    });
    expect(res.body.cliente).not.toContain('<script>');
  });

  test('SEC-04 rechaza estados inválidos', async () => {
    const crear = await request(app).post('/pedidos').send({
      cliente: 'Eva', items: [{ productoId: 2, cantidad: 1 }],
    });
    const res = await request(app)
      .patch(`/pedidos/${crear.body.id}/estado`)
      .send({ estado: 'hackeado' });
    expect(res.status).toBe(400);
  });
});