# Đặc tả Website

## Tech Stack

- NextJS
- Shadcn
- Supabase

## I. Tính năng Cốt Lõi

### 1. Hệ thống Xác thực

- Đăng nhập qua Google OAuth
- Bảo vệ route với AuthGuard
- Quản lý phiên làm việc sử dụng Supabase Auth

### 2. Quản lý Series

- Tạo series mới
- Liệt kê series của người dùng
- Chức năng xóa series
- Xem chi tiết series
- Chỉnh sửa thông tin series (tiêu đề, mô tả)
- Phân loại/gắn thẻ series
- Trạng thái series (nháp, đã xuất bản, hoàn thành)
- Quyền riêng tư series (công khai/riêng tư)
- Chia sẻ series
- Xóa hàng loạt series

### 3. Quản lý Episode

- Episode được liên kết với series
- Sắp xếp Episode theo thứ tự
- Quản lý nội dung Episode
- Xem chi tiết Episode
- Xóa theo tầng (khi series bị xóa)

### 4. Tích hợp AI

- Tạo series bằng AI
- Tạo nội dung Episode
- Hiển thị tiến trình tạo nội dung
- Tích hợp với Deepseek API

## II. Giao diện Người dùng

### 1. Components UI

- Giao diện responsive
- Trạng thái đang tải
- Xử lý lỗi
- Thông báo toast
- Xác nhận qua dialog
- Hiển thị nội dung Markdown
- Chỉ báo tiến trình

### 2. Điều hướng

- Route được bảo vệ trong nhóm (auth)
- Chuyển hướng đăng nhập
- Trang danh sách series
- Trang chi tiết series
- Trang chi tiết tập

### 3. Quản lý Nội dung

- Trình soạn thảo văn bản phong phú
- Tải lên/quản lý hình ảnh
- Thư viện media
- Sao lưu nội dung
- Chức năng Nhập/Xuất
- Tự động lưu bản nháp
- Lên lịch nội dung

## III. Cơ sở Dữ liệu & Bảo mật

### 1. Cấu trúc Database

- Bảng series với quyền sở hữu người dùng
- Bảng tập với quan hệ series
- Ràng buộc khóa ngoại
- Timestamps cho created_at
- UUID cho khóa chính

### 2. Tính năng Bảo mật

- Bảo mật theo hàng (RLS)
- Kiểm soát truy cập theo người dùng
- Bảo vệ route API
- Xử lý cookie an toàn
- Xác thực phía server

## IV. Tính năng Xã hội & Tương tác

### 1. Tính năng Xã hội

- Hệ thống bình luận
- Chức năng chia sẻ
- Tính năng Thích/Lưu
- Theo dõi người dùng
- Feed hoạt động
- Hồ sơ công khai

### 2. Phân tích & Thống kê

- Thống kê lượt xem
- Ước tính thời gian đọc
- Số liệu tương tác nội dung
- Phân tích hành vi người dùng
- Thống kê sử dụng AI
- Số liệu hiệu suất

### 3. Tìm kiếm & Lọc

- Tìm kiếm toàn văn
- Lọc nâng cao
- Tùy chọn sắp xếp
- Lọc theo thẻ/danh mục
- Lọc theo khoảng thời gian
- Lọc theo trạng thái

## V. Tích hợp n8n

### 1. Tự động hóa Tạo Nội dung

- Kích hoạt tự động tạo nội dung cho tập theo lịch
- Xử lý hàng loạt việc tạo nhiều tập
- Gửi thông báo khi nội dung sẵn sàng

### 2. Quản lý Series

- Tự động sao lưu dữ liệu series vào cloud
- Tạo phiên bản PDF/ePub của nội dung series
- Tạo tóm tắt nội dung để chia sẻ trên mạng xã hội

### 3. Tương tác Người dùng

- Gửi email thông báo cho:
  - Cập nhật series mới
  - Hoàn thành tạo nội dung
  - Cột mốc tương tác người dùng
  - Thông báo bình luận

### 4. Phân tích & Báo cáo

- Tạo báo cáo định kỳ về:
  - Series phổ biến nhất
  - Số liệu tương tác người dùng
  - Thống kê tạo nội dung
- Xuất dữ liệu ra bảng tính

### 5. Tích hợp Mạng xã hội

- Tự động chia sẻ series mới trên mạng xã hội
- Tạo xem trước cho mạng xã hội
- Lên lịch bài đăng quảng cáo

## VI. Tích hợp Supabase

- Supabase Storage cho Media (Tải lên hình ảnh series)
- Supabase Edge Functions cho Tác vụ nền (Xử lý dữ liệu series, tạo tóm tắt, v.v)
- Cập nhật Realtime (Cập nhật bình luận realtime)
- Tìm kiếm toàn văn (tìm kiếm series)
- Hàm Database (Lấy thống kê series: lượt xem, lượt thích, số bình luận, v.v)

## VII. Chiến lược Phát triển

### 1. Đối tượng Mục tiêu

- Người tạo nội dung
- Giáo viên/Giảng viên
- Nhà văn/Blogger
- Người tạo khóa học online
- Chủ doanh nghiệp nhỏ

### 2. Marketing Nội dung

- Bài viết blog về tạo nội dung AI
- Video hướng dẫn tạo series
- Nghiên cứu trường hợp người dùng thành công
- Bản tin tips hàng tuần

### 3. Mô hình Kinh doanh

- Freemium:
  - Basic: Tạo series miễn phí
  - Pro: Tính năng AI nâng cao
  - Enterprise: Giải pháp tùy chỉnh
- Chương trình giới thiệu

### 4. Chỉ số Theo dõi

- Tỷ lệ thu hút người dùng mới
- Tỷ lệ hoàn thành series
- Khối lượng tạo nội dung
- Chỉ số tương tác người dùng
- Thống kê chia sẻ/cộng tác

### 5. Growth Hacking

- Triển khai vòng lặp viral: Chia sẻ series để nhận thêm 5 lần tạo AI khi có người đăng ký!
- Chiến lược kích hoạt
- Tính năng giữ chân người dùng
- Hệ thống gamification
- Hệ thống credits


