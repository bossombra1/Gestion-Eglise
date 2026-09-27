import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { AuthError } from '../services/auth.service'
import { PaymentError } from '../services/payment.service'
import { RegistrationError } from '../services/registration.service'

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Les données envoyées sont invalides.',
      errors: error.flatten().fieldErrors,
    })
  }

  if (
    error instanceof AuthError ||
    error instanceof RegistrationError ||
    error instanceof PaymentError
  ) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    })
  }

  console.error(error)

  return res.status(500).json({
    success: false,
    message: 'Une erreur interne est survenue.',
  })
}
