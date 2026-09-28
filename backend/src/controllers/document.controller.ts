import type { NextFunction, Request, Response } from 'express'
import { documentService } from '../services/document.service'

const getContext = (req: Request) => {
  if (!req.user) throw new Error('Utilisateur non authentifié.')
  return { userId: req.user.id, parishId: req.user.parishId }
}

const getOptionalMovementId = (req: Request) => {
  const value = req.query.movementId
  if (value === undefined) return undefined
  if (typeof value !== 'string') throw new Error('Identifiant de mouvement invalide.')
  return value
}

const getDocumentId = (req: Request) => {
  const id = req.params.id
  if (typeof id !== 'string') throw new Error('Identifiant de document invalide.')
  return id
}

export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const data = await documentService.list(context.userId, context.parishId, getOptionalMovementId(req))
    return res.json({ success: true, data })
  } catch (error) {
    return next(error)
  }
}

export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    if (!Buffer.isBuffer(req.body)) throw new Error('Le fichier doit être envoyé en binaire.')

    const headers = documentService.readUploadHeaders(req.headers)
    if (!headers.movementId || !headers.name || !headers.fileName || !headers.mimeType) {
      throw new Error('Les métadonnées du document sont incomplètes.')
    }

    const data = await documentService.create({
      userId: context.userId,
      parishId: context.parishId,
      movementId: headers.movementId,
      name: headers.name,
      description: headers.description,
      type: headers.type,
      originalFileName: headers.fileName,
      mimeType: headers.mimeType,
      buffer: req.body,
    })

    return res.status(201).json({ success: true, data })
  } catch (error) {
    return next(error)
  }
}

export const downloadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const document = await documentService.getFile(context.userId, getDocumentId(req), context.parishId)
    return res.download(document.filePath, document.fileName, {
      headers: { 'Content-Type': document.mimeType ?? 'application/octet-stream' },
    })
  } catch (error) {
    return next(error)
  }
}

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    await documentService.remove(context.userId, getDocumentId(req), context.parishId)
    return res.json({ success: true })
  } catch (error) {
    return next(error)
  }
}
