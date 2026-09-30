import type { NextFunction, Request, Response } from 'express'
import { administrationMovementReportService } from '../services/administration-movement-report.service'

function params(req: Request) {
  const movementId = typeof req.params.id === 'string' ? req.params.id : Array.isArray(req.params.id) ? req.params.id[0] : ''
  const period = typeof req.query.period === 'string' ? req.query.period : 'monthly'
  const year = typeof req.query.year === 'string' ? Number(req.query.year) : new Date().getUTCFullYear()
  const month = typeof req.query.month === 'string' ? Number(req.query.month) : undefined
  return { movementId, period, year: Number.isFinite(year) ? year : new Date().getUTCFullYear(), month }
}

export const getMovementReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.parishId) return res.status(403).json({ success: false, message: 'Aucune paroisse associée.' })
    const p = params(req)
    const data = await administrationMovementReportService.generate(req.user.parishId, p.movementId, p.period, p.year, p.month)
    if (!data) return res.status(404).json({ success: false, message: 'Mouvement introuvable.' })
    return res.json({ success: true, data })
  } catch (error) { return next(error) }
}

export const exportMovementReportCsv = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.parishId) return res.status(403).json({ success: false, message: 'Aucune paroisse associée.' })
    const p = params(req)
    const csv = await administrationMovementReportService.csv(req.user.parishId, p.movementId, p.period, p.year, p.month)
    if (!csv) return res.status(404).json({ success: false, message: 'Mouvement introuvable.' })
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="rapport-mouvement.csv"')
    return res.send('\ufeff' + csv)
  } catch (error) { return next(error) }
}
