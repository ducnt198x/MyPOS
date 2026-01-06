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

// Helper: Encode UTF-8 string to Base64 (Safe for Vietnamese)
const utf8ToBase64 = (str: string) => {
  return window.btoa(unescape(encodeURIComponent(str)));
};

/**
 * Tạo nội dung HTML sạch cho hóa đơn (Tối ưu cho máy in nhiệt Thermal)
 */
const generateReceiptHTML = (order: any, paperSize: '58mm' | '80mm' = '80mm') => {
  const total = order.total || 0;
  
  // Thông tin cấu hình cơ bản
  const config = {
      storeName: "RESBAR POS SYSTEM",
      address: "27 tổ 4 Đông Anh, Hà Nội",
      wifiName: "ResBar_Guest",
      wifiPass: "67896789",
      footerMessage: "Cảm ơn & Hẹn gặp lại!"
  };

  // Đọc cấu hình ngân hàng từ localStorage
  const bankConfigStr = localStorage.getItem('bank_config');
  const bankConfig = bankConfigStr ? JSON.parse(bankConfigStr) : null;

  let qrHtml = '';
  if (bankConfig) {
    const qrUrl = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-compact2.png?amount=${total}&addInfo=${encodeURIComponent(order.id)}&accountName=${encodeURIComponent(bankConfig.accountName)}`;
    
    qrHtml = `
      <div class="divider"></div>
      <div class="text-center" style="margin-top: 10px;">
        <div class="font-bold uppercase text-normal" style="margin-bottom: 5px;">Quét mã để thanh toán</div>
        <img src="${qrUrl}" class="qr-image" />
        <div class="text-normal" style="margin-top: 5px;">
          <div><strong>${bankConfig.bankId}</strong></div>
          <div>STK: <strong>${bankConfig.accountNo}</strong></div>
          <div class="uppercase">${bankConfig.accountName}</div>
        </div>
      </div>
    `;
  }

  const itemsHtml = order.items.map((item: any) => `
    <tr>
        <td style="width: 55%; font-weight: 600;">${item.name}</td>
        <td style="width: 15%; text-align: center;">x${item.quantity || item.qty}</td>
        <td style="width: 30%; text-align: right;">${formatMoney(item.price * (item.quantity || item.qty))}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page { size: auto; margin: 0mm; }
          body { 
            margin: 0;
            padding: 5px;
            width: 100%;
            font-family: 'Courier New', monospace;
            background-color: #fff;
            color: #000;
            -webkit-print-color-adjust: exact;
          }
          .receipt-container { width: 100%; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          
          .text-normal { font-size: 16px; line-height: 1.4; }
          .text-header { font-size: 20px; font-weight: bold; text-align: center; }
          .text-large { font-size: 24px; font-weight: bold; }
          .text-small { font-size: 14px; color: #333; }

          .divider { border-top: 1px dashed #000; margin: 10px 0; height: 0; }
          
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th { text-align: left; border-bottom: 1px dashed #000; font-size: 14px; padding-bottom: 5px; }
          td { border-bottom: 1px dotted #ccc; padding: 6px 0; font-size: 16px; vertical-align: top; }
          
          .flex-row { display: flex; justify-content: space-between; align-items: baseline; }
          
          .qr-image {
            display: block;
            margin: 10px auto;
            width: 60%;
            height: auto;
            max-width: 200px;
            filter: grayscale(100%);
            -webkit-filter: grayscale(100%);
          }
          .grand-total-row { border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
            <div class="text-header uppercase">${config.storeName}</div>
            <div class="text-center text-small">${config.address}</div>
            
            <div class="divider"></div>
            
            <div class="text-normal">
                <div class="flex-row"><span>Số: <strong>#${order.id.toString().slice(-6)}</strong></span><span>${formatDate(order.created_at)}</span></div>
                <div class="flex-row"><span>Bàn: <strong>${order.table}</strong></span><span>NV: ${order.staff}</span></div>
            </div>
            
            <div class="divider"></div>
            
            <table>
                <thead>
                    <tr>
                        <th>MÓN</th>
                        <th style="text-align: center;">SL</th>
                        <th style="text-align: right;">T.TIỀN</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="text-normal">
                <div class="flex-row">
                    <span>Tổng cộng:</span>
                    <span class="font-bold">${formatMoney(total)}</span>
                </div>
                <div class="flex-row grand-total-row">
                    <span class="uppercase font-bold">Thanh toán:</span>
                    <span class="text-large">${formatMoney(total)}</span>
                </div>
            </div>
            
            ${qrHtml}
            
            <div class="divider"></div>
            
            <div class="text-center text-normal">
                <div class="font-bold">WIFI: ${config.wifiName}</div>
                <div class="font-bold">PASS: ${config.wifiPass}</div>
                <div style="margin-top: 15px; font-weight: bold; font-style: italic;">${config.footerMessage}</div>
            </div>
            <div style="height: 40px;"></div>
        </div>
      </body>
    </html>
  `;
};

/**
 * In qua cơ chế Iframe của trình duyệt (PC/Laptop)
 */
const printViaIframe = (html: string) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '100%';
  iframe.style.bottom = '100%';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1500);
      }, 1000);
    };
  }
};

/**
 * In qua ứng dụng RawBT (Android)
 */
const printViaRawBT = (html: string) => {
  const base64Html = utf8ToBase64(html);
  window.location.href = `rawbt:data:text/html;base64,${base64Html}`;
};

// --- EXPORTS ---

export const printOrderReceipt = (order: any) => {
  if (!order) return;

  // Đọc cấu hình in ấn
  const printConfigStr = localStorage.getItem('print_config');
  const printConfig = printConfigStr ? JSON.parse(printConfigStr) : { method: 'browser', paperSize: '80mm' };

  const html = generateReceiptHTML(order, printConfig.paperSize || '80mm');

  if (printConfig.method === 'rawbt') {
    printViaRawBT(html);
  } else {
    printViaIframe(html);
  }
};

export const printTestTicket = () => {
  const testOrder = {
    id: "TEST-PRINTER",
    table: "TEST",
    staff: "System",
    total: 25000,
    items: [{ name: "Máy in nhiệt hoạt động tốt", quantity: 1, price: 25000 }],
    created_at: new Date().toISOString()
  };
  printOrderReceipt(testOrder);
};
