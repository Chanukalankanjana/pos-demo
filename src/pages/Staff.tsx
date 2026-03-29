import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, DollarSign, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { UpgradeModal } from "@/components/Billing/UpgradeModal";
import { useFeature } from "@/hooks/useFeature";

const Staff = () => {
  const { isEnabled } = useFeature("staffHr");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEnabled) {
      setShowUpgrade(true);
    }
  }, [isEnabled]);

  const [staffMembers, setStaffMembers] = useState([
    { name: "John Smith", role: "Head Chef", status: "active", salary: 125000, hours: "160" },
    { name: "Sarah Johnson", role: "Sous Chef", status: "active", salary: 95000, hours: "158" },
    { name: "Mike Brown", role: "Senior Waiter", status: "active", salary: 65000, hours: "152" },
    { name: "Emily Davis", role: "Restaurant Manager", status: "active", salary: 135000, hours: "160" },
    { name: "James Wilson", role: "Bartender", status: "active", salary: 75000, hours: "145" },
    { name: "Lisa Anderson", role: "Host", status: "off", salary: 55000, hours: "120" },
  ]);

  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    salary: '',
    hours: ''
  });

  const handleAddStaff = () => {
    const staff = {
      name: newStaff.name,
      role: newStaff.role,
      status: "active",
      salary: parseInt(newStaff.salary),
      hours: newStaff.hours
    };
    setStaffMembers([...staffMembers, staff]);
    setNewStaff({ name: '', role: '', salary: '', hours: '' });
  };
  return (
    <DashboardLayout>
      <div className="p-8 relative">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Staff & HR Management</h1>
            <p className="text-muted-foreground mt-1">Manage your team and payroll</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="staff-name">Full Name</Label>
                  <Input
                    id="staff-name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                    placeholder="Enter staff member name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="staff-role">Role</Label>
                  <select
                    id="staff-role"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Select role</option>
                    <option value="Head Chef">Head Chef</option>
                    <option value="Sous Chef">Sous Chef</option>
                    <option value="Senior Waiter">Senior Waiter</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Restaurant Manager">Restaurant Manager</option>
                    <option value="Bartender">Bartender</option>
                    <option value="Host">Host</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="staff-salary">Salary (LKR)</Label>
                  <Input
                    id="staff-salary"
                    type="number"
                    value={newStaff.salary}
                    onChange={(e) => setNewStaff({...newStaff, salary: e.target.value})}
                    placeholder="Enter salary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="staff-hours">Hours per Month</Label>
                  <Input
                    id="staff-hours"
                    value={newStaff.hours}
                    onChange={(e) => setNewStaff({...newStaff, hours: e.target.value})}
                    placeholder="Enter hours per month"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleAddStaff}>Add Staff Member</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                  <p className="text-3xl font-bold mt-1">24</p>
                  <p className="text-sm text-success mt-1">6 on duty now</p>
                </div>
                <UserPlus className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrencyCompact(1850000)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Due in 5 days</p>
                </div>
                <DollarSign className="w-10 h-10 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours (This Month)</p>
                  <p className="text-3xl font-bold mt-1">3,456</p>
                  <p className="text-sm text-accent mt-1">+8% from last month</p>
                </div>
                <Clock className="w-10 h-10 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffMembers.map((staff) => (
                <div key={staff.name} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Monthly Salary</p>
                      <p className="font-semibold">{formatCurrency(staff.salary)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Hours</p>
                      <p className="font-semibold">{staff.hours}h</p>
                    </div>
                    <Badge variant={staff.status === "active" ? "default" : "secondary"}>
                      {staff.status === "active" ? "On Duty" : "Off Duty"}
                    </Badge>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Morning Shift", time: "8:00 AM - 2:00 PM", staff: 8 },
                  { name: "Lunch Shift", time: "11:00 AM - 4:00 PM", staff: 12 },
                  { name: "Evening Shift", time: "4:00 PM - 11:00 PM", staff: 15 },
                  { name: "Night Shift", time: "9:00 PM - 1:00 AM", staff: 6 },
                ].map((shift) => (
                  <div key={shift.name} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{shift.name}</p>
                      <p className="text-sm text-muted-foreground">{shift.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent">{shift.staff} Staff</p>
                      <Button variant="ghost" size="sm" className="mt-1">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Mike Brown", dates: "Dec 24-26", status: "pending" },
                  { name: "Sarah Johnson", dates: "Dec 31 - Jan 2", status: "pending" },
                  { name: "Lisa Anderson", dates: "Jan 15-17", status: "approved" },
                  { name: "James Wilson", dates: "Jan 20-22", status: "pending" },
                ].map((request) => (
                  <div key={`${request.name}-${request.dates}`} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-muted-foreground">{request.dates}</p>
                    </div>
                    <div className="flex gap-2">
                      {request.status === "pending" ? (
                        <>
                          <Button variant="outline" size="sm" className="bg-success text-success-foreground">
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" className="bg-destructive text-destructive-foreground">
                            Deny
                          </Button>
                        </>
                      ) : (
                        <Badge variant="default">Approved</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <UpgradeModal
          featureKey="staffHr"
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

export default Staff;
