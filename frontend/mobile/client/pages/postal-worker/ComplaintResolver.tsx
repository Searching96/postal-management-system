import PostalWorkerShell from "@/components/PostalWorkerShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, MessageSquare, Clock, CheckCircle, XCircle, Search, Phone, Mail, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type ComplaintStatus = 'pending' | 'investigating' | 'resolved' | 'closed' | 'escalated';
type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';
type ComplaintCategory = 'delivery' | 'damage' | 'lost' | 'delay' | 'service' | 'billing' | 'other';

interface Complaint {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  trackingNumber: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
  notes: string[];
}

interface ComplaintAction {
  action: string;
  timestamp: string;
  user: string;
  note?: string;
}

const mockComplaints: Complaint[] = [
  {
    id: '1',
    ticketNumber: 'CP240001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    customerEmail: 'nguyenva@example.com',
    trackingNumber: 'VNP12345678',
    category: 'damage',
    priority: 'high',
    status: 'pending',
    subject: 'Kiện hàng bị hỏng khi nhận',
    description: 'Tôi nhận được kiện hàng nhưng bên trong bị vỡ. Đây là món quà sinh nhật quan trọng.',
    createdAt: '2024-12-01 09:30',
    updatedAt: '2024-12-01 09:30',
    notes: []
  },
  {
    id: '2',
    ticketNumber: 'CP240002',
    customerName: 'Trần Thị B',
    customerPhone: '0987654321',
    customerEmail: 'tranthib@example.com',
    trackingNumber: 'VNP87654321',
    category: 'delay',
    priority: 'medium',
    status: 'investigating',
    subject: 'Kiện hàng giao quá thời gian dự kiến',
    description: 'Kiện hàng đã quá 3 ngày so với thời gian dự kiến nhưng vẫn chưa được giao.',
    createdAt: '2024-11-30 14:15',
    updatedAt: '2024-12-01 08:00',
    assignedTo: 'Nguyễn Thị E',
    notes: ['Đã liên hệ bưu tá giao hàng - đang xác minh vị trí kiện hàng']
  },
  {
    id: '3',
    ticketNumber: 'CP240003',
    customerName: 'Lê Văn C',
    customerPhone: '0912345678',
    customerEmail: 'levanc@example.com',
    trackingNumber: 'VNP11223344',
    category: 'service',
    priority: 'low',
    status: 'resolved',
    subject: 'Nhân viên giao hàng thái độ không tốt',
    description: 'Nhân viên giao hàng có thái độ cộc cằn và không lịch sự khi giao kiện hàng.',
    createdAt: '2024-11-29 16:45',
    updatedAt: '2024-11-30 10:20',
    assignedTo: 'Nguyễn Thị E',
    resolution: 'Đã nhắc nhở và đào tạo lại nhân viên. Khách hàng đã hài lòng với giải pháp.',
    notes: [
      'Đã liên hệ với nhân viên giao hàng để xác minh sự việc',
      'Đã trao đổi với khách hàng và xin lỗi về sự cố',
      'Đã đào tạo lại nhân viên về cách ứng xử với khách hàng'
    ]
  }
];

const categoryLabels: Record<ComplaintCategory, string> = {
  delivery: 'Giao hàng',
  damage: 'Hỏng hóc',
  lost: 'Thất lạc',
  delay: 'Chậm trễ',
  service: 'Dịch vụ',
  billing: 'Thanh toán',
  other: 'Khác'
};

const priorityLabels: Record<ComplaintPriority, string> = {
  low: 'Thấp',
  medium: 'Vừa',
  high: 'Cao',
  critical: 'Khẩn cấp'
};

const statusLabels: Record<ComplaintStatus, string> = {
  pending: 'Chờ xử lý',
  investigating: 'Đang điều tra',
  resolved: 'Đã giải quyết',
  closed: 'Đã đóng',
  escalated: 'Chuyển cấp trên'
};

export default function ComplaintResolver() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [newNote, setNewNote] = useState('');
  const [resolution, setResolution] = useState('');

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (complaintId: string, newStatus: ComplaintStatus) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: newStatus, updatedAt: new Date().toLocaleString('vi-VN') }
        : complaint
    ));
    
    toast({
      title: "Cập nhật trạng thái",
      description: "Trạng thái khiếu nại đã được cập nhật",
      variant: "default"
    });
  };

  const handleAddNote = (complaintId: string) => {
    if (!newNote.trim()) return;

    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { 
            ...complaint, 
            notes: [...complaint.notes, `[${new Date().toLocaleString('vi-VN')}] ${newNote}`],
            updatedAt: new Date().toLocaleString('vi-VN')
          }
        : complaint
    ));
    
    setNewNote('');
    toast({
      title: "Thêm ghi chú",
      description: "Ghi chú đã được thêm vào khiếu nại",
      variant: "default"
    });
  };

  const handleResolveComplaint = (complaintId: string) => {
    if (!resolution.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung giải quyết",
        variant: "destructive"
      });
      return;
    }

    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { 
            ...complaint, 
            status: 'resolved' as ComplaintStatus,
            resolution,
            updatedAt: new Date().toLocaleString('vi-VN')
          }
        : complaint
    ));
    
    setResolution('');
    setSelectedComplaint(null);
    toast({
      title: "Giải quyết khiếu nại",
      description: "Khiếu nại đã được đánh dấu là đã giải quyết",
      variant: "default"
    });
  };

  const getPriorityColor = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-slate-100 text-slate-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PostalWorkerShell title="Giải Quyết Khiếu Nại" userName="Nguyễn Thị E" role="Nhân viên bưu điện">
      <div className="space-y-6">
        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Tìm Kiếm Khiếu Nại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo mã ticket, tên KH, mã vận đơn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ComplaintStatus | 'all')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="investigating">Đang điều tra</SelectItem>
                  <SelectItem value="resolved">Đã giải quyết</SelectItem>
                  <SelectItem value="closed">Đã đóng</SelectItem>
                  <SelectItem value="escalated">Chuyển cấp trên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <Card key={complaint.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {complaint.ticketNumber}
                      </Badge>
                      <Badge className={getPriorityColor(complaint.priority)}>
                        {priorityLabels[complaint.priority]}
                      </Badge>
                      <Badge className={getStatusColor(complaint.status)}>
                        {statusLabels[complaint.status]}
                      </Badge>
                    </div>
                    <h3 className="font-medium">{complaint.subject}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Khách hàng: {complaint.customerName}</div>
                      <div>Mã vận đơn: {complaint.trackingNumber}</div>
                      <div>Loại: {categoryLabels[complaint.category]}</div>
                      <div>Ngày tạo: {complaint.createdAt}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Chi Tiết Khiếu Nại - {complaint.ticketNumber}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Customer Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-medium">Khách hàng</Label>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <span>{complaint.customerName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  <span>{complaint.customerPhone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  <span>{complaint.customerEmail}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label className="font-medium">Thông tin khiếu nại</Label>
                              <div className="space-y-1 text-sm">
                                <div>Mã vận đơn: {complaint.trackingNumber}</div>
                                <div>Loại: {categoryLabels[complaint.category]}</div>
                                <div>Độ ưu tiên: {priorityLabels[complaint.priority]}</div>
                                <div>Trạng thái: {statusLabels[complaint.status]}</div>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <Label className="font-medium">Mô tả chi tiết</Label>
                            <p className="text-sm mt-1 p-3 bg-muted/50 rounded">{complaint.description}</p>
                          </div>

                          {/* Notes */}
                          {complaint.notes.length > 0 && (
                            <div>
                              <Label className="font-medium">Ghi chú xử lý</Label>
                              <div className="space-y-2 mt-2">
                                {complaint.notes.map((note, index) => (
                                  <div key={index} className="text-sm p-2 bg-blue-50 border-l-4 border-blue-200 rounded-r">
                                    {note}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Resolution */}
                          {complaint.resolution && (
                            <div>
                              <Label className="font-medium">Kết quả giải quyết</Label>
                              <p className="text-sm mt-1 p-3 bg-green-50 border-l-4 border-green-200 rounded-r">
                                {complaint.resolution}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                            <div className="space-y-3 pt-4 border-t">
                              <div>
                                <Label htmlFor="newNote">Thêm ghi chú</Label>
                                <div className="flex gap-2 mt-1">
                                  <Textarea
                                    id="newNote"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Nhập ghi chú về quá trình xử lý..."
                                    rows={2}
                                  />
                                  <Button 
                                    onClick={() => handleAddNote(complaint.id)}
                                    disabled={!newNote.trim()}
                                  >
                                    Thêm
                                  </Button>
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="resolution">Giải quyết khiếu nại</Label>
                                <div className="space-y-2 mt-1">
                                  <Textarea
                                    id="resolution"
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    placeholder="Mô tả cách giải quyết và kết quả..."
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => handleResolveComplaint(complaint.id)}
                                      disabled={!resolution.trim()}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Giải quyết
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleStatusUpdate(complaint.id, 'escalated')}
                                    >
                                      Chuyển cấp trên
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {complaint.status === 'pending' && (
                      <Button 
                        size="sm"
                        onClick={() => handleStatusUpdate(complaint.id, 'investigating')}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Bắt đầu
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredComplaints.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Không tìm thấy khiếu nại nào</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PostalWorkerShell>
  );
}