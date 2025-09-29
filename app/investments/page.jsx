"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  Edit, 
  Trash2,
  Target,
  Coins,
  Building2,
  Banknote
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AddInvestmentModal from "@/components/modals/AddInvestmentModal";

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

function InvestmentsContent() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingInvestment, setDeletingInvestment] = useState(null);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const response = await fetch('/api/investments');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInvestments(data.data);
        } else {
          console.error('API error:', data.error);
          setInvestments([]);
        }
      } else {
        console.error('Failed to fetch investments');
        setInvestments([]);
      }
    } catch (error) {
      console.error("Failed to fetch investments:", error);
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvestment = async (investmentId) => {
    try {
      const response = await fetch(`/api/investments?id=${investmentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchInvestments();
        setShowDeleteModal(false);
        setDeletingInvestment(null);
      }
    } catch (error) {
      console.error('Failed to delete investment:', error);
    }
  };

  const handleInvestmentSuccess = () => {
    fetchInvestments();
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingInvestment(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const getInvestmentIcon = (type) => {
    switch (type) {
      case 'STOCKS':
        return BarChart3;
      case 'MUTUAL_FUNDS':
        return Target;
      case 'CRYPTOCURRENCY':
        return Coins;
      case 'REAL_ESTATE':
        return Building2;
      case 'GOLD':
        return Banknote;
      default:
        return DollarSign;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'profit':
        return 'text-green-600 bg-green-100';
      case 'loss':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate summary statistics
  const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
  const topPerformer = investments.length > 0 ? 
    investments.reduce((top, inv) => inv.profitLossPercent > top.profitLossPercent ? inv : top, investments[0]) : null;

  // Chart data for investment distribution
  const investmentTypeData = investments.reduce((acc, inv) => {
    const existing = acc.find(item => item.type === inv.type);
    if (existing) {
      existing.value += inv.currentValue;
      existing.count += 1;
    } else {
      acc.push({
        type: inv.type,
        name: inv.type.replace('_', ' ').toLowerCase(),
        value: inv.currentValue,
        count: 1
      });
    }
    return acc;
  }, []);

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
          <h1 className="text-3xl font-bold tracking-tight">Investments</h1>
          <p className="text-muted-foreground">Track your portfolio and investment performance</p>
        </div>
        
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Investment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalInvested)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Current Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCurrentValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {totalProfitLoss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
            </div>
            <p className={`text-xs ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformer ? (
              <>
                <div className="text-lg font-bold truncate">
                  {topPerformer.symbol}
                </div>
                <p className={`text-xs ${topPerformer.profitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {topPerformer.profitLossPercent >= 0 ? '+' : ''}{topPerformer.profitLossPercent.toFixed(2)}%
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No investments</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investments List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Investments ({investments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No investments yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first investment to start tracking your portfolio
                  </p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Investment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {investments.map((investment) => {
                    const Icon = getInvestmentIcon(investment.type);
                    const statusColor = getStatusColor(investment.status);
                    
                    return (
                      <div key={investment.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${statusColor}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{investment.symbol}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {investment.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {investment.name}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-4">
                              <div className="font-bold text-lg">
                                {formatCurrency(investment.currentValue)}
                              </div>
                              <div className={`text-sm ${investment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {investment.profitLoss >= 0 ? '+' : ''}{formatCurrency(investment.profitLoss)} 
                                ({investment.profitLoss >= 0 ? '+' : ''}{investment.profitLossPercent.toFixed(2)}%)
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingInvestment(investment);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingInvestment(investment);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Investment Details */}
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Quantity</p>
                            <p className="font-medium">{investment.quantity}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg. Price</p>
                            <p className="font-medium">{formatCurrency(investment.purchasePrice)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Current Price</p>
                            <p className="font-medium">{formatCurrency(investment.currentPrice)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Invested</p>
                            <p className="font-medium">{formatCurrency(investment.investedAmount)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Investment Distribution Chart */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {investmentTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={investmentTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {investmentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>No investment data available</p>
                </div>
              )}
              
              {/* Legend */}
              {investmentTypeData.length > 0 && (
                <div className="mt-4 space-y-2">
                  {investmentTypeData.map((item, index) => (
                    <div key={item.type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddInvestmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleInvestmentSuccess}
      />

      <AddInvestmentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingInvestment(null);
        }}
        onSuccess={handleInvestmentSuccess}
        editData={editingInvestment}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Delete Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete "{deletingInvestment?.symbol} - {deletingInvestment?.name}"? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingInvestment(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteInvestment(deletingInvestment.id)}
                  className="flex-1"
                >
                  Delete Investment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function InvestmentsPage() {
  return (
    <DashboardLayout>
      <InvestmentsContent />
    </DashboardLayout>
  );
}