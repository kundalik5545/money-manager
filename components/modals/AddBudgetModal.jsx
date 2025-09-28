"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { X, Target, Calendar, Mail } from "lucide-react";

export default function AddBudgetModal({ isOpen, onClose, onSuccess, categories, editData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    period: "MONTHLY",
    categoryId: "",
    startDate: "",
    endDate: "",
    emailNotifications: true,
    warningThreshold: "80"
  });

  // Initialize form with edit data when modal opens
  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        name: editData.name || "",
        amount: editData.amount?.toString() || "",
        period: editData.period || "MONTHLY",
        categoryId: editData.categoryId || "",
        startDate: editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : "",
        endDate: editData.endDate ? new Date(editData.endDate).toISOString().split('T')[0] : "",
        emailNotifications: editData.emailNotifications !== undefined ? editData.emailNotifications : true,
        warningThreshold: (editData.warningThreshold * 100)?.toString() || "80"
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: "",
        amount: "",
        period: "MONTHLY",
        categoryId: "",
        startDate: "",
        endDate: "",
        emailNotifications: true,
        warningThreshold: "80"
      });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        amount: parseFloat(formData.amount) || 0,
        period: formData.period,
        categoryId: formData.categoryId || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        emailNotifications: formData.emailNotifications,
        warningThreshold: parseFloat(formData.warningThreshold) / 100
      };

      // Add ID for edit mode
      if (editData) {
        submitData.id = editData.id;
      }

      const response = await fetch('/api/budgets', {
        method: editData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onSuccess?.();
          onClose();
        }
      }
    } catch (error) {
      console.error("Failed to create/update budget:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPeriodText = (period) => {
    switch (period) {
      case 'WEEKLY':
        return '1 week';
      case 'MONTHLY':
        return '1 month';
      case 'YEARLY':
        return '1 year';
      default:
        return period;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle>{editData ? 'Edit Budget' : 'Create New Budget'}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Budget Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Budget Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Budget Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter budget name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount">Budget Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="50000"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Budget Period</Label>
                    <Select value={formData.period} onValueChange={(value) => handleInputChange("period", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Budget will reset every {getPeriodText(formData.period)}
                    </p>
                  </div>

                  <div>
                    <Label>Category (Optional)</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories?.filter(cat => cat.type === 'EXPENSE').map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to track all expenses
                    </p>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Budget Period Dates
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date (Optional)</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to start today
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to auto-calculate based on period
                    </p>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  Notification Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email alerts when approaching budget limit
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="warningThreshold">Warning Threshold (%)</Label>
                    <Input
                      id="warningThreshold"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="80"
                      value={formData.warningThreshold}
                      onChange={(e) => handleInputChange("warningThreshold", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Get notified when you reach this percentage of your budget
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (editData ? "Updating..." : "Creating...") : (editData ? "Update Budget" : "Create Budget")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}