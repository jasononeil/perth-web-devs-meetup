import type { FC, PropsWithChildren } from 'hono/jsx'

export const Layout: FC<PropsWithChildren<{ title?: string }>> = ({ title, children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title || 'Meetup Group'}</title>
        <link href="/css/styles.css" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
