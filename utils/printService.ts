import { Order } from '../types';

// Helper: Format tiền tệ VNĐ chuẩn
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Helper: Format ngày giờ
const formatDate = (dateString?: string) => {
  const date = dateString ? new Date(dateString) : new Date();
  return date.toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

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

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  }
};

// --- HÓA ĐƠN TEST ---
export const printTestTicket = () => {
  const content = `
    <html>
      <head>
        <style>
          body { font-family: 'Courier New', monospace; width: 72mm; margin: 0; padding: 5px; font-size: 12px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 16px; margin-bottom: 5px;">KẾT NỐI THÀNH CÔNG</div>
        <div class="center">----------------</div>
        <div class="center">Máy in đã sẵn sàng hoạt động!</div>
        <div class="center">${new Date().toLocaleString('vi-VN')}</div>
      </body>
    </html>
  `;
  printHTML(content);
};

// --- HÓA ĐƠN BAR / BẾP (Mới thêm) ---
export const printBarTicket = (
  orderId: string,
  type: 'Dine-in' | 'Takeaway',
  tableName: string,
  items: { item: { name: string }; qty: number }[]
) => {
  const itemsHtml = items.map(i => `
    <div style="display: flex; align-items: flex-start; margin-bottom: 8px; border-bottom: 1px dashed #eee; padding-bottom: 4px;">
        <div style="width: 15%; font-weight: 900; font-size: 16px; text-align: center;">${i.qty}</div>
        <div style="width: 85%; font-weight: 600; line-height: 1.2;">${i.item.name}</div>
    </div>
  `).join('');

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: 72mm auto; margin: 0; }
          body { 
            font-family: 'Consolas', monospace;
            width: 72mm; 
            margin: 0 auto; 
            padding: 5px; 
            color: #000;
            font-size: 14px; 
          }
          .header { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 5px; }
          .title { font-size: 20px; font-weight: 900; text-transform: uppercase; display: block; }
          .time { font-size: 12px; font-style: italic; }
          
          .meta { margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 5px; }
          .table-name { font-size: 22px; font-weight: 900; display: block; margin-bottom: 4px; }
          .order-id { font-size: 12px; }

          .footer { margin-top: 15px; text-align: center; font-size: 12px; border-top: 1px dashed #000; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="title">PHIẾU CHẾ BIẾN</span>
          <span class="time">${new Date().toLocaleString('vi-VN')}</span>
        </div>
        
        <div class="meta">
          <span class="table-name">
            ${type === 'Takeaway' ? '🥡 MANG VỀ' : `🍽️ BÀN: ${tableName}`}
          </span>
          <span class="order-id">Mã đơn: ${orderId}</span>
        </div>
        
        <div class="items">
            ${itemsHtml}
        </div>

        <div class="footer">
          --- Bar / Bếp ---
        </div>
      </body>
    </html>
  `;

  printHTML(content);
};

// --- HÓA ĐƠN THANH TOÁN (Layout Hiện đại) ---
export const printOrderReceipt = (order: any) => {
  if (!order) return;

  const total = order.total || 0;
  
  // Thông tin cấu hình
  const config = {
      storeName: "THONG DONG F&B",
      address: "27 tổ 4 Đông Anh, Hà Nội",
      wifiName: "Thong Dong F&B",
      wifiPass: "67896789",
      footerMessage: "Cảm ơn & Hẹn gặp lại!"
  };

  // Tạo danh sách món ăn
  const itemsHtml = order.items.map((item: any) => `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
        <div style="width: 55%; font-weight: 600;">${item.name}</div>
        <div style="width: 15%; text-align: center;">x${item.quantity}</div>
        <div style="width: 30%; text-align: right;">${formatMoney(item.price * item.quantity)}</div>
    </div>
  `).join('');

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: 72mm auto; margin: 0; }
          body { 
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace; /* Font monospace đẹp */
            width: 72mm; 
            margin: 0 auto; 
            padding: 5px; 
            background: white;
            color: black;
            font-size: 12px; 
            line-height: 1.4;
          }
          
          /* Utility Classes */
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          
          /* Sections */
          .header { margin-bottom: 10px; }
          .store-name { font-size: 20px; font-weight: 900; letter-spacing: 1px; margin-bottom: 4px; }
          .store-info { font-size: 11px; color: #333; }
          
          .divider { 
             border-top: 1px dashed #000; 
             margin: 8px 0; 
             display: block;
          }
          
          .bill-details { margin-bottom: 10px; font-size: 11px; }
          .flex-row { display: flex; justify-content: space-between; }
          
          .items-container { margin: 10px 0; }
          
          .totals { font-size: 13px; margin-top: 10px; }
          .grand-total { font-size: 18px; font-weight: 900; margin-top: 5px; }
          
          .wifi-box {
             border: 2px solid #000;
             border-radius: 8px;
             padding: 8px;
             margin: 15px 0;
             text-align: center;
             font-size: 11px;
          }
          
          .footer { margin-top: 20px; font-style: italic; font-size: 11px; }
        </style>
      </head>
      <body>
        
        <div class="header text-center">
            <div class="store-name">${config.storeName}</div>
            <div class="store-info">${config.address}</div>
            <div class="store-info">Hotline: 0966.742.573 - 0981.110.666</div> 
        </div>

        <div class="divider"></div>

        <div class="bill-details">
            <div class="flex-row">
                <span>Số phiếu: <strong>#${order.id.toString().slice(-6)}</strong></span>
                <span>${formatDate(order.created_at)}</span>
            </div>
            <div class="flex-row" style="margin-top: 4px;">
                <span>Bàn: <strong>${order.table}</strong></span>
                <span>NV: ${order.staff}</span>
            </div>
        </div>

        <div class="divider"></div>

        <div style="display: flex; font-weight: bold; font-size: 11px; margin-bottom: 5px; text-transform: uppercase;">
            <div style="width: 55%;">Tên món</div>
            <div style="width: 15%; text-align: center;">SL</div>
            <div style="width: 30%; text-align: right;">T.Tiền</div>
        </div>

        <div class="items-container">
            ${itemsHtml}
        </div>

        <div class="divider"></div>

        <div class="totals">
            <div class="flex-row">
                <span>Tổng cộng:</span>
                <span class="font-bold">${formatMoney(total)}</span>
            </div>
            <div class="flex-row" style="margin-top: 2px;">
                <span>Thanh toán (${order.payment_method || 'Cash'}):</span>
                <span class="grand-total">${formatMoney(total)}</span>
            </div>
        </div>

        <div class="wifi-box">
            <div class="font-bold uppercase" style="margin-bottom: 2px;">WI-FI FREE</div>
            <div>ID: <strong>${config.wifiName}</strong></div>
            <div>Pass: <strong>${config.wifiPass}</strong></div>
        </div>

        <div class="footer text-center">
            <div>${config.footerMessage}</div>
            <div style="font-size: 10px; margin-top: 5px;">Powered by ThongDong POS</div>
        </div>

      </body>
    </html>
  `;

  printHTML(content);
};
