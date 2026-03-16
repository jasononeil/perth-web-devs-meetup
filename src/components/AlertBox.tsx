import type { FC } from 'hono/jsx'

type AlertType = 'success' | 'info' | 'danger'

export const AlertBox: FC<{ type: AlertType; message: string }> = ({ type, message }) => {
  return (
    <div class={`alert alert-${type}`}>
      {message}
    </div>
  )
}
