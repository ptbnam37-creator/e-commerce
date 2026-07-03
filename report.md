# Báo Cáo Dự Án: Ứng Dụng E-commerce (Mobile Shopping)

## 1. Giới thiệu chung
Dự án **Mobile Shopping** là một ứng dụng web thương mại điện tử hoàn chỉnh, tập trung vào trải nghiệm mua sắm mượt mà trên cả thiết bị di động (Mobile) và máy tính bàn (Desktop). Giao diện được thiết kế theo hướng tối giản, hiện đại và tập trung vào hiệu suất.

## 2. Công nghệ sử dụng
*   **Frontend:** React (viết bằng TypeScript), Vite (Build tool).
*   **Styling:** CSS thuần (không dùng thư viện ngoài) để tối ưu dung lượng và kiểm soát linh hoạt bố cục (Flexbox, Grid).
*   **Backend & Database:** PocketBase (Backend-as-a-Service mã nguồn mở).
*   **Quản lý phiên bản:** Git và GitHub.

## 3. Các tính năng cốt lõi (Core Features)
### A. Dành cho Khách hàng
*   **Khám phá sản phẩm:** Danh sách sản phẩm được phân trang (pagination) tự động dựa trên chiều cao thực tế của màn hình (hạn chế thanh cuộn dư thừa). Hỗ trợ tìm kiếm theo tên và lọc theo đánh giá/màu sắc.
*   **Chi tiết sản phẩm:** Giao diện chi tiết rõ ràng, hỗ trợ xem nhiều biến thể màu sắc (color variants) kèm hình ảnh chuyển đổi tương ứng (carousel), định dạng mô tả tự động nhận diện xuống dòng.
*   **Giỏ hàng (Cart):** Cho phép thêm sản phẩm vào giỏ, cập nhật số lượng và tính tổng tiền real-time. Có huy hiệu (badge) báo số lượng món hàng trên thanh công cụ.
*   **Tài khoản người dùng:** Đăng nhập/Đăng ký an toàn qua PocketBase. Cập nhật thông tin cá nhân (Họ tên, Email, Số điện thoại) với ràng buộc định dạng chuẩn (HTML5 Validation).

### B. Kiến trúc Giao diện (Responsive Design)
*   **Desktop:** Sidebar (thanh điều hướng) nằm cố định bên trái (sticky), cho phép cuộn nội dung chính độc lập.
*   **Mobile:** Sidebar tự động chuyển đổi thành thanh điều hướng nằm ngang (Bottom Navigation Bar) bám sát mép dưới màn hình, tối ưu hóa cho thao tác bằng ngón tay cái.

## 4. Các thách thức kỹ thuật đã giải quyết
Trong quá trình phát triển, chúng tôi đã gặp và xử lý thành công một số bài toán hóc búa về UI/UX:
1.  **Lỗi tràn layout (Flexbox Wrap Bug):** Hình ảnh sản phẩm có kích thước gốc quá lớn khiến tính năng tự động gập cột của Flexbox hoạt động sai trên Desktop. Đã khắc phục triệt để bằng thuộc tính `min-width: 0`.
2.  **Toán học Phân trang (Pagination Math):** Đảm bảo thanh chuyển trang luôn nằm cố định ở cuối trang mà không bị hộp sản phẩm đè lên, bằng công thức bù trừ khoảng không (offset) kết hợp `Math.ceil()`.
3.  **Lỗi thanh công cụ trên Mobile:** Khắc phục tình trạng thanh điều hướng dưới cùng bị giật lên trên do ảnh hưởng từ thuộc tính `top` của giao diện Desktop (Sửa bằng `top: auto`).

## 5. Tổng quan dự án (Overall Review)
Frontend của nền tảng thương mại điện tử là một ứng dụng React được xây dựng bằng Vite và TypeScript, quản lý trạng thái qua sự kết hợp giữa React Context (ví dụ: `CartContext`) và API của PocketBase (`pb.authStore`). Ứng dụng giao tiếp với backend PocketBase chạy ở local để thực hiện các dịch vụ xác thực và cơ sở dữ liệu.

### Kiến trúc và Tech Stack
*   **Frontend:** React (sử dụng Hooks), TypeScript, Vite, CSS thuần.
*   **Quản lý trạng thái:** React Context API cho giỏ hàng (`CartContext`), API của PocketBase cho xác thực và hồ sơ người dùng (`authStore`).
*   **Backend:** Dịch vụ PocketBase local (`pocketbase.exe`) sử dụng cơ sở dữ liệu SQLite.
*   **Testing:** Vitest, React Testing Library.

### Chất lượng mã nguồn và khả năng bảo trì
**Điểm mạnh:**
*   Sự phân tách trách nhiệm (separation of concerns) rất tốt với các thành phần như components, contexts, pages và services được module hóa chuẩn mực trong thư mục `src`.
*   Độ phủ của Unit test ở mức khá (khoảng 66-68% statement coverage), bao gồm các bài kiểm thử chi tiết cho các vùng quan trọng như Login và Shop.
*   Sử dụng Vitest - một công cụ testing hiện đại và hiệu suất cao.

**Điểm cần cải thiện (Đã xử lý):**
*   **Linting/Static Analysis:** Đã xử lý các cảnh báo lint liên quan đến quy tắc của React hooks (`react-hooks/set-state-in-effect`), import dạng CommonJS (`require`) trong các file tiện ích `.js`, và các file cấu hình `@types` còn thiếu.
*   **Tối ưu Render:** Các component như `Shop.tsx` trước đây tiềm ẩn nguy cơ render liên tục do cập nhật state đồng bộ (synchronous) bên trong `useEffect`. Việc này đã được tái cấu trúc bằng cách logic hóa để an toàn hơn.
*   **Cấu hình:** Khắc phục sự lẫn lộn giữa cú pháp ES Module và CommonJS trong các file script tiện ích (như `inspect_db.js`) bằng cách đổi đuôi thành `.cjs` hoặc `.mjs` để phù hợp với thuộc tính `"type": "module"` trong `package.json`.

## 6. Danh sách kiểm thử (Test Checklist)
### 6.1. Kiểm thử tính năng (Functional Tests)
**Xác thực (Đăng nhập/Đăng xuất):**
- [x] Xác minh khả năng đăng nhập thành công với thông tin hợp lệ (ví dụ: tài khoản mock 'levanb').
- [x] Xác minh các thông báo lỗi khi nhập sai thông tin đăng nhập.
- [x] Xác minh rằng việc nhấn "Đăng xuất" sẽ xóa state của người dùng và điều hướng về trang đăng nhập thành công.

**Hiển thị Cửa hàng (Shop View):**
- [x] Xác minh sản phẩm được tải thành công từ dịch vụ PocketBase.
- [x] Xác minh lưới sản phẩm (grid) tương thích chuẩn xác với các kích thước màn hình khác nhau (mobile vs. desktop).

**Tìm kiếm và Bộ lọc:**
- [x] Xác minh chức năng tìm kiếm văn bản lọc chính xác sản phẩm theo tên.
- [x] Xác minh bộ lọc khoảng giá (min và max) thu hẹp kết quả sản phẩm chính xác.
- [x] Xác minh bộ lọc đánh giá (rating) thu hẹp kết quả sản phẩm chính xác.
- [x] Xác minh sự kết hợp giữa tìm kiếm, giá, và đánh giá hoạt động trơn tru cùng nhau.

**Chi tiết sản phẩm:**
- [x] Xác minh khi click vào sản phẩm sẽ điều hướng sang giao diện chi tiết.
- [x] Xác minh hình ảnh, mô tả, giá cả, và đánh giá được hiển thị chính xác.

**Quản lý giỏ hàng:**
- [x] Xác minh sản phẩm có thể thêm vào giỏ hàng.
- [x] Xác minh số lượng sản phẩm có thể được cập nhật ngay trong giỏ hàng.
- [x] Xác minh sản phẩm có thể bị xóa khỏi giỏ.
- [x] Xác minh tổng số tiền được tính toán chính xác.

### 6.2. Trạng thái & Độ bền vững (State Management & Persistence)
- [x] Xác minh hồ sơ người dùng và token bảo mật vẫn tồn tại khi tải lại trang (thông qua localStorage).
- [x] Xác minh `CartContext` theo dõi trạng thái giỏ hàng chính xác khi di chuyển giữa các trang khác nhau.

### 6.3. Kiểm thử Tự động (Automated Tests - Vitest)
- [x] Chạy bộ test (`npx vitest run`) và đảm bảo toàn bộ 55 bài test vượt qua thành công trên 10 file test.
- [x] Xem lại báo cáo độ phủ (`npx vitest run --coverage`) để xác định và ưu tiên các luồng code chưa được test trong các component cốt lõi.

### 6.4. Chất lượng mã & Định dạng (Code Quality)
- [x] Chạy linter (`npm run lint`) để đảm bảo toàn bộ mã nguồn tuân thủ các quy tắc của ESLint và TypeScript. Không có lỗi hay cảnh báo.
- [x] Đảm bảo không sử dụng cú pháp import `require()` trong các file ES Modules tiêu chuẩn.

### 6.5. Tích hợp Backend (Backend Integration)
- [x] Xác minh ứng dụng trỏ chính xác về endpoint `http://127.0.0.1:8090` khi chạy local dev server.
- [x] Xác minh các thông báo lỗi rõ ràng (fallback logic) được kích hoạt mượt mà khi dịch vụ backend bị ngắt kết nối.

## 7. Kết luận
Dự án đã đạt được cấu trúc vững chắc để có thể mở rộng (scale) thêm các tính năng phức tạp hơn như thanh toán trực tuyến (payment gateway), quản lý đơn hàng (order tracking), và tích hợp hệ thống quản trị (Admin Dashboard). Kiến trúc tách bạch giữa React và PocketBase cho phép quá trình phát triển diễn ra cực kỳ nhanh chóng và độc lập. Cùng với quy trình kiểm thử (testing) và đánh giá chất lượng (review) chặt chẽ, ứng dụng đảm bảo được tính ổn định và đáng tin cậy cao trước khi đưa vào môi trường thực tế.

## 8. Đánh giá Mã Nguồn Chi Tiết (Code Review)

**Kiến trúc & Tổ chức (Architecture & Organization):**
- Thư mục được tổ chức chuẩn xác theo mô hình feature-based: `components`, `pages`, `contexts`, `services`, `types`. Việc này giúp mã nguồn dễ dàng mở rộng và bảo trì, phân tách rạch ròi giữa UI, logic state và giao tiếp API.
- Các file cấu hình (`vite.config.ts`, `vitest.config.ts`, `eslint.config.ts`) được thiết lập rất bài bản, cho thấy quy trình làm việc chuyên nghiệp.

**Chất lượng React & TypeScript:**
- **Hooks & State:** Việc kết hợp Context API (`CartContext`) cho giỏ hàng toàn cục và Local State cho các tương tác component lẻ (như đóng mở sidebar, dropdown) cho thấy hiểu biết sâu sắc về quản lý trạng thái.
- **Code Splitting:** Ứng dụng áp dụng xuất sắc `React.lazy()` và `Suspense` trong `App.tsx` giúp chia nhỏ gói bundle, tối ưu hóa triệt để hiệu suất tải trang ban đầu (Initial Load Time).
- **TypeScript:** Định nghĩa Interface/Type (như `Product`, `CartItem`, `User`) rất rõ ràng. Nó mang lại sự an toàn tuyệt đối khi truy xuất dữ liệu từ PocketBase.

**Styling & UI/UX:**
- **CSS Thuần (Vanilla CSS):** Không lạm dụng thư viện UI nặng nề, dự án ưu tiên CSS thuần kết hợp CSS Variables (`--primary`, `--secondary`,...). Điều này cho thấy khả năng làm chủ Flexbox và CSS Grid rất tốt của nhà phát triển.
- **Khả năng tương thích (Responsive):** Kỹ thuật chuyển đổi giao diện từ Sidebar (Desktop) sang Bottom Navigation Bar (Mobile) bằng media queries là một điểm sáng nổi bật về UX. Các sự cố tinh vi như thanh cuộn kép hay header bám dính (sticky) đều đã được xử lý triệt để.

**Giao tiếp Backend (PocketBase):**
- Mã nguồn khởi tạo SDK PocketBase đúng cách qua Singleton pattern (`services/pocketbase.ts`). 
- **Điểm có thể cải thiện (Recommendation):** Hiện tại một số lời gọi API `.getFullList()` đang nằm trực tiếp trong `useEffect` của `Shop.tsx`. Để tối ưu hơn theo nguyên lý SOLID, chúng ta có thể tách riêng các truy vấn này vào một module `productService.ts` riêng biệt trong tương lai.
