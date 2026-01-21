// Real-time updates using polling (simpler than Socket.io for Next.js App Router)
// For production, consider Server-Sent Events or upgrading to a custom server with Socket.io

export const POLL_INTERVAL = 2000 // 2 seconds

// Event types for real-time updates
export type StatusUpdateEvent = {
  type: 'status-update'
  studentId: string
  status: string
}

export type ConfigUpdateEvent = {
  type: 'config-update'
  config: {
    displayTitle: string
    seatsPerRow: number
    totalRows: number
  }
}

export type RealtimeEvent = StatusUpdateEvent | ConfigUpdateEvent
