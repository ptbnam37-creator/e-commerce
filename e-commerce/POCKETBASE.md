# Hướng dẫn tích hợp và sử dụng PocketBase làm Backend

Tài liệu này hướng dẫn cách thiết lập, chạy và kết nối máy chủ **PocketBase** (một backend gọn nhẹ nguồn mở) với ứng dụng React e-commerce.

---

## 1. Cấu trúc thư mục dự án

Để ứng dụng và backend hoạt động chính xác, cấu trúc thư mục của bạn nên được tổ chức như sau:

```text
react-ecommerce/
├── e-commerce/              # Mã nguồn dự án React (Thư mục chứa Git Repository này)
│   ├── src/
│   ├── package.json
│   └── POCKETBASE.md        # Tài liệu hướng dẫn này
└── pocketbase/              # Thư mục chứa Backend (Nằm bên ngoài thư mục e-commerce)
    ├── pocketbase.exe       # Tệp thực thi máy chủ PocketBase
    └── pb_data/             # Thư mục cơ sở dữ liệu SQLite (Tự động sinh ra khi chạy)
```

> [!NOTE]
> Vì tệp `pocketbase.exe` và dữ liệu `pb_data/` là dữ liệu chạy cục bộ của từng máy phát triển, chúng được đặt ngoài thư mục Git `e-commerce` để tránh đẩy các tệp nhị phân nặng và dữ liệu SQLite cá nhân lên GitHub.

---

## 2. Các bước khởi chạy và cài đặt

### Bước 1: Khởi chạy máy chủ PocketBase
Mở một cửa sổ Terminal (PowerShell hoặc Command Prompt) mới và chạy máy chủ bằng lệnh:

```powershell
# Di chuyển vào thư mục pocketbase nằm ở thư mục cha
cd ../pocketbase

# Khởi chạy PocketBase
.\pocketbase.exe serve
```

Khi máy chủ hoạt động, bạn sẽ thấy thông tin kết nối:
*   **API Endpoint**: `http://127.0.0.1:8090` (Để React kết nối qua SDK).
*   **Admin UI**: `http://127.0.0.1:8090/_/` (Trang quản trị cơ sở dữ liệu).

### Bước 2: Thiết lập tài khoản quản trị (Lần đầu chạy)
1. Truy cập vào **Admin UI**: [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/)
2. Nhập Email và Mật khẩu mong muốn để tạo tài khoản Admin quản lý hệ thống.

---

## 3. Cách tạo tài khoản người dùng để đăng nhập

PocketBase tích hợp sẵn một bảng (Collection) lưu trữ người dùng tên là `users`. Bạn hãy thực hiện các bước sau để tạo tài khoản thử nghiệm:

1. Tại trang **Admin UI**, bấm chọn bảng `users` ở danh sách menu bên trái.
2. Bấm nút **`+ New record`** ở góc trên bên phải.
3. Điền các thông tin của tài khoản:
   *   **Email**: ví dụ `levanb@gmail.com`
   *   **Username**: ví dụ `levanb` (dùng làm tên đăng nhập)
   *   **Password** và **Password Confirm**: nhập mật khẩu của bạn.
4. Bấm **Save** để lưu lại.

---

## 4. Cách sử dụng trong ứng dụng React

Ứng dụng e-commerce đã tích hợp sẵn **PocketBase JS SDK** và có cơ chế đăng nhập thông minh:

### Khởi tạo kết nối:
Cấu hình client được quản lý tại tệp [src/services/pocketbase.ts](file:///c:/Users/GIGABYTE/Desktop/react-ecommerce/e-commerce/src/services/pocketbase.ts):
```typescript
import PocketBase from 'pocketbase';
export const pb = new PocketBase('http://127.0.0.1:8090');
```

### Cơ chế đăng nhập kép (Đăng nhập PocketBase + Fallback mặc định):
Tại màn hình đăng nhập, hệ thống sẽ tự động ưu tiên kết nối tới PocketBase để kiểm tra thông tin tài khoản bạn nhập vào (sử dụng Email hoặc Username).

*   **Trường hợp dùng PocketBase**: Đăng nhập bằng Email (ví dụ: `levanb@gmail.com`) hoặc Username (ví dụ: `levanb`) cùng mật khẩu bạn tạo ở Bước 3.
*   **Trường hợp dự phòng (Fallback)**: Nếu máy chủ PocketBase không hoạt động (offline) hoặc không tìm thấy tài khoản, ứng dụng sẽ tự động sử dụng tài khoản thử nghiệm mặc định của hệ thống:
    *   **Tên đăng nhập**: `nguyenvana`
    *   **Mật khẩu**: `12345678`
