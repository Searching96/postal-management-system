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
import { AlertTriangle, Plus, Ticket, Clock, CheckCircle, XCircle, Settings, Users, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TicketCategory = 'equipment' | 'system' | 'vehicle' | 'facility' | 'safety' | 'hr' | 'other';

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  resolution?: string;
  attachments?: string[];
  comments: TicketComment[];
}

interface TicketComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface NewTicketForm {
  title: string;
  description: string;
  category: TicketCategory | '';
  priority: TicketPriority | '';
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'IT240001',
    title: 'Máy in tem giao hàng bị kẹt giấy',
    description: 'Máy in ở khu vực phân loại bị kẹt giấy liên tục, không thể in tem được.',
    category: 'equipment',
    priority: 'high',
    status: 'open',
    createdBy: 'Nguyễn Thị E',
    createdAt: '2024-12-01 08:30',
    updatedAt: '2024-12-01 08:30',
    dueDate: '2024-12-01 17:00',
    comments: []
  },
  {
    id: '2',
    ticketNumber: 'IT240002',
    title: 'Hệ thống quản lý kiện hàng chạy chậm',
    description: 'Hệ thống quét mã vận đơn và cập nhật trạng thái chạy rất chậm, ảnh hưởng đến hiệu suất.',
    category: 'system',
    priority: 'medium',
    status: 'in-progress',
    createdBy: 'Trần Văn F',
    assignedTo: 'IT Support',
    createdAt: '2024-11-30 14:20',
    updatedAt: '2024-12-01 09:15',
    dueDate: '2024-12-02 17:00',
    comments: [
      {
        id: '1',
        author: 'IT Support',
        content: 'Đã xác minh vấn đề. Đang nâng cấp server database.',
        timestamp: '2024-12-01 09:15'
      }
    ]
  },
  {
    id: '3',
    ticketNumber: 'IT240003',
    title: 'Xe tải BKS 51C-123.45 cần bảo trì',
    description: 'Xe tải cần thay dầu và kiểm tra phanh trước chuyến đi dài.',
    category: 'vehicle',
    priority: 'medium',
    status: 'resolved',
    createdBy: 'Lê Văn G',
    assignedTo: 'Bộ phận bảo trì',
    createdAt: '2024-11-29 10:00',
    updatedAt: '2024-11-30 16:30',
    resolution: 'Đã hoàn thành bảo trì định kỳ. Xe đã sẵn sàng hoạt động.',
    comments: [
      {
        id: '1',
        author: 'Bộ phận bảo trì',
        content: 'Đã lên lịch bảo trì vào sáng mai.',
        timestamp: '2024-11-29 14:00'
      },
      {
        id: '2',
        author: 'Bộ phận bảo trì',
        content: 'Hoàn thành bảo trì. Tất cả hệ thống hoạt động tốt.',
        timestamp: '2024-11-30 16:30'
      }
    ]
  }
];

const categoryLabels: Record<TicketCategory, string> = {
  equipment: 'Thiết bị',
  system: 'Hệ thống',
  vehicle: 'Phương tiện',
  facility: 'Cơ sở vật chất',
  safety: 'An toàn',
  hr: 'Nhân sự',
  other: 'Khác'
};

const priorityLabels: Record<TicketPriority, string> = {
  low: 'Thấp',
  medium: 'Vừa',
  high: 'Cao',
  urgent: 'Khẩn cấp'
};

const statusLabels: Record<TicketStatus, string> = {
  open: 'Mới',
  'in-progress': 'Đang xử lý',
  resolved: 'Đã giải quyết',
  closed: 'Đã đóng'
};

export default function TicketManagement() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [resolution, setResolution] = useState('');
  const [newTicket, setNewTicket] = useState<NewTicketForm>({
    title: '',
    description: '',
    category: '',
    priority: ''
  });

  const generateTicketNumber = () => {
    const prefix = "IT";
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const sequence = (tickets.length + 1).toString().padStart(3, '0');
    return `${prefix}${year}${month}${sequence}`;
  };

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description || !newTicket.category || !newTicket.priority) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive"
      });
      return;
    }

    const ticket: Ticket = {
      id: Date.now().toString(),
      ticketNumber: generateTicketNumber(),
      title: newTicket.title,
      description: newTicket.description,
      category: newTicket.category as TicketCategory,
      priority: newTicket.priority as TicketPriority,
      status: 'open',
      createdBy: 'Nguyễn Thị E',
      createdAt: new Date().toLocaleString('vi-VN'),
      updatedAt: new Date().toLocaleString('vi-VN'),
      comments: []
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({ title: '', description: '', category: '', priority: '' });
    setShowCreateDialog(false);

    toast({
      title: "Tạo ticket thành công",
      description: `Ticket ${ticket.ticketNumber} đã được tạo`,
      variant: "default"
    });
  };

  const handleStatusUpdate = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus, updatedAt: new Date().toLocaleString('vi-VN') }
        : ticket
    ));
    
    toast({
      title: "Cập nhật trạng thái",
      description: "Trạng thái ticket đã được cập nhật",
      variant: "default"
    });
  };

  const handleAddComment = (ticketId: string) => {
    if (!newComment.trim()) return;

    const comment: TicketComment = {
      id: Date.now().toString(),
      author: 'Nguyễn Thị E',
      content: newComment,
      timestamp: new Date().toLocaleString('vi-VN')
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            comments: [...ticket.comments, comment],
            updatedAt: new Date().toLocaleString('vi-VN')
          }
        : ticket
    ));
    
    setNewComment('');
    toast({
      title: "Thêm bình luận",
      description: "Bình luận đã được thêm vào ticket",
      variant: "default"
    });
  };

  const handleResolveTicket = (ticketId: string) => {
    if (!resolution.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung giải quyết",
        variant: "destructive"
      });
      return;
    }

    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: 'resolved' as TicketStatus,
            resolution,
            updatedAt: new Date().toLocaleString('vi-VN')
          }
        : ticket
    ));
    
    setResolution('');
    setSelectedTicket(null);
    toast({
      title: "Giải quyết ticket",
      description: "Ticket đã được đánh dấu là đã giải quyết",
      variant: "default"
    });
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: TicketCategory) => {
    switch (category) {
      case 'equipment': return <Settings className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'vehicle': return <Truck className="h-4 w-4" />;
      case 'facility': return <Settings className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      case 'hr': return <Users className="h-4 w-4" />;
      default: return <Ticket className="h-4 w-4" />;
    }
  };

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
    <PostalWorkerShell title="Quản Lý Ticket" userName="Nguyễn Thị E" role="Nhân viên bưu điện">
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{openTickets.length}</div>
              <div className="text-sm text-muted-foreground">Đang mở</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{resolvedTickets.length}</div>
              <div className="text-sm text-muted-foreground">Đã giải quyết</div>
            </div>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Ticket Mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo Ticket Mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Mô tả ngắn gọn vấn đề"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Mô tả chi tiết *</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả chi tiết vấn đề và tác động"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Danh mục *</Label>
                    <Select value={newTicket.category} onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value as TicketCategory }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Độ ưu tiên *</Label>
                    <Select value={newTicket.priority} onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value as TicketPriority }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn độ ưu tiên" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateTicket}>
                    Tạo Ticket
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tickets Tabs */}
        <Tabs defaultValue="open" className="space-y-4">
          <TabsList>
            <TabsTrigger value="open">Đang Mở ({openTickets.length})</TabsTrigger>
            <TabsTrigger value="resolved">Đã Giải Quyết ({resolvedTickets.length})</TabsTrigger>
            <TabsTrigger value="all">Tất Cả ({tickets.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="open" className="space-y-4">
            {openTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(ticket.category)}
                        <Badge variant="outline" className="font-mono">
                          {ticket.ticketNumber}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {priorityLabels[ticket.priority]}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {statusLabels[ticket.status]}
                        </Badge>
                      </div>
                      <h3 className="font-medium">{ticket.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Tạo bởi: {ticket.createdBy} • {ticket.createdAt}
                        {ticket.assignedTo && ` • Phụ trách: ${ticket.assignedTo}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            Chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Ticket className="h-5 w-5" />
                              Chi Tiết Ticket - {ticket.ticketNumber}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Ticket Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-medium">Thông tin cơ bản</Label>
                                <div className="space-y-1 text-sm">
                                  <div>Danh mục: {categoryLabels[ticket.category]}</div>
                                  <div>Độ ưu tiên: {priorityLabels[ticket.priority]}</div>
                                  <div>Trạng thái: {statusLabels[ticket.status]}</div>
                                  <div>Tạo bởi: {ticket.createdBy}</div>
                                </div>
                              </div>
                              <div>
                                <Label className="font-medium">Thời gian</Label>
                                <div className="space-y-1 text-sm">
                                  <div>Tạo: {ticket.createdAt}</div>
                                  <div>Cập nhật: {ticket.updatedAt}</div>
                                  {ticket.dueDate && <div>Hạn: {ticket.dueDate}</div>}
                                  {ticket.assignedTo && <div>Phụ trách: {ticket.assignedTo}</div>}
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <div>
                              <Label className="font-medium">Mô tả chi tiết</Label>
                              <p className="text-sm mt-1 p-3 bg-muted/50 rounded">{ticket.description}</p>
                            </div>

                            {/* Comments */}
                            {ticket.comments.length > 0 && (
                              <div>
                                <Label className="font-medium">Bình luận</Label>
                                <div className="space-y-2 mt-2">
                                  {ticket.comments.map((comment) => (
                                    <div key={comment.id} className="text-sm p-3 bg-blue-50 border-l-4 border-blue-200 rounded-r">
                                      <div className="font-medium">{comment.author}</div>
                                      <div className="text-muted-foreground text-xs">{comment.timestamp}</div>
                                      <div className="mt-1">{comment.content}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Resolution */}
                            {ticket.resolution && (
                              <div>
                                <Label className="font-medium">Kết quả giải quyết</Label>
                                <p className="text-sm mt-1 p-3 bg-green-50 border-l-4 border-green-200 rounded-r">
                                  {ticket.resolution}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                              <div className="space-y-3 pt-4 border-t">
                                <div>
                                  <Label htmlFor="newComment">Thêm bình luận</Label>
                                  <div className="flex gap-2 mt-1">
                                    <Textarea
                                      id="newComment"
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      placeholder="Nhập bình luận về tiến trình xử lý..."
                                      rows={2}
                                    />
                                    <Button 
                                      onClick={() => handleAddComment(ticket.id)}
                                      disabled={!newComment.trim()}
                                    >
                                      Thêm
                                    </Button>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label htmlFor="resolution">Giải quyết ticket</Label>
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
                                        onClick={() => handleResolveTicket(ticket.id)}
                                        disabled={!resolution.trim()}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Giải quyết
                                      </Button>
                                      {ticket.status === 'open' && (
                                        <Button 
                                          variant="outline"
                                          onClick={() => handleStatusUpdate(ticket.id, 'in-progress')}
                                        >
                                          <Clock className="h-4 w-4 mr-1" />
                                          Bắt đầu xử lý
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {ticket.status === 'open' && (
                        <Button 
                          size="sm"
                          onClick={() => handleStatusUpdate(ticket.id, 'in-progress')}
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
            
            {openTickets.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">Không có ticket nào đang mở</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="resolved" className="space-y-4">
            {resolvedTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(ticket.category)}
                        <Badge variant="outline" className="font-mono">
                          {ticket.ticketNumber}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {statusLabels[ticket.status]}
                        </Badge>
                      </div>
                      <h3 className="font-medium">{ticket.title}</h3>
                      {ticket.resolution && (
                        <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                          Đã giải quyết: {ticket.resolution}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Tạo: {ticket.createdAt} • Cập nhật: {ticket.updatedAt}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {resolvedTickets.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Chưa có ticket nào được giải quyết</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(ticket.category)}
                        <Badge variant="outline" className="font-mono">
                          {ticket.ticketNumber}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {priorityLabels[ticket.priority]}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {statusLabels[ticket.status]}
                        </Badge>
                      </div>
                      <h3 className="font-medium">{ticket.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Tạo: {ticket.createdAt} • Cập nhật: {ticket.updatedAt}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </PostalWorkerShell>
  );
}