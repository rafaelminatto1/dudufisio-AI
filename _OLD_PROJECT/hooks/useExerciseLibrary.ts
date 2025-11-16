import { useEffect, useState } from 'react'
import { useToast } from '../contexts/ToastContext'
import * as exerciseLibraryService from '../services/exerciseLibraryService'
import type { ExerciseCategory, Protocol } from '../types'

interface UseExerciseLibraryResult {
  protocols: Protocol[]
  exerciseGroups: ExerciseCategory[]
  isLoading: boolean
}

const useExerciseLibrary = (): UseExerciseLibraryResult => {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [exerciseGroups, setExerciseGroups] = useState<ExerciseCategory[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { showToast } = useToast()

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const { protocols: fetchedProtocols, exerciseGroups: fetchedGroups } =
          await exerciseLibraryService.getExerciseLibraryData()

        if (!isMounted) return
        setProtocols(fetchedProtocols)
        setExerciseGroups(fetchedGroups)
      } catch {
        if (!isMounted) return
        showToast('Falha ao carregar a biblioteca de exercícios.', 'error')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchData()

    return () => {
      isMounted = false
    }
  }, [showToast])

  return { protocols, exerciseGroups, isLoading }
}

export default useExerciseLibrary
