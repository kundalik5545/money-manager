"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Wallet, Building } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function AccountsContent() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const formattedAccounts = data.data.map(acc => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            isDefault: acc.isDefault,
            transactionCount: acc._count?.transactions || 0,
            lastTransaction: acc.updatedAt || acc.createdAt
          }));
          setAccounts(formattedAccounts);
        } else {
          console.error('API error:', data.error);
          setAccounts([]);
        }
      } else {
        console.error('Failed to fetch accounts');
        setAccounts([]);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'BANK':
        return Building;
      case 'CREDIT_CARD':
        return CreditCard;
      case 'WALLET':
        return Wallet;
      default:
        return Building;
    }
  };

  const getAccountColor = (type) => {
    switch (type) {
      case 'BANK':
        return 'text-blue-600 bg-blue-100';
      case 'CREDIT_CARD':
        return 'text-orange-600 bg-orange-100';
      case 'WALLET':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate totals by account type
  const accountTotals = {
    bank: accounts.filter(acc => acc.type === 'BANK').reduce((sum, acc) => sum + acc.balance, 0),
    creditCard: accounts.filter(acc => acc.type === 'CREDIT_CARD').reduce((sum, acc) => sum + acc.balance, 0),
    wallet: accounts.filter(acc => acc.type === 'WALLET').reduce((sum, acc) => sum + acc.balance, 0),
  };

  const totalNetWorth = accountTotals.bank + accountTotals.creditCard + accountTotals.wallet;

  const chartData = [
    { name: 'Bank Accounts', value: accountTotals.bank, color: '#0088FE' },
    { name: 'Credit Cards', value: Math.abs(accountTotals.creditCard), color: '#FF8042' },
    { name: 'Wallets', value: accountTotals.wallet, color: '#00C49F' },
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage your financial accounts and track balances</p>
        </div>
        
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalNetWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalNetWorth)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(accountTotals.bank)}
            </div>
            <p className="text-xs text-muted-foreground">
              {accounts.filter(acc => acc.type === 'BANK').length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credit Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(accountTotals.creditCard)}
            </div>
            <p className="text-xs text-muted-foreground">
              {accounts.filter(acc => acc.type === 'CREDIT_CARD').length} cards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(accountTotals.wallet)}
            </div>
            <p className="text-xs text-muted-foreground">
              {accounts.filter(acc => acc.type === 'WALLET').length} wallets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Accounts ({accounts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account) => {
                  const Icon = getAccountIcon(account.type);
                  const colorClass = getAccountColor(account.type);
                  
                  return (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{account.name}</p>
                            {account.isDefault && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>
                              {account.type.replace('_', ' ').toLowerCase()}
                            </span>
                            <span>•</span>
                            <span>{account.transactionCount} transactions</span>
                            <span>•</span>
                            <span>Last: {new Date(account.lastTransaction).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold text-xl ${
                          account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {account.balance < 0 && '-'}{formatCurrency(account.balance)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Distribution Chart */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Account Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>No account data available</p>
                </div>
              )}
              
              {/* Legend */}
              <div className="mt-4 space-y-2">
                {chartData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}