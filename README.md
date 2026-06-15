# E-Commerce Project with PocketBase Integration

Dự án này tích hợp ứng dụng **Frontend (React + Vite)** và **Backend (PocketBase)** nằm song song trong cùng một kho lưu trữ Git trên nhánh `pocketbase-only-products`.

---

## 1. Cấu trúc thư mục dự án

```text
react-ecommerce/
├── e-commerce/              # Mã nguồn Frontend (React + Redux + Vite)
│   ├── src/                 # Các component, context và logic trang web
│   ├── package.json         # Danh sách thư viện frontend
│   └── vite.config.ts       # Cấu hình Vite (đã cho phép kết nối qua ngrok)
│
└── pocketbase/              # Mã nguồn Backend (PocketBase Service)
    ├── pocketbase.exe       # Tệp thực thi máy chủ PocketBase
    ├── pb_migrations/       # Các bản cập nhật cấu trúc bảng dữ liệu (Migrations)
    └── pb_data/             # Cơ sở dữ liệu SQLite và tài nguyên hình ảnh cục bộ
```

---

## 2. Hướng dẫn khởi chạy dự án dưới Local

### Bước 1: Khởi chạy PocketBase Backend
Mở một Terminal mới tại thư mục gốc của dự án và chạy các lệnh sau:

```bash
# Di chuyển vào thư mục backend
cd pocketbase

# Khởi chạy máy chủ PocketBase
.\pocketbase.exe serve
```

*   **API Endpoint**: `http://127.0.0.1:8090` (Để React SDK kết nối).
*   **Trang quản trị (Admin UI)**: [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/)

### Bước 2: Khởi chạy React Frontend
Mở một Terminal khác tại thư mục gốc của dự án và chạy:

```bash
# Di chuyển vào thư mục frontend
cd e-commerce

# Cài đặt các thư viện (nếu chạy lần đầu)
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt truy cập vào địa chỉ local dev được hiển thị (ví dụ: `http://localhost:5173/`).

---

## 3. Cấu hình Ngrok Tunnels (Nếu cần Public)

Khi expose ứng dụng qua **ngrok** để kiểm tra trên thiết bị di động hoặc môi trường bên ngoài:
- **Cấu hình cho phép host**: Vite đã được cấu hình thuộc tính `server.allowedHosts` chấp nhận các tên miền `.ngrok-free.dev` và `.ngrok.io`.
- Hãy đảm bảo bạn khởi động lại dev server (`npm run dev`) để cập nhật cấu hình này trước khi chạy ngrok.

---

## 4. Quản lý Nhánh trên Git

- Nhánh **`pocketbase-only-products`** chứa cả cấu trúc thư mục frontend `e-commerce` và backend `pocketbase`.
- Thư mục cơ sở dữ liệu SQLite cục bộ `pocketbase/pb_data` đã được đưa vào quản lý để đồng bộ các sản phẩm mẫu cũng như hình ảnh mẫu lên GitHub mà không bị mất dữ liệu.
- Các tệp ghi tạm thời của SQLite như `*.db-shm` và `*.db-wal` sẽ tự động bị bỏ qua qua tệp `.gitignore` chính ở thư mục gốc.
