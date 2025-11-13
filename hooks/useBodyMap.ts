import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../contexts/ToastContext'
import * as bodyMapService from '../services/bodyMapService'

type BodyPoint = Awaited<ReturnType<typeof bodyMapService.getBodyPointsByPatientId>>[number]
type CreateBodyPointInput = Parameters<typeof bodyMapService.addBodyPoint>[0]
type UpdateBodyPointInput = Parameters<typeof bodyMapService.updateBodyPoint>[1]

const toDate = (value: BodyPoint['createdAt']): Date | null => {
  if (!value) return null
  return value instanceof Date ? value : new Date(value)
}

export const useBodyMap = (patientId?: string) => {
  const [bodyPoints, setBodyPoints] = useState<BodyPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  const loadBodyPoints = useCallback(async () => {
    if (!patientId) {
      setBodyPoints([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const points = await bodyMapService.getBodyPointsByPatientId(patientId)
      setBodyPoints(points)
    } catch (err) {
      setError('Erro ao carregar mapa corporal')
      showToast('Erro ao carregar mapa corporal', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [patientId, showToast])

  useEffect(() => {
    void loadBodyPoints()
  }, [loadBodyPoints])

  const addBodyPoint = useCallback(
    async (point: CreateBodyPointInput): Promise<BodyPoint> => {
      try {
        setError(null)
        const newPoint = await bodyMapService.addBodyPoint(point)
        setBodyPoints(prev => [newPoint, ...prev])
        showToast('Ponto de dor adicionado com sucesso', 'success')
        return newPoint
      } catch (err) {
        setError('Erro ao adicionar ponto')
        showToast('Erro ao adicionar ponto de dor', 'error')
        throw err
      }
    },
    [showToast]
  )

  const updateBodyPoint = useCallback(
    async (id: string, pointData: UpdateBodyPointInput): Promise<BodyPoint> => {
      try {
        setError(null)
        const updatedPoint = await bodyMapService.updateBodyPoint(id, pointData)
        setBodyPoints(prev => prev.map(point => (point.id === id ? updatedPoint : point)))
        showToast('Ponto de dor atualizado com sucesso', 'success')
        return updatedPoint
      } catch (err) {
        setError('Erro ao atualizar ponto')
        showToast('Erro ao atualizar ponto de dor', 'error')
        throw err
      }
    },
    [showToast]
  )

  const deleteBodyPoint = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null)
        await bodyMapService.deleteBodyPoint(id)
        setBodyPoints(prev => prev.filter(point => point.id !== id))
        showToast('Ponto de dor removido com sucesso', 'success')
      } catch (err) {
        setError('Erro ao deletar ponto')
        showToast('Erro ao remover ponto de dor', 'error')
        throw err
      }
    },
    [showToast]
  )

  const getPointsByDate = useCallback(
    (date: string): BodyPoint[] => {
      return bodyPoints.filter(point => {
        const createdAt = toDate(point.createdAt)
        return createdAt?.toLocaleDateString('pt-BR') === date
      })
    },
    [bodyPoints]
  )

  const getPointsBySide = useCallback(
    (side: string): BodyPoint[] => bodyPoints.filter(point => point.bodySide === side),
    [bodyPoints]
  )

  const getAverageePainLevel = useCallback((): number => {
    const levels = bodyPoints
      .map(point => point.painLevel ?? 0)
      .filter(level => typeof level === 'number')

    if (levels.length === 0) return 0

    const total = levels.reduce((sum, level) => sum + level, 0)
    return Math.round((total / levels.length) * 10) / 10
  }, [bodyPoints])

  const refreshBodyPoints = useCallback(async () => {
    await loadBodyPoints()
  }, [loadBodyPoints])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    bodyPoints,
    isLoading,
    error,
    addBodyPoint,
    updateBodyPoint,
    deleteBodyPoint,
    getPointsByDate,
    getPointsBySide,
    getAverageePainLevel,
    refreshBodyPoints,
    clearError,
  }
}
