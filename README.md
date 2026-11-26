# Bài thực hành 03 (N2) - Lập trình Web: Sổ Chi Tiêu Cá Nhân

- Họ và tên sinh viên: Ngô Thế Dương
- Mã số sinh viên: B25DCTV020

| Thư mục | Nội dung |
| --- | --- |
| `part-a-class/` | React Class Components, dữ liệu mẫu trong mã nguồn |
| `part-b-hooks/` | React Function Components, Hooks, REST API và giao diện sáng/tối |

## Cách chạy

Cài Node.js 22 trở lên. Mở terminal tại thư mục chứa README và chạy:

```sh
npm ci
npm run dev:a
```

Mở địa chỉ Vite in trên terminal, mặc định là `http://localhost:5173`. Mở terminal khác tại cùng thư mục để chạy Phần B:

```sh
npm run dev:b
```

Địa chỉ mặc định của Phần B là `http://localhost:5174`. Lệnh `npm run build` tạo thư mục `dist` trong mỗi phần.

## MockAPI cho Phần B

Phần B kết nối mặc định đến `https://6b07a4da58419b87a4387843.mockapi.io/expenses`. Dùng dữ liệu mẫu khi thao tác trên endpoint này. Các thay đổi được lưu trên MockAPI và dùng chung giữa các phiên chạy.

Nếu cần dùng resource riêng, làm theo các bước sau.

1. Tạo project trong MockAPI và tạo resource tên `expenses`.
2. Khai báo các trường `description` (chuỗi), `amount` (số nguyên dương), `category` (chuỗi) và `date` (chuỗi `YYYY-MM-DD`). MockAPI tự cấp `id`.
3. Nếu thêm dữ liệu mẫu, dùng một trong bốn giá trị `Ăn uống`, `Đi lại`, `Học tập` hoặc `Giải trí` cho `category`. Ví dụ một bản ghi gửi bằng POST:

   ```json
   {
     "description": "Cơm trưa",
     "amount": 45000,
     "category": "Ăn uống",
     "date": "2026-11-26"
   }
   ```

4. Sao chép `part-b-hooks/.env.example` thành `part-b-hooks/.env`. Gán URL đầy đủ của resource vào `VITE_MOCKAPI_URL` rồi khởi động lại Vite. Ví dụ về cấu trúc URL:

   ```dotenv
   VITE_MOCKAPI_URL=https://<project-id>.mockapi.io/api/v1/expenses
   ```

`useFetch` gọi GET và POST trên URL collection, rồi gọi DELETE trên URL có thêm `/id`. Giao diện hiển thị trạng thái tải, lỗi và nút **Thử lại** nếu tải danh sách thất bại. Để dùng REST API cục bộ có sẵn dữ liệu mẫu, đặt `VITE_MOCKAPI_URL=/api/expenses` trong `part-b-hooks/.env` và khởi động lại Vite. Phần A đặt lại dữ liệu khi tải lại trang. Chế độ dùng thử của Phần B đặt lại dữ liệu khi khởi động lại Vite.

## Cách dùng

Giao diện đặt tổng chi và thống kê theo loại ở đầu trang. Trên màn hình rộng, form nhập và danh sách nằm cạnh nhau. Trên điện thoại, các mục xếp dọc để dễ thao tác.

Nhập nội dung, số tiền nguyên dương bằng đồng, loại và ngày chi rồi bấm **Thêm khoản chi**. Bấm nút của từng loại để lọc và nhập nội dung cần tìm. Danh sách áp dụng tìm kiếm sau 300 ms. Dòng cuối danh sách tính các khoản đang hiển thị. Khung tổng chi, thống kê theo loại và tiêu đề tab tính trên toàn bộ danh sách. Nút **Xóa** mở hộp thoại xác nhận trước khi thay đổi dữ liệu.

Nút **Ẩn đồng hồ** gỡ đồng hồ khỏi giao diện để có thể quan sát vòng đời của bộ đếm. Khi hiện lại, đồng hồ bắt đầu cập nhật theo giờ hiện tại.

## Hooks giải quyết những gì trong bài?

| Tình huống | Class Component | Function Component + Hooks |
| --- | --- | --- |
| Đồng hồ và bộ hẹn giờ tìm kiếm | Class giữ ID bộ hẹn giờ và dọn chúng trong `componentWillUnmount`. | `useClock` và `useDebounce` đặt việc tạo và dọn bộ hẹn giờ trong cùng một effect. |
| Cập nhật tiêu đề tab | `componentDidMount` đặt tiêu đề ban đầu và `componentDidUpdate` kiểm tra danh sách có đổi hay không. | Effect phụ thuộc vào tổng chi và trạng thái tải nên chỉ cập nhật theo hai giá trị đó. |
| Tải và ghi dữ liệu | App của Phần A giữ danh sách mẫu trong state. | `useFetch` quản lý riêng các yêu cầu HTTP, hủy yêu cầu khi unmount và cập nhật danh sách sau phản hồi thành công. |
| Focus và giao diện | Phần A quản lý form trong state của Class. | `useRef` đưa con trỏ về ô nội dung sau khi thêm thành công và `useContext` cho Header đọc chế độ sáng/tối. |
