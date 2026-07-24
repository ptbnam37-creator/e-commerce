# E-Commerce Project with PocketBase Integration

Dự án này tích hợp ứng dụng **Frontend (React + Vite)** và **Backend (PocketBase)** nằm song song trong cùng một kho lưu trữ Git trên nhánh `pocketbase-only-products`.

> **Backend API** đã được host công khai trên [Render](https://render.com). Frontend production sẽ tự động kết nối tới endpoint này mà không cần khởi chạy PocketBase thủ công.

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

## 2. Backend API (Render)

Backend PocketBase đã được deploy lên **Render** và có thể truy cập công khai:

*   **API Endpoint**: URL backend trên Render (đã được cấu hình trong `src/services/pocketbase.ts`)
*   **Trang quản trị (Admin UI)**: Truy cập qua URL Render tương ứng với đuôi `/_/`

> ⚠️ Lưu ý: Render có thể tắt service sau một thời gian không hoạt động (spin down). Lần đầu truy cập có thể cần vài giây để service khởi động lại.

---

## 3. Hướng dẫn khởi chạy Frontend (Local Development)

```bash
# Di chuyển vào thư mục frontend
cd e-commerce

# Cài đặt các thư viện (nếu chạy lần đầu)
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt truy cập vào địa chỉ local dev được hiển thị (ví dụ: `http://localhost:5173/`).

Frontend sẽ kết nối trực tiếp tới **backend trên Render** — không cần khởi chạy PocketBase cục bộ.

---

## 4. Chạy Backend PocketBase cục bộ (Tuỳ chọn)

Nếu muốn phát triển/kiểm thử offline với database cục bộ:

```bash
# Di chuyển vào thư mục backend
cd pocketbase

# Khởi chạy máy chủ PocketBase
.\pocketbase.exe serve
```

*   **API Endpoint cục bộ**: `http://127.0.0.1:8090`
*   **Trang quản trị (Admin UI)**: [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/)

Sau đó cập nhật URL trong `src/services/pocketbase.ts` để trỏ về `http://127.0.0.1:8090`.

---

## 5. Cấu hình Ngrok Tunnels (Nếu cần)

Khi expose frontend local qua **ngrok** để kiểm tra trên thiết bị di động:
- **Cấu hình cho phép host**: Vite đã được cấu hình thuộc tính `server.allowedHosts` chấp nhận các tên miền `.ngrok-free.dev` và `.ngrok.io`.
- Khởi động lại dev server (`npm run dev`) sau khi thay đổi cấu hình.

---

## 6. Quản lý Nhánh trên Git

- Nhánh **`pocketbase-only-products`** chứa cả cấu trúc thư mục frontend `e-commerce` và backend `pocketbase`.
- Thư mục cơ sở dữ liệu SQLite cục bộ `pocketbase/pb_data` đã được đưa vào quản lý để đồng bộ các sản phẩm mẫu cũng như hình ảnh mẫu lên GitHub mà không bị mất dữ liệu.
- Các tệp ghi tạm thời của SQLite như `*.db-shm` và `*.db-wal` sẽ tự động bị bỏ qua qua tệp `.gitignore` chính ở thư mục gốc.
