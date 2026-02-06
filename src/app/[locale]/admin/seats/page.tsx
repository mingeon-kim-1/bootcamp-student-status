'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import SettingsModal from '@/components/SettingsModal'

interface SeatPosition {
  id?: string
  seatNumber: number
  gridRow: number
  gridCol: number
  label?: string
}

interface Config {
  seatsPerRow: number
  totalRows: number
  useCustomLayout: boolean
  corridorAfterRows: number[]
  corridorAfterCols: number[]
}

export default function AdminSeatsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [config, setConfig] = useState<Config | null>(null)
  const [seats, setSeats] = useState<SeatPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nextSeatNumber, setNextSeatNumber] = useState(1)
  const [assignMode, setAssignMode] = useState<'click' | 'sequential'>('click')

  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user?.role !== 'admin')) {
      router.push(`/${locale}/admin/login`)
    }
  }, [status, session, router, locale])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchData()
    }
  }, [session])

  useEffect(() => {
    if (seats.length > 0) {
      const maxSeat = Math.max(...seats.map(s => s.seatNumber))
      setNextSeatNumber(maxSeat + 1)
    } else {
      setNextSeatNumber(1)
    }
  }, [seats])

  const fetchData = async () => {
    try {
      const [configRes, seatsRes] = await Promise.all([
        fetch('/api/admin/config'),
        fetch('/api/admin/seats'),
      ])
      const configData = await configRes.json()
      setConfig({
        ...configData,
        corridorAfterRows: configData.corridorAfterRows || [],
        corridorAfterCols: configData.corridorAfterCols || [],
      })
      setSeats(await seatsRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCellClick = (row: number, col: number) => {
    const existingSeat = seats.find(s => s.gridRow === row && s.gridCol === col)
    
    if (existingSeat) {
      setSeats(seats.filter(s => !(s.gridRow === row && s.gridCol === col)))
    } else {
      if (assignMode === 'sequential') {
        setSeats([...seats, {
          seatNumber: nextSeatNumber,
          gridRow: row,
          gridCol: col,
        }])
        // Auto-increment for next sequential assignment
        setNextSeatNumber(nextSeatNumber + 1)
      } else {
        const input = prompt(`Enter seat number for position (Row ${row + 1}, Col ${col + 1}):`, nextSeatNumber.toString())
        if (input !== null) {
          const seatNum = parseInt(input)
          if (!isNaN(seatNum) && seatNum > 0) {
            const newSeats = seats.filter(s => s.seatNumber !== seatNum && !(s.gridRow === row && s.gridCol === col))
            newSeats.push({
              seatNumber: seatNum,
              gridRow: row,
              gridCol: col,
            })
            setSeats(newSeats)
            // Update next seat number to be after the manually entered number
            setNextSeatNumber(seatNum + 1)
          }
        }
      }
    }
  }

  const toggleRowCorridor = (afterRow: number) => {
    if (!config) return
    const corridors = [...config.corridorAfterRows]
    const index = corridors.indexOf(afterRow)
    if (index > -1) {
      corridors.splice(index, 1)
    } else {
      corridors.push(afterRow)
      corridors.sort((a, b) => a - b)
    }
    setConfig({ ...config, corridorAfterRows: corridors })
  }

  const toggleColCorridor = (afterCol: number) => {
    if (!config) return
    const corridors = [...config.corridorAfterCols]
    const index = corridors.indexOf(afterCol)
    if (index > -1) {
      corridors.splice(index, 1)
    } else {
      corridors.push(afterCol)
      corridors.sort((a, b) => a - b)
    }
    setConfig({ ...config, corridorAfterCols: corridors })
  }

  const saveAll = async () => {
    if (!config) return
    setSaving(true)
    try {
      await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      await fetch('/api/admin/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats }),
      })
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const clearAllSeats = () => {
    if (!confirm('Clear all seat positions?')) return
    setSeats([])
  }

  const clearAllCorridors = () => {
    if (!config || !confirm('Clear all corridors?')) return
    setConfig({ ...config, corridorAfterRows: [], corridorAfterCols: [] })
  }

  const autoFillSeats = () => {
    if (!config) return
    if (!confirm('This will replace all current seat assignments. Continue?')) return
    const newSeats: SeatPosition[] = []
    let seatNum = 1
    for (let row = 0; row < config.totalRows; row++) {
      for (let col = config.seatsPerRow - 1; col >= 0; col--) {
        newSeats.push({ seatNumber: seatNum++, gridRow: row, gridCol: col })
      }
    }
    setSeats(newSeats)
  }

  const getSeatAtPosition = (row: number, col: number) => seats.find(s => s.gridRow === row && s.gridCol === col)
  const hasRowCorridorAfter = (row: number) => config?.corridorAfterRows.includes(row) || false
  const hasColCorridorAfter = (col: number) => config?.corridorAfterCols.includes(col) || false

  if (status === 'loading' || loading || !config) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-gray-700 dark:text-white text-xl">{t('common.loading')}</div>
      </div>
    )
  }

  if (session?.user?.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.dashboard')}</h1>
          <div className="flex items-center gap-4">
            <SettingsModal />
            <button onClick={() => signOut({ callbackUrl: `/${locale}` })} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              {t('common.logout')}
            </button>
          </div>
        </div>
        <nav className="mt-4 flex gap-4">
          <Link href={`/${locale}/admin/dashboard`} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-white rounded-lg transition-colors">{t('admin.config')}</Link>
          <Link href={`/${locale}/admin/seats`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{t('admin.seats')}</Link>
          <Link href={`/${locale}/admin/students`} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-white rounded-lg transition-colors">{t('admin.studentManagement')}</Link>
          <Link href={`/${locale}/admin/display`} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">{t('admin.display')}</Link>
        </nav>
      </header>

      <main className="p-6">
        <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('admin.customLayout')}</h2>
              <p className="text-gray-500 dark:text-slate-400 mt-1">Click squares to assign seats • Use side/top buttons to add corridors</p>
            </div>
            <div className="flex gap-2">
              <button onClick={autoFillSeats} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Auto Fill</button>
              <button onClick={clearAllSeats} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">Clear Seats</button>
              <button onClick={clearAllCorridors} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">Clear Corridors</button>
              <button onClick={saveAll} disabled={saving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors">
                {saving ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </div>

          {/* Assignment Mode */}
          <div className="mb-6 flex items-center gap-4">
            <span className="text-gray-700 dark:text-slate-300">Mode:</span>
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <button onClick={() => setAssignMode('click')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${assignMode === 'click' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'}`}>
                Custom Number
              </button>
              <button onClick={() => setAssignMode('sequential')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${assignMode === 'sequential' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'}`}>
                Sequential (Next: {nextSeatNumber})
              </button>
            </div>
          </div>

          {/* Grid with Column Corridor Toggles */}
          <div className="overflow-auto pb-4">
            <div className="text-gray-500 dark:text-slate-400 text-sm mb-2 text-center">↑ Front of Room ↑</div>
            
            {(() => {
              // Grid dimensions
              const cellSize = 64 // w-16 = 64px
              const gap = 8 // gap-2 = 8px
              const corridorWidth = 6
              const toggleBtnWidth = 32 // w-8 = 32px
              const toggleBtnHeight = 32 // h-8 for column toggles
              const rowToggleHeight = cellSize // Match cell height

              // Calculate column position accounting for corridors
              const getColPosition = (col: number) => {
                let pos = col * (cellSize + gap)
                for (let c = 0; c < col; c++) {
                  if (hasColCorridorAfter(c)) {
                    pos += corridorWidth + gap
                  }
                }
                return pos
              }

              // Calculate row position accounting for corridors (rows are reversed for display)
              const getRowPosition = (displayRow: number) => {
                let pos = (config.totalRows - 1 - displayRow) * (cellSize + gap)
                for (let r = config.totalRows - 1; r > displayRow; r--) {
                  if (hasRowCorridorAfter(r)) {
                    pos += corridorWidth + gap
                  }
                }
                return pos
              }

              // Total grid dimensions
              const totalWidth = getColPosition(config.seatsPerRow - 1) + cellSize
              const totalHeight = getRowPosition(0) + cellSize

              return (
                <div className="flex">
                  {/* Row corridor toggle buttons */}
                  <div className="relative mr-2" style={{ width: toggleBtnWidth, height: totalHeight, marginTop: toggleBtnHeight + gap }}>
                    {Array.from({ length: config.totalRows }).map((_, rowIndex) => {
                      const row = config.totalRows - 1 - rowIndex
                      return (
                        <button
                          key={`row-toggle-${row}`}
                          onClick={() => toggleRowCorridor(row)}
                          className={`absolute w-8 rounded flex items-center justify-center text-xs transition-colors ${
                            hasRowCorridorAfter(row)
                              ? 'bg-amber-500/30 text-amber-600 dark:text-amber-400 border-2 border-amber-500'
                              : 'bg-gray-200 dark:bg-slate-700/30 text-gray-400 dark:text-slate-500 border-2 border-gray-300 dark:border-slate-600 hover:border-amber-500 hover:text-amber-500'
                          }`}
                          style={{
                            height: cellSize,
                            top: getRowPosition(row),
                          }}
                          title={hasRowCorridorAfter(row) ? 'Remove horizontal corridor' : 'Add horizontal corridor'}
                        >
                          {hasRowCorridorAfter(row) ? '━' : '+'}
                        </button>
                      )
                    })}
                  </div>

                  {/* Main grid area */}
                  <div className="flex flex-col">
                    {/* Column corridor toggle buttons */}
                    <div className="relative mb-2" style={{ width: totalWidth, height: toggleBtnHeight }}>
                      {Array.from({ length: config.seatsPerRow - 1 }).map((_, colIndex) => {
                        // Position button at the gap between columns (where corridor would appear)
                        const xPos = getColPosition(colIndex) + cellSize + gap / 2
                        return (
                          <button
                            key={`col-toggle-${colIndex}`}
                            onClick={() => toggleColCorridor(colIndex)}
                            className={`absolute h-8 w-4 rounded flex items-center justify-center text-xs transition-colors ${
                              hasColCorridorAfter(colIndex)
                                ? 'bg-amber-500/30 text-amber-600 dark:text-amber-400 border-2 border-amber-500'
                                : 'bg-gray-200 dark:bg-slate-700/30 text-gray-400 dark:text-slate-500 border-2 border-gray-300 dark:border-slate-600 hover:border-amber-500 hover:text-amber-500'
                            }`}
                            style={{
                              left: xPos - 8, // Center the 16px button on the gap
                            }}
                            title={hasColCorridorAfter(colIndex) ? 'Remove vertical corridor' : 'Add vertical corridor'}
                          >
                            {hasColCorridorAfter(colIndex) ? '┃' : '+'}
                          </button>
                        )
                      })}
                    </div>

                    {/* Seat Grid with absolute positioning */}
                    <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
                      {/* Continuous vertical corridors */}
                      {config.corridorAfterCols.map(col => {
                        if (col >= config.seatsPerRow - 1) return null
                        const xPos = getColPosition(col) + cellSize + gap / 2
                        return (
                          <div
                            key={`v-corridor-${col}`}
                            className="absolute bg-amber-500 rounded-full"
                            style={{
                              width: corridorWidth,
                              height: totalHeight,
                              left: xPos - corridorWidth / 2,
                              top: 0,
                            }}
                          />
                        )
                      })}

                      {/* Continuous horizontal corridors */}
                      {config.corridorAfterRows.map(row => {
                        if (row <= 0) return null
                        const yPos = getRowPosition(row) - gap / 2
                        return (
                          <div
                            key={`h-corridor-${row}`}
                            className="absolute bg-amber-500 rounded-full"
                            style={{
                              width: totalWidth,
                              height: corridorWidth,
                              left: 0,
                              top: yPos - corridorWidth / 2,
                            }}
                          />
                        )
                      })}

                      {/* Seat cells */}
                      {Array.from({ length: config.totalRows }).map((_, rowIndex) => {
                        const row = config.totalRows - 1 - rowIndex
                        return Array.from({ length: config.seatsPerRow }).map((_, colIndex) => {
                          const seat = getSeatAtPosition(row, colIndex)
                          return (
                            <button
                              key={`cell-${row}-${colIndex}`}
                              onClick={() => handleCellClick(row, colIndex)}
                              className={`absolute rounded-lg border-2 flex flex-col items-center justify-center font-bold transition-all hover:scale-105 ${
                                seat
                                  ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30'
                                  : 'border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700/50 text-gray-400 dark:text-slate-500 hover:border-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                              }`}
                              style={{
                                width: cellSize,
                                height: cellSize,
                                left: getColPosition(colIndex),
                                top: getRowPosition(row),
                              }}
                            >
                              {seat ? (
                                <>
                                  <span className="text-xl">{seat.seatNumber}</span>
                                  <span className="text-[10px] opacity-60">remove</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-2xl">+</span>
                                  <span className="text-[10px] opacity-60">add</span>
                                </>
                              )}
                            </button>
                          )
                        })
                      })}

                      {/* Row labels */}
                      {Array.from({ length: config.totalRows }).map((_, rowIndex) => {
                        const row = config.totalRows - 1 - rowIndex
                        return (
                          <span
                            key={`label-${row}`}
                            className="absolute text-gray-500 dark:text-slate-500 text-sm whitespace-nowrap"
                            style={{
                              left: totalWidth + 12,
                              top: getRowPosition(row) + cellSize / 2 - 10,
                            }}
                          >
                            Row {row + 1}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })()}
            <div className="text-gray-500 dark:text-slate-400 text-sm mt-4 text-center">↓ Back of Room ↓</div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 border-emerald-500 bg-emerald-100 dark:bg-emerald-500/20" />
              <span className="text-gray-600 dark:text-slate-300">Seat ({seats.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700/50" />
              <span className="text-gray-600 dark:text-slate-300">Empty</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-amber-500/20 border-y-2 border-dashed border-amber-500/50" />
              <span className="text-gray-600 dark:text-slate-300">Row Corridor ({config.corridorAfterRows.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-6 bg-amber-500/20 border-x-2 border-dashed border-amber-500/50" />
              <span className="text-gray-600 dark:text-slate-300">Column Corridor ({config.corridorAfterCols.length})</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
