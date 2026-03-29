import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Eye, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { UpgradeModal } from "@/components/Billing/UpgradeModal";
import { useFeature } from "@/hooks/useFeature";

const QRMenu = () => {
  const { isEnabled } = useFeature("qrOrdering");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEnabled) {
      setShowUpgrade(true);
    }
  }, [isEnabled]);

  return (
    <DashboardLayout>
      <div className="p-8 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">QR Code Ordering</h1>
          <p className="text-muted-foreground mt-1">Digital menu and contactless ordering</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Table QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 8 }, (_, i) => i + 1).map(table => (
                  <Card key={table} className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-primary" />
                    </div>
                    <p className="font-semibold text-center mb-2">Table {table}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Print
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Menu Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Main Menu</p>
                    <p className="text-sm text-muted-foreground">45 items</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Lunch Specials</p>
                    <p className="text-sm text-muted-foreground">12 items</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Drinks Menu</p>
                    <p className="text-sm text-muted-foreground">28 items</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">QR Orders Today</span>
                  <span className="text-2xl font-bold text-accent">142</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg. Order Value</span>
                  <span className="text-2xl font-bold text-success">{formatCurrency(2850)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Customer Satisfaction</span>
                  <span className="text-2xl font-bold text-warning">4.8⭐</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <UpgradeModal
          featureKey="qrOrdering"
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
    </DashboardLayout>
  );
};

export default QRMenu;
