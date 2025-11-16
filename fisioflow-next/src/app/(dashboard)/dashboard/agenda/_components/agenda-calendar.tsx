'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

type Appointment = {
  id: string
  data_hora: string
  tipo: string | null
  status: string | null
  pacientes: {
    nome: string
    telefone: string | null
  } | null
}

export function AgendaCalendar({ appointments }: { appointments: Appointment[] }) {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const weekStart = startOfWeek(currentWeek, { locale: ptBR })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8h às 20h

  const getAppointmentsForDay = (day: Date, hour: number) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.data_hora)
      return isSameDay(aptDate, day) && aptDate.getHours() === hour
    })
  }

  const previousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7))
  }

  const nextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7))
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(weekStart, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
            {format(addDays(weekStart, 6), 'dd/MM/yyyy', { locale: ptBR })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-1 min-w-[900px]">
            {/* Header */}
            <div className="sticky left-0 bg-card p-2 font-medium">Horário</div>
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`p-2 text-center font-medium ${
                  isSameDay(day, new Date()) ? 'bg-primary/10 rounded-t-lg' : ''
                }`}
              >
                <div className="text-sm">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className="text-lg">{format(day, 'dd', { locale: ptBR })}</div>
              </div>
            ))}

            {/* Time slots */}
            {hours.map((hour) => (
              <>
                <div
                  key={`hour-${hour}`}
                  className="sticky left-0 bg-card p-2 text-sm font-medium"
                >
                  {hour}:00
                </div>
                {weekDays.map((day) => {
                  const dayAppointments = getAppointmentsForDay(day, hour)
                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={`min-h-[60px] border p-1 ${
                        isSameDay(day, new Date()) ? 'bg-primary/5' : 'bg-card'
                      }`}
                    >
                      {dayAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="rounded bg-primary p-1 text-xs text-primary-foreground"
                        >
                          <div className="font-medium truncate">
                            {apt.pacientes?.nome || 'Sem nome'}
                          </div>
                          <div className="opacity-90">
                            {format(new Date(apt.data_hora), 'HH:mm', {
                              locale: ptBR,
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

