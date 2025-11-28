import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getMyLoyaltyInfo,
  getLoyaltyHistory,
} from '@/services/loyalty.service';

const LoyaltyAdmin = () => {
  const [info, setInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [infoRes, historyRes] = await Promise.all([
        getMyLoyaltyInfo(),
        getLoyaltyHistory(),
      ]);
      setInfo(infoRes.data || infoRes);
      setHistory(historyRes.data || historyRes || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load loyalty info/history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Loyalty & Coins</h1>
          <p className="text-sm text-muted-foreground">
            View your tier, coins, and recent coin activity.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {info ? (
            <>
              <div className="text-sm">Tier: <strong>{info.loyaltyTier || 'none'}</strong></div>
              <div className="text-sm">Coins: <strong>{info.loyaltyPoints}</strong></div>
              <div className="text-sm">Lifetime spent: {info.lifetimeSpent}</div>
              <div className="text-sm">Spent last 12 months: {info.spentLast12Months}</div>
            </>
          ) : (
            !loading && <div className="text-sm text-muted-foreground">No data yet</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent coin history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {!loading && history.length === 0 && (
            <div className="text-sm text-muted-foreground">No transactions.</div>
          )}
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h._id} className="p-3 border rounded-md flex justify-between">
                <div>
                  <div className="text-sm font-medium">{h.description || h.type}</div>
                  <div className="text-xs text-muted-foreground">
                    {h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}
                  </div>
                </div>
                <div className={`text-sm font-semibold ${h.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                  {h.type === 'earn' ? '+' : '-'}
                  {h.amount}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyAdmin;
