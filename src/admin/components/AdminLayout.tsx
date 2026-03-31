import type { FC, PropsWithChildren } from 'hono/jsx'

type Props = PropsWithChildren<{
  title: string
  flash?: { message?: string; type?: 'success' | 'error' | 'info' } | null
}>

export const AdminLayout: FC<Props> = ({ title, flash, children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title} - Admin</title>
        <style>{adminCss}</style>
      </head>
      <body>
        <div class="admin-wrapper">
          <nav class="admin-nav">
            <h2>Admin</h2>
            <ul>
              <li><a href="/admin">Dashboard</a></li>
              <li><a href="/admin/groups">Groups</a></li>
              <li><a href="/admin/events">Events</a></li>
              <li><a href="/admin/people">People</a></li>
              <li><a href="/admin/subscribers">Subscribers</a></li>
              <li><a href="/admin/emails">Send Emails</a></li>
              <li class="nav-divider"></li>
              <li><a href="/">View Site</a></li>
            </ul>
          </nav>
          <main class="admin-main">
            <h1>{title}</h1>
            {flash?.message && (
              <div class={`admin-alert admin-alert-${flash.type || 'info'}`}>
                {flash.message}
              </div>
            )}
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

const adminCss = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 15px; color: #1a1a1a; background: #f5f5f5; }
  a { color: #0066cc; text-decoration: none; }
  a:hover { text-decoration: underline; }

  .admin-wrapper { display: flex; min-height: 100vh; }

  .admin-nav {
    width: 220px; background: #1a1a1a; color: #fff; padding: 20px 0; flex-shrink: 0;
  }
  .admin-nav h2 { padding: 0 20px 16px; font-size: 18px; border-bottom: 1px solid #333; margin-bottom: 8px; }
  .admin-nav ul { list-style: none; }
  .admin-nav li a { display: block; padding: 8px 20px; color: #ccc; font-size: 14px; }
  .admin-nav li a:hover { background: #333; color: #fff; text-decoration: none; }
  .admin-nav .nav-divider { border-top: 1px solid #333; margin: 8px 0; }

  .admin-main { flex: 1; padding: 32px 40px; max-width: 1200px; }
  .admin-main h1 { font-size: 28px; margin-bottom: 24px; }
  .admin-main h2 { font-size: 22px; margin: 24px 0 12px; }
  .admin-main h3 { font-size: 18px; margin: 16px 0 8px; }

  .admin-alert { padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; }
  .admin-alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
  .admin-alert-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
  .admin-alert-info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }

  table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; background: #fff; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  th { background: #f8f9fa; text-align: left; padding: 10px 14px; font-size: 13px; font-weight: 600; color: #555; border-bottom: 2px solid #dee2e6; }
  td { padding: 10px 14px; border-bottom: 1px solid #eee; font-size: 14px; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #f8f9fa; }

  .btn { display: inline-block; padding: 6px 14px; border-radius: 4px; font-size: 13px; font-weight: 500; border: none; cursor: pointer; text-decoration: none; }
  .btn:hover { text-decoration: none; opacity: 0.9; }
  .btn-primary { background: #0066cc; color: #fff; }
  .btn-danger { background: #dc3545; color: #fff; }
  .btn-secondary { background: #6c757d; color: #fff; }
  .btn-success { background: #28a745; color: #fff; }
  .btn-warning { background: #ffc107; color: #000; }
  .btn-sm { padding: 4px 10px; font-size: 12px; }

  .btn-group { display: flex; gap: 8px; margin: 16px 0; }

  form.admin-form { max-width: 600px; }
  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; font-weight: 600; font-size: 13px; margin-bottom: 4px; color: #333; }
  .form-group input, .form-group textarea, .form-group select {
    width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; font-family: inherit;
  }
  .form-group textarea { min-height: 120px; resize: vertical; }
  .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #0066cc; box-shadow: 0 0 0 2px rgba(0,102,204,0.15); }
  .form-group .form-help { font-size: 12px; color: #666; margin-top: 2px; }
  .form-group-inline { display: flex; align-items: center; gap: 8px; }
  .form-group-inline input[type="checkbox"] { width: auto; }

  .card { background: #fff; border-radius: 6px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .card h3 { margin-top: 0; }

  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 500; }
  .badge-success { background: #d4edda; color: #155724; }
  .badge-warning { background: #fff3cd; color: #856404; }
  .badge-danger { background: #f8d7da; color: #721c24; }
  .badge-info { background: #d1ecf1; color: #0c5460; }

  .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: #fff; border-radius: 6px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .stat-card .stat-value { font-size: 32px; font-weight: 700; }
  .stat-card .stat-label { font-size: 13px; color: #666; margin-top: 4px; }

  .empty-state { text-align: center; padding: 40px; color: #666; font-style: italic; }

  .actions { display: flex; gap: 6px; }

  .email-preview { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 24px; margin: 16px 0; max-width: 600px; }
  .email-preview h3 { margin-top: 0; }
`
