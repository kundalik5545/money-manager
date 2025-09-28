"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, TrendingUp, BarChart3 } from "lucide-react";

export default function AddInvestmentModal({ isOpen, onClose, onSuccess, editData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    type: "STOCKS",
    quantity: "",
    purchasePrice: "",
    currentPrice: ""
  });

  // Initialize form with edit data when modal opens
  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        symbol: editData.symbol || "",
        name: editData.name || "",
        type: editData.type || "STOCKS",
        quantity: editData.quantity?.toString() || "",
        purchasePrice: editData.purchasePrice?.toString() || "",
        currentPrice: editData.currentPrice?.toString() || ""
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        symbol: "",
        name: "",
        type: "STOCKS",
        quantity: "",
        purchasePrice: "",
        currentPrice: ""
      });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        symbol: formData.symbol,
        name: formData.name,
        type: formData.type,
        quantity: parseFloat(formData.quantity) || 0,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        currentPrice: parseFloat(formData.currentPrice) || parseFloat(formData.purchasePrice) || 0
      };

      // Add ID for edit mode
      if (editData) {
        submitData.id = editData.id;
      }

      const response = await fetch('/api/investments', {
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
      console.error("Failed to create/update investment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInvestmentTypeIcon = (type) => {
    switch (type) {
      case 'STOCKS':
        return BarChart3;
      case 'CRYPTOCURRENCY':
        return TrendingUp;
      default:
        return TrendingUp;
    }
  };

  if (!isOpen) return null;

  const InvestmentIcon = getInvestmentTypeIcon(formData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <InvestmentIcon className="h-5 w-5 text-blue-600" />
              <CardTitle>{editData ? 'Edit Investment' : 'Add New Investment'}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Investment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Investment Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">Symbol/Ticker</Label>
                    <Input
                      id="symbol"
                      placeholder="AAPL, RELIANCE.NS"
                      value={formData.symbol}
                      onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Stock ticker symbol or identifier
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name">Investment Name</Label>
                    <Input
                      id="name"
                      placeholder="Apple Inc."
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Investment Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select investment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STOCKS">Stocks</SelectItem>
                        <SelectItem value="MUTUAL_FUNDS">Mutual Funds</SelectItem>
                        <SelectItem value="ETF">ETF</SelectItem>
                        <SelectItem value="BONDS">Bonds</SelectItem>
                        <SelectItem value="CRYPTOCURRENCY">Cryptocurrency</SelectItem>
                        <SelectItem value="GOLD">Gold</SelectItem>
                        <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.001"
                      placeholder="10"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Number of shares/units
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Information */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Price Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      placeholder="150.00"
                      value={formData.purchasePrice}
                      onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Average price when purchased
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="currentPrice">Current Price (₹) - Optional</Label>
                    <Input
                      id="currentPrice"
                      type="number"
                      step="0.01"
                      placeholder="175.00"
                      value={formData.currentPrice}
                      onChange={(e) => handleInputChange("currentPrice", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to use purchase price
                    </p>
                  </div>
                </div>

                {/* Calculated Values Preview */}
                {formData.quantity && formData.purchasePrice && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <h4 className="font-medium mb-2">Investment Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Invested</p>
                        <p className="font-medium">
                          ₹{((parseFloat(formData.quantity) || 0) * (parseFloat(formData.purchasePrice) || 0)).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Value</p>
                        <p className="font-medium">
                          ₹{((parseFloat(formData.quantity) || 0) * (parseFloat(formData.currentPrice) || parseFloat(formData.purchasePrice) || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (editData ? "Updating..." : "Adding...") : (editData ? "Update Investment" : "Add Investment")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}