import { describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../src/app'

describe('GET /api/health', () => {
  it('retourne un statut API sain', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
