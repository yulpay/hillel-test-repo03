import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { BASE_URL, HTTP_CREDENTIALS, testUser } from '../../utils/env';

type Brand = { id: number; title: string };
type Model = { id: number; carBrandId: number; title: string };

let api: APIRequestContext;
let brand: Brand;
let model: Model; // belongs to `brand`
let foreignModel: Model; // belongs to a different brand
const createdCarIds: number[] = [];

test.beforeAll(async () => {
  api = await request.newContext({ baseURL: BASE_URL, httpCredentials: HTTP_CREDENTIALS });

  const { email, password } = testUser();
  const signIn = await api.post('/api/auth/signin', { data: { email, password, remember: false } });
  expect(signIn.status(), 'sign in').toBe(200);

  const brands: Brand[] = (await (await api.get('/api/cars/brands')).json()).data;
  const models: Model[] = (await (await api.get('/api/cars/models')).json()).data;
  brand = brands[0];
  model = models.find((m) => m.carBrandId === brand.id)!;
  foreignModel = models.find((m) => m.carBrandId !== brand.id)!;
  expect(model && foreignModel, 'test data from /api/cars/models').toBeTruthy();
});

test.afterEach(async () => {
  while (createdCarIds.length) {
    const id = createdCarIds.pop()!;
    const res = await api.delete(`/api/cars/${id}`);
    expect(res.status(), `delete car ${id}`).toBe(200);
  }
});

test.afterAll(async () => {
  await api?.dispose();
});

/** POST /api/cars and remember the id of any car that actually got created. */
async function createCar(data: Record<string, unknown>, ctx: APIRequestContext = api) {
  const res = await ctx.post('/api/cars', { data });
  const body = await res.json();
  if (res.status() === 201 && typeof body.data?.id === 'number') createdCarIds.push(body.data.id);
  return { status: res.status(), body };
}

test.describe('POST /api/cars', () => {
  test('creates a car with valid data', async () => {
    const payload = { carBrandId: brand.id, carModelId: model.id, mileage: 122 };

    const { status, body } = await createCar(payload);

    expect(status).toBe(201);
    expect(body.status).toBe('ok');
    expect(body.data).toMatchObject({
      ...payload,
      initialMileage: payload.mileage,
      brand: brand.title,
      model: model.title,
    });
    expect(typeof body.data.id).toBe('number');
  });

  test('returns 404 for a non-existent brand', async () => {
    const { status, body } = await createCar({ carBrandId: 99999, carModelId: model.id, mileage: 100 });

    expect(status).toBe(404);
    expect(body).toEqual({ status: 'error', message: 'Brand not found' });
  });

  for (const mileage of [-1, 1_000_000]) {
    test(`returns 400 for out-of-range mileage ${mileage}`, async () => {
      const { status, body } = await createCar({ carBrandId: brand.id, carModelId: model.id, mileage });

      expect(status).toBe(400);
      expect(body).toEqual({ status: 'error', message: 'Mileage has to be from 0 to 999999' });
    });
  }

  test('returns 404 for a model that belongs to another brand', async () => {
    const { status, body } = await createCar({ carBrandId: brand.id, carModelId: foreignModel.id, mileage: 100 });

    expect(status).toBe(404);
    expect(body).toEqual({ status: 'error', message: 'Model not found' });
  });

  test('returns 400 when mileage is missing', async () => {
    const { status, body } = await createCar({ carBrandId: brand.id, carModelId: model.id });

    expect(status).toBe(400);
    expect(body).toEqual({ status: 'error', message: 'Mileage is required' });
  });

  test('returns 401 without a session', async () => {
    const anonymous = await request.newContext({ baseURL: BASE_URL, httpCredentials: HTTP_CREDENTIALS });
    try {
      const { status, body } = await createCar({ carBrandId: brand.id, carModelId: model.id, mileage: 100 }, anonymous);

      expect(status).toBe(401);
      expect(body).toEqual({ status: 'error', message: 'Not authenticated' });
    } finally {
      await anonymous.dispose();
    }
  });
});
