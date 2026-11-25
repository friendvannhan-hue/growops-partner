# GrowOps Partner

Mã nguồn website GrowOps đang được công bố trên Cloudflare Workers và GitHub Pages.

- Website chính: https://growops-partner.nhannv-working.workers.dev/
- GitHub Pages: https://friendvannhan-hue.github.io/growops-partner/

Đồng bộ bản đã duyệt ngày 25/11/2026, gồm định vị AI, 14 thương hiệu, 6 năng lực, cụm CDP, lộ trình đồng hành, trang dịch vụ và Social. Các mục thu gọn được mở sẵn theo yêu cầu.

## Cấu trúc

Website tĩnh HTML/CSS/JavaScript, không cần cài framework hoặc backend. Trang chủ ở `index.html`, dịch vụ ở `dich-vu/`, thư viện thiết kế ở `social-media-manager-da-kenh/`.

GitHub Pages triển khai từ nhánh `main`, thư mục `/ (root)`. Các đường dẫn favicon dùng đường dẫn tương đối để hoạt động tại cả đường dẫn dự án `/growops-partner/` và gốc tên miền Workers. Open Graph giữ website Workers làm nguồn ảnh chia sẻ.

Repo `growops-partner-v2` là phiên bản gửi khách riêng và không bị thay thế bởi lần đồng bộ này.

## Chạy và kiểm tra

```sh
python3 -m http.server 4176
node --test tests/*.test.mjs
```

Các số liệu, giả định và minh họa giữ nguyên phạm vi và ghi chú nguồn trên website.
