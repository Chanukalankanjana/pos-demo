import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  ShoppingCart,
  PieChart,
  LineChart
} from "lucide-react";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { generatePDF, generateSalesReport } from "@/lib/pdfUtils";
import { UpgradeModal } from "@/components/Billing/UpgradeModal";
import { useFeature } from "@/hooks/useFeature";

const Analytics = () => {
  const { isEnabled } = useFeature("analytics");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEnabled) {
      setShowUpgrade(true);
    }
  }, [isEnabled]);
  const handleExportReport = async () => {
    try {
      await generatePDF('analytics-content', 'analytics-report.pdf')
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const handleExportSalesData = () => {
    generateSalesReport(salesData)
  }
  const salesData = [
    { month: "Jan", revenue: 125000, orders: 450 },
    { month: "Feb", revenue: 142000, orders: 520 },
    { month: "Mar", revenue: 138000, orders: 480 },
    { month: "Apr", revenue: 165000, orders: 620 },
    { month: "May", revenue: 158000, orders: 580 },
    { month: "Jun", revenue: 175000, orders: 650 },
  ];

  const categoryData = [
    { category: "Mains", revenue: 450000, percentage: 45 },
    { category: "Drinks", revenue: 200000, percentage: 20 },
    { category: "Desserts", revenue: 150000, percentage: 15 },
    { category: "Starters", revenue: 100000, percentage: 10 },
    { category: "Other", revenue: 100000, percentage: 10 },
  ];

  const hourlyData = [
    { hour: "6AM", orders: 5, revenue: 12500 },
    { hour: "9AM", orders: 15, revenue: 37500 },
    { hour: "12PM", orders: 45, revenue: 112500 },
    { hour: "3PM", orders: 25, revenue: 62500 },
    { hour: "6PM", orders: 60, revenue: 150000 },
    { hour: "9PM", orders: 40, revenue: 100000 },
    { hour: "12AM", orders: 10, revenue: 25000 },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
        {/* Modern Header */}
        <div className="p-8 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Analytics & Reports
              </h1>
              <p className="text-muted-foreground mt-3 text-xl">Comprehensive insights into your business performance</p>
            </div>
            <div className="flex items-center gap-4">
              <Button className="modern-button gradient-primary" onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" className="modern-button" onClick={handleExportSalesData}>
                <Download className="w-4 h-4 mr-2" />
                Export Sales Data
              </Button>
              <div className="px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                <span className="text-accent font-semibold text-sm">Live Data</span>
              </div>
              <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div id="analytics-content" className="px-8 pb-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="modern-card shadow-modern-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold mt-2">{formatCurrencyCompact(1000000)}</p>
                    <p className="text-sm text-success mt-1 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +12.5% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="modern-card shadow-modern-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
                    <p className="text-3xl font-bold mt-2">3,200</p>
                    <p className="text-sm text-success mt-1 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +8.2% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="modern-card shadow-modern-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Avg. Order Value</p>
                    <p className="text-3xl font-bold mt-2">{formatCurrency(3125)}</p>
                    <p className="text-sm text-success mt-1 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +3.1% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 gradient-warning rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="modern-card shadow-modern-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Customer Growth</p>
                    <p className="text-3xl font-bold mt-2">+24%</p>
                    <p className="text-sm text-success mt-1 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +5.2% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 gradient-success rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="sales" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-modern">
                Sales Trends
              </TabsTrigger>
              <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-modern">
                Categories
              </TabsTrigger>
              <TabsTrigger value="hourly" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-modern">
                Hourly Analysis
              </TabsTrigger>
              <TabsTrigger value="predictions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-modern">
                Predictions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales">
              <Card className="modern-card shadow-modern-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                      <LineChart className="w-5 h-5 text-white" />
                    </div>
                    Monthly Sales Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {salesData.map((data, index) => (
                      <div key={data.month} className="flex items-center justify-between p-5 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-muted/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold">
                            {data.month}
                          </div>
                          <div>
                            <p className="font-bold text-lg">{data.month} 2024</p>
                            <p className="text-sm text-muted-foreground">{data.orders} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl">{formatCurrency(data.revenue)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full gradient-primary rounded-full"
                                style={{ width: `${(data.revenue / 175000) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {Math.round((data.revenue / 175000) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card className="modern-card shadow-modern-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
                      <PieChart className="w-5 h-5 text-white" />
                    </div>
                    Revenue by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.map((category, index) => (
                      <div key={category.category} className="p-5 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-muted/50">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-lg">{category.category}</h3>
                          <div className="text-right">
                            <p className="font-bold text-xl">{formatCurrency(category.revenue)}</p>
                            <p className="text-sm text-muted-foreground">{category.percentage}% of total</p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full gradient-accent rounded-full transition-all duration-500"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hourly">
              <Card className="modern-card shadow-modern-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 gradient-warning rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    Peak Hours Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hourlyData.map((hour, index) => (
                      <div key={hour.hour} className="p-5 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-muted/50 hover:shadow-modern transition-all duration-200">
                        <div className="text-center">
                          <p className="font-bold text-2xl text-primary">{hour.hour}</p>
                          <p className="text-sm text-muted-foreground mt-1">{hour.orders} orders</p>
                          <p className="font-bold text-lg mt-2">{formatCurrency(hour.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="modern-card shadow-modern-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Next Month Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-success/20 to-success/10 rounded-xl border border-success/30">
                        <p className="font-bold text-lg text-success">Expected Revenue</p>
                        <p className="text-2xl font-bold text-success mt-1">{formatCurrencyCompact(1850000)}</p>
                        <p className="text-sm text-success/80 mt-1">+15% growth predicted</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl border border-primary/30">
                        <p className="font-bold text-lg text-primary">Expected Orders</p>
                        <p className="text-2xl font-bold text-primary mt-1">3,680</p>
                        <p className="text-sm text-primary/80 mt-1">+12% growth predicted</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="modern-card shadow-modern-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <div className="w-7 h-7 gradient-warning rounded-lg flex items-center justify-center">
                        <TrendingDown className="w-4 h-4 text-white" />
                      </div>
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-warning/20 to-warning/10 rounded-xl border border-warning/30">
                        <p className="font-bold text-lg text-warning">Low Risk</p>
                        <p className="text-sm text-warning/80 mt-1">Current trends are stable and positive</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-accent/20 to-accent/10 rounded-xl border border-accent/30">
                        <p className="font-bold text-lg text-accent">Recommendation</p>
                        <p className="text-sm text-accent/80 mt-1">Consider expanding peak hour capacity</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <UpgradeModal
            featureKey="analytics"
            open={showUpgrade}
            onOpenChange={(open) => {
              setShowUpgrade(open);
              if (!open && !isEnabled) {
                const fallback = "/pos";
                const last = sessionStorage.getItem("lastUnlockedRoute") || fallback;
                navigate(last, { replace: true });
              }
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
