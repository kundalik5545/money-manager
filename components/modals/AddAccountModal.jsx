"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Building, CreditCard, Wallet } from "lucide-react";

export default function AddAccountModal({ isOpen, onClose, onSuccess, editData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "BANK",
    balance: "",
    // Enhanced bank details
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    upiId: "",
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    creditLimit: "",
    // Wallet details
    walletProvider: "",
    linkedPhone: ""
  });

  // Initialize form with edit data when modal opens
  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        name: editData.name || "",
        type: editData.type || "BANK",
        balance: editData.balance?.toString() || "",
        // Enhanced bank details (not stored in DB yet)
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        branchName: "",
        upiId: "",
        cardNumber: "",
        cardHolderName: "",
        expiryDate: "",
        creditLimit: "",
        walletProvider: "",
        linkedPhone: ""
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: "",
        type: "BANK",
        balance: "",
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        branchName: "",
        upiId: "",
        cardNumber: "",
        cardHolderName: "",
        expiryDate: "",
        creditLimit: "",
        walletProvider: "",
        linkedPhone: ""
      });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance) || 0
      };

      // Add ID for edit mode
      if (editData) {
        submitData.id = editData.id;
      }

      const response = await fetch('/api/accounts', {
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
          // Reset form
          setFormData({
            name: "",
            type: "BANK",
            balance: "",
            accountNumber: "",
            ifscCode: "",
            bankName: "",
            branchName: "",
            upiId: "",
            cardNumber: "",
            cardHolderName: "",
            expiryDate: "",
            creditLimit: "",
            walletProvider: "",
            linkedPhone: ""
          });
        }
      }
    } catch (error) {
      console.error("Failed to create account:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  if (!isOpen) return null;

  const AccountIcon = getAccountIcon(formData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <AccountIcon className="h-5 w-5 text-blue-600" />
              <CardTitle>{editData ? 'Edit Account' : 'Add New Account'}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Account Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter account name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Account Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BANK">Bank Account</SelectItem>
                        <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                        <SelectItem value="WALLET">Digital Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="balance">
                      {formData.type === 'CREDIT_CARD' ? 'Current Balance (₹)' : 'Initial Balance (₹)'}
                    </Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.balance}
                      onChange={(e) => handleInputChange("balance", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Bank Account Details */}
              {formData.type === 'BANK' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Bank Account Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        placeholder="State Bank of India"
                        value={formData.bankName}
                        onChange={(e) => handleInputChange("bankName", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="branchName">Branch Name</Label>
                      <Input
                        id="branchName"
                        placeholder="Main Branch"
                        value={formData.branchName}
                        onChange={(e) => handleInputChange("branchName", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="XXXX-XXXX-XXXX-1234"
                        value={formData.accountNumber}
                        onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="ifscCode">IFSC Code</Label>
                      <Input
                        id="ifscCode"
                        placeholder="SBIN0000123"
                        value={formData.ifscCode}
                        onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="upiId">UPI ID (Optional)</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@paytm"
                        value={formData.upiId}
                        onChange={(e) => handleInputChange("upiId", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Credit Card Details */}
              {formData.type === 'CREDIT_CARD' && (
                <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    Credit Card Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number (Last 4 digits)</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234"
                        maxLength="4"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardHolderName">Card Holder Name</Label>
                      <Input
                        id="cardHolderName"
                        placeholder="John Doe"
                        value={formData.cardHolderName}
                        onChange={(e) => handleInputChange("cardHolderName", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                      <Input
                        id="creditLimit"
                        type="number"
                        placeholder="50000"
                        value={formData.creditLimit}
                        onChange={(e) => handleInputChange("creditLimit", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Details */}
              {formData.type === 'WALLET' && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-green-600" />
                    Digital Wallet Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="walletProvider">Wallet Provider</Label>
                      <Select value={formData.walletProvider} onValueChange={(value) => handleInputChange("walletProvider", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select wallet provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paytm">Paytm</SelectItem>
                          <SelectItem value="phonepe">PhonePe</SelectItem>
                          <SelectItem value="googlepay">Google Pay</SelectItem>
                          <SelectItem value="amazonpay">Amazon Pay</SelectItem>
                          <SelectItem value="mobikwik">MobiKwik</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="linkedPhone">Linked Phone Number</Label>
                      <Input
                        id="linkedPhone"
                        placeholder="+91 98765 43210"
                        value={formData.linkedPhone}
                        onChange={(e) => handleInputChange("linkedPhone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}