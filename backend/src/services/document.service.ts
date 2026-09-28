import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { documentRepository } from '../repositories/document.repository'

export type MovementDocumentType =
  | 'GENERAL'
  | 'REGISTRATION'
  | 'MEDICAL'
  | 'ADMINISTRATIVE'
  | 'FINANCIAL'
  | 'COMMUNICATION'
  | 'OTHER'

export class DocumentError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message)
    this.name = 'DocumentError'
  }
}

const allowedTypes = new Set<MovementDocumentType>([
  'GENERAL',
  'REGISTRATION',
  'MEDICAL',
  'ADMINISTRATIVE',
  'FINANCIAL',
  'COMMUNICATION',
  'OTHER',
])

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
])

const storageRoot = path.resolve(process.cwd(), 'uploads', 'movements')

const sanitizeFileName = (value: string) => {
  const baseName = path.basename(value).trim()
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return sanitized || 'document'
}

const getOptionalHeader = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0]
  return value
}

export const documentService = {
  list(userId: string, parishId?: string, movementId?: string) {
    return documentRepository.findManagedDocuments(userId, parishId, movementId)
  },

  async create(input: {
    userId: string
    parishId?: string
    movementId: string
    name: string
    description?: string
    type?: string
    originalFileName: string
    mimeType: string
    buffer: Buffer
  }) {
    if (!input.parishId) throw new DocumentError('Aucune paroisse associée à cet utilisateur.', 403)

    const movement = await documentRepository.findManagedMovement(input.userId, input.movementId, input.parishId)
    if (!movement) throw new DocumentError('Mouvement non autorisé ou introuvable.', 403)

    const type = (input.type ?? 'GENERAL').toUpperCase() as MovementDocumentType
    if (!allowedTypes.has(type)) throw new DocumentError('Type de document invalide.')
    if (!allowedMimeTypes.has(input.mimeType)) throw new DocumentError('Type de fichier non autorisé.')
    if (!input.buffer.length) throw new DocumentError('Le fichier est vide.')
    if (!input.name.trim()) throw new DocumentError('Le nom du document est obligatoire.')
    if (!input.originalFileName.trim()) throw new DocumentError('Le nom du fichier est obligatoire.')
    if (input.buffer.length > 10 * 1024 * 1024) throw new DocumentError('Le fichier dépasse la taille maximale de 10 Mo.')

    const safeOriginalName = sanitizeFileName(input.originalFileName)
    const extension = path.extname(safeOriginalName)
    const storedName = randomUUID() + extension
    const directory = path.join(storageRoot, movement.id)
    const absolutePath = path.join(directory, storedName)
    const relativePath = path.relative(process.cwd(), absolutePath)

    await mkdir(directory, { recursive: true })
    await writeFile(absolutePath, input.buffer)

    try {
      return await documentRepository.create({
        name: input.name.trim(),
        description: input.description?.trim() || undefined,
        type,
        fileName: safeOriginalName,
        filePath: relativePath,
        mimeType: input.mimeType,
        size: input.buffer.length,
        parishId: movement.parishId,
        movementId: movement.id,
        uploadedById: input.userId,
      })
    } catch (error) {
      await unlink(absolutePath).catch(() => undefined)
      throw error
    }
  },

  async getFile(userId: string, documentId: string, parishId?: string) {
    const document = await documentRepository.findManagedDocument(userId, documentId, parishId)
    if (!document) throw new DocumentError('Document non autorisé ou introuvable.', 404)
    return document
  },

  async remove(userId: string, documentId: string, parishId?: string) {
    const document = await documentRepository.findManagedDocument(userId, documentId, parishId)
    if (!document) throw new DocumentError('Document non autorisé ou introuvable.', 404)

    await documentRepository.delete(document.id)
    await unlink(path.resolve(process.cwd(), document.filePath)).catch(() => undefined)

    return document
  },

  readUploadHeaders(headers: Record<string, string | string[] | undefined>) {
    return {
      movementId: getOptionalHeader(headers['x-movement-id']),
      name: getOptionalHeader(headers['x-document-name']),
      description: getOptionalHeader(headers['x-document-description']),
      type: getOptionalHeader(headers['x-document-type']),
      fileName: getOptionalHeader(headers['x-file-name']),
      mimeType: getOptionalHeader(headers['x-file-type']),
    }
  },
}
