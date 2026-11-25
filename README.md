# GrowOps Partner

Mã nguồn website GrowOps đang được công bố trên Cloudflare Workers và GitHub Pages.

- Website chính: https://growops-partner.quytbio.com/
- GitHub Pages: https://friendvannhan-hue.github.io/growops-partner/

Đồng bộ bản đã duyệt ngày 25/11/2026, gồm định vị AI, 14 thương hiệu, 6 năng lực, cụm CDP, lộ trình đồng hành, trang dịch vụ và Social. Các mục chi tiết được mở sẵn theo yêu cầu của anh (xác nhận lại 25/11/2026).

## Cấu trúc

Website tĩnh HTML/CSS/JavaScript, không cần cài framework hoặc backend. Trang chủ ở `index.html`, dịch vụ ở `dich-vu/`, thư viện thiết kế ở `social-media-manager-da-kenh/`.

### Giao diện (từ 25/11/2026, nhịp tham khảo link.me)

Mỗi trang nạp đúng 3 file CSS theo thứ tự:

1. `tokens.css` — bảng màu, cỡ chữ, khoảng cách, bo góc. Đổi nhận diện thì sửa ở đây.
2. File gộp của trang: `home.css` (trang chủ), `dich-vu.css`, `social-page.css`. Đây là các file CSS cũ được gộp nguyên thứ tự và đổi màu sang bảng mới; hạn chế sửa trực tiếp.
3. `linkme.css` — lớp giao diện mới dùng chung (tiêu đề, nút, thẻ, header, chân trang, nút tư vấn dính đáy trên mobile). Chỉnh giao diện thì sửa ở đây.

`dock.mjs` điều khiển nút "Đặt lịch tư vấn qua Zalo" dính đáy trên điện thoại. Nguồn tham khảo giao diện ghi ở `docs/ui-import-log.md`.

GitHub Pages triển khai từ nhánh `main`, thư mục `/ (root)`. Các đường dẫn favicon dùng đường dẫn tương đối để hoạt động tại cả đường dẫn dự án `/growops-partner/` và gốc tên miền Workers. Open Graph giữ website Workers làm nguồn ảnh chia sẻ.

Repo `growops-partner-v2` là phiên bản gửi khách riêng và không bị thay thế bởi lần đồng bộ này.

## Chạy và kiểm tra

```sh
python3 -m http.server 4176
node --test tests/*.test.mjs
```

Các số liệu, giả định và minh họa giữ nguyên phạm vi và ghi chú nguồn trên website.
