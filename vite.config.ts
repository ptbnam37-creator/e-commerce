import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/login' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const { username, password } = JSON.parse(body);
                const validUser = process.env.VITE_VALID_USERNAME || 'nguyenvana';
                const validPass = process.env.VITE_VALID_PASSWORD || '12345678';

                if (username === validUser && password === validPass) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true }));
                } else {
                  res.statusCode = 401;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' }));
                }
              } catch {
                res.statusCode = 400;
                res.end('Bad Request');
              }
            });
            return;
          }
          next();
        });
      }
    }
  ],
})
