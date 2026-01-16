'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Building2, DollarSign, RefreshCw, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface VendorBalance {
  companyId: string;
  companyName: string;
  totalSales: number;
  totalCommission: number;
  pendingPayout: number;
  totalPaidOut: number;
}

interface Payout {
  id: string;
  companyId: string;
  amount: string;
  platformFee: string;
  netAmount: string;
  status: string;
  bankReference?: string;
  processedAt?: string;
  createdAt: string;
  company: {
    name: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    bankName?: string;
  };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

export default function AdminPayoutsPage() {
  const { token } = useAuth();
  const [balances, setBalances] = useState<VendorBalance[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<VendorBalance | null>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payouts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBalances(data.balances || []);
      setPayouts(data.history || []);
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPayout = async () => {
    if (!selectedCompany || !payoutAmount) return;

    setCreating(true);
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId: selectedCompany.companyId,
          amount: parseFloat(payoutAmount),
          notes: payoutNotes,
        }),
      });

      if (res.ok) {
        alert('Payout created successfully');
        setSelectedCompany(null);
        setPayoutAmount('');
        setPayoutNotes('');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create payout');
      }
    } catch (error) {
      console.error('Failed to create payout:', error);
    } finally {
      setCreating(false);
    }
  };

  const processPayout = async (payoutId: string, bankReference: string) => {
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bankReference }),
      });

      if (res.ok) {
        alert('Payout processed successfully');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to process payout');
      }
    } catch (error) {
      console.error('Failed to process payout:', error);
    }
  };

  const formatPrice = (price: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendor Payouts</h1>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {balances.map((balance) => (
          <Card key={balance.companyId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {balance.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sales</span>
                  <span className="font-medium">{formatPrice(balance.totalSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission (10%)</span>
                  <span className="text-red-600">-{formatPrice(balance.totalCommission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Paid Out</span>
                  <span>{formatPrice(balance.totalPaidOut)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold">
                  <span>Pending Payout</span>
                  <span className="text-green-600">{formatPrice(balance.pendingPayout)}</span>
                </div>
              </div>

              {balance.pendingPayout > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full mt-4"
                      size="sm"
                      onClick={() => {
                        setSelectedCompany(balance);
                        setPayoutAmount(balance.pendingPayout.toString());
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Create Payout
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Payout for {balance.companyName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          max={balance.pendingPayout}
                          step="0.01"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Max: {formatPrice(balance.pendingPayout)}
                        </p>
                      </div>
                      <div>
                        <Label>Notes (Optional)</Label>
                        <Input
                          value={payoutNotes}
                          onChange={(e) => setPayoutNotes(e.target.value)}
                          placeholder="Payment notes..."
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={createPayout}
                        disabled={creating || !payoutAmount}
                      >
                        {creating ? 'Creating...' : 'Create Payout'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payouts yet</p>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{payout.company.name}</span>
                      <Badge className={statusColors[payout.status]}>{payout.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Net: {formatPrice(payout.netAmount)} (Fee: {formatPrice(payout.platformFee)})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payout.createdAt)}
                      {payout.bankReference && ` • Ref: ${payout.bankReference}`}
                    </p>
                  </div>
                  {payout.status === 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const ref = prompt('Enter bank reference number:');
                        if (ref) processPayout(payout.id, ref);
                      }}
                    >
                      Process
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
