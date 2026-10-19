import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Download, 
  Maximize2, 
  RefreshCw, 
  Lightbulb, 
  BookOpen, 
  Atom, 
  Dna, 
  Flame, 
  Eye, 
  Layers, 
  Compass, 
  Share2, 
  HelpCircle,
  X
} from 'lucide-react';
import { SystemConfig, UserSession, SubjectType, GradeLevel } from '../types';
import { TexRenderer } from './TexRenderer';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  subject?: string;
}

interface GeneratedImageItem {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
  style?: string;
}

interface AIAssistantViewProps {
  systemConfig: SystemConfig;
  currentUser: UserSession | null;
}

export function AIAssistantView({ systemConfig, currentUser }: AIAssistantViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'image'>('chat');

  // Chat state
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('ydon_gemini_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'welcome-msg',
        role: 'model',
        text: `Xin chào ${currentUser?.name ? currentUser.name : 'em'}! 👋\n\nTôi là **Thầy/Cô Trợ lý AI Khoa Học Tự Nhiên (Trách nhiệm cao)** của Trường THCS & THPT Y Đôn.\n\n🛡️ **CAM KẾT TRÁCH NHIỆM 100%:**\n1. 🔬 **Trả lời trực diện, đúng và trúng** mọi câu hỏi KHTN (Vật lí, Hóa học, Sinh học) từ Lớp 6 đến Lớp 9.\n2. 🧪 **Hướng dẫn phương pháp giải bài tập từng bước**, phân tích hiện tượng, bản chất khoa học.\n3. 📝 **Cung cấp công thức TeX, phương trình hóa học cân bằng chuẩn xác** theo Chương trình GDPT 2018.\n4. 🎨 **Tạo ảnh minh họa trực quan** từ văn bản (mô hình 3D, tế bào, nguyên tử, thí nghiệm).\n\nTuyệt đối không né tránh, không bảo xem lại sách giáo khoa. Hãy chọn một câu hỏi gợi ý bên dưới hoặc nhập ngay câu hỏi của em nhé!`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputQuestion, setInputQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSubject, setChatSubject] = useState<string>('all');
  const [chatGrade, setChatGrade] = useState<number>(currentUser?.grade || 8);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Text to Image state
  const [imagePrompt, setImagePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16'>('1:1');
  const [imageStyle, setImageStyle] = useState('3d_model');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [currentGeneratedImage, setCurrentGeneratedImage] = useState<GeneratedImageItem | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<GeneratedImageItem | null>(null);

  // Gallery of generated images
  const [gallery, setGallery] = useState<GeneratedImageItem[]>(() => {
    const saved = localStorage.getItem('ydon_ai_generated_images');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'img-demo-1',
        url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
        prompt: 'Mô hình cấu tạo tế bào thực vật 3D rõ nét với lục lạp và không bào lớn',
        aspectRatio: '1:1',
        createdAt: 'Mẫu tham khảo',
        style: '3d_model'
      },
      {
        id: 'img-demo-2',
        url: 'https://images.unsplash.com/photo-1607988795691-3d0147b43231?auto=format&fit=crop&q=80&w=800',
        prompt: 'Thí nghiệm phản ứng hóa học phát sáng trong phòng thí nghiệm KHTN',
        aspectRatio: '1:1',
        createdAt: 'Mẫu tham khảo',
        style: 'experiment'
      }
    ];
  });

  // Save chat history
  useEffect(() => {
    try {
      localStorage.setItem('ydon_gemini_chat_history', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Save gallery
  useEffect(() => {
    try {
      localStorage.setItem('ydon_ai_generated_images', JSON.stringify(gallery));
    } catch (e) {}
  }, [gallery]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Handle Send Chat
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuestion).trim();
    if (!query || chatLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      subject: chatSubject !== 'all' ? chatSubject : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setChatLoading(true);

    try {
      // Build conversation history for API
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          grade: chatGrade,
          subject: chatSubject !== 'all' ? chatSubject : undefined
        })
      });

      const data = await res.json();
      const replyText = data.reply || data.error || 'Xin lỗi, không thể xử lý câu trả lời lúc này.';

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'Có lỗi xảy ra khi kết nối máy chủ Gemini. Vui lòng thử lại sau giây lát!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle Clear Chat
  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: 'Đã làm mới cuộc hội thoại! Bạn có thể đặt câu hỏi mới về môn Khoa học Tự nhiên.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Handle Copy text
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Text to Image Generation
  const handleGenerateImage = async (customPrompt?: string) => {
    const promptToUse = (customPrompt || imagePrompt).trim();
    if (!promptToUse || imageLoading) return;

    setImageLoading(true);
    setImageError(null);

    // Enhance prompt with style keyword
    let styleDescriptor = '';
    if (imageStyle === '3d_model') styleDescriptor = '3D realistic render, educational science model';
    else if (imageStyle === 'diagram') styleDescriptor = 'detailed scientific textbook diagram, labeled cross section';
    else if (imageStyle === 'experiment') styleDescriptor = 'laboratory photography, glowing chemical reaction, high quality';
    else if (imageStyle === 'schematic') styleDescriptor = 'vector clean scientific schematic diagram';

    const fullPrompt = `${promptToUse}, ${styleDescriptor}`;

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio
        })
      });

      const data = await res.json();
      if (data.imageUrl) {
        const newImgItem: GeneratedImageItem = {
          id: `img-${Date.now()}`,
          url: data.imageUrl,
          prompt: promptToUse,
          aspectRatio,
          createdAt: new Date().toLocaleDateString('vi-VN'),
          style: imageStyle
        };
        setCurrentGeneratedImage(newImgItem);
        setGallery(prev => [newImgItem, ...prev]);
      } else {
        setImageError(data.error || 'Không thể tạo hình ảnh. Vui lòng thử lại với mô tả khác.');
      }
    } catch (err: any) {
      setImageError(err.message || 'Lỗi kết nối máy chủ tạo ảnh.');
    } finally {
      setImageLoading(false);
    }
  };

  // Download image helper
  const handleDownloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prompt suggestions for Chat
  const promptSuggestions = [
    {
      title: '🌿 Quang hợp ở thực vật',
      query: 'Giải thích quá trình quang hợp ở thực vật (KHTN 7). Viết phương trình hóa học dạng chữ và nêu các yếu tố ảnh hưởng?',
      subject: 'biology'
    },
    {
      title: '🌊 Áp suất chất lỏng & Archimedes',
      query: 'Trình bày công thức tính áp suất chất lỏng p = d.h và lực đẩy Archimedes F_A = d.V (KHTN 8). Cho một ví dụ bài tập tính toán cụ thể?',
      subject: 'physics'
    },
    {
      title: '🧪 Cân bằng phương trình hóa học',
      query: 'Hướng dẫn phương pháp các bước cân bằng phương trình phản ứng hóa học (KHTN 8). Cho ví dụ minh họa phản ứng Al + O2 -> Al2O3?',
      subject: 'chemistry'
    },
    {
      title: '🧬 Cấu trúc ADN & Di truyền',
      query: 'Cấu tạo phân tử ADN gồm các nguyên tố nào và theo nguyên tắc nào? Nguyên tắc bổ sung giữa các nucleotide là gì (KHTN 9)?',
      subject: 'biology'
    },
    {
      title: '⚡ Định luật Ohm & Điện trở',
      query: 'Phát biểu định luật Ohm cho đoạn mạch (I = U/R). Ý nghĩa của điện trở và công thức tính điện trở dây dẫn?',
      subject: 'physics'
    },
    {
      title: '🔬 Bảng tuần hoàn nguyên tố',
      query: 'Nguyên tắc sắp xếp các nguyên tố hóa học trong bảng tuần hoàn Mendeleev là gì? Ô nguyên tố, chu kì và nhóm cho biết những thông tin gì?',
      subject: 'chemistry'
    }
  ];

  // Image Prompt suggestions
  const imagePromptSuggestions = [
    {
      title: 'Tế bào thực vật 3D',
      prompt: 'Cấu tạo tế bào thực vật 3D rõ nét với thành tế bào, lục lạp màu xanh lá, không bào trung tâm lớn và nhân tế bào',
      aspect: '1:1' as const
    },
    {
      title: 'Cấu trúc xoắn kép ADN',
      prompt: 'Mô hình chuỗi xoắn kép ADN phát sáng 3D với các cặp bazơ nitơ A-T, G-X màu sắc tương phản nổi bật trên nền khoa học vi mô',
      aspect: '16:9' as const
    },
    {
      title: 'Thí nghiệm hóa học kết tủa',
      prompt: 'Thí nghiệm hóa học tạo kết tủa màu xanh lam của Đồng hydroxide Cu(OH)2 trong ống nghiệm thủy tinh trong suốt phòng lab',
      aspect: '4:3' as const
    },
    {
      title: 'Hệ Mặt Trời & Quỹ đạo',
      prompt: 'Mô hình 3D Hệ Mặt Trời gồm Mặt Trời ở trung tâm và các hành tinh chuyển động theo quỹ đạo elip quanh Mặt Trời trong vũ trụ',
      aspect: '16:9' as const
    },
    {
      title: 'Mô hình nguyên tử Bohr',
      prompt: 'Mô hình nguyên tử cấu trúc hạt nhân mang điện tích dương và các electron chuyển động theo quỹ đạo xung quanh',
      aspect: '1:1' as const
    },
    {
      title: 'Tia sáng qua lăng kính',
      prompt: 'Tia sáng trắng truyền qua lăng kính tam giác bị khúc xạ và tán sắc thành dải cầu vồng 7 màu rực rỡ',
      aspect: '16:9' as const
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-700/50">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                GOOGLE GEMINI AI ASSISTANT
              </span>
              <span className="text-xs text-indigo-200 font-semibold">
                THCS & THPT Y ĐÔN
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>TRỢ LÝ KHOA HỌC TỰ NHIÊN AI</span>
            </h2>

            <p className="text-sm text-indigo-100 max-w-2xl leading-relaxed">
              Ứng dụng trí tuệ nhân tạo Gemini hỗ trợ dạy và học: Hỏi đáp gia sư KHTN thông minh & Tạo hình ảnh minh họa bài học trực quan từ văn bản.
            </p>
          </div>

          {/* Sub Tab Navigation */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/15 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('chat')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeSubTab === 'chat'
                  ? 'bg-white text-indigo-950 shadow-md scale-102'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Bot className="w-4 h-4 text-purple-600" />
              <span>Chatbot Gemini</span>
            </button>

            <button
              onClick={() => setActiveSubTab('image')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeSubTab === 'image'
                  ? 'bg-white text-indigo-950 shadow-md scale-102'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-fuchsia-600" />
              <span>Biến Văn Bản Thành Ảnh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. TAB: CHATBOT GEMINI */}
      {activeSubTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Chat Conversation Container */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
            
            {/* Chat Top Controls Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-purple-600" />
                  Gia sư AI Gemini:
                </span>

                {/* Grade selector */}
                <select
                  value={chatGrade}
                  onChange={(e) => setChatGrade(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-700 outline-none"
                >
                  <option value={6}>Khối 6</option>
                  <option value={7}>Khối 7</option>
                  <option value={8}>Khối 8</option>
                  <option value={9}>Khối 9</option>
                </select>

                {/* Subject filter */}
                <select
                  value={chatSubject}
                  onChange={(e) => setChatSubject(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-700 outline-none"
                >
                  <option value="all">Tất cả môn</option>
                  <option value="physics">Vật lí</option>
                  <option value="chemistry">Hóa học</option>
                  <option value="biology">Sinh học</option>
                </select>
              </div>

              {/* Chat action buttons */}
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1 px-3 py-1 text-slate-500 hover:text-rose-600 font-semibold rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Xóa làm mới đoạn chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Làm mới hội thoại</span>
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
              {messages.map((m) => {
                const isModel = m.role === 'model';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}
                  >
                    {isModel && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs group relative ${
                        isModel
                          ? 'bg-white border border-slate-200 text-slate-800'
                          : 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-medium'
                      }`}
                    >
                      {/* Copy action for model message */}
                      {isModel && (
                        <button
                          onClick={() => handleCopyText(m.id, m.text)}
                          className="absolute right-2 top-2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Sao chép nội dung"
                        >
                          {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Content with LaTeX TeX rendering & formatted Vietnamese */}
                      {isModel ? (
                        <TexRenderer content={m.text} className="text-slate-800" />
                      ) : (
                        <div className="whitespace-pre-wrap font-sans space-y-1 text-white">
                          {m.text}
                        </div>
                      )}

                      <div
                        className={`mt-2 text-[10px] flex items-center justify-end gap-1 ${
                          isModel ? 'text-slate-400' : 'text-blue-200'
                        }`}
                      >
                        <span>{m.timestamp}</span>
                        {isModel && <span>• Gemini 3.8 Flash</span>}
                      </div>
                    </div>

                    {!isModel && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Chat loading bubble */}
              {chatLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 shadow-2xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                    <span>Gemini đang suy nghĩ và soạn thảo câu trả lời...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Nhập câu hỏi KHTN cần giải đáp... (Ví dụ: Công thức tính nhiệt lượng Q = m.c.Δt?)"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  disabled={chatLoading}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-purple-600 focus:bg-white transition-all"
                />

                <button
                  type="submit"
                  disabled={!inputQuestion.trim() || chatLoading}
                  className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                    inputQuestion.trim() && !chatLoading
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Gửi</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Prompt Suggestions Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Câu hỏi mẫu trọng tâm:</span>
              </div>

              <div className="space-y-2">
                {promptSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.query)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 text-xs font-medium text-slate-700 hover:text-purple-900 transition-all cursor-pointer space-y-1 block group"
                  >
                    <div className="font-bold text-slate-900 group-hover:text-purple-700">
                      {item.title}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {item.query}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Information card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100 text-xs text-indigo-900 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5">
                <Atom className="w-4 h-4 text-indigo-600" />
                Hỗ trợ học tập 24/7
              </span>
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                Trợ lý AI giúp học sinh ôn tập lý thuyết, tìm hiểu hiện tượng tự nhiên và chuẩn bị bài trước khi đến lớp.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* 2. TAB: BIẾN VĂN BẢN THÀNH HÌNH ẢNH (TEXT TO IMAGE) */}
      {activeSubTab === 'image' && (
        <div className="space-y-6">
          
          {/* Generation Controls Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-fuchsia-600" />
                  <span>TẠO HÌNH ẢNH KHOA HỌC TỰ NHIÊN BẰNG AI</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nhập mô tả bằng tiếng Việt để tạo hình ảnh minh họa cấu tạo sinh học, phân tử hóa học, hiện tượng vật lí
                </p>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold self-start md:self-auto">
                <span className="px-2 text-slate-500 text-[11px]">Tỉ lệ:</span>
                {(['1:1', '16:9', '4:3', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      aspectRatio === ratio
                        ? 'bg-white text-fuchsia-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Mô tả chi tiết hình ảnh cần tạo: <span className="text-red-500">*</span>
              </label>
              
              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Cấu tạo tế bào thực vật 3D rõ nét với lục lạp, không bào lớn và nhân tế bào..."
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  disabled={imageLoading}
                  className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold outline-none focus:border-fuchsia-600 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            {/* Style Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Phong cách hình ảnh:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { id: '3d_model', label: 'Mô hình 3D Khoa học', icon: Atom },
                  { id: 'diagram', label: 'Sơ đồ mặt cắt SGK', icon: BookOpen },
                  { id: 'experiment', label: 'Thí nghiệm thực tế', icon: Flame },
                  { id: 'schematic', label: 'Vector đồ họa phẳng', icon: Layers }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setImageStyle(s.id)}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
                      imageStyle === s.id
                        ? 'bg-fuchsia-50 border-fuchsia-400 text-fuchsia-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <s.icon className={`w-4 h-4 ${imageStyle === s.id ? 'text-fuchsia-600' : 'text-slate-400'}`} />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error display */}
            {imageError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <span>⚠️ {imageError}</span>
              </div>
            )}

            {/* Action button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 hidden sm:inline">
                ✨ Được hỗ trợ bởi Gemini Flash Image Model
              </span>

              <button
                type="button"
                onClick={() => handleGenerateImage()}
                disabled={!imagePrompt.trim() || imageLoading}
                className={`px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer shadow-md ${
                  imagePrompt.trim() && !imageLoading
                    ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 text-white active:scale-98'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {imageLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang khởi tạo hình ảnh AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Biến Văn Bản Thành Hình Ảnh</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggestion prompt chips */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-500">Mẫu mô tả nhanh có sẵn:</span>
              <div className="flex flex-wrap gap-2">
                {imagePromptSuggestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setImagePrompt(item.prompt);
                      setAspectRatio(item.aspect);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-fuchsia-50 hover:text-fuchsia-800 text-slate-700 text-xs font-medium transition-colors cursor-pointer border border-slate-200/60"
                  >
                    + {item.title}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Current Generated Image Result Card */}
          {currentGeneratedImage && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-fuchsia-600 tracking-wider">
                    KẾT QUẢ VỪA TẠO
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {currentGeneratedImage.prompt}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewModalImg(currentGeneratedImage)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    title="Xem toàn màn hình"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadImage(currentGeneratedImage.url, `khtn_ai_${Date.now()}.png`)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Tải ảnh về máy"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải ảnh</span>
                  </button>
                </div>
              </div>

              {/* Image Preview Container */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 max-h-[500px]">
                <img
                  src={currentGeneratedImage.url}
                  alt={currentGeneratedImage.prompt}
                  referrerPolicy="no-referrer"
                  className="max-h-[500px] w-auto object-contain"
                />
              </div>
            </div>
          )}

          {/* Gallery of previously generated images */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>Bộ Sưu Tập Hình Ảnh AI Đã Tạo ({gallery.length})</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Lưu trữ trực tiếp trên trình duyệt, sẵn sàng tải xuống hoặc sử dụng làm tài liệu học tập
                </p>
              </div>
            </div>

            {gallery.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Chưa có hình ảnh nào được tạo. Hãy nhập mô tả bên trên để tạo hình ảnh đầu tiên!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((img) => (
                  <div
                    key={img.id}
                    className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.prompt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewModalImg(img)}
                          className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-md cursor-pointer"
                          title="Xem ảnh lớn"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadImage(img.url, `khtn_${img.id}.png`)}
                          className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-md cursor-pointer"
                          title="Tải ảnh"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                        {img.prompt}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>{img.createdAt}</span>
                        <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {img.aspectRatio}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* FULLSCREEN IMAGE MODAL PREVIEW */}
      {previewModalImg && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
            <div className="p-4 bg-black/40 text-white flex items-center justify-between border-b border-white/10">
              <span className="text-xs font-bold truncate max-w-md">
                {previewModalImg.prompt}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadImage(previewModalImg.url, `khtn_ai_${Date.now()}.png`)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải ảnh</span>
                </button>
                <button
                  onClick={() => setPreviewModalImg(null)}
                  className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-center bg-black/60 max-h-[75vh]">
              <img
                src={previewModalImg.url}
                alt={previewModalImg.prompt}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
