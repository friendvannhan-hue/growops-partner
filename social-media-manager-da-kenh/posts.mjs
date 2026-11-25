// Only owner-supplied portfolio artwork. No inferred client or performance data.
const frame = (box, label) => ({ box, label });
const sourceNote = 'Thiết kế do chủ website cung cấp.';
const campaignNote = 'Tư liệu thiết kế chiến dịch đã thực hiện. Thông tin trong ảnh không phải ưu đãi hiện hành.';
const osen = { brand: 'Osen Hotel', brandKey: 'osen', channel: 'facebook', sourceNote };
const ls2 = { brand: 'LS2 Vietnam', brandKey: 'ls2', channel: 'facebook', sourceNote };
const fashion = { brand: 'Thời trang', brandKey: 'fashion', channel: 'design', sourceNote, kind: 'image', width: 1536, height: 2048, cover: '0 0 1536 2048' };

export const posts = [
  { ...osen, id: 'osen-new-chapter', kind: 'album', title: 'A new kind of comfort.', category: 'Nhận diện & không gian',
    caption: 'Bộ thiết kế giới thiệu một chương mới của Osen Hotel. Tông kem, xanh trầm và nhịp chữ lớn kết nối những góc nghỉ ngơi thành một câu chuyện xuyên suốt.',
    alt: 'Bộ năm thiết kế không gian Osen Hotel, chữ serif xanh đậm trên nền kem.', image: 'assets/osen-new-chapter.webp', width: 1366, height: 1318, cover: '0 177 1356 1133',
    frames: [frame('0 177 673 678', 'For the stay lovers'), frame('678 177 677 678', 'A new kind of comfort'), frame('0 860 447 450', 'A space to slow down'), frame('452 860 449 450', 'The art of feeling at home'), frame('906 860 449 450', 'More room for more moments')] },
  { ...ls2, id: 'ls2-opening-ticket', kind: 'image', title: 'Hẹn anh em khai trương.', category: 'Thiết kế chiến dịch',
    caption: 'Poster khai trương LS2 Store tại 237 Hồng Bàng. Bố cục lấy cảm hứng từ vé sự kiện, kết hợp sắc đỏ thương hiệu và ảnh không gian cửa hàng.',
    alt: 'Poster LS2 khai trương với thiết kế vé đỏ và kem, chữ lớn và ảnh cửa hàng.', image: 'assets/ls2-opening-ticket.webp', width: 1122, height: 1402, cover: '0 0 1122 1402', sourceNote: campaignNote },
  { ...fashion, id: 'fashion-knit-palette', title: 'Một thiết kế. Ba sắc thái.', category: 'Fashion editorial',
    caption: 'Bố cục ba khung hình đặt cạnh nhau, làm nổi bật sắc độ xanh nhạt, nâu và vàng kem trên cùng một tinh thần hình ảnh.',
    alt: 'Thiết kế thời trang ba khung, người mẫu trong trang phục xanh, nâu và vàng kem.', image: 'assets/fashion-knit-palette.webp' },
  { ...osen, id: 'osen-comfort', kind: 'image', title: 'Không gian nghỉ dưỡng tiện nghi.', category: 'Nội dung trải nghiệm',
    caption: 'Thiết kế giới thiệu không gian Osen Hotel Phú Quốc. Hình ảnh căn phòng, hệ chữ và đường cong ánh vàng tạo cảm giác ấm áp, thư thái.',
    alt: 'Thiết kế Osen Hotel với hai giường trắng, cửa sổ lớn và chữ không gian nghỉ dưỡng tiện nghi.', image: 'assets/osen-comfort.webp', width: 1352, height: 1644, cover: '41 191 1258 1257' },
  { ...ls2, id: 'ls2-carbon', kind: 'album', title: 'Chất riêng trên từng cung đường.', category: 'Hình ảnh thương hiệu',
    caption: 'Bộ hình LS2 với bề mặt carbon và các góc nhìn cận cảnh. Nền tối và ánh sáng có chủ đích giữ sự tập trung vào chất liệu và đường nét.',
    alt: 'Bộ năm hình mũ bảo hiểm LS2 carbon trên nền tối.', image: 'assets/ls2-carbon.webp', width: 1364, height: 1320, cover: '3 190 1361 1130',
    frames: [frame('24 190 657 677', 'LS2 carbon — góc chính diện'), frame('706 190 658 677', 'LS2 carbon — góc nghiêng'), frame('4 872 451 448', 'LS2 carbon — góc bên'), frame('460 872 448 448', 'LS2 carbon — phía sau'), frame('915 872 449 448', 'LS2 carbon — chi tiết đường nét')] },
  { ...fashion, id: 'fashion-black-dress', title: 'Tối giản để nổi bật.', category: 'Portrait & styling',
    caption: 'Hai góc nhìn trong cùng một bố cục: toàn thân và chân dung. Sắc đen cùng nền trung tính tạo nhịp hình ảnh gọn, tập trung vào thần thái.',
    alt: 'Bố cục hai ảnh người mẫu trong váy đen, một ảnh toàn thân và một ảnh chân dung.', image: 'assets/fashion-black-dress.webp' },
  { ...osen, id: 'osen-spa', kind: 'album', title: 'Một hành trình thư giãn mới.', category: 'Không gian & trải nghiệm',
    caption: 'OSEN SPA — A NEW JOURNEY OF RELAXATION.\n\nBộ thiết kế giới thiệu Osen Spa tại Grand World, Phú Quốc. Tông vàng ấm và xanh olive kết nối không gian thư giãn với câu chuyện thương hiệu.',
    alt: 'Bộ bốn thiết kế Osen Spa với không gian chăm sóc sức khỏe, tông vàng ấm và xanh olive.', image: 'assets/osen-spa.webp', width: 1088, height: 1512, cover: '0 429 1088 1083',
    frames: [frame('0 429 720 1083', 'Thư giãn hôm nay, năng lượng ngày mai'), frame('721 429 367 363', 'Osen Spa — thư giãn trọn vẹn'), frame('721 792 367 363', 'Tái tạo năng lượng'), frame('721 1155 367 357', 'Osen Spa — nơi thanh lọc thân tâm')] },
  { ...ls2, id: 'ls2-opening-store', kind: 'image', title: 'Điểm hẹn mới: 237 Hồng Bàng.', category: 'Thiết kế sự kiện',
    caption: 'Poster giới thiệu điểm hẹn LS2 Store. Hệ chữ đậm, đường chéo và tương phản đỏ — trắng tiếp nối ngôn ngữ nhận diện của thương hiệu.',
    alt: 'Poster LS2 với chữ 237 Hồng Bàng lớn và mặt tiền cửa hàng sáng đèn đỏ.', image: 'assets/ls2-opening-store.webp', width: 1122, height: 1402, cover: '0 0 1122 1402', sourceNote: campaignNote },
  { ...fashion, id: 'fashion-knit-editorial', title: 'Nhịp hình ảnh đồng điệu.', category: 'Fashion editorial',
    caption: 'Thiết kế hai khung hình với sắc nâu ấm và denim. Cùng một bối cảnh, hai dáng chụp tạo sự liền mạch cho câu chuyện hình ảnh.',
    alt: 'Hai khung ảnh người mẫu mặc áo len nâu và quần jeans trên nền sáng.', image: 'assets/fashion-knit-editorial.webp' },
  { ...osen, id: 'osen-bucket-list', kind: 'image', title: 'Phú Quốc trong danh sách phải đến.', category: 'Cảm hứng du lịch',
    caption: 'Thiết kế nội dung du lịch cho Osen Hotel. Sắc xanh biển, nền kem và điểm nhấn cam gợi mở một hành trình khám phá Phú Quốc.',
    alt: 'Thiết kế Why Phu Quoc should be on your Bucket List với bãi biển, hàng dừa và khách du lịch.', image: 'assets/osen-bucket-list.webp', width: 1350, height: 1438, cover: '163 180 1006 1257' },
  { ...ls2, id: 'ls2-store-campaign', kind: 'album', title: 'Một chiến dịch. Nhiều điểm chạm.', category: 'Thiết kế chiến dịch',
    caption: 'Bộ hình truyền thông sự kiện tại LS2 Store: thiết kế chủ đạo kết hợp không gian cửa hàng và các chi tiết trưng bày.',
    alt: 'Bộ bốn hình truyền thông LS2 với thiết kế sự kiện đỏ và ảnh không gian cửa hàng.', image: 'assets/ls2-store-campaign.webp', width: 1362, height: 1628, cover: '1 272 1361 1356', sourceNote: campaignNote,
    frames: [frame('1 272 679 677', 'LS2 — thiết kế chủ đạo của chiến dịch'), frame('685 272 677 677', 'LS2 — không gian cửa hàng'), frame('1 953 679 675', 'LS2 — góc trưng bày trang phục'), frame('685 953 677 675', 'LS2 — góc trưng bày phụ kiện')] },
  { ...fashion, id: 'fashion-outdoor', title: 'Từ chi tiết đến chuyển động.', category: 'Lifestyle & outdoor',
    caption: 'Bố cục nối góc cận chất liệu với khoảnh khắc ngoài trời. Tông xanh olive giữ sự thống nhất giữa hai nhịp hình ảnh.',
    alt: 'Thiết kế hai khung ảnh áo khoác xanh olive: cận cảnh và người mẫu ngoài trời.', image: 'assets/fashion-outdoor.webp' },
  { ...osen, id: 'osen-family', kind: 'album', title: 'Trọn vẹn những khoảnh khắc.', category: 'Không gian & trải nghiệm',
    caption: 'Bộ thiết kế về không gian nghỉ ngơi và những chi tiết nhỏ tại Osen Hotel. Chữ, màu và ảnh được kết nối để giữ cùng một cảm giác thương hiệu.',
    alt: 'Album Osen Hotel về phòng gia đình, khăn, tiện nghi và khu vực đón tiếp.', image: 'assets/osen-family.webp', width: 1362, height: 1364, cover: '0 227 1362 1135',
    sourceNote: 'Năm khung hiển thị từ ảnh bài đăng do chủ website cung cấp. Ký hiệu +6 thuộc ảnh chụp gốc.',
    frames: [frame('0 227 678 679', 'Osen — không gian phòng gia đình'), frame('682 227 678 679', 'Osen — nghỉ ngơi trọn vẹn'), frame('0 910 450 452', 'Osen — a room to rest'), frame('455 910 450 452', 'Osen — những điều nhỏ tạo nên trải nghiệm'), frame('910 910 450 452', 'Osen — khu vực đón tiếp trong ảnh bài đăng')] },
  { ...fashion, id: 'fashion-detail', title: 'Chi tiết làm nên tổng thể.', category: 'Visual composition',
    caption: 'Thiết kế kết hợp cận cảnh chất liệu, ảnh toàn thân và khoảng trắng biên tập trong cùng một bố cục.',
    alt: 'Thiết kế thời trang kết hợp ảnh chi tiết áo khoác xanh, người mẫu và mảng chữ biên tập.', image: 'assets/fashion-detail.webp' },
  { ...osen, id: 'osen-phu-quoc', kind: 'image', title: 'Khám phá đảo ngọc.', category: 'Cảm hứng du lịch',
    caption: 'Thiết kế collage về Phú Quốc: nhiều điểm đến và trải nghiệm được kết nối bằng hệ chữ lớn, nét vẽ và sắc vàng nắng.',
    alt: 'Poster collage khám phá Phú Quốc với cáp treo, biển, đảo và các điểm đến.', image: 'assets/osen-phu-quoc.webp', width: 1358, height: 1476, cover: '175 217 1006 1259' },
];

export const channelNames = { facebook: 'Facebook', design: 'Thiết kế hình ảnh' };

export function normalizeSearch(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

export function selectPosts(items, { query = '', brand = 'all', kind = 'all', channel = 'all', savedOnly = false, saved = [] } = {}) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  const savedIds = new Set(saved);
  return items.filter((post) => (
    (brand === 'all' || post.brandKey === brand) &&
    (kind === 'all' || post.kind === kind) &&
    (channel === 'all' || post.channel === channel) &&
    (!savedOnly || savedIds.has(post.id)) &&
    terms.every(term => normalizeSearch([post.brand, post.title, post.category, post.caption, channelNames[post.channel]].join(' ')).includes(term))
  ));
}

export function readSaved(raw, allowedIds) {
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const allowed = new Set(allowedIds);
    return [...new Set(value.filter(id => typeof id === 'string' && allowed.has(id)))];
  } catch { return []; }
}

export function toggleSaved(saved, id, allowedIds) {
  if (!allowedIds.includes(id)) return [...saved];
  return saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
}
