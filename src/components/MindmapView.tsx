import React, { useState, useRef } from 'react';
import { 
  GitFork, 
  Sparkles, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RefreshCw, 
  Save, 
  FolderOpen, 
  Share2, 
  BookOpen, 
  Atom, 
  Dna, 
  Flame, 
  HelpCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { GradeLevel, SubjectType, UserSession } from '../types';

export interface MindmapNode {
  id: string;
  label: string;
  color?: string;
  expanded?: boolean;
  children?: MindmapNode[];
}

interface MindmapViewProps {
  currentUser: UserSession | null;
}

const PRESET_MINDMAPS: Record<string, { title: string; grade: number; subject: string; data: MindmapNode }> = {
  photosynthesis: {
    title: 'Quang Hợp Ở Thực Vật (KHTN 7)',
    grade: 7,
    subject: 'biology',
    data: {
      id: 'root-1',
      label: 'QUANG HỢP (KHTN 7)',
      color: '#059669',
      expanded: true,
      children: [
        {
          id: 'b1',
          label: '1. Khái Niệm & Bản Chất',
          color: '#10b981',
          expanded: true,
          children: [
            { id: 'b1-1', label: 'Quá trình tổng hợp chất hữu cơ từ CO₂ và H₂O' },
            { id: 'b1-2', label: 'Biến đổi năng lượng ánh sáng thành hóa năng' },
            { id: 'b1-3', label: 'Cơ quan thực hiện: Lá cây (bào quan Lục lạp chứa diệp lục)' }
          ]
        },
        {
          id: 'b2',
          label: '2. Phương Trình Dạng Chữ',
          color: '#0284c7',
          expanded: true,
          children: [
            { id: 'b2-1', label: 'Nước + Carbon dioxide' },
            { id: 'b2-2', label: 'Điều kiện: Ánh sáng & Diệp lục' },
            { id: 'b2-3', label: 'Sản phẩm: Glucose + Oxygen (O₂)' }
          ]
        },
        {
          id: 'b3',
          label: '3. Các Yếu Tố Ảnh Hưởng',
          color: '#f59e0b',
          expanded: true,
          children: [
            { id: 'b3-1', label: 'Cường độ và chất lượng ánh sáng' },
            { id: 'b3-2', label: 'Nồng độ khí CO₂ trong không khí' },
            { id: 'b3-3', label: 'Nhiệt độ môi trường (tối ưu 25°C - 35°C)' },
            { id: 'b3-4', label: 'Hàm lượng nước cung cấp' }
          ]
        },
        {
          id: 'b4',
          label: '4. Vai Trò Thực Tiễn',
          color: '#8b5cf6',
          expanded: true,
          children: [
            { id: 'b4-1', label: 'Cung cấp thức ăn và năng lượng cho sinh giới' },
            { id: 'b4-2', label: 'Điều hòa khí hậu, hấp thụ CO₂ và giải phóng O₂' },
            { id: 'b4-3', label: 'Bảo vệ tầng ozone, làm sạch môi trường' }
          ]
        }
      ]
    }
  },
  archimedes: {
    title: 'Áp Suất & Lực Đẩy Archimedes (KHTN 8)',
    grade: 8,
    subject: 'physics',
    data: {
      id: 'root-2',
      label: 'ÁP SUẤT & ARCHIMEDES (KHTN 8)',
      color: '#2563eb',
      expanded: true,
      children: [
        {
          id: 'phy-1',
          label: '1. Áp Suất Chất Lỏng',
          color: '#0284c7',
          expanded: true,
          children: [
            { id: 'phy-1-1', label: 'Chất lỏng gây áp suất theo mọi phương' },
            { id: 'phy-1-2', label: 'Công thức: p = d · h (Pa = N/m²)' },
            { id: 'phy-1-3', label: 'd: Trọng lượng riêng (N/m³); h: Độ sâu (m)' }
          ]
        },
        {
          id: 'phy-2',
          label: '2. Lực Đẩy Archimedes',
          color: '#10b981',
          expanded: true,
          children: [
            { id: 'phy-2-1', label: 'Tác dụng: Hướng thẳng đứng từ dưới lên trên' },
            { id: 'phy-2-2', label: 'Công thức: F_A = d · V' },
            { id: 'phy-2-3', label: 'V: Thể tích phần chất lỏng bị vật chiếm chỗ (m³)' }
          ]
        },
        {
          id: 'phy-3',
          label: '3. Điều Kiện Vật Nổi - Chìm',
          color: '#ea580c',
          expanded: true,
          children: [
            { id: 'phy-3-1', label: 'F_A > P (hoặc d_vật < d_lỏng) → Vật nổi lên' },
            { id: 'phy-3-2', label: 'F_A = P (hoặc d_vật = d_lỏng) → Vật lơ lửng' },
            { id: 'phy-3-3', label: 'F_A < P (hoặc d_vật > d_lỏng) → Vật chìm xuống' }
          ]
        },
        {
          id: 'phy-4',
          label: '4. Ứng Dụng Thực Tiễn',
          color: '#9333ea',
          expanded: true,
          children: [
            { id: 'phy-4-1', label: 'Thiết kế tàu ngầm điều chỉnh thể tích nước dằn' },
            { id: 'phy-4-2', label: 'Tàu thủy vỏ thép nổi nhờ khoang rỗng chứa không khí' },
            { id: 'phy-4-3', label: 'Khinh khí cầu bay trong không khí' }
          ]
        }
      ]
    }
  },
  cell_structure: {
    title: 'Cấu Tạo Tế Bào Sống (KHTN 6)',
    grade: 6,
    subject: 'biology',
    data: {
      id: 'root-3',
      label: 'CẤU TẠO TẾ BÀO (KHTN 6)',
      color: '#059669',
      expanded: true,
      children: [
        {
          id: 'cell-1',
          label: '1. Màng Sinh Chất',
          color: '#10b981',
          expanded: true,
          children: [
            { id: 'c1-1', label: 'Bao bọc bên ngoài bảo vệ tế bào' },
            { id: 'c1-2', label: 'Thực hiện trao đổi chất có chọn lọc với môi trường' }
          ]
        },
        {
          id: 'cell-2',
          label: '2. Tế Bào Chất',
          color: '#0284c7',
          expanded: true,
          children: [
            { id: 'c2-1', label: 'Chất keo bán lỏng chứa bào quan' },
            { id: 'c2-2', label: 'Nơi diễn ra hầu hết hoạt động sống của tế bào' },
            { id: 'c2-3', label: 'Ti thể: Cung cấp năng lượng hô hấp tế bào' }
          ]
        },
        {
          id: 'cell-3',
          label: '3. Nhân / Vùng Nhân',
          color: '#ea580c',
          expanded: true,
          children: [
            { id: 'c3-1', label: 'Chứa vật chất di truyền (DNA)' },
            { id: 'c3-2', label: 'Điều khiển mọi hoạt động sống và sinh sản' }
          ]
        },
        {
          id: 'cell-4',
          label: '4. Khác Biệt Tế Bào Thực Vật',
          color: '#8b5cf6',
          expanded: true,
          children: [
            { id: 'c4-1', label: 'Có thành tế bào Cellulose giữ hình dạng cứng cáp' },
            { id: 'c4-2', label: 'Có Lục lạp chứa diệp lục để quang hợp' },
            { id: 'c4-3', label: 'Có Không bào trung tâm lớn chứa dịch tế bào' }
          ]
        }
      ]
    }
  },
  periodic_table: {
    title: 'Bảng Tuần Hoàn & Phản Ứng Hóa Học (KHTN 8)',
    grade: 8,
    subject: 'chemistry',
    data: {
      id: 'root-4',
      label: 'PHẢN ỨNG HÓA HỌC (KHTN 8)',
      color: '#d97706',
      expanded: true,
      children: [
        {
          id: 'ch-1',
          label: '1. Biến Đổi Vật Lí & Hóa Học',
          color: '#f59e0b',
          expanded: true,
          children: [
            { id: 'ch-1-1', label: 'Vật lí: Thay đổi trạng thái, hình dạng (không sinh chất mới)' },
            { id: 'ch-1-2', label: 'Hóa học: Có chất mới sinh ra (đổi màu, sinh khí, kết tủa)' }
          ]
        },
        {
          id: 'ch-2',
          label: '2. Định Luật Bảo Toàn Khối Lượng',
          color: '#ef4444',
          expanded: true,
          children: [
            { id: 'ch-2-1', label: 'Tổng khối lượng chất tham gia = Tổng khối lượng sản phẩm' },
            { id: 'ch-2-2', label: 'mA + mB = mC + mD' },
            { id: 'ch-2-3', label: 'Bản chất: Số nguyên tử mỗi nguyên tố được bảo toàn' }
          ]
        },
        {
          id: 'ch-3',
          label: '3. Phương Trình Hóa Học',
          color: '#3b82f6',
          expanded: true,
          children: [
            { id: 'ch-3-1', label: 'Viết sơ đồ phản ứng bằng CTHH' },
            { id: 'ch-3-2', label: 'Cân bằng số nguyên tử mỗi vế bằng hệ số' },
            { id: 'ch-3-3', label: 'Ý nghĩa: Tỉ lệ số phân tử / nguyên tử các chất' }
          ]
        }
      ]
    }
  }
};

export function MindmapView({ currentUser }: MindmapViewProps) {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('photosynthesis');
  const [mindmapData, setMindmapData] = useState<MindmapNode>(PRESET_MINDMAPS.photosynthesis.data);
  const [mindmapTitle, setMindmapTitle] = useState<string>(PRESET_MINDMAPS.photosynthesis.title);

  // AI Prompt generation
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Canvas controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  
  const mindmapContainerRef = useRef<HTMLDivElement>(null);

  // Switch preset
  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    const preset = PRESET_MINDMAPS[key];
    if (preset) {
      setMindmapData(JSON.parse(JSON.stringify(preset.data)));
      setMindmapTitle(preset.title);
    }
  };

  // Toggle expand node
  const handleToggleNode = (nodeId: string) => {
    const toggleInTree = (node: MindmapNode): MindmapNode => {
      if (node.id === nodeId) {
        return { ...node, expanded: !node.expanded };
      }
      if (node.children) {
        return { ...node, children: node.children.map(toggleInTree) };
      }
      return node;
    };
    setMindmapData(prev => toggleInTree(prev));
  };

  // Add child node
  const handleAddChildNode = (parentId: string) => {
    const text = prompt('Nhập nội dung nhánh con mới:');
    if (!text || !text.trim()) return;

    const addChildInTree = (node: MindmapNode): MindmapNode => {
      if (node.id === parentId) {
        const newChild: MindmapNode = {
          id: `node-${Date.now()}`,
          label: text.trim(),
          expanded: true,
          children: []
        };
        return {
          ...node,
          expanded: true,
          children: [...(node.children || []), newChild]
        };
      }
      if (node.children) {
        return { ...node, children: node.children.map(addChildInTree) };
      }
      return node;
    };
    setMindmapData(prev => addChildInTree(prev));
  };

  // Start edit
  const handleStartEdit = (nodeId: string, currentLabel: string) => {
    setEditingNodeId(nodeId);
    setEditingText(currentLabel);
  };

  // Save edit
  const handleSaveEdit = (nodeId: string) => {
    if (!editingText.trim()) return;
    const editInTree = (node: MindmapNode): MindmapNode => {
      if (node.id === nodeId) {
        return { ...node, label: editingText.trim() };
      }
      if (node.children) {
        return { ...node, children: node.children.map(editInTree) };
      }
      return node;
    };
    setMindmapData(prev => editInTree(prev));
    setEditingNodeId(null);
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === mindmapData.id) {
      alert('Không thể xóa nút chủ đề trung tâm.');
      return;
    }
    if (!confirm('Bạn có chắc muốn xóa nhánh này và các nhánh con của nó?')) return;

    const deleteInTree = (node: MindmapNode): MindmapNode => {
      if (!node.children) return node;
      return {
        ...node,
        children: node.children.filter(c => c.id !== nodeId).map(deleteInTree)
      };
    };
    setMindmapData(prev => deleteInTree(prev));
  };

  // AI Generate Mindmap
  const handleGenerateAIMindmap = async () => {
    const promptToUse = aiPrompt.trim();
    if (!promptToUse) return;

    setIsAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Hãy tạo sơ đồ tư duy (Mindmap) môn Khoa học Tự nhiên cho chủ đề: "${promptToUse}".
Yêu cầu trả về đúng định dạng JSON có cấu trúc sau:
{
  "title": "Tên chủ đề",
  "root": {
    "label": "TÊN CHỦ ĐỀ CHÍNH",
    "children": [
      {
        "label": "1. Nhánh chính 1",
        "children": [
          { "label": "Ý chi tiết 1.1" },
          { "label": "Ý chi tiết 1.2" }
        ]
      },
      {
        "label": "2. Nhánh chính 2",
        "children": [
          { "label": "Ý chi tiết 2.1" },
          { "label": "Ý chi tiết 2.2" }
        ]
      },
      {
        "label": "3. Nhánh chính 3",
        "children": [
          { "label": "Ý chi tiết 3.1" }
        ]
      }
    ]
  }
}
Chỉ trả về JSON thuần túy trong cặp dấu \`\`\`json \`\`\`, không viết thêm lời dẫn.`
        })
      });

      const data = await res.json();
      if (data.reply) {
        const jsonMatch = data.reply.match(/```json([\s\S]*?)```/) || data.reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const rawJson = jsonMatch[1] || jsonMatch[0];
          const parsed = JSON.parse(rawJson);
          if (parsed && parsed.root && parsed.root.label) {
            // Assign IDs & colors to parsed tree
            const colors = ['#059669', '#0284c7', '#ea580c', '#8b5cf6', '#d97706'];
            const assignIds = (n: any, depth = 0, colorIdx = 0): MindmapNode => {
              return {
                id: `ai-node-${Math.random().toString(36).substr(2, 9)}`,
                label: n.label || 'Khái niệm',
                expanded: true,
                color: depth === 0 ? '#1e3a8a' : colors[colorIdx % colors.length],
                children: Array.isArray(n.children) 
                  ? n.children.map((c: any, i: number) => assignIds(c, depth + 1, depth === 0 ? i : colorIdx)) 
                  : []
              };
            };

            const newTree = assignIds(parsed.root);
            setMindmapData(newTree);
            setMindmapTitle(parsed.title || promptToUse);
            setSelectedPresetKey('custom');
          }
        }
      }
    } catch (err: any) {
      console.error('AI Mindmap error:', err);
      setAiError('Không thể tạo sơ đồ tự động lúc này. Bạn có thể chọn các sơ đồ mẫu có sẵn bên trên.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Download Mindmap as high-res Image / SVG
  const handleDownloadMindmap = () => {
    if (!mindmapContainerRef.current) return;
    window.print();
  };

  // Recursive Branch Renderer
  const renderBranch = (node: MindmapNode, depth = 0, branchColor = '#0284c7') => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded !== false;
    const nodeColor = node.color || branchColor;

    return (
      <div key={node.id} className="flex items-center my-3 relative">
        {/* Node Box */}
        <div 
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl shadow-xs transition-all border ${
            depth === 0
              ? 'bg-blue-900 text-white font-black text-sm sm:text-base border-blue-700 shadow-md ring-4 ring-blue-300/40'
              : depth === 1
              ? 'bg-white font-bold text-xs sm:text-sm text-slate-900 border-2 shadow-xs'
              : 'bg-white font-medium text-xs text-slate-800 border-slate-200'
          }`}
          style={depth === 1 ? { borderColor: nodeColor } : {}}
        >
          {depth > 0 && (
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: nodeColor }}
            />
          )}

          {editingNodeId === node.id ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit(node.id);
                  if (e.key === 'Escape') setEditingNodeId(null);
                }}
                className="px-2 py-0.5 border border-blue-500 rounded text-xs text-slate-900 outline-none"
              />
              <button
                type="button"
                onClick={() => handleSaveEdit(node.id)}
                className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded font-bold cursor-pointer"
              >
                Lưu
              </button>
            </div>
          ) : (
            <span 
              onDoubleClick={() => handleStartEdit(node.id, node.label)}
              className="select-text"
              title="Nhấp đúp để sửa chữ"
            >
              {node.label}
            </span>
          )}

          {/* Action buttons on hover */}
          <div className="flex items-center gap-1 ml-2 opacity-80 hover:opacity-100">
            {hasChildren && (
              <button
                type="button"
                onClick={() => handleToggleNode(node.id)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                title={isExpanded ? 'Thu gọn nhánh' : 'Mở rộng nhánh'}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleAddChildNode(node.id)}
              className="p-1 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg cursor-pointer"
              title="Thêm nhánh con"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleStartEdit(node.id, node.label)}
              className="p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg cursor-pointer"
              title="Sửa nội dung"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {depth > 0 && (
              <button
                type="button"
                onClick={() => handleDeleteNode(node.id)}
                className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                title="Xóa nhánh này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Child Subtree */}
        {hasChildren && isExpanded && (
          <div className="relative pl-6 sm:pl-10 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
            {node.children!.map((child, idx) => (
              <div key={child.id} className="relative before:absolute before:-left-6 sm:before:-left-10 before:top-1/2 before:w-6 sm:before:w-10 before:h-0.5 before:bg-slate-300">
                {renderBranch(child, depth + 1, depth === 0 ? child.color || branchColor : nodeColor)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="mindmap-view" className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-800 to-cyan-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-teal-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <GitFork className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider bg-teal-950/40 px-2.5 py-0.5 rounded-full text-amber-300">
                CÔNG CỤ TƯ DUY TRỰC QUAN
              </span>
              <span className="text-[11px] font-bold text-teal-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                KHTN 6, 7, 8, 9 • Vẽ Theo Yêu Cầu & Tự Động Bằng AI
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white">
              SƠ ĐỒ TƯ DUY KHOA HỌC TỰ NHIÊN (MINDMAP)
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 font-normal">
              Hệ thống hóa kiến thức Vật lí - Hóa học - Sinh học dạng sơ đồ nhánh • Dễ nhớ, dễ ôn tập và in ấn
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadMindmap}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-2xl shadow-md text-xs transition-transform active:scale-95 cursor-pointer"
            title="In hoặc lưu sơ đồ dưới dạng PDF/Ảnh"
          >
            <Download className="w-4 h-4 text-teal-700" />
            <span>Tải / In Sơ Đồ</span>
          </button>
        </div>
      </div>

      {/* Preset Selector & AI Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Preset Selector */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span>Chọn Sơ Đồ Bài Học Có Sẵn</span>
          </h3>

          <div className="space-y-2">
            {Object.entries(PRESET_MINDMAPS).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPreset(key)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  selectedPresetKey === key
                    ? 'bg-teal-50 border-teal-500 text-teal-950 shadow-xs ring-1 ring-teal-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{p.title}</span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 font-semibold text-slate-600">
                  Lớp {p.grade}
                </span>
              </button>
            ))}
          </div>

          {/* AI Generator Box */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <h4 className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Vẽ Sơ Đồ Mới Theo Yêu Cầu (AI)</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Nhập bất kỳ chủ đề bài học nào để Trợ lý AI tự động phân nhánh logic:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="VD: Cấu tạo nguyên tử, Hệ bài tiết..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateAIMindmap()}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-purple-500"
              />
              <button
                type="button"
                disabled={isAiLoading || !aiPrompt.trim()}
                onClick={handleGenerateAIMindmap}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-md cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiLoading ? 'Đang tạo...' : 'Tạo'}</span>
              </button>
            </div>
            {aiError && (
              <p className="text-[11px] text-rose-600 font-medium">{aiError}</p>
            )}
          </div>
        </div>

        {/* Mindmap Canvas Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          
          {/* Canvas Controls Header */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>{mindmapTitle}</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Nhấp vào nút (+) để thêm nhánh con • Nhấp đúp để chỉnh sửa chữ
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.8))}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.6))}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                title="Đặt lại zoom 100%"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
            </div>
          </div>

          {/* Interactive Mindmap Tree Container */}
          <div 
            ref={mindmapContainerRef}
            className="p-6 sm:p-10 overflow-x-auto min-h-[460px] bg-slate-50/50 flex items-center"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
          >
            {renderBranch(mindmapData, 0)}
          </div>

          {/* Canvas Footer */}
          <div className="p-3 bg-white border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Trường THCS & THPT Y Đôn • Tổ Lí-Hóa-Sinh-CN</span>
            <span className="font-semibold text-teal-700">Mẹo: Nhấp vào mũi tên để đóng/mở nhánh</span>
          </div>

        </div>

      </div>

    </div>
  );
}
