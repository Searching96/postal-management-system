
import { formatCurrency, formatDate } from "./utils";

export const generateReceiptContent = (order: any) => {
  // If order has pre-formatted dimensions string, use it. 
  // Otherwise fallback to component fields if available.
  const dimensions = order.dimensions || `${order.lengthCm}x${order.widthCm}x${order.heightCm}`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Hóa Đơn - ${order.trackingNumber}</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        font-size: 12px; 
        margin: 0; 
        padding: 20px;
        background: white;
      }
      .receipt {
        width: 80mm;
        border: 1px solid #000;
        padding: 10px;
        box-sizing: border-box;
      }
      .header {
        text-align: center;
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 25px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }
      .section {
        margin: 10px 0;
        border-bottom: 1px dashed #666;
        padding-bottom: 8px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        margin: 3px 0;
      }
      .label { font-weight: bold; }
      .total {
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        margin: 10px 0;
      }
      @media print {
        body { margin: 0; padding: 0; }
      }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="header">
        HÓA ĐƠN GỬI HÀNG<br>
        POSTAL SERVICE
      </div>
      
      <div class="section">
        <div class="row">
          <span class="label">Mã vận đơn:</span>
          <span>${order.trackingNumber}</span>
        </div>
        <div class="row">
          <span class="label">Ngày gửi:</span>
          <span>${formatDate(order.createdAt)}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="label">Người gửi:</div>
        <div>${order.senderName}</div>
        <div>${order.senderPhone}</div>
        <div>${order.senderAddressLine1}, ${order.senderWardName}, ${order.senderProvinceName}</div>
      </div>
      
      <div class="section">
        <div class="label">Người nhận:</div>
        <div>${order.receiverName}</div>
        <div>${order.receiverPhone}</div>
        <div>${order.receiverAddressLine1}, ${order.receiverWardName}, ${order.receiverProvinceName}</div>
      </div>
      
      <div class="section">
        <div class="row">
          <span class="label">Loại:</span>
          <span>${order.packageType}</span>
        </div>
        <div class="row">
          <span class="label">Khối lượng:</span>
          <span>${order.weightKg}kg</span>
        </div>
        <div class="row">
          <span class="label">Kích thước:</span>
          <span>${dimensions}</span>
        </div>
        <div class="row">
          <span class="label">Cước phí:</span>
          <span>${formatCurrency(order.totalAmount)}</span>
        </div>
        ${order.codAmount > 0 ? `
        <div class="row">
          <span class="label">COD:</span>
          <span>${formatCurrency(order.codAmount)}</span>
        </div>
        ` : ''}
      </div>
      
      ${order.notes ? `
      <div class="section">
        <div class="label">Ghi chú:</div>
        <div>${order.notes}</div>
      </div>
      ` : ''}
      
      <div class="total">
        Cảm ơn quý khách!
      </div>
    </div>
  </body>
  </html>
`;
};

export const generateStickerContent = (order: any) => {
  const dimensions = order.dimensions || `${order.lengthCm}x${order.widthCm}x${order.heightCm}`;
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Tem Dán Kiện - ${order.trackingNumber}</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        font-size: 11px; 
        margin: 0; 
        padding: 15px;
        background: white;
      }
      .sticker {
        width: 100mm;
        height: 150mm;
        border: 2px solid #000;
        padding: 8px;
        box-sizing: border-box;
      }
      .header {
        text-align: center;
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 8px;
        border-bottom: 1px solid #000;
        padding-bottom: 5px;
      }
      .tracking {
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        margin: 8px 0;
      }
      .tracking-wrapper {
        text-align: center;
        margin: 15px 0;
        min-height: 20px;
      }
      .section {
        margin: 6px 0;
        border-bottom: 1px solid #ccc;
        padding-bottom: 4px;
      }
      .label { font-weight: bold; }
      @media print {
        body { margin: 0; padding: 0; }
      }
    </style>
  </head>
  <body>
    <div class="sticker">
      <div class="header">POSTAL SERVICE</div>
      <div class="tracking">${order.trackingNumber}</div>
      <div class="tracking-wrapper"></div>
      
      <div class="section">
        <div class="label">Từ:</div>
        <div>${order.senderName}</div>
        <div>${order.senderPhone}</div>
        <div>${order.senderAddressLine1}, ${order.senderWardName}, ${order.senderProvinceName}</div>
      </div>
      
      <div class="section">
        <div class="label">Đến:</div>
        <div>${order.receiverName}</div>
        <div>${order.receiverPhone}</div>
        <div>${order.receiverAddressLine1}, ${order.receiverWardName}, ${order.receiverProvinceName}</div>
      </div>
      
      <div class="section">
        <div class="label">Thông tin:</div>
        <div>Loại: ${order.packageType} | KL: ${order.weightKg}kg</div>
        <div>Kích thước: ${dimensions}</div>
      </div>
      
      <div style="text-align: center; margin-top: 10px; font-size: 10px;">
        ${formatDate(order.createdAt)}
      </div>
    </div>
  </body>
  </html>
`;
};


export const handlePrintReceipt = (order: any) => {
  const content = generateReceiptContent(order);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }
};

export const handlePrintSticker = (order: any) => {
  const content = generateStickerContent(order);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }
};
