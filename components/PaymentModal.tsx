import React, { useState, useMemo } from 'react';
import { X, DollarSign, CreditCard, ArrowRightLeft, Check, Loader2, Printer, QrCode, AlertCircle, Info } from 'lucide-react';
import { useCurrency } from '../CurrencyContext';
import { useTheme } from '../ThemeContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Cập nhật: onConfirm nhận thêm tham số shouldPrint
  onConfirm: (method: 'Cash' | 'Card' | 'Transfer', shouldPrint: boolean) => void;
  onPrint: () => void; // Giữ nguyên để test in lẻ
  totalAmount: number;
  orderId: string;
  isProcessing: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onPrint,
  totalAmount,
  orderId,
  isProcessing
}) => {
  const { formatPrice } = useCurrency();
  const { t } = useTheme();
  const [method, setMethod] = useState<'Cash' | 'Card' | 'Transfer'>('Cash');
  
  // Bank Config for QR
  const bankConfig = useMemo(() => {
    const saved = localStorage.getItem('bank_config');
    return saved ? JSON.parse(saved) : null;
  }, []);

  const qrUrl = useMemo(() => {
    if (!bankConfig || method !== 'Transfer') return '';
    const { bankId, accountNo, accountName, template } = bankConfig;
    // URL format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template || 'compact2'}.png?amount=${totalAmount}&addInfo=${encodeURIComponent(orderId)}&accountName=${encodeURIComponent(accountName)}`;
  }, [bankConfig, method, totalAmount, orderId]);

  // State mới: Mặc định là CÓ in (true), nhưng ưu tiên lấy từ LocalStorage
  const [shouldPrint, setShouldPrint] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('pos_auto_print');
        return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const handleTogglePrint = () => {
    const newValue = !shouldPrint;
    setShouldPrint(newValue);
    localStorage.setItem('pos_auto_print', String(newValue));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col transition-all duration-300 ${method === 'Transfer' ? 'max-w-xl' : 'max-w-md'}`}>
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-text-main text-xl">{t('Confirm Payment')}</h3>
          <button onClick={onClose} disabled={isProcessing}>
            <X size={20} className="text-secondary hover:text-text-main"/>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="text-center relative">
            <p className="text-secondary text-sm mb-1">{t('Total to Pay')}</p>
            <p className="text-4xl font-bold text-text-main">{formatPrice(totalAmount)}</p>
            <p className="text-sm text-secondary mt-2">{t('Order #')}{orderId}</p>
            
            {/* Nút in lẻ (Test) */}
            <button 
              onClick={onPrint}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-surface border border-border rounded-lg text-secondary hover:text-text-main hover:border-primary transition-colors flex flex-col items-center gap-1"
              title="Print Preview"
            >
                <Printer size={16} />
                <span className="text-[10px] font-bold">{t('View')}</span>
            </button>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-3">
            {[
                { key: 'Cash', icon: DollarSign },
                { key: 'Card', icon: CreditCard },
                { key: 'Transfer', icon: QrCode }
            ].map((m) => (
              <button 
                key={m.key} 
                onClick={() => setMethod(m.key as any)} 
                disabled={isProcessing}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${method === m.key ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20' : 'bg-background border-border text-secondary hover:border-primary/50'}`}
              >
                <m.icon size={24}/>
                <span className="text-xs font-bold mt-2">{t(m.key)}</span>
              </button>
            ))}
          </div>

          {/* QR Content for Transfer */}
          {method === 'Transfer' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
               {bankConfig ? (
                  <div className="bg-background border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8 shadow-inner">
                      <div className="w-full md:w-1/2 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-2xl shadow-xl mb-3">
                           <img src={qrUrl} alt="VietQR" className="w-full aspect-square object-contain" />
                        </div>
                        <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                            <QrCode size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">{t('Scan to pay')}</span>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-1/2 space-y-4">
                         <div className="flex flex-col">
                            <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">{t('Bank')}</span>
                            <span className="text-sm font-black text-text-main">{bankConfig.bankId}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">{t('Account Number')}</span>
                            <span className="text-lg font-black text-primary tracking-tight">{bankConfig.accountNo}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">{t('Account Owner')}</span>
                            <span className="text-sm font-black text-text-main uppercase">{bankConfig.accountName}</span>
                         </div>
                         <div className="flex flex-col p-3 bg-surface border border-border rounded-xl">
                            <span className="text-[10px] text-secondary uppercase font-bold tracking-wider mb-1">{t('Memo')}</span>
                            <span className="text-xs font-black text-primary bg-primary/5 p-2 rounded border border-primary/10 select-all cursor-copy" title="Click to copy">{orderId}</span>
                         </div>
                      </div>
                  </div>
               ) : (
                  <div className="p-8 bg-red-500/5 border-2 border-dashed border-red-500/20 rounded-2xl text-center flex flex-col items-center gap-4">
                     <AlertCircle size={48} className="text-red-500/50" />
                     <div className="space-y-1">
                        <p className="font-bold text-red-500">{t('Bank settings required')}</p>
                        <p className="text-xs text-secondary leading-relaxed">Cấu hình thông tin ngân hàng trong mục Cài đặt hệ thống để sử dụng tính năng VietQR.</p>
                     </div>
                  </div>
               )}
            </div>
          )}

          {/* Tùy chọn In hóa đơn */}
          <div className="flex items-center justify-center pt-2">
            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-border/30 transition-colors">
              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${shouldPrint ? 'bg-primary border-primary text-background' : 'border-gray-300 dark:border-white/20 text-transparent'}`}>
                <Check size={16} strokeWidth={4} />
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={shouldPrint} 
                onChange={handleTogglePrint}
              />
              <span className={`font-bold transition-colors ${shouldPrint ? 'text-text-main' : 'text-gray-800 dark:text-white'}`}>
                {t('Auto Print Receipt')}
              </span>
              <Printer size={16} className={shouldPrint ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}/>
            </label>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-border bg-background">
          <button 
            // Truyền cả method và shouldPrint ra ngoài
            onClick={() => onConfirm(method, shouldPrint)} 
            disabled={isProcessing}
            className="w-full py-4 bg-primary text-background font-bold rounded-xl text-lg hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Check size={20} />}
            {t('Complete Order')}
          </button>
        </div>
      </div>
    </div>
  );
};