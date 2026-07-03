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

## 6. Danh sách kiểm thử mở rộng (Extended Test Checklist)

### 6.1. Xác thực & Quản lý Phiên (Authentication & Session Management)
- [x] **Đăng nhập thành công (Mock & Real):** Nhập thông tin hợp lệ (ví dụ: `levanb`, `12345678`), đảm bảo trạng thái "Đang đăng nhập..." xuất hiện và chuyển hướng đến trang Shop thành công.
- [x] **Đăng nhập thất bại:** Nhập sai thông tin. Xác minh thông báo lỗi màu đỏ ("Tên đăng nhập hoặc mật khẩu không chính xác!") hiển thị ngay trên các ô input.
- [x] **Nút "Ghi nhớ đăng nhập" (Session vs Local Storage):**
  - Đã chọn (Check): Đăng nhập, đóng tab, mở lại và xác minh người dùng vẫn đang đăng nhập (sử dụng `localStorage`).
  - Không chọn (Uncheck): Đăng nhập, đóng tab, mở lại và xác minh người dùng bị văng ra màn hình login (sử dụng `sessionStorage`).
- [x] **Luồng Đăng xuất (Logout Flow):** Chuyển đến menu profile, nhấn "Đăng xuất" và xác minh trạng thái Redux đã bị xóa. Trình duyệt không thể dùng nút "Back" để quay lại trang shop (tránh lỗ hổng bảo mật).

### 6.2. Quản lý Hồ sơ (Profile Management)
- [x] **Render Lần đầu:** Truy cập `/profile`. Xác minh các trường dữ liệu được điền tự động theo trạng thái mặc định của Redux (ví dụ: Lê Văn B, levanb@gmail.com).
- [x] **Cập nhật Hồ sơ:** Thay đổi số điện thoại hoặc địa chỉ, lưu form và xác minh dữ liệu mới vẫn tồn tại sau khi refresh trang (thông qua `localStorage.setItem('profileData', ...)`).
- [x] **Xử lý JSON không hợp lệ:** Mô phỏng dữ liệu hỏng bằng cách set `profileData` thành `{invalid-json` trong DevTools. Làm mới trang và đảm bảo ứng dụng chuyển về profile mặc định mà không bị sập (crash).

### 6.3. Cửa hàng & Bộ lọc (Shop & Product Filtering)
- [x] **Bố cục dạng lưới tương thích (Responsive Grid Layout):**
  - Desktop (w > 1200px): Lưới nhiều cột với thẻ sản phẩm lớn.
  - Mobile (w <= 1200px): Thu gọn về 1 cột và tự động tính toán số hàng bằng thuật toán toán học.
- [x] **Tìm kiếm với Debounce (Debounced Search):** Gõ liên tục vào ô tìm kiếm và xác minh danh sách sản phẩm chỉ cập nhật SAU KHI bạn ngừng gõ một khoảng thời gian (debounce delay).
- [x] **Edge Cases cho Bộ lọc (Filter Dropdown):**
  - Cài đặt Giá tối thiểu (minPrice) cao hơn Giá tối đa (maxPrice). Xác minh ứng dụng tự động sửa maxPrice bằng với minPrice.
  - Nhấp ra ngoài vùng dropdown và xác minh nó tự động đóng lại (nhờ `useRef` outside click handler).
- [x] **Trạng thái Trống (Empty State):** Tìm kiếm chuỗi không tồn tại (ví dụ: `zzxy123`). Xác minh thông báo "Không tìm thấy sản phẩm nào" hiển thị chuẩn.
- [x] **Giữ phân trang an toàn (Pagination Persistence):** Ở trang 2, gõ từ khóa tìm kiếm. Xác minh `Shop.tsx` tự động reset về Trang 1 để tránh lỗi hiển thị trang trống vô lý.

### 6.4. Chi tiết Sản phẩm (Product Details)
- [x] **Hình ảnh dự phòng (Image Fallback):** Xóa đường dẫn ảnh, xác minh thuộc tính `onError` tự động chuyển ảnh hỏng thành ảnh mặc định `/samsung_a31.png`.
- [x] **Chọn màu sắc (Color Selection Variants):**
  - Nhấp vào các hình thu nhỏ (ColorThumbnails) và xác minh màu đã chọn (selectedColor) được cập nhật trên giao diện.
  - Nhấn "Thêm vào giỏ hàng" và xác minh thông báo Toast hiện lên đúng biến thể màu vừa chọn.
- [x] **Toast Debounce:** Nhấn liên tục "Thêm vào giỏ hàng" 5 lần. Xác minh bộ đếm thời gian của Toast tự khởi động lại chứ không sinh ra 5 thông báo đè lên nhau.

### 6.5. Quản lý Giỏ hàng (Cart Management)
- [x] **Giao diện Trống (Empty Cart View):** Hiển thị màn hình "Giỏ hàng của bạn đang trống" nếu không có sản phẩm.
- [x] **Thêm và Gộp sản phẩm (Add & Deduplicate):**
  - Thêm một biến thể sản phẩm 2 lần. Xác minh số lượng tăng lên 2 thay vì sinh ra 2 dòng.
  - Thêm cùng sản phẩm nhưng khác màu. Xác minh nó sinh ra 2 dòng sản phẩm riêng biệt nhờ phân biệt bằng `variantId`.
- [x] **Điều chỉnh Số lượng (Quantity Adjustments):**
  - Tăng số lượng (+). Xác minh Tạm tính, Thuế, và Tổng tiền được tính toán lại ngay lập tức nhờ `useMemo`.
  - Giảm số lượng (-) xuống mức 1. Nhấn nút trừ lần nữa phải vô hiệu hóa hoặc hiện xác nhận xóa (không cho xuống 0).
- [x] **Xóa sản phẩm (Deletion Flow):** Nhấn icon Thùng rác. Hiện hộp thoại xác nhận. Nhấn "Đồng ý" và xác minh sản phẩm bay khỏi danh sách, tính toán tiền gộp lại chuẩn xác.
- [x] **Đồng bộ Database (Database Sync):** Kiểm tra xem những thay đổi trong Context có được lưu lên backend `pb.collection('carts').update` khi chạy PocketBase thật hay không.

### 6.6. Giao diện & Độ chịu tải UI (Visual & UI Tolerances)
- [x] **Xuống dòng dài (Long Text Wrapping):** Kiểm tra tên sản phẩm hoặc mô tả cực kỳ dài. Đảm bảo text được cắt bằng dấu chấm lửng `...` chứ không phá vỡ giao diện Flexbox.
- [x] **Đánh giá Sao (Star Rating Math):** Thuật toán hiển thị số sao (ví dụ: 4.5 sao) sẽ render 4 sao đầy và 1 sao bị cắt đôi một cách chính xác dựa trên logic `fillPercent`.

### 6.7. Kiểm thử Tự động & Chất lượng Code (Automated Tests & Code Quality)
- [x] **Vitest:** Chạy `npx vitest run` và đảm bảo toàn bộ các bài test đi qua mượt mà.
- [x] **ESLint & TS:** `npm run lint` sạch bóng lỗi cảnh báo, không còn dính `require()` trong môi trường ES Modules.
- [x] **Tích hợp Backend:** Endpoint `127.0.0.1:8090` hoạt động trơn tru. Có thông báo fallback logic rõ ràng khi backend đứt mạng.

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
