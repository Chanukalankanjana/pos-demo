import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, UserCheck, UserX, Download, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { generatePDF } from "@/lib/pdfUtils";
import { StatCard } from "@/components/Dashboard/StatCard";
import { UpgradeModal } from "@/components/Billing/UpgradeModal";
import { useFeature } from "@/hooks/useFeature";

const Attendance = () => {
  const { isEnabled } = useFeature("attendance");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEnabled) {
      setShowUpgrade(true);
    }
  }, [isEnabled]);

  const handleExportReport = async () => {
    try {
      await generatePDF('attendance-content', 'attendance-report.pdf')
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const todayAttendance = [
    { id: "EMP001", name: "John Smith", role: "Chef", checkIn: "08:45 AM", checkOut: "-", status: "present", hours: "5h 30m" },
    { id: "EMP002", name: "Sarah Johnson", role: "Server", checkIn: "09:00 AM", checkOut: "-", status: "present", hours: "5h 15m" },
    { id: "EMP003", name: "Mike Wilson", role: "Manager", checkIn: "08:30 AM", checkOut: "-", status: "present", hours: "5h 45m" },
    { id: "EMP004", name: "Emily Davis", role: "Server", checkIn: "-", checkOut: "-", status: "absent", hours: "0h" },
    { id: "EMP005", name: "David Brown", role: "Cook", checkIn: "09:15 AM", checkOut: "-", status: "late", hours: "5h 0m" },
    { id: "EMP006", name: "Lisa Anderson", role: "Server", checkIn: "09:00 AM", checkOut: "02:30 PM", status: "checked-out", hours: "5h 30m" },
  ];

  const weeklyReport = [
    { employee: "John Smith", mon: "P", tue: "P", wed: "P", thu: "P", fri: "P", sat: "P", sun: "Off", totalHours: "48h", attendance: "100%" },
    { employee: "Sarah Johnson", mon: "P", tue: "P", wed: "L", thu: "P", fri: "P", sat: "P", sun: "Off", totalHours: "47h", attendance: "95%" },
    { employee: "Mike Wilson", mon: "P", tue: "P", wed: "P", thu: "A", fri: "P", sat: "P", sun: "Off", totalHours: "40h", attendance: "85%" },
    { employee: "Emily Davis", mon: "P", tue: "L", wed: "P", thu: "P", fri: "A", sat: "P", sun: "Off", totalHours: "38h", attendance: "80%" },
  ];

  const leaveRequests = [
    { id: "LR001", employee: "Sarah Johnson", type: "Sick Leave", startDate: "2025-10-18", endDate: "2025-10-19", days: 2, status: "pending", reason: "Medical appointment" },
    { id: "LR002", employee: "Mike Wilson", type: "Vacation", startDate: "2025-10-25", endDate: "2025-10-30", days: 6, status: "approved", reason: "Family vacation" },
    { id: "LR003", employee: "David Brown", type: "Personal", startDate: "2025-10-20", endDate: "2025-10-20", days: 1, status: "pending", reason: "Personal matters" },
    { id: "LR004", employee: "Lisa Anderson", type: "Sick Leave", startDate: "2025-10-16", endDate: "2025-10-17", days: 2, status: "rejected", reason: "Common cold" },
  ];

  const shifts = [
    { shift: "Morning (08:00 - 14:00)", scheduled: 8, present: 7, absent: 1, coverage: "87%" },
    { shift: "Afternoon (14:00 - 20:00)", scheduled: 10, present: 10, absent: 0, coverage: "100%" },
    { shift: "Evening (20:00 - 02:00)", scheduled: 6, present: 5, absent: 1, coverage: "83%" },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 relative">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Attendance Management</h1>
            <p className="text-muted-foreground mt-2">Track employee attendance and schedules</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Attendance Calendar</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">October 2025</h3>
                    <div className="grid grid-cols-7 gap-2 text-sm">
                      <div className="p-2 text-center font-semibold">Sun</div>
                      <div className="p-2 text-center font-semibold">Mon</div>
                      <div className="p-2 text-center font-semibold">Tue</div>
                      <div className="p-2 text-center font-semibold">Wed</div>
                      <div className="p-2 text-center font-semibold">Thu</div>
                      <div className="p-2 text-center font-semibold">Fri</div>
                      <div className="p-2 text-center font-semibold">Sat</div>
                      
                      {Array.from({ length: 31 }, (_, i) => {
                        const day = i + 1;
                        const isToday = day === 15; // Current day
                        const isWeekend = (i + 1) % 7 === 0 || (i + 1) % 7 === 1;
                        const hasAttendance = day % 3 === 0; // Some days have attendance data
                        
                        return (
                          <div
                            key={day}
                            className={`p-2 text-center rounded ${
                              isToday 
                                ? 'bg-primary text-primary-foreground' 
                                : isWeekend 
                                ? 'bg-muted text-muted-foreground' 
                                : hasAttendance 
                                ? 'bg-green-100 text-green-800' 
                                : 'hover:bg-muted'
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex justify-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-100 rounded"></div>
                        <span>Present</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-100 rounded"></div>
                        <span>Absent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-muted rounded"></div>
                        <span>Weekend</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div id="attendance-content" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Present Today"
            value="18/24"
            change="75%"
            icon={UserCheck}
            trend="up"
          />
          <StatCard
            title="Absent Today"
            value="3"
            change="-2"
            icon={UserX}
            trend="down"
          />
          <StatCard
            title="Late Arrivals"
            value="3"
            change="+1"
            icon={Clock}
            trend="down"
          />
          <StatCard
            title="Avg. Attendance"
            value="92.5%"
            change="+3.2%"
            icon={TrendingUp}
            trend="up"
          />
        </div>

        <Tabs defaultValue="today" className="space-y-6">
          <TabsList>
            <TabsTrigger value="today">Today's Attendance</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
            <TabsTrigger value="shifts">Shift Coverage</TabsTrigger>
            <TabsTrigger value="leave">Leave Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <Card>
              <CardHeader>
                <CardTitle>Today's Attendance - October 15, 2025</CardTitle>
                <CardDescription>Real-time attendance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours Worked</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.id}</TableCell>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.role}</TableCell>
                        <TableCell>{record.checkIn}</TableCell>
                        <TableCell>{record.checkOut}</TableCell>
                        <TableCell>{record.hours}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              record.status === "present" ? "default" : 
                              record.status === "absent" ? "destructive" : 
                              record.status === "late" ? "secondary" : 
                              "outline"
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance Report</CardTitle>
                <CardDescription>Week of October 9-15, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-center">Mon</TableHead>
                      <TableHead className="text-center">Tue</TableHead>
                      <TableHead className="text-center">Wed</TableHead>
                      <TableHead className="text-center">Thu</TableHead>
                      <TableHead className="text-center">Fri</TableHead>
                      <TableHead className="text-center">Sat</TableHead>
                      <TableHead className="text-center">Sun</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weeklyReport.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{record.employee}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={record.mon === "P" ? "default" : record.mon === "L" ? "secondary" : record.mon === "A" ? "destructive" : "outline"} className="w-12">
                            {record.mon}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={record.tue === "P" ? "default" : record.tue === "L" ? "secondary" : record.tue === "A" ? "destructive" : "outline"} className="w-12">
                            {record.tue}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={record.wed === "P" ? "default" : record.wed === "L" ? "secondary" : record.wed === "A" ? "destructive" : "outline"} className="w-12">
                            {record.wed}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={record.thu === "P" ? "default" : record.thu === "L" ? "secondary" : record.thu === "A" ? "destructive" : "outline"} className="w-12">
                            {record.thu}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={record.fri === "P" ? "default" : record.fri === "L" ? "secondary" : record.fri === "A" ? "destructive" : "outline"} className="w-12">
                            {record.fri}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={record.sat === "P" ? "default" : record.sat === "L" ? "secondary" : record.sat === "A" ? "destructive" : "outline"} className="w-12">
                            {record.sat}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="w-12">{record.sun}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{record.totalHours}</TableCell>
                        <TableCell>
                          <Badge variant={parseInt(record.attendance) >= 95 ? "default" : parseInt(record.attendance) >= 85 ? "secondary" : "destructive"}>
                            {record.attendance}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Legend:</p>
                  <div className="flex gap-4 text-sm">
                    <span><strong>P</strong> - Present</span>
                    <span><strong>L</strong> - Late</span>
                    <span><strong>A</strong> - Absent</span>
                    <span><strong>Off</strong> - Scheduled Off</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shifts">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shifts.map((shift, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{shift.shift}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Scheduled</p>
                        <p className="text-2xl font-bold">{shift.scheduled}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Present</p>
                        <p className="text-2xl font-bold text-success">{shift.present}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Absent</p>
                        <p className="text-2xl font-bold text-destructive">{shift.absent}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Coverage</p>
                        <p className="text-2xl font-bold">{shift.coverage}</p>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: shift.coverage }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leave">
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Manage employee time-off requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>{request.employee}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.type}</Badge>
                        </TableCell>
                        <TableCell>{request.startDate}</TableCell>
                        <TableCell>{request.endDate}</TableCell>
                        <TableCell>{request.days}</TableCell>
                        <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              request.status === "approved" ? "default" : 
                              request.status === "rejected" ? "destructive" : 
                              "secondary"
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Approve</Button>
                              <Button size="sm" variant="outline">Reject</Button>
                            </div>
                          )}
                          {request.status !== "pending" && (
                            <Button size="sm" variant="outline">View</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <UpgradeModal
          featureKey="attendance"
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

export default Attendance;
