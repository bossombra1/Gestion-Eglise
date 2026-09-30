import type { NextFunction, Request, Response } from 'express'
import { administrationDocumentService } from '../services/administration-document.service'

const getParishId = (req: Request) => {
  if (!req.user?.parishId) throw new Error('Aucune paroisse associée à cet utilisateur.')
  return req.user.parishId
}

const queryString = (value: unknown) => {
  if (value === undefined) return undefined
  if (typeof value !== 'string') throw new Error('Paramètre invalide.')
  return value.trim() || undefined
}

export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await administrationDocumentService.list(getParishId(req), {
      search: queryString(req.query.search),
      type: queryString(req.query.type),
      movementId: queryString(req.query.movementId),
    })
    return res.json({ success: true, data })
  } catch (error) {
    return next(error)
  }
}

export const downloadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await administrationDocumentService.getFile(getParishId(req), req.params.id)
    return res.download(document.filePath, document.fileName, {
      headers: { 'Content-Type': document.mimeType ?? 'application/octet-stream' },
    })
  } catch (error) {
    return next(error)
  }
}
