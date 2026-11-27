# JLPT N1 Vocabulary Studio

Trang web tĩnh để học và luyện từ vựng JLPT N1 (4601 từ từ 4 cuốn sách). Không cần build, không cần server riêng hay API.

## Cấu trúc

```
index.html          giao diện
assets/style.css    giao diện (CSS)
assets/app.js       toàn bộ logic: đọc CSV, học từ, tạo đề, chấm điểm, lưu từ sai
data/vocab.csv      dữ liệu duy nhất (từ vựng + dữ liệu câu hỏi)
```

## Chức năng

- **Học từ:** lọc theo sách, bài, loại từ, số sao ★; tìm kiếm theo Kanji, kana hoặc nghĩa Việt/Anh; nghe phát âm; nút VI/EN đổi ngôn ngữ.
- **Luyện đề N1:** chọn một hay nhiều bài, một hay nhiều sách. Câu hỏi theo đúng 4 dạng của phần từ vựng N1:
  - 問題1 漢字読み: đọc từ gạch chân. Đáp án nhiễu là các kiểu đọc sai hay gặp trong đề thật (trường âm, âm đục/âm trong, っ, ゃゅょ).
  - 問題2 文脈規定: điền từ vào chỗ trống. Đáp án nhiễu là từ cùng loại, cùng dạng chia.
  - 問題3 言い換え類義: chọn từ gần nghĩa với từ gạch chân.
  - 問題4 用法: chọn câu dùng từ đúng. Ba câu còn lại dùng từ sai ngữ cảnh.
  - "Đề chuẩn N1" lấy đúng tỷ lệ 6–7–6–6 câu như đề thật.
  - Hai chế độ: luyện tập (chấm và giải thích ngay từng câu) hoặc thi thử (chấm khi hết bài).
- **Ôn từ sai:** từ trả lời sai được lưu trong trình duyệt (localStorage); có thể luyện lại, tải CSV hoặc xóa.

## Chạy thử trên máy

Trang đọc `data/vocab.csv` bằng `fetch`, nên phải mở qua một web server (mở thẳng file `index.html` sẽ không tải được dữ liệu):

```
npx serve .
```
hoặc
```
python -m http.server 8000
```

## Đưa lên GitHub và deploy Vercel

1. Tạo repository mới trên GitHub và tải toàn bộ thư mục này lên (giữ nguyên cấu trúc).
2. Vào Vercel → **Add New… → Project** → chọn repository đó.
3. Framework Preset: **Other**. Để trống Build Command và Output Directory.
4. Bấm **Deploy**.

## Các cột trong `data/vocab.csv`

| Cột | Ý nghĩa |
|---|---|
| id | mã từ, dạng `b{sách}-l{bài}-{số}` |
| book, lesson | sách và bài nơi từ xuất hiện lần đầu |
| word, reading | từ và cách đọc |
| alt_spellings, alt_readings | cách viết / cách đọc khác (phân cách bằng ／) |
| importance | số sao ★ trong sách (0 = không có) |
| pos | loại từ: n, vs, v, adj-i, adj-na, adv, expr… |
| collocation | cụm từ gợi ý in trong sách |
| meaning_vi, meaning_en | nghĩa |
| explain_vi, explain_en | giải thích ngắn |
| synonym_ja | từ gần nghĩa tiếng Nhật |
| example_ja | câu ví dụ; từ cần học đặt trong 【】 |
| example_vi, example_en | bản dịch câu ví dụ |
| pdf_meaning_vi, ja_def_pdf | nghĩa tiếng Việt và giải nghĩa tiếng Nhật in trong sách |
| notes | ghi chú lỗi in đã sửa |
| also_in | các bài khác có từ này, dạng `sách-bài; …` |
| q_read | `đáp_án|lựa_chọn_sai:loại_bẫy;…` (dạng 問題1) |
| q_context | `từ_điền:id_từ_gốc;…` (đáp án nhiễu dạng 問題2) |
| q_paraphrase | `từ_gần_nghĩa:id_từ_gốc;…` (đáp án nhiễu dạng 問題3) |
| q_usage | `câu_dùng_sai::id_từ_gốc§…` (câu sai dạng 問題4) |

Nếu bạn sửa nghĩa hoặc ví dụ, chỉ cần sửa trong CSV rồi đẩy lại lên GitHub; Vercel sẽ tự cập nhật. Nếu để trống một cột `q_*`, từ đó chỉ đơn giản là không xuất hiện ở dạng câu hỏi tương ứng.

> Câu hỏi được sinh tự động theo cấu trúc đề N1. Đây là đề luyện, không phải đề thi chính thức.
