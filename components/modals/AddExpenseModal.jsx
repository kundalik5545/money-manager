"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, TrendingDown } from "lucide-react";

export default function AddExpenseModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    accountId: "",
    categoryId: "",
    subcategoryId: ""
  });

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.categoryId) {
      fetchSubcategories(formData.categoryId);
    } else {
      setSubcategories([]);
    }
  }, [formData.categoryId]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAccounts(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filter only EXPENSE categories
          const expenseCategories = data.data.filter(cat => cat.type === 'EXPENSE');
          setCategories(expenseCategories);
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const category = categories.find(cat => cat.id === categoryId);
      if (category && category.subcategories) {
        setSubcategories(category.subcategories);
      }
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onSuccess?.();
          onClose();
          // Reset form
          setFormData({
            amount: "",
            description: "",
            date: new Date().toISOString().split('T')[0],
            accountId: "",
            categoryId: "",
            subcategoryId: ""
          });
        }
      }
    } catch (error) {
      console.error("Failed to create expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">Add Expense Transaction</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter expense description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Account</Label>
                <Select value={formData.accountId} onValueChange={(value) => handleInputChange("accountId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Expense Category</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expense category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <Label>Subcategory (Optional)</Label>
                  <Select value={formData.subcategoryId} onValueChange={(value) => handleInputChange("subcategoryId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700">
                  {loading ? "Adding..." : "Add Expense"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}