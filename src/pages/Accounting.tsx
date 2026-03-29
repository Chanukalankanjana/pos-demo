import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Download, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generatePDF } from "@/lib/pdfUtils";
import { StatCard } from "@/components/Dashboard/StatCard";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";

const Accounting = () => {
  const [recentTransactions, setRecentTransactions] = useState([
    { id: "TRX001", date: "2025-10-15", type: "income", category: "Sales", amount: 125750.00, description: "Table 5 - Dinner Service" },
    { id: "TRX002", date: "2025-10-15", type: "expense", category: "Inventory", amount: -45000.00, description: "Fresh Produce Delivery" },
    { id: "TRX003", date: "2025-10-14", type: "income", category: "Sales", amount: 98500.00, description: "Online Orders" },
    { id: "TRX004", date: "2025-10-14", type: "expense", category: "Utilities", amount: -32000.00, description: "Electricity Bill" },
    { id: "TRX005", date: "2025-10-14", type: "expense", category: "Payroll", amount: -280000.00, description: "Staff Salaries - Week 41" },
    { id: "TRX006", date: "2025-10-13", type: "income", category: "Sales", amount: 156250.00, description: "Weekend Rush" },
  ]);

  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: ''
  });

  const handleAddTransaction = () => {
    const transaction = {
      id: `TRX${String(recentTransactions.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      type: newTransaction.type,
      category: newTransaction.category,
      amount: newTransaction.type === 'income' ? parseFloat(newTransaction.amount) : -parseFloat(newTransaction.amount),
      description: newTransaction.description
    };
    setRecentTransactions([transaction, ...recentTransactions]);
    setNewTransaction({ type: 'income', category: '', amount: '', description: '' });
  };

  const handleExportReport = async () => {
    try {
      await generatePDF('accounting-content', 'accounting-report.pdf')
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  };

  const expenses = [
    { category: "Inventory", amount: 1245000.00, percentage: 45, change: "+5%" },
    { category: "Payroll", amount: 890000.00, percentage: 32, change: "+2%" },
    { category: "Utilities", amount: 320000.00, percentage: 12, change: "-3%" },
    { category: "Rent", amount: 250000.00, percentage: 9, change: "0%" },
    { category: "Other", amount: 55000.00, percentage: 2, change: "+1%" },
  ];

  const invoices = [
    { id: "INV-001", vendor: "Fresh Farm Supplies", amount: 125000.00, dueDate: "2025-10-20", status: "pending" },
    { id: "INV-002", vendor: "City Water & Power", amount: 32000.00, dueDate: "2025-10-25", status: "pending" },
    { id: "INV-003", vendor: "Restaurant Equipment Co.", amount: 450000.00, dueDate: "2025-10-18", status: "overdue" },
    { id: "INV-004", vendor: "Cleaning Services Ltd", amount: 28000.00, dueDate: "2025-11-01", status: "pending" },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Accounting</h1>
            <p className="text-muted-foreground mt-2">Financial management and reporting</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="transaction-type">Transaction Type</Label>
                    <select
                      id="transaction-type"
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="transaction-category">Category</Label>
                    <select
                      id="transaction-category"
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="">Select category</option>
                      {newTransaction.type === 'income' ? (
                        <>
                          <option value="Sales">Sales</option>
                          <option value="Online Orders">Online Orders</option>
                          <option value="Catering">Catering</option>
                          <option value="Other Income">Other Income</option>
                        </>
                      ) : (
                        <>
                          <option value="Inventory">Inventory</option>
                          <option value="Payroll">Payroll</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Rent">Rent</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Other Expense">Other Expense</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="transaction-amount">Amount (LKR)</Label>
                    <Input
                      id="transaction-amount"
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="transaction-description">Description</Label>
                    <Input
                      id="transaction-description"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      placeholder="Enter transaction description"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleAddTransaction}>Add Transaction</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div id="accounting-content" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrencyCompact(4825000)}
            change="+12.5%"
            icon={DollarSign}
            trend="up"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrencyCompact(2760000)}
            change="+5.2%"
            icon={TrendingDown}
            trend="down"
          />
          <StatCard
            title="Net Profit"
            value={formatCurrencyCompact(2065000)}
            change="+18.3%"
            icon={TrendingUp}
            trend="up"
          />
          <StatCard
            title="Profit Margin"
            value="42.8%"
            change="+3.1%"
            icon={ArrowUpRight}
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.type === "income" ? "text-success" : "text-destructive"}`}>
                        {transaction.type === "income" ? <ArrowUpRight className="inline w-4 h-4 mr-1" /> : <ArrowDownRight className="inline w-4 h-4 mr-1" />}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Monthly spending by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{expense.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{formatCurrency(expense.amount)}</span>
                      <Badge variant="outline" className="text-xs">{expense.change}</Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${expense.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Invoices</CardTitle>
            <CardDescription>Manage your payables and receivables</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.vendor}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "overdue" ? "destructive" : "secondary"}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Pay Now</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Accounting;
