import { Order } from '../types';

// Helper: Format tiền tệ (đơn giản hóa để không phụ thuộc context)
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm cốt lõi: Tạo iframe và in nội dung HTML
const printHTML = (htmlContent: string) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Quan trọng: Đợi hình ảnh/font load xong mới in
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        // Xóa iframe sau khi in xong (để 1 lúc cho chắc)
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  }
};

// 1. IN TEST (Bạn đã test thành công cái này)
export const printTestTicket = () => {
  const content = `
    <html>
      <head>
        <style>
          body { font-family: monospace; width: 72mm; margin: 0; padding: 10px; font-size: 12px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 16px;">TEST PRINT</div>
        <div class="center">----------------</div>
        <div class="center">Printer Connection OK!</div>
        <div class="center">${new Date().toLocaleString()}</div>
      </body>
    </html>
  `;
  printHTML(content);
};

// 2. IN HÓA ĐƠN THẬT (Cần sửa lại cho chuẩn)
export const printOrderReceipt = (order: any) => {
  if (!order) return;

  // Lấy danh sách món
  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 2px 0;">${item.name} <br/> <span style="font-size: 10px; color: #555;">x${item.quantity}</span></td>
      <td style="text-align: right; vertical-align: top;">${formatMoney(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  // Tính toán
  const total = order.total || 0;
  
  // Thông tin quán (Có thể lấy từ localStorage như bài trước, ở đây mình hardcode ví dụ)
  const storeName = "RESPO POS";
  const address = "27 to 4 Dong Anh";

  const content = `
    <html>
      <head>
        <style>
          @page { size: 72mm auto; margin: 0; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: 72mm; 
            margin: 0; 
            padding: 5px; 
            font-size: 12px; 
            line-height: 1.2;
            color: black;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .divider { border-top: 1px dashed black; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; }
        </style>
      </head>
      <body>
        <div class="center bold large">${storeName}</div>
        <div class="center">${address}</div>
        <div class="divider"></div>
        
        <div>Order #: <span class="bold">${order.id}</span></div>
        <div>Date: ${new Date().toLocaleString()}</div>
        <div>Table: ${order.table}</div>
        <div>Staff: ${order.staff}</div>
        <div class="divider"></div>

        <table>
          ${itemsHtml}
        </table>
        <div class="divider"></div>

        <table style="font-size: 14px;">
          <tr>
            <td>Total:</td>
            <td class="right bold">${formatMoney(total)}</td>
          </tr>
          <tr>
            <td style="font-size: 11px;">Method:</td>
            <td class="right" style="font-size: 11px;">${order.payment_method || 'Cash'}</td>
          </tr>
        </table>
        <div class="divider"></div>

        <div class="center" style="margin-top: 10px;">Thank you & See you again!</div>
        <div class="center" style="font-size: 10px;">Wifi: RespoGuest / Pass: 123456</div>
      </body>
    </html>
  `;

  printHTML(content);
};
