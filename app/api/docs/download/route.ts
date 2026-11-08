import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'TAI_LIEU_KY_THUAT_HE_THONG_PMS.md');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Tệp tài liệu không tồn tại' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const format = request.nextUrl.searchParams.get('format');

    // Return HTML Print / PDF View
    if (format === 'html') {
      const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Cáo Kỹ Thuật Hệ Thống PMS Enterprise</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-light.min.css">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
    }
    .markdown-body {
      background: #ffffff;
      padding: 40px 48px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .toolbar {
      position: sticky;
      top: 20px;
      z-index: 100;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      padding: 12px 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
      border: none;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }
    @media print {
      body {
        padding: 0;
        background: white;
      }
      .toolbar {
        display: none !important;
      }
      .markdown-body {
        box-shadow: none;
        border: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <strong style="color: #0f172a; font-size: 14px;">Tài Liệu Kỹ Thuật PMS Enterprise</strong>
      <span style="color: #64748b; font-size: 12px; margin-left: 8px;">Phiên bản 1.0 (Sprint 1)</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <a href="/api/docs/download" class="btn btn-secondary">
        ⬇️ Tải file Markdown (.md)
      </a>
      <button onclick="window.print()" class="btn btn-primary">
        🖨️ In / Lưu thành PDF
      </button>
    </div>
  </div>

  <article class="markdown-body" id="content">
    <div style="text-align: center; color: #64748b; padding: 40px;">Đang biên dịch nội dung tài liệu...</div>
  </article>

  <script>
    const rawMarkdown = ${JSON.stringify(fileContent)};
    document.getElementById('content').innerHTML = marked.parse(rawMarkdown);
  </script>
</body>
</html>`;

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // Default: Return Markdown File Download
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="TAI_LIEU_KY_THUAT_HE_THONG_PMS.md"',
      },
    });
  } catch (error) {
    console.error('Lỗi khi tải tài liệu:', error);
    return NextResponse.json({ error: 'Lỗi tải tệp tài liệu' }, { status: 500 });
  }
}
