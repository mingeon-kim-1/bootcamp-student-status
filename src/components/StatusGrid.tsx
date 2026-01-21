'use client'

import { useMemo } from 'react'

interface Student {
  id: string
  seatNumber: number
  status: string
  lastActive: string | null
}

interface SeatPosition {
  seatNumber: number
  gridRow: number
  gridCol: number
  label?: string
}

interface Config {
  seatsPerRow: number
  totalRows: number
  seatDirection: string
  useCustomLayout: boolean
}

interface StatusGridProps {
  students: Student[]
  config: Config
  seatPositions: SeatPosition[]
}

export default function StatusGrid({ students, config, seatPositions }: StatusGridProps) {
  const studentMap = useMemo(() => {
    const map = new Map<number, Student>()
    students.forEach(s => map.set(s.seatNumber, s))
    return map
  }, [students])

  const customPositionMap = useMemo(() => {
    const map = new Map<string, SeatPosition>()
    seatPositions.forEach(sp => map.set(`${sp.gridRow}-${sp.gridCol}`, sp))
    return map
  }, [seatPositions])

  // Calculate seat number for a given grid position based on direction
  const getSeatNumberForPosition = (row: number, col: number, totalRows: number, seatsPerRow: number, direction: string): number => {
    switch (direction) {
      case 'bottom-right-horizontal':
        // Start from bottom-right, go left then up
        return (row * seatsPerRow) + (seatsPerRow - col)
      case 'bottom-left-horizontal':
        // Start from bottom-left, go right then up
        return (row * seatsPerRow) + col + 1
      case 'top-right-horizontal':
        // Start from top-right, go left then down
        return ((totalRows - 1 - row) * seatsPerRow) + (seatsPerRow - col)
      case 'top-left-horizontal':
        // Start from top-left, go right then down
        return ((totalRows - 1 - row) * seatsPerRow) + col + 1
      default:
        return (row * seatsPerRow) + (seatsPerRow - col)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500 shadow-green-500/50'
      case 'need-help':
        return 'bg-red-500 shadow-red-500/50 animate-pulse'
      default:
        return 'bg-gray-500'
    }
  }

  const renderGrid = () => {
    const rows = []
    
    // Render from top row (highest index) to bottom row (0)
    for (let displayRow = config.totalRows - 1; displayRow >= 0; displayRow--) {
      const cells = []
      
      for (let col = 0; col < config.seatsPerRow; col++) {
        let seatNumber: number | null = null
        
        if (config.useCustomLayout) {
          // Use custom layout - check if there's a seat assigned to this position
          const customSeat = customPositionMap.get(`${displayRow}-${col}`)
          seatNumber = customSeat?.seatNumber || null
        } else {
          // Use automatic layout based on direction
          seatNumber = getSeatNumberForPosition(displayRow, col, config.totalRows, config.seatsPerRow, config.seatDirection)
        }

        const student = seatNumber ? studentMap.get(seatNumber) : null
        const status = student?.status || 'offline'
        
        cells.push(
          <div
            key={`${displayRow}-${col}`}
            className={`aspect-square rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 ${
              seatNumber ? getStatusColor(status) : 'bg-slate-800 opacity-30'
            }`}
          >
            {seatNumber || '-'}
          </div>
        )
      }
      
      rows.push(
        <div key={displayRow} className="flex gap-2 justify-center">
          {cells}
        </div>
      )
    }
    
    return rows
  }

  return (
    <div className="flex flex-col gap-2">
      {renderGrid()}
    </div>
  )
}
