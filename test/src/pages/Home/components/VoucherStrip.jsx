import React from 'react';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';

const VoucherStrip = ({ vouchers = [], onCollect, collectingId, error }) => {
  if (error) {
    return (
      <div className="px-4 sm:px-6 md:px-[5%] py-4">
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!vouchers.length) return null;

  return (
    <div className="px-4 sm:px-6 md:px-[5%] py-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">Hot vouchers</h3>
          <p className="text-sm text-muted-foreground">
            Lưu ngay để dùng khi thanh toán
          </p>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {vouchers.map((v) => (
          <div
            key={v._id}
            className="min-w-[240px] border rounded-xl p-4 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold">{v.name}</span>
              <Badge variant="secondary">{v.type}</Badge>
              {v.collected && <Badge variant="outline">Đã lưu</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              {v.type === 'percent'
                ? `${v.value}% off`
                : `${Number(v.value || 0).toLocaleString()}₫ off`}
              {v.maxDiscount ? ` • Max ${Number(v.maxDiscount).toLocaleString()}₫` : ''}
              {v.minOrderValue ? ` • Min ${Number(v.minOrderValue).toLocaleString()}₫` : ''}
            </div>
            {(v.startDate || v.endDate) && (
              <div className="text-xs text-muted-foreground mt-1">
                {v.startDate && `Từ ${new Date(v.startDate).toLocaleDateString()} `}
                {v.endDate && `đến ${new Date(v.endDate).toLocaleDateString()}`}
              </div>
            )}
            <div className="mt-3">
              <Button
                size="sm"
                variant={v.collected ? 'outline' : 'default'}
                disabled={v.collected || collectingId === v._id}
                onClick={() => onCollect?.(v._id)}
                className="w-full"
              >
                {collectingId === v._id ? 'Đang lưu...' : v.collected ? 'Đã lưu' : 'Lưu voucher'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoucherStrip;
