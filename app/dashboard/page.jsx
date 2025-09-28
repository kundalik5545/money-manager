"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Plus,
  Upload,
  BarChart3
} from "lucide-react";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">FinanceHub</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName}!
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Manage Accounts
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$12,345.67</div>
              <p className="text-xs text-muted-foreground">
                +2.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$5,300.00</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">$1,477.50</div>
              <p className="text-xs text-muted-foreground">
                -5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">$3,822.50</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Notice */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Setup Required</CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700">
            <p className="mb-4">
              Welcome to your personal finance dashboard! To get started, you'll need to set up your Clerk authentication keys and database connection.
            </p>
            <div className="bg-white rounded-md p-4 border border-orange-200">
              <h4 className="font-semibold mb-2">Required Setup:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Add your Clerk Publishable Key and Secret Key to .env.local</li>
                <li>Set up your Neon PostgreSQL database connection</li>
                <li>Run database migrations with Prisma</li>
                <li>Configure email notifications with Resend</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}