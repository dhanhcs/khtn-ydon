import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  FlaskConical,
  Atom,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Cân bằng phương trình: Al + H₂SO₄ đặc, nóng',
  'Hiện tượng khi sục khí CO₂ từ từ vào nước vôi trong',
  'Tính nồng độ mol của dung dịch khi hòa tan 5,85g NaCl vào 500ml nước',
  'Cách phân biệt 3 kim loại: Fe, Al, Cu bằng phương pháp hóa học',
  'Phương pháp giải bài toán CO₂ tác dụng dung dịch kiềm Ca(OH)₂',
  'Định luật bảo toàn khối lượng và các dạng bài tập áp dụng',
];

export const AiAssistantPage: React.FC = () => {
  const { showToast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Xin chào các em học sinh và quý phụ huynh! Thầy là **Trợ lý AI Hóa học NĐH**, được phát triển dựa trên kinh nghiệm sư phạm và phương pháp giảng dạy môn Hóa học THCS của **Thầy Nguyễn Đình Hành**.\n\nEm đang gặp khó khăn ở phương trình hóa học nào, bài toán tính số mol, nồng độ dung dịch hay hiện tượng thí nghiệm nào? Hãy đặt câu hỏi để Thầy hướng dẫn chi tiết từng bước nhé!',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: historyPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi kết nối Trợ lý AI.');
      }

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: data.text || 'Đã ghi nhận câu hỏi.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('AI chat error:', err);
      const errMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content:
          'Rất tiếc, đã có sự gián đoạn kết nối với máy chủ AI. Vui lòng kiểm tra lại đường truyền mạng hoặc thử lại sau giây lát.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Đã sao chép nội dung câu trả lời.', 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleResetChat = () => {
    if (confirm('Bạn muốn bắt đầu cuộc trò chuyện mới?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Thầy đã sẵn sàng hỗ trợ bài học Hóa học mới của em. Hãy nhập câu hỏi bên dưới nhé!',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-purple-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 text-amber-300 text-xs font-bold border border-purple-500/40 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Mục số 9 trong Mê nu chính: Trợ lý AI Hóa học NĐH
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Trợ Lý Trí Tuệ Nhân Tạo Hóa Học THCS
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            Được huấn luyện theo giáo trình và phương pháp giải Hóa học của Thầy Nguyễn Đình Hành.
          </p>
        </div>

        <button
          onClick={handleResetChat}
          className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 text-xs font-semibold border border-purple-600/40 transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Hội thoại mới</span>
        </button>
      </div>

      {/* Quick Prompts Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-bold shrink-0 flex items-center gap-1 text-[11px]">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Gợi ý nhanh:
        </span>
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 shrink-0 transition text-[11px] font-medium shadow-2xs cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-6 min-h-[420px] max-h-[600px] overflow-y-auto flex flex-col space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white'
                }`}
              >
                {isUser ? 'Em' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed relative group ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                <div className="mt-2 flex items-center justify-between text-[10px] opacity-70">
                  <span>{m.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:text-purple-600 rounded cursor-pointer"
                      title="Sao chép câu trả lời"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
              <span>Thầy Hành AI đang giải bài và cân bằng phương trình...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200"
      >
        <input
          type="text"
          placeholder="Nhập phương trình hóa học hoặc câu hỏi cần giải..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm shadow transition flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Gửi</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
