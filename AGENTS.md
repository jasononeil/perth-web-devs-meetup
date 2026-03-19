# Perth Web Devs agent instructions

## Verifying changes

Always check your code passes the automated tests.

Use `devbox run verify` to apply formatters, and check lint and test results.

## Testing in a browser

- See if the server is running at http://localhost:8000
- If not, try `devbox services up --background` to start it
- Then you can use Chrome Dev Tools MCP server to view changes
