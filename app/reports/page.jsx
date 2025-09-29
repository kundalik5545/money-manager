"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Filter,
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  FileText,
  Target,
  Eye,
  EyeOff
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  Area,
  AreaChart
} from "recharts";

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export default function ReportsPage() {
  const [timeFilter, setTimeFilter] = useState("monthly");
  const [reportType, setReportType] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({});
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryTableVisible, setCategoryTableVisible] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [timeFilter, reportType, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch transactions based on date range
      const transactionsUrl = `/api/transactions?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      const transactionsResponse = await fetch(transactionsUrl);
      const transactionsData = await transactionsResponse.json();
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = await categoriesResponse.json();
      
      if (transactionsData.success && categoriesData.success) {
        setTransactions(transactionsData.data);
        setCategories(categoriesData.data);
        
        // Process data based on current filters
        const processedData = processTransactionData(transactionsData.data, categoriesData.data);
        setReportData(processedData);
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processTransactionData = (transactions, categories) => {
    const income = transactions.filter(t => t.category.type === 'INCOME');
    const expenses = transactions.filter(t => t.category.type === 'EXPENSE');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpense;
    
    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach(t => {
      if (!categoryBreakdown[t.category.name]) {
        categoryBreakdown[t.category.name] = 0;
      }
      categoryBreakdown[t.category.name] += t.amount;
    });
    
    const categoryChartData = Object.entries(categoryBreakdown)
      .map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
    
    // Time-based data
    const timeBasedData = generateTimeBasedData(transactions);
    
    return {
      overview: {
        totalIncome,
        totalExpense,
        netSavings,
        transactionCount: transactions.length,
        avgTransactionSize: transactions.length > 0 ? (totalIncome + totalExpense) / transactions.length : 0,
        categoryBreakdown: categoryChartData,
        timeBasedData,
        categoryWiseTable: generateCategoryTable(categories, transactions)
      }
    };
  };

  const generateTimeBasedData = (transactions) => {
    const data = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      let key;
      
      if (timeFilter === 'daily') {
        key = date.toLocaleDateString();
      } else if (timeFilter === 'monthly') {
        key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      } else if (timeFilter === 'yearly') {
        key = date.getFullYear().toString();
      }
      
      if (!data[key]) {
        data[key] = { period: key, income: 0, expense: 0, net: 0 };
      }
      
      if (t.category.type === 'INCOME') {
        data[key].income += t.amount;
      } else {
        data[key].expense += t.amount;
      }
      data[key].net = data[key].income - data[key].expense;
    });
    
    return Object.values(data).sort((a, b) => new Date(a.period) - new Date(b.period));
  };

  const generateCategoryTable = (categories, transactions) => {
    return categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.categoryId === category.id);
      const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const transactionCount = categoryTransactions.length;
      const avgAmount = transactionCount > 0 ? totalAmount / transactionCount : 0;
      
      return {
        id: category.id,
        name: category.name,
        type: category.type,
        totalAmount,
        transactionCount,
        avgAmount,
        percentage: transactions.length > 0 ? (transactionCount / transactions.length) * 100 : 0
      };
    }).filter(cat => cat.totalAmount > 0).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const formatPercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  };

  const handleExportReport = () => {
    const csvContent = [
      ['Category', 'Type', 'Total Amount', 'Transaction Count', 'Average Amount', 'Percentage'].join(','),
      ...reportData.overview?.categoryWiseTable?.map(cat => [
        cat.name,
        cat.type,
        cat.totalAmount,
        cat.transactionCount,
        cat.avgAmount.toFixed(2),
        cat.percentage.toFixed(1) + '%'
      ].join(',')) || []
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefreshData = () => {
    fetchReportData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const data = reportData.overview;

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your financial patterns and trends</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleRefreshData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button onClick={handleExportReport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.netSavings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.transactionCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {formatCurrency(data.avgTransactionSize)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Income vs Expenses Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="income" fill="#00C49F" name="Income" />
                <Bar dataKey="expense" fill="#FF8042" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {data.categoryBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatPercentage(item.value, data.totalExpense)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Savings Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Net Savings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area 
                  type="monotone" 
                  dataKey="net" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                  name="Net Savings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Spending Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Spending Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#FF8042" 
                  strokeWidth={3}
                  dot={{ fill: "#FF8042", strokeWidth: 2, r: 4 }}
                  name="Daily Spending"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.categoryBreakdown
                .sort((a, b) => b.value - a.value)
                .map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-muted rounded-full text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPercentage(category.value, data.totalExpense)}% of total expenses
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatCurrency(category.value)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Health Score */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Health Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Savings Rate */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Savings Rate</span>
                  <span className="font-medium">
                    {formatPercentage(data.netSavings, data.totalIncome)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${Math.min((data.netSavings / data.totalIncome) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(data.netSavings / data.totalIncome) > 0.2 ? 'Excellent' : 
                   (data.netSavings / data.totalIncome) > 0.1 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>

              {/* Expense Ratio */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Expense Ratio</span>
                  <span className="font-medium">
                    {formatPercentage(data.totalExpense, data.totalIncome)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-orange-500"
                    style={{ width: `${Math.min((data.totalExpense / data.totalIncome) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(data.totalExpense / data.totalIncome) < 0.5 ? 'Excellent' : 
                   (data.totalExpense / data.totalIncome) < 0.8 ? 'Good' : 'High'}
                </p>
              </div>

              {/* Monthly Growth */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Monthly Growth</span>
                </div>
                <p className="text-2xl font-bold text-green-600">+12.5%</p>
                <p className="text-xs text-muted-foreground">
                  Your savings increased compared to last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category-wise Spending Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Category-wise Financial Analysis
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategoryTableVisible(!categoryTableVisible)}
            className="flex items-center gap-2"
          >
            {categoryTableVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {categoryTableVisible ? 'Hide' : 'Show'} Table
          </Button>
        </CardHeader>
        {categoryTableVisible && (
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Category</th>
                    <th className="text-center py-3 px-2 font-medium">Type</th>
                    <th className="text-right py-3 px-2 font-medium">Total Amount</th>
                    <th className="text-right py-3 px-2 font-medium">Transactions</th>
                    <th className="text-right py-3 px-2 font-medium">Avg per Transaction</th>
                    <th className="text-right py-3 px-2 font-medium">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categoryWiseTable?.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            category.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge 
                          variant={category.type === 'INCOME' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {category.type}
                        </Badge>
                      </td>
                      <td className={`py-3 px-2 text-right font-bold ${
                        category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(category.totalAmount)}
                      </td>
                      <td className="py-3 px-2 text-right text-muted-foreground">
                        {category.transactionCount}
                      </td>
                      <td className="py-3 px-2 text-right text-muted-foreground">
                        {formatCurrency(category.avgAmount)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm font-medium">
                            {category.percentage.toFixed(1)}%
                          </span>
                          <div className="w-12 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                category.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(category.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-muted-foreground">
                        No category data available for the selected date range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Category Table Summary */}
            {data.categoryWiseTable && data.categoryWiseTable.length > 0 && (
              <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Categories</p>
                    <p className="text-2xl font-bold">{data.categoryWiseTable.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Highest Spending</p>
                    <p className="text-lg font-bold text-red-600">
                      {data.categoryWiseTable.length > 0 ? formatCurrency(Math.max(...data.categoryWiseTable.map(c => c.totalAmount))) : '₹0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Most Transactions</p>
                    <p className="text-lg font-bold text-purple-600">
                      {data.categoryWiseTable.length > 0 ? Math.max(...data.categoryWiseTable.map(c => c.transactionCount)) : 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg per Category</p>
                    <p className="text-lg font-bold text-blue-600">
                      {data.categoryWiseTable.length > 0 ? formatCurrency(data.categoryWiseTable.reduce((sum, c) => sum + c.totalAmount, 0) / data.categoryWiseTable.length) : '₹0'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
    </DashboardLayout>
  );
}