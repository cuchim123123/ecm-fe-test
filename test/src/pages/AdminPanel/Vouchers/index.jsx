import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, RefreshCw, Trash2, Edit, Sparkles, Gift, Calendar, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Badge from '@/components/ui/badge';
import {
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from '@/services/vouchers.service';

const defaultForm = {
  name: '',
  type: 'percent',
  value: 0,
  maxDiscount: 0,
  minOrderValue: 0,
  usagePerUser: 1,
  startDate: '',
  endDate: '',
  isActive: true,
  isCollectable: true,
};

const Vouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return vouchers.filter((v) =>
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.type?.toLowerCase().includes(search.toLowerCase())
    );
  }, [vouchers, search]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAllVouchers();
      setVouchers(res.vouchers || res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        maxDiscount: Number(form.maxDiscount) || 0,
        minOrderValue: Number(form.minOrderValue) || 0,
        usagePerUser: Number(form.usagePerUser) || 1,
      };

      if (editingId) {
        await updateVoucher(editingId, payload);
        toast.success('Voucher updated');
      } else {
        await createVoucher(payload);
        toast.success('Voucher created');
      }
      setForm(defaultForm);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save voucher');
    }
  };

  const startEdit = (voucher) => {
    setEditingId(voucher._id);
    setForm({
      name: voucher.name || '',
      type: voucher.type || 'percent',
      value: voucher.value || 0,
      maxDiscount: voucher.maxDiscount || 0,
      minOrderValue: voucher.minOrderValue || 0,
      usagePerUser: voucher.usagePerUser || 1,
      startDate: voucher.startDate ? voucher.startDate.slice(0, 10) : '',
      endDate: voucher.endDate ? voucher.endDate.slice(0, 10) : '',
      isActive: voucher.isActive ?? true,
      isCollectable: voucher.isCollectable ?? true,
    });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this voucher?')) return;
    try {
      await deleteVoucher(id);
      toast.success('Voucher deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete voucher');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 font-semibold">
              <Sparkles size={18} />
              Voucher Center
            </div>
            <h1 className="text-3xl font-bold text-stone-800">Quản lý & phát hành voucher</h1>
            <p className="text-sm text-stone-600 mt-1">
              Hỗ trợ voucher phần trăm/cố định, giới hạn thời gian và số lần sử dụng.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Tìm voucher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-52 bg-white/70"
            />
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/70 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
            <Gift className="text-amber-500" size={20} />
            <div>
              <p className="text-xs text-stone-500">Total vouchers</p>
              <p className="text-lg font-semibold">{vouchers.length}</p>
            </div>
          </div>
          <div className="bg-white/70 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
            <Percent className="text-amber-500" size={20} />
            <div>
              <p className="text-xs text-stone-500">Percent type</p>
              <p className="text-lg font-semibold">{vouchers.filter(v => v.type === 'percent').length}</p>
            </div>
          </div>
          <div className="bg-white/70 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
            <Calendar className="text-amber-500" size={20} />
            <div>
              <p className="text-xs text-stone-500">Active</p>
              <p className="text-lg font-semibold">{vouchers.filter(v => v.isActive !== false).length}</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingId ? 'Update voucher' : 'Create new voucher'}
            <span className="text-xs text-muted-foreground">Clean layout for quick input</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Mid-year sale"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3 items-start">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  className="border rounded-md px-3 py-2 text-sm bg-white"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed (VND)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Value</label>
                <Input
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder="10 or 50000"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Max discount (VND)</label>
                <Input
                  type="number"
                  min="0"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  placeholder="0 = unlimited"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min order value (VND)</label>
                <Input
                  type="number"
                  min="0"
                  value={form.minOrderValue}
                  onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Max uses per user</label>
                <Input
                  type="number"
                  min="1"
                  value={form.usagePerUser}
                  onChange={(e) => setForm({ ...form, usagePerUser: e.target.value })}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center gap-4 px-3 py-2 border rounded-md bg-white">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isCollectable}
                      onChange={(e) => setForm({ ...form, isCollectable: e.target.checked })}
                    />
                    Collectable
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start date</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End date</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-end justify-end gap-2 col-span-full">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForm(defaultForm);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" className="flex items-center gap-2">
                <Plus size={16} />
                {editingId ? 'Save changes' : 'Create voucher'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Danh sách voucher</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {!loading && filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">No vouchers found.</div>
          )}
          <div className="grid gap-3">
            {filtered.map((v) => (
              <div
                key={v._id}
                className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{v.name}</span>
                    <Badge variant="secondary">{v.type}</Badge>
                    {v.isActive === false && <Badge variant="outline">Inactive</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Value: {v.value} {v.type === 'percent' ? '%' : 'VND'}
                    {v.maxDiscount ? ` • Max ${v.maxDiscount}` : ''}
                    {v.minOrderValue ? ` • Min order ${v.minOrderValue}` : ''}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {v.startDate && `Start: ${new Date(v.startDate).toLocaleDateString()} • `}
                    {v.endDate && `End: ${new Date(v.endDate).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => startEdit(v)}>
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(v._id)}>
                    <Trash2 className="text-destructive" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vouchers;
