import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, RefreshCw, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Badge from '@/components/ui/badge';
import {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
} from '@/services/badges.service';

const defaultBadge = {
  name: '',
  description: '',
  icon: '',
  type: 'spent', // cố định: dựa trên số tiền chi tiêu
  threshold: 0,
};

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [form, setForm] = useState(defaultBadge);
  const [iconPreview, setIconPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAllBadges();
      setBadges(res.badges || res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        type: form.type || 'spent',
        threshold: Number(form.threshold) || 0,
      };
      if (editingId) {
        await updateBadge(editingId, payload);
        toast.success('Badge updated');
      } else {
        await createBadge(payload);
        toast.success('Badge created');
      }
      setForm(defaultBadge);
      setIconPreview('');
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save badge');
    }
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setForm({
      name: b.name || '',
      description: b.description || '',
      icon: b.icon || '',
      type: b.type || 'spent',
      threshold: b.threshold || 0,
    });
    setIconPreview(b.icon || '');
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this badge?')) return;
    try {
      await deleteBadge(id);
      toast.success('Badge deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete badge');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Badges</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý huy hiệu dựa trên mức chi tiêu hoặc số đơn hàng.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Cập nhật badge' : 'Tạo badge mới'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid md:grid-cols-2 gap-4" onSubmit={submit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Gold Member"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setForm({ ...form, icon: reader.result });
                    setIconPreview(reader.result);
                  };
                  reader.readAsDataURL(file);
                }}
              />
              {iconPreview && (
                <div className="w-12 h-12 rounded-full overflow-hidden border">
                  <img src={iconPreview} alt="badge icon preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Unlocked after spending 5M"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Threshold</label>
              <Input
                type="number"
                min="0"
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                required
              />
            </div>
            <div className="flex items-end justify-end gap-2 md:col-span-2">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForm(defaultBadge);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" className="flex items-center gap-2">
                <Plus size={16} />
                {editingId ? 'Save badge' : 'Create badge'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {!loading && badges.length === 0 && (
            <div className="text-sm text-muted-foreground">No badges found.</div>
          )}
          <div className="grid gap-3">
            {badges.map((b) => (
              <div
                key={b._id}
                className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{b.name}</span>
                    <Badge variant="secondary">{b.type}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{b.description}</div>
                  <div className="text-xs text-muted-foreground">
                    Threshold: {b.threshold} {b.type === 'spent' ? 'VND' : 'orders'}
                  </div>
                  {b.icon && (
                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                      Icon: {b.icon}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => startEdit(b)}>
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(b._id)}>
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

export default Badges;
