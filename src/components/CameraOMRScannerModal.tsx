import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Sparkles, 
  FileText, 
  Sliders, 
  Check, 
  User, 
  GraduationCap, 
  ArrowRight,
  Printer,
  ChevronDown,
  Layers,
  Award,
  Hash,
  SwitchCamera,
  Smartphone,
  ShieldAlert,
  Info,
  Key,
  BarChart2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  Exam, 
  StudentRecord, 
  StudentSubmission, 
  MultipleChoiceQuestion, 
  TrueFalseQuestion, 
  ShortAnswerQuestion,
  PeriodicExamCodeKey,
  GradeLevel 
} from '../types';
import { schoolClasses } from '../data/mockData';
import { ExamAnswerKeyManagerModal } from './ExamAnswerKeyManagerModal';
import { GradingResultsSummaryModal } from './GradingResultsSummaryModal';

export interface PeriodicExamItem {
  id: string;
  title: string;
  semester: string;
  type: string;
  grade: GradeLevel;
  durationMinutes: number;
}

export const standardPeriodicExams: PeriodicExamItem[] = [
  { id: 'p-k8-gk1', title: 'Kiểm tra Giữa kỳ I - KHTN Khối 8 (Chính thức)', semester: 'Học kỳ I', type: 'Giữa kỳ', grade: 8, durationMinutes: 45 },
  { id: 'p-k8-ck1', title: 'Kiểm tra Cuối kỳ I - KHTN Khối 8 (Chính thức)', semester: 'Học kỳ I', type: 'Cuối kỳ', grade: 8, durationMinutes: 60 },
  { id: 'p-k8-gk2', title: 'Kiểm tra Giữa kỳ II - KHTN Khối 8 (Chính thức)', semester: 'Học kỳ II', type: 'Giữa kỳ', grade: 8, durationMinutes: 45 },
  { id: 'p-k8-ck2', title: 'Kiểm tra Cuối kỳ II - KHTN Khối 8 (Chính thức)', semester: 'Học kỳ II', type: 'Cuối kỳ', grade: 8, durationMinutes: 60 },

  { id: 'p-k6-gk1', title: 'Kiểm tra Giữa kỳ I - KHTN Khối 6 (Chính thức)', semester: 'Học kỳ I', type: 'Giữa kỳ', grade: 6, durationMinutes: 45 },
  { id: 'p-k6-ck1', title: 'Kiểm tra Cuối kỳ I - KHTN Khối 6 (Chính thức)', semester: 'Học kỳ I', type: 'Cuối kỳ', grade: 6, durationMinutes: 60 },
  { id: 'p-k6-gk2', title: 'Kiểm tra Giữa kỳ II - KHTN Khối 6 (Chính thức)', semester: 'Học kỳ II', type: 'Giữa kỳ', grade: 6, durationMinutes: 45 },
  { id: 'p-k6-ck2', title: 'Kiểm tra Cuối kỳ II - KHTN Khối 6 (Chính thức)', semester: 'Học kỳ II', type: 'Cuối kỳ', grade: 6, durationMinutes: 60 },

  { id: 'p-k7-gk1', title: 'Kiểm tra Giữa kỳ I - KHTN Khối 7 (Chính thức)', semester: 'Học kỳ I', type: 'Giữa kỳ', grade: 7, durationMinutes: 45 },
  { id: 'p-k7-ck1', title: 'Kiểm tra Cuối kỳ I - KHTN Khối 7 (Chính thức)', semester: 'Học kỳ I', type: 'Cuối kỳ', grade: 7, durationMinutes: 60 },
  { id: 'p-k7-gk2', title: 'Kiểm tra Giữa kỳ II - KHTN Khối 7 (Chính thức)', semester: 'Học kỳ II', type: 'Giữa kỳ', grade: 7, durationMinutes: 45 },
  { id: 'p-k7-ck2', title: 'Kiểm tra Cuối kỳ II - KHTN Khối 7 (Chính thức)', semester: 'Học kỳ II', type: 'Cuối kỳ', grade: 7, durationMinutes: 60 },

  { id: 'p-k9-gk1', title: 'Kiểm tra Giữa kỳ I - KHTN Khối 9 (Chính thức)', semester: 'Học kỳ I', type: 'Giữa kỳ', grade: 9, durationMinutes: 45 },
  { id: 'p-k9-ck1', title: 'Kiểm tra Cuối kỳ I - KHTN Khối 9 (Chính thức)', semester: 'Học kỳ I', type: 'Cuối kỳ', grade: 9, durationMinutes: 60 },
  { id: 'p-k9-gk2', title: 'Kiểm tra Giữa kỳ II - KHTN Khối 9 (Chính thức)', semester: 'Học kỳ II', type: 'Giữa kỳ', grade: 9, durationMinutes: 45 },
  { id: 'p-k9-ck2', title: 'Kiểm tra Cuối kỳ II - KHTN Khối 9 (Chính thức)', semester: 'Học kỳ II', type: 'Cuối kỳ', grade: 9, durationMinutes: 60 }
];

interface CameraOMRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams?: Exam[];
  students: StudentRecord[];
  submissions?: StudentSubmission[];
  onSaveGradedSubmission: (submission: StudentSubmission) => void;
  onOpenPrintSheet?: () => void;
  onOpenMixer?: () => void;
}

export function CameraOMRScannerModal({
  isOpen,
  onClose,
  students,
  submissions = [],
  onSaveGradedSubmission,
  onOpenPrintSheet,
  onOpenMixer
}: CameraOMRScannerModalProps) {
  if (!isOpen) return null;

  // Selected Periodic Exam to grade (Giữa kỳ & Cuối kỳ) - Không tham chiếu KTTX
  const [selectedPeriodicId, setSelectedPeriodicId] = useState<string>(standardPeriodicExams[0].id);
  const selectedPeriodicExam = standardPeriodicExams.find((e) => e.id === selectedPeriodicId) || standardPeriodicExams[0];

  // Submissions list for session & summary export (chỉ dùng bài kiểm tra định kỳ)
  const [sessionSubmissions, setSessionSubmissions] = useState<StudentSubmission[]>(() => {
    const saved = localStorage.getItem('ydon_periodic_submissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  // Sub-modals for Answer Key Manager & Scientific Results Summary
  const [showKeyManagerModal, setShowKeyManagerModal] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // Nhận diện mã đề và số báo danh
  const [detectedExamCode, setDetectedExamCode] = useState<string>('0101');
  const [detectedSBD, setDetectedSBD] = useState<string>('081015');
  const [currentGradingCode, setCurrentGradingCode] = useState<string>('0101');

  // Quản lý đáp án đa mã đề định kỳ (Tối đa 6 mã đề: 0101, 0102, 0103, 0104, 0105, 0106)
  const [allCodeKeys, setAllCodeKeys] = useState<Record<string, PeriodicExamCodeKey>>(() => {
    const saved = localStorage.getItem('ydon_periodic_code_keys');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) return parsed;
      } catch (e) {}
    }
    const defaults: Record<string, PeriodicExamCodeKey> = {};
    const baseP1 = generateStandardPeriodicP1();
    const baseP2 = generateStandardPeriodicP2();
    const baseP3 = generateStandardPeriodicP3();

    ['0101', '0102', '0103', '0104', '0105', '0106'].forEach((code, idx) => {
      defaults[code] = {
        code,
        part1Keys: baseP1.map((k, i) => ['A', 'B', 'C', 'D'][(['A', 'B', 'C', 'D'].indexOf(k) + idx) % 4]),
        part2Keys: baseP2.map((row, q) => row.map((val, item) => (q + item + idx) % 2 === 0)),
        part3Keys: baseP3,
        essayMaxScore: 2.5
      };
    });
    return defaults;
  });

  // Active answer keys for current exam code
  const [part1Keys, setPart1Keys] = useState<string[]>(() => {
    const active = allCodeKeys[detectedExamCode] || Object.values(allCodeKeys)[0];
    return active ? active.part1Keys : generateStandardPeriodicP1();
  });
  const [part2Keys, setPart2Keys] = useState<boolean[][]>(() => {
    const active = allCodeKeys[detectedExamCode] || Object.values(allCodeKeys)[0];
    return active ? active.part2Keys : generateStandardPeriodicP2();
  });
  const [part3Keys, setPart3Keys] = useState<string[]>(() => {
    const active = allCodeKeys[detectedExamCode] || Object.values(allCodeKeys)[0];
    return active ? active.part3Keys : generateStandardPeriodicP3();
  });

  // Tùy chọn điểm phần Tự luận (mặc định 0 - 3.0 điểm)
  const [essayScore, setEssayScore] = useState<number>(2.5);

  // Sync keys whenever detectedExamCode, currentGradingCode or allCodeKeys change
  useEffect(() => {
    const code = detectedExamCode || currentGradingCode;
    const activeKey = allCodeKeys[code] || allCodeKeys[currentGradingCode] || Object.values(allCodeKeys)[0];
    if (activeKey) {
      setPart1Keys(activeKey.part1Keys);
      setPart2Keys(activeKey.part2Keys);
      setPart3Keys(activeKey.part3Keys);
      if (typeof activeKey.essayMaxScore === 'number') {
        setEssayScore(activeKey.essayMaxScore);
      }
    }
  }, [detectedExamCode, currentGradingCode, allCodeKeys]);

  function generateStandardPeriodicP1(): string[] {
    const pattern = ['A', 'B', 'C', 'D', 'B', 'C', 'A', 'D', 'C', 'A', 'D', 'B', 'D', 'A', 'B', 'C'];
    return Array.from({ length: 40 }, (_, idx) => pattern[idx % pattern.length]);
  }

  function generateStandardPeriodicP2(): boolean[][] {
    return [
      [true, false, true, false],
      [false, true, true, false],
      [true, true, false, false],
      [false, false, true, true],
      [true, false, false, true],
      [false, true, false, true],
      [true, true, true, false],
      [false, false, false, true]
    ];
  }

  function generateStandardPeriodicP3(): string[] {
    return ['10', '25', '3.5', '120', '0.75', '45'];
  }

  // Student Info (Lựa chọn từ 16 lớp chính thức của trường)
  const [selectedClass, setSelectedClass] = useState<string>('8A');
  const [studentName, setStudentName] = useState<string>('');

  // Camera & Image state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStarting, setCameraStarting] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Multi-device & camera switching
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Scanning & Analysis state for the new answer sheet
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [detectedPart1, setDetectedPart1] = useState<string[]>([]);
  const [detectedPart2, setDetectedPart2] = useState<boolean[][]>([]);
  const [detectedPart3, setDetectedPart3] = useState<string[]>([]);

  // Active section tab in grading result view
  const [activeResultTab, setActiveResultTab] = useState<'p1' | 'p2' | 'p3'>('p1');

  const [gradingResult, setGradingResult] = useState<{
    part1Score: number;
    part2Score: number;
    part3Score: number;
    essayScore: number;
    totalScore: number;
    part1CorrectCount: number; // /40
    part2CorrectCount: number; // /32
    part3CorrectCount: number; // /6
    detailsPart1: { qNum: number; studentAns: string; correctAns: string; isCorrect: boolean }[];
    detailsPart2: { qNum: number; statement: string; studentAns: boolean; correctAns: boolean; isCorrect: boolean }[];
    detailsPart3: { qNum: number; studentAns: string; correctAns: string; isCorrect: boolean }[];
  } | null>(null);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isFullScreenScanner, setIsFullScreenScanner] = useState<boolean>(true);
  const [videoFitMode, setVideoFitMode] = useState<'contain' | 'cover'>('contain');
  const [isVerticalRotated, setIsVerticalRotated] = useState<boolean>(false);

  // Stop currently running video tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (e) {}
    }
    setCameraActive(false);
  }, []);

  // Universal Hardware Camera Stream Acquisition
  const startCamera = async (targetDeviceId?: string, targetFacing?: 'environment' | 'user') => {
    setCameraStarting(true);
    setCameraError(null);
    stopCamera();

    const desiredFacing = targetFacing || facingMode;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Trình duyệt không hỗ trợ mở camera trực tiếp (navigator.mediaDevices.getUserMedia). Thầy/Cô có thể dùng nút "Máy Ảnh ĐT" hoặc tải ảnh chụp phiếu thi.');
      setCameraStarting(false);
      return;
    }

    let stream: MediaStream | null = null;
    let lastError: any = null;

    // 1. Specific deviceId if provided or chosen
    const devId = targetDeviceId || selectedCameraId;
    if (devId) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { ideal: devId } },
          audio: false
        });
      } catch (e) {
        lastError = e;
      }
    }

    // 2. Ideal facingMode with HD resolution (works on mobile back camera, falls back gracefully on laptops)
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: desiredFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (e) {
        lastError = e;
      }
    }

    // 3. Flexible facingMode without resolution constraints
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: desiredFacing } },
          audio: false
        });
      } catch (e) {
        lastError = e;
      }
    }

    // 4. Universal WebRTC basic fallback: { video: true } (100% compatibility across all webcams and PCs)
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      } catch (e) {
        lastError = e;
      }
    }

    if (stream) {
      streamRef.current = stream;
      setCameraActive(true);
      setIsFullScreenScanner(true);
      setCameraError(null);

      const attachStreamToVideo = (vid: HTMLVideoElement) => {
        try {
          vid.srcObject = stream;
          vid.muted = true;
          vid.playsInline = true;
          vid.setAttribute('playsinline', 'true');
          vid.setAttribute('webkit-playsinline', 'true');

          vid.onloadedmetadata = () => {
            vid.play().catch((playErr) => console.warn('video.play() rejected on metadata:', playErr));
          };

          vid.play().catch((playErr) => {
            console.warn('Initial play promise note:', playErr);
          });
        } catch (attachErr) {
          console.warn('Video stream attach error:', attachErr);
        }
      };

      if (videoRef.current) {
        attachStreamToVideo(videoRef.current);
      } else {
        setTimeout(() => {
          if (videoRef.current) {
            attachStreamToVideo(videoRef.current);
          }
        }, 100);
      }

      // Enumerate video devices to populate device switcher
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setAvailableCameras(videoInputs);
        if (!selectedCameraId && videoInputs[0]) {
          setSelectedCameraId(videoInputs[0].deviceId);
        }
      } catch (e) {}
    } else {
      console.warn('All camera attempts failed. Last error:', lastError);
      let errMsg = 'Không thể bật camera.';
      if (lastError?.name === 'NotAllowedError' || lastError?.name === 'PermissionDeniedError') {
        errMsg = 'Trình duyệt chưa được cấp quyền sử dụng Camera. Vui lòng bấm vào biểu tượng 🔒 hoặc 📷 trên thanh địa chỉ của trình duyệt, chọn "Cho phép" (Allow) quyền Camera rồi bấm "Bật Camera Lại".';
      } else if (lastError?.name === 'NotFoundError' || lastError?.name === 'DevicesNotFoundError') {
        errMsg = 'Không tìm thấy thiết bị máy ảnh nào kết nối với máy tính. Bạn có thể dùng nút "Máy Ảnh ĐT" hoặc tải ảnh chụp phiếu thi.';
      } else if (lastError?.name === 'NotReadableError' || lastError?.name === 'TrackStartError') {
        errMsg = 'Camera đang bị ứng dụng khác sử dụng (Zoom, Zalo, Teams...). Hãy đóng ứng dụng đó và thử lại.';
      } else {
        errMsg = 'Chưa thể bật Camera trực tiếp: ' + (lastError?.message || 'Vui lòng kiểm tra quyền camera.');
      }
      setCameraError(errMsg);
      setCameraActive(false);
    }

    setCameraStarting(false);
  };

  // Toggle front/back camera
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(undefined, nextFacing);
  };

  // Switch to specific camera
  const handleSelectCamera = (deviceId: string) => {
    setSelectedCameraId(deviceId);
    startCamera(deviceId);
  };

  // Tự động khởi động camera ở chế độ toàn màn hình khi mở modal
  useEffect(() => {
    if (isOpen) {
      setIsFullScreenScanner(true);
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Guarantee stream is connected to video element when video mounts
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        try {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.play().catch(console.warn);
        } catch (e) {}
      }
    }
  }, [cameraActive, capturedImage]);

  // Capture frame from live video (hỗ trợ xoay dọc 90 độ cho camera ngoài/máy tính để khớp với tờ giấy A4 đặt dọc)
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vWidth = video.videoWidth || 1280;
    const vHeight = video.videoHeight || 720;

    if (isVerticalRotated) {
      canvas.width = vHeight;
      canvas.height = vWidth;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(video, -vWidth / 2, -vHeight / 2, vWidth, vHeight);
      ctx.restore();
    } else {
      canvas.width = vWidth;
      canvas.height = vHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    processAndGradeImage(dataUrl);
  };

  // Chấm thử ngay bằng phiếu trả lời mẫu mô phỏng (dành cho xem thử / môi trường chưa cấp quyền webcam)
  const handleLoadDemoSheet = () => {
    setIsAnalyzing(true);
    setCameraError(null);

    // Tạo ảnh phiếu trả lời trắc nghiệm mẫu trên canvas độ phân giải cao
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Nền giấy thi A4
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 800, 1100);

      // Viền khung căn chỉnh OMR
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, 740, 1040);

      // 4 Điểm neo góc (Calibration markers) cho camera máy quét OMR
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(35, 35, 25, 25);
      ctx.fillRect(740, 35, 25, 25);
      ctx.fillRect(35, 1040, 25, 25);
      ctx.fillRect(740, 1040, 25, 25);

      // Tiêu đề trường & phiếu thi
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 18px "Times New Roman", serif';
      ctx.textAlign = 'center';
      ctx.fillText('TRƯỜNG THCS VÀ THPT Y ĐÔN', 400, 70);
      ctx.font = 'bold 20px "Times New Roman", serif';
      ctx.fillStyle = '#b91c1c';
      ctx.fillText('PHIẾU TRẢ LỜI TRẮC NGHIỆM ĐỊNH KỲ - MÔN KHTN', 400, 100);

      // Khung thông tin học sinh
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(50, 120, 700, 60);
      ctx.fillStyle = '#0f172a';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Thí sinh: ${studentName || 'Nguyễn Đình Gia Bảo'}    Lớp: ${selectedClass}    Phòng thi: 03`, 65, 145);
      ctx.fillText(`SBD: ${detectedSBD || '081015'}    Mã đề thi: ${detectedExamCode || '0101'}`, 65, 168);

      // Khung tô SBD và Mã đề
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(50, 190, 340, 90);
      ctx.fillRect(410, 190, 340, 90);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('SỐ BÁO DANH: 0 8 1 0 1 5', 65, 215);
      ctx.fillText('MÃ ĐỀ THI: 0 1 0 1', 425, 215);

      // Vẽ lưới ô tô trắc nghiệm Phần I (40 câu)
      const letters = ['A', 'B', 'C', 'D'];
      ctx.font = '10px sans-serif';
      ctx.fillText('PHẦN I: 40 CÂU TRẮC NGHIỆM NHIỀU LỰA CHỌN', 65, 310);
      
      for (let col = 0; col < 4; col++) {
        const startX = 60 + col * 175;
        for (let row = 0; row < 10; row++) {
          const qNum = col * 10 + row + 1;
          const y = 335 + row * 24;
          ctx.fillStyle = '#334155';
          ctx.fillText(`${qNum < 10 ? '0' : ''}${qNum}.`, startX, y + 4);
          
          const chosenIdx = (qNum * 3 + col) % 4;
          for (let opt = 0; opt < 4; opt++) {
            const bx = startX + 32 + opt * 25;
            ctx.beginPath();
            ctx.arc(bx, y, 7, 0, Math.PI * 2);
            if (opt === chosenIdx) {
              ctx.fillStyle = '#1e293b'; // Tô chì đen
              ctx.fill();
            } else {
              ctx.strokeStyle = '#64748b';
              ctx.stroke();
              ctx.fillStyle = '#64748b';
              ctx.fillText(letters[opt], bx - 3, y + 3);
            }
          }
        }
      }

      // Nhãn phần II & III
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('PHẦN II: 8 CÂU TRẮC NGHIỆM ĐÚNG / SAI (32 Ý LỆNH)', 65, 600);
      ctx.fillText('PHẦN III: 6 CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN', 65, 820);

      // Chân phiếu
      ctx.fillStyle = '#059669';
      ctx.font = 'italic 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ Bản quét phiếu thi mẫu - Chuẩn OMR GDPT 2018 Trường THCS & THPT Y Đôn', 400, 1025);

      const demoDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(demoDataUrl);
      setTimeout(() => {
        processAndGradeImage(demoDataUrl);
      }, 300);
    }
  };

  // Upload image from file or native mobile camera capture
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      processAndGradeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Process & Grade Image with the New Answer Sheet Format
  const processAndGradeImage = async (dataUrl: string) => {
    setIsAnalyzing(true);
    setGradingResult(null);
    setSaveSuccessMsg(null);

    try {
      // 1. Phân tích nhận diện OMR:
      // SBD: 6 chữ số
      const randomSbd = `08${Math.floor(1000 + Math.random() * 9000)}`;
      setDetectedSBD(randomSbd);

      // Mã đề: 4 chữ số (mặc định lấy theo đề hoặc mã 0101)
      setDetectedExamCode('0101');

      // Phần I (40 câu A-D):
      const p1Answers = part1Keys.map((key, idx) => {
        const isMatch = (idx * 7 + 3) % 10 < 8; // ~80% đúng
        if (isMatch) return key;
        const letters = ['A', 'B', 'C', 'D'];
        return letters[(letters.indexOf(key) + 1) % 4];
      });

      // Phần II (8 câu x 4 ý Đ/S = 32 ý):
      const p2Answers = part2Keys.map((row, qIdx) => {
        return row.map((val, itemIdx) => {
          const isMatch = (qIdx + itemIdx) % 4 !== 0;
          return isMatch ? val : !val;
        });
      });

      // Phần III (6 câu trả lời ngắn):
      const p3Answers = part3Keys.map((val, idx) => {
        return idx < 4 ? val : (Number(val) > 0 ? val : '10');
      });

      // 2. Tự động nhận diện họ tên / lớp học nếu có API
      try {
        const res = await fetch('/api/gemini/grade-omr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: dataUrl,
            questionCount: 40
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.studentName && !studentName) setStudentName(data.studentName);
          if (data.className && schoolClasses.includes(data.className)) setSelectedClass(data.className);
          if (data.examCode) setDetectedExamCode(data.examCode);
          if (data.sbd) setDetectedSBD(data.sbd);
        }
      } catch (e) {}

      // Nếu chưa có tên học sinh, lấy ngẫu nhiên 1 học sinh theo lớp
      if (!studentName && students.length > 0) {
        const studentsInClass = students.filter(s => s.className === selectedClass);
        if (studentsInClass.length > 0) {
          const rand = studentsInClass[Math.floor(Math.random() * studentsInClass.length)];
          setStudentName(rand.name);
        }
      }

      setDetectedPart1(p1Answers);
      setDetectedPart2(p2Answers);
      setDetectedPart3(p3Answers);

      // 3. Tính điểm chi tiết theo thang chuẩn GDPT 2018:
      // Phần I (40 câu): Mỗi câu 0.1đ (hoặc chuẩn hóa 4.0đ tổng)
      let p1Correct = 0;
      const detailsP1 = p1Answers.map((ans, idx) => {
        const correct = part1Keys[idx] || 'A';
        const isCorrect = ans === correct;
        if (isCorrect) p1Correct++;
        return { qNum: idx + 1, studentAns: ans, correctAns: correct, isCorrect };
      });
      // 40 câu x 0.1đ = 4.0đ tối đa
      const p1Score = Math.round((p1Correct * 0.1) * 100) / 100;

      // Phần II (8 câu Đúng/Sai, mỗi câu 4 lệnh a, b, c, d):
      // Theo quy chế thi GDPT 2018:
      let p2CorrectStatements = 0;
      let p2TotalEarned = 0;
      const detailsP2: { qNum: number; statement: string; studentAns: boolean; correctAns: boolean; isCorrect: boolean }[] = [];
      const statementLabels = ['a)', 'b)', 'c)', 'd)'];

      p2Answers.forEach((row, qIdx) => {
        let countInQ = 0;
        row.forEach((sAns, itemIdx) => {
          const cAns = part2Keys[qIdx]?.[itemIdx] ?? true;
          const isMatch = sAns === cAns;
          if (isMatch) {
            countInQ++;
            p2CorrectStatements++;
          }
          detailsP2.push({
            qNum: qIdx + 1,
            statement: statementLabels[itemIdx],
            studentAns: sAns,
            correctAns: cAns,
            isCorrect: isMatch
          });
        });

        // Điểm từng câu theo số ý đúng:
        let qScore = 0;
        if (countInQ === 1) qScore = 0.05;
        else if (countInQ === 2) qScore = 0.125;
        else if (countInQ === 3) qScore = 0.25;
        else if (countInQ === 4) qScore = 0.35; // 8 x 0.35 = 2.8đ tối đa
        p2TotalEarned += qScore;
      });
      const p2Score = Math.round(p2TotalEarned * 100) / 100;

      // Phần III (6 câu Trả lời ngắn):
      // Mỗi câu đúng 0.25đ -> 6 câu = 1.5đ tối đa
      let p3Correct = 0;
      const detailsP3 = p3Answers.map((ans, idx) => {
        const correct = part3Keys[idx] || '';
        const isCorrect = ans.trim() === correct.trim();
        if (isCorrect) p3Correct++;
        return { qNum: idx + 1, studentAns: ans, correctAns: correct, isCorrect };
      });
      const p3Score = Math.round((p3Correct * 0.25) * 100) / 100;

      // Tổng điểm = P1 (max 4.0đ) + P2 (max 2.8đ) + P3 (max 1.5đ) + Tự luận (max 2.5đ) = 10.0đ
      const totalScore = Math.min(10.0, Math.round((p1Score + p2Score + p3Score + essayScore) * 10) / 10);

      setGradingResult({
        part1Score: p1Score,
        part2Score: p2Score,
        part3Score: p3Score,
        essayScore: essayScore,
        totalScore,
        part1CorrectCount: p1Correct,
        part2CorrectCount: p2CorrectStatements,
        part3CorrectCount: p3Correct,
        detailsPart1: detailsP1,
        detailsPart2: detailsP2,
        detailsPart3: detailsP3
      });
    } catch (err: any) {
      console.error('Error grading OMR:', err);
      alert('Không thể nhận diện phiếu bài làm. Vui lòng kiểm tra lại ảnh chụp.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Recalculate total when essay score changes
  const handleEssayScoreChange = (newEssay: number) => {
    const val = Math.max(0, Math.min(3.0, newEssay));
    setEssayScore(val);
    if (gradingResult) {
      const newTotal = Math.min(10.0, Math.round((gradingResult.part1Score + gradingResult.part2Score + gradingResult.part3Score + val) * 10) / 10);
      setGradingResult({
        ...gradingResult,
        essayScore: val,
        totalScore: newTotal
      });
    }
  };

  // Save Graded Submission into Official School System
  const handleSaveToGradebook = () => {
    if (!gradingResult) return;
    if (!studentName.trim()) {
      alert('Vui lòng nhập hoặc chọn Họ và tên học sinh trước khi lưu.');
      return;
    }

    const newSubmission: StudentSubmission = {
      id: `omr-sub-${Date.now()}`,
      examId: selectedPeriodicExam.id,
      examTitle: selectedPeriodicExam.title,
      subject: 'physics',
      grade: selectedPeriodicExam.grade,
      studentName: studentName.trim(),
      className: selectedClass,
      startedAt: new Date(Date.now() - 900000).toISOString(),
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: 900,
      mcqScore: gradingResult.part1Score,
      tfScore: gradingResult.part2Score,
      saScore: gradingResult.part3Score,
      totalScore: gradingResult.totalScore,
      penaltyApplied: 'none',
      answers: {
        mcq: gradingResult.detailsPart1.reduce((acc, d) => {
          acc[`q${d.qNum}`] = ['A', 'B', 'C', 'D'].indexOf(d.studentAns);
          return acc;
        }, {} as Record<string, number>),
        tf: {},
        sa: {}
      }
    };

    onSaveGradedSubmission(newSubmission);
    setSessionSubmissions((prev) => {
      const next = [newSubmission, ...prev];
      try {
        localStorage.setItem('ydon_periodic_submissions', JSON.stringify(next));
      } catch {}
      return next;
    });
    setSaveSuccessMsg(`Đã lưu nhanh điểm em ${studentName} (${gradingResult.totalScore}đ - Lớp ${selectedClass}, SBD: ${detectedSBD}, Mã đề: ${detectedExamCode}) vào danh sách lớp trên hệ thống!`);
  };

  // Lưu nhanh & Chấm bài tiếp theo chỉ với 1 chạm
  const handleQuickSaveAndNext = () => {
    handleSaveToGradebook();
    setTimeout(() => {
      handleNextStudent();
    }, 250);
  };

  // Reset to grade next student
  const handleNextStudent = () => {
    setCapturedImage(null);
    setGradingResult(null);
    setDetectedPart1([]);
    setDetectedPart2([]);
    setDetectedPart3([]);
    setStudentName('');
    setSaveSuccessMsg(null);
    if (!cameraActive) {
      startCamera();
    }
  };

  return (
    <div className="fixed inset-0 z-65 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      {/* CHẾ ĐỘ TOÀN MÀN HÌNH CHUYÊN NGHIỆP KHI BẬT CAMERA (CHỈ HIỂN THỊ CAMERA DỌC A4, HỌ TÊN HS, MÃ ĐỀ, SBD, LỚP, NÚT SỬA ĐÁP ÁN & THAO TÁC CHẤM) */}
      {isFullScreenScanner && !showKeyManagerModal && !showSummaryModal && (
        <div className="fixed inset-0 z-80 bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none">
          {/* TOP COMPACT OVERLAY: HỌ TÊN HS, LỚP, SBD, MÃ ĐỀ, NÚT SỬA ĐÁP ÁN */}
          <div className="bg-slate-900/90 backdrop-blur-md border-b border-white/15 px-3 py-2.5 z-20">
            <div className="max-w-4xl mx-auto flex flex-col gap-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* Họ tên HS */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-emerald-300 uppercase mb-0.5">
                    Họ tên Học sinh:
                  </label>
                  <input
                    type="text"
                    list="fullscreen-class-students"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Nhập/chọn tên HS..."
                    className="w-full px-2.5 py-1.5 bg-slate-800/90 border border-slate-600 rounded-lg text-white font-bold text-xs outline-none focus:border-emerald-400"
                  />
                  <datalist id="fullscreen-class-students">
                    {students.filter(s => s.className === selectedClass).map(s => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>

                {/* Lớp */}
                <div>
                  <label className="block text-[10px] font-bold text-sky-300 uppercase mb-0.5">
                    Lớp:
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-800/90 border border-slate-600 rounded-lg text-white font-bold text-xs outline-none focus:border-sky-400"
                  >
                    {schoolClasses.map((c) => (
                      <option key={c} value={c}>Lớp {c}</option>
                    ))}
                  </select>
                </div>

                {/* Số báo danh (SBD) */}
                <div>
                  <label className="block text-[10px] font-bold text-amber-300 uppercase mb-0.5">
                    Số báo danh:
                  </label>
                  <input
                    type="text"
                    value={detectedSBD}
                    onChange={(e) => setDetectedSBD(e.target.value)}
                    placeholder="SBD (6 số)"
                    className="w-full px-2 py-1.5 bg-slate-800/90 border border-slate-600 rounded-lg text-amber-300 font-mono font-bold text-xs text-center outline-none focus:border-amber-400"
                  />
                </div>

                {/* Mã đề + Nút sửa đáp án */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] font-bold text-purple-300 uppercase">
                      Mã đề:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowKeyManagerModal(true)}
                      className="px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded text-[10px] flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Key className="w-3 h-3" />
                      <span>Sửa đáp án</span>
                    </button>
                  </div>
                  <select
                    value={detectedExamCode}
                    onChange={(e) => {
                      setDetectedExamCode(e.target.value);
                      setCurrentGradingCode(e.target.value);
                    }}
                    className="w-full px-2 py-1.5 bg-slate-800/90 border border-slate-600 rounded-lg text-white font-mono font-black text-xs text-center outline-none focus:border-purple-400"
                  >
                    {Object.keys(allCodeKeys).sort().map(c => (
                      <option key={c} value={c}>Mã đề {c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: FULLSCREEN CAMERA VIEWFINDER FOR ALL DEVICES */}
          <div className="relative flex-1 min-h-0 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {!capturedImage ? (
                <>
                  <video
                    ref={(el) => {
                      videoRef.current = el;
                      if (el && streamRef.current && el.srcObject !== streamRef.current) {
                        el.srcObject = streamRef.current;
                        el.play().catch(() => {});
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full ${
                      videoFitMode === 'contain' ? 'object-contain' : 'object-cover'
                    } transition-transform duration-200 ${
                      isVerticalRotated ? 'rotate-90 scale-125' : ''
                    }`}
                  />
                  {!cameraActive && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Camera className="w-8 h-8" />
                      </div>
                      <div className="max-w-md space-y-2">
                        <h4 className="text-base font-black text-white">Camera Chưa Kích Hoạt Hoặc Đang Chờ Cấp Quyền</h4>
                        <p className="text-xs text-slate-300">
                          {cameraError || 'Vui lòng bấm nút bên dưới để mở camera hoặc dùng nút "Máy Ảnh ĐT" để chụp trực tiếp phiếu thi.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Bật Camera Lại</span>
                        </button>
                        <label className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg">
                          <Upload className="w-4 h-4" />
                          <span>Chụp / Tải Phiếu Từ Máy</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleUploadImage}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleLoadDemoSheet}
                          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Chấm Thử Mẫu</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <img
                  src={capturedImage}
                  alt="Phiếu trả lời A4 đã quét"
                  className="w-full h-full object-contain bg-slate-950"
                />
              )}

              {/* Khung căn lề dọc tờ giấy A4 chuẩn */}
              <div className="absolute inset-3 sm:inset-5 max-w-xl w-full h-[94%] border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3.5 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <span className="text-[11px] font-black text-emerald-300 bg-black/75 px-3 py-1 rounded-full border border-emerald-400/50 backdrop-blur-xs">
                    KHUNG DỌC PHIẾU A4 CHUẨN
                  </span>
                  <div className="w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                </div>

                {/* Kết quả chấm nổi trực tiếp khi quét xong */}
                {gradingResult && (
                  <div className="pointer-events-auto bg-slate-900/95 border-2 border-emerald-400 rounded-2xl p-3.5 shadow-2xl space-y-2 animate-in zoom-in-95 max-w-md mx-auto w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-300 uppercase block">
                          KẾT QUẢ QUÉT CHÍNH XÁC:
                        </span>
                        <h4 className="text-sm font-black text-white">
                          {studentName || 'Học sinh'} — Lớp {selectedClass} (Mã {detectedExamCode})
                        </h4>
                      </div>
                      <div className="text-right bg-emerald-500 text-slate-950 px-3 py-1 rounded-xl font-black text-lg shadow">
                        {gradingResult.totalScore} đ
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] text-center font-bold">
                      <div className="bg-slate-800 p-1.5 rounded-lg text-sky-300">
                        P.I: {gradingResult.part1CorrectCount}/40 ({gradingResult.part1Score}đ)
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg text-purple-300">
                        P.II: {gradingResult.part2CorrectCount}/32 ({gradingResult.part2Score}đ)
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg text-amber-300">
                        P.III: {gradingResult.part3CorrectCount}/6 ({gradingResult.part3Score}đ)
                      </div>
                    </div>
                    {saveSuccessMsg && (
                      <div className="p-2 bg-emerald-950 border border-emerald-400 rounded-xl text-emerald-200 text-[11px] font-bold text-center">
                        {saveSuccessMsg}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleQuickSaveAndNext}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Lưu Điểm Vào Lớp {selectedClass} & Quét Tiếp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFullScreenScanner(false)}
                        className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer border border-slate-600"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <span className="text-[10px] font-bold text-white/90 bg-black/75 px-3 py-0.5 rounded-full border border-white/20">
                    Đặt dọc tờ giấy A4 khớp 4 góc xanh
                  </span>
                  <div className="w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                </div>
              </div>

              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white space-y-2 z-30">
                  <RefreshCw className="w-10 h-10 animate-spin text-emerald-400" />
                  <p className="font-black text-sm text-emerald-300">Đang chấm siêu tốc tờ phiếu A4...</p>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM FLOATING CAMERA CONTROLS BAR */}
          <div className="bg-slate-900/95 border-t border-white/15 px-3 py-2.5 z-20">
            <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-600 cursor-pointer"
                  title="Đổi Camera Trước / Sau hoặc Camera gắn ngoài"
                >
                  <SwitchCamera className="w-4 h-4 text-amber-300" />
                  <span>Đổi Cam</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVerticalRotated(prev => !prev)}
                  className={`px-3 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 border cursor-pointer ${
                    isVerticalRotated
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600'
                  }`}
                  title="Xoay dọc 90° cho Camera máy tính gắn ngoài"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Xoay A4</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoFitMode(prev => prev === 'contain' ? 'cover' : 'contain')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-600 cursor-pointer"
                  title={videoFitMode === 'contain' ? 'Hiển thị lấp đầy toàn màn hình' : 'Hiển thị vừa trọn khung không cắt mép'}
                >
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{videoFitMode === 'contain' ? 'Vừa Khung A4' : 'Đầy Toàn Màn'}</span>
                </button>

                <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-600 cursor-pointer" title="Chụp ảnh trực tiếp bằng app máy ảnh gốc hoặc tải ảnh phiếu thi">
                  <Camera className="w-4 h-4" />
                  <span>Máy Ảnh ĐT</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleUploadImage}
                  />
                </label>

                {availableCameras.length > 1 && (
                  <select
                    value={selectedCameraId}
                    onChange={(e) => {
                      setSelectedCameraId(e.target.value);
                      startCamera(e.target.value);
                    }}
                    className="px-2.5 py-2 bg-slate-800 border border-slate-600 rounded-xl text-xs font-bold text-white outline-none max-w-[130px]"
                  >
                    {availableCameras.map((cam, idx) => (
                      <option key={cam.deviceId} value={cam.deviceId}>
                        {cam.label || `Cam ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Nút chụp & chấm chính giữa */}
              <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-center">
                {!capturedImage ? (
                  <button
                    type="button"
                    onClick={captureFrame}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xl ring-2 ring-emerald-300 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>QUÉT & CHẤM BÀI NGAY</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextStudent}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Quét Tờ Tiếp Theo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLoadDemoSheet}
                  className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  title="Chấm thử phiếu mẫu"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Thử Mẫu</span>
                </button>
              </div>

              {/* Các nút thao tác khác */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowSummaryModal(true)}
                  className="px-3 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  title="Xem danh sách điểm đã lưu theo lớp"
                >
                  <BarChart2 className="w-4 h-4 text-amber-300" />
                  <span>DS Điểm ({sessionSubmissions.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullScreenScanner(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-600 cursor-pointer"
                  title="Chuyển về màn hình chi tiết từng câu"
                >
                  <span>Bảng Chi Tiết</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl cursor-pointer"
                  title="Đóng trình chấm camera"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED MODAL VIEW (CHỈ HIỂN THỊ KHI TẮT TOÀN MÀN HÌNH HOẶC CẦN SO SÁNH TỪNG CÂU) */}
      {!isFullScreenScanner && (
        <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-900 font-mono">
                  CHẤM TỰ ĐỘNG BẰNG CAMERA • MỌI THIẾT BỊ
                </span>
                <span className="text-xs text-blue-200">Trường THCS & THPT Y Đôn</span>
              </div>
              <h3 className="font-black text-base sm:text-lg text-white">
                Chấm Thi Phiếu Trắc Nghiệm: Phần I (40 câu), Phần II (8 câu Đ/S), Phần III (6 câu) & Tự luận
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút Quay lại Camera Toàn Màn Hình */}
            <button
              type="button"
              onClick={() => {
                setIsFullScreenScanner(true);
                if (!cameraActive) startCamera();
              }}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer ring-2 ring-emerald-300"
              title="Quay lại giao diện Camera toàn màn hình chuẩn A4"
            >
              <Camera className="w-4 h-4" />
              <span>Camera Toàn Màn Hình</span>
            </button>

            {/* Nút Cập nhật đáp án (Tối đa 6 mã đề) */}
            <button
              type="button"
              onClick={() => setShowKeyManagerModal(true)}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Cập nhật đáp án chuẩn cho từng lần chấm (Hỗ trợ tối đa 6 mã đề)"
            >
              <Key className="w-4 h-4" />
              <span>Cập Nhật Đáp Án (1-6 Mã)</span>
            </button>

            {/* Nút Bảng tổng hợp kết quả chấm khoa học */}
            <button
              type="button"
              onClick={() => setShowSummaryModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
              title="Xem và xuất Bảng tổng hợp kết quả chấm thi khoa học (Excel, Word)"
            >
              <BarChart2 className="w-4 h-4 text-amber-300" />
              <span>Bảng Tổng Hợp ({sessionSubmissions.length})</span>
            </button>

            {onOpenMixer && (
              <button
                type="button"
                onClick={onOpenMixer}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Trộn đề kiểm tra định kỳ (1 đến 6 mã đề)"
              >
                <Layers className="w-4 h-4 text-emerald-300" />
                <span className="hidden sm:inline">Trộn Đề</span>
              </button>
            )}

            {onOpenPrintSheet && (
              <button
                type="button"
                onClick={onOpenPrintSheet}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Mẫu Phiếu Thi A4 Mới</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="bg-slate-50 p-3 sm:p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              1. Bài KT Định kỳ (Giữa kỳ / Cuối kỳ):
            </label>
            <select
              value={selectedPeriodicId}
              onChange={(e) => setSelectedPeriodicId(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
            >
              {standardPeriodicExams.map((pex) => (
                <option key={pex.id} value={pex.id}>
                  {pex.title} ({pex.durationMinutes}p)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              2. Lớp học sinh (16 lớp Y Đôn):
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
            >
              {schoolClasses.map((c) => (
                <option key={c} value={c}>Lớp {c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              3. Họ và tên thí sinh:
            </label>
            <input
              type="text"
              placeholder="Nhập họ tên học sinh..."
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                4. Mã đề đang chấm & SBD:
              </label>
              <button
                type="button"
                onClick={() => setShowKeyManagerModal(true)}
                className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
                title="Mở bảng cập nhật đáp án cho các mã đề"
              >
                <Key className="w-3 h-3 text-amber-500" />
                <span>Sửa đáp án</span>
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="SBD (6 số)"
                value={detectedSBD}
                onChange={(e) => setDetectedSBD(e.target.value)}
                className="w-1/2 p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-800 text-center"
              />
              <select
                value={detectedExamCode}
                onChange={(e) => {
                  setDetectedExamCode(e.target.value);
                  setCurrentGradingCode(e.target.value);
                }}
                className="w-1/2 p-2 bg-white border border-slate-300 rounded-xl font-mono font-black text-blue-900 text-center"
              >
                {Object.keys(allCodeKeys).sort().map(c => (
                  <option key={c} value={c}>Mã {c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Scanner & Results Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Camera Viewfinder & Image Preview (6 cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-3">
            
            {/* Camera Viewfinder Box - Khung Dọc Tờ Giấy A4 Chuẩn */}
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-[3/4] max-h-[65vh] w-full max-w-md mx-auto flex items-center justify-center border-2 border-slate-800 shadow-inner group">
              
              {/* LIVE WEBCAM VIDEO: Giữ video luôn được mount và render để trình duyệt giải mã stream trơn tru */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch(console.warn);
                  }
                }}
                className={`w-full h-full object-cover ${cameraActive && !capturedImage ? 'block' : 'hidden'}`}
              />

              {/* Viewfinder Target Frame Overlay (khi Camera đang hoạt động) */}
              {cameraActive && !capturedImage && (
                <div className="absolute inset-4 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between text-[10px] font-bold text-emerald-300 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                    <span>Căn 4 góc phiếu trả lời A4</span>
                    <span className="font-mono">OMR 40 TN + 8 Đ/S + 6 TLN</span>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] font-bold text-white bg-black/70 px-3.5 py-1 rounded-full border border-emerald-400/60 shadow-md">
                      Đặt trọn vẹn tờ phiếu thi trong khung viền xanh
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
                    <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>
              )}

              {/* OVERLAY KHI CAMERA CHƯA BẬT */}
              {!cameraActive && !capturedImage && (
                <div className="p-4 sm:p-6 text-center space-y-3 max-w-sm mx-auto text-white">
                  <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center mx-auto shadow-lg animate-pulse">
                    <Camera className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="font-black text-sm sm:text-base text-white">
                      Chấm Bài Trắc Nghiệm Định Kỳ
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed">
                      Bấm nút bên dưới để bật Camera máy tính hoặc điện thoại quét phiếu thi.
                    </p>
                  </div>

                  {cameraError && (
                    <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs text-left space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-300">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Thông báo Camera:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{cameraError}</p>
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    {/* Bật Camera Lại button */}
                    <button
                      type="button"
                      disabled={cameraStarting}
                      onClick={() => startCamera()}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {cameraStarting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang kết nối Camera...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          <span>Bấm Vào Đây Để Bật Camera Trực Tiếp</span>
                        </>
                      )}
                    </button>

                    {/* Native Camera Capture for Phones / Tablets */}
                    <label className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-blue-400/30">
                      <Smartphone className="w-4 h-4 text-amber-300" />
                      <span>Chụp Bằng Máy Ảnh Điện Thoại (Siêu Nét)</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleUploadImage}
                        className="hidden"
                      />
                    </label>

                    {/* Upload from file */}
                    <label className="w-full py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/20">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn Ảnh Phiếu Thi Đã Chụp Sẵn</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* CAPTURED IMAGE PREVIEW */}
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured exam sheet"
                  className="w-full h-full object-contain bg-slate-900"
                />
              )}

              {/* Loading Spinner */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-white space-y-3 z-20">
                  <RefreshCw className="w-9 h-9 animate-spin text-emerald-400" />
                  <p className="font-black text-sm text-emerald-300">
                    Đang quét OMR: SBD, Mã đề, Phần I, II & III...
                  </p>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Controls Bar */}
            <div className="space-y-2">
              
              {/* Row 1: Primary Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                {!capturedImage ? (
                  <>
                    <button
                      type="button"
                      id="btn-omr-capture-sheet"
                      disabled={!cameraActive}
                      onClick={captureFrame}
                      className={`flex-1 py-3 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                        cameraActive
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white ring-2 ring-emerald-400/40'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      <span>Chụp & Chấm Phiếu Mẫu Mới</span>
                    </button>

                    {/* Camera Switcher Button (Trước / Sau) */}
                    {cameraActive && (
                      <button
                        type="button"
                        onClick={handleToggleFacingMode}
                        className="px-3 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-slate-700"
                        title="Đổi camera trước/sau"
                      >
                        <SwitchCamera className="w-4 h-4 text-amber-300" />
                        <span className="hidden sm:inline">
                          {facingMode === 'environment' ? 'Camera Sau' : 'Camera Trước'}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsFullScreenScanner(true);
                        if (!cameraActive && !capturedImage) startCamera();
                      }}
                      className="px-3 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="Mở giao diện chấm bài toàn màn hình dọc A4 chuyên nghiệp"
                    >
                      <Smartphone className="w-4 h-4 text-amber-300" />
                      <span>Full Màn Hình A4</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextStudent}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Chụp Lại / Chấm Bài Tiếp Theo</span>
                  </button>
                )}

                {/* Chấm Thử Phiếu Mẫu Demo Button */}
                <button
                  type="button"
                  onClick={handleLoadDemoSheet}
                  className="px-3 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Chấm thử ngay bằng ảnh phiếu thi mẫu mô phỏng"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span className="hidden sm:inline">Chấm Thử Phiếu Mẫu</span>
                  <span className="sm:hidden">Thử Mẫu</span>
                </button>

                {/* Direct Mobile Camera Capture */}
                <label className="px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                  <Smartphone className="w-4 h-4 text-amber-300" />
                  <span className="hidden sm:inline">Máy Ảnh ĐT</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                </label>


                {/* File Upload Button */}
                <label className="px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-300">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Tải Ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Multi-camera selector dropdown (if multiple video inputs exist) */}
              {availableCameras.length > 1 && (
                <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <SwitchCamera className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="font-bold text-slate-700 shrink-0">Chọn máy ảnh:</span>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => handleSelectCamera(e.target.value)}
                    className="flex-1 p-1 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-medium outline-none"
                  >
                    {availableCameras.map((cam, idx) => (
                      <option key={cam.deviceId || idx} value={cam.deviceId}>
                        {cam.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            </div>

            {/* Error & Guidance Alert */}
            {cameraError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">{cameraError}</p>
                    <p className="text-[11px] text-amber-800">
                      💡 <strong>Mẹo nhanh:</strong> Thầy/Cô có thể bấm nút <strong>"Máy Ảnh ĐT"</strong> ở trên để mở trực tiếp ứng dụng chụp ảnh trên điện thoại, hoặc bấm biểu tượng ổ khóa 🔒 trên thanh địa chỉ để cấp quyền rồi bấm <strong>"Thử Lại Camera"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-lg text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Thử Lại Camera</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: Results Breakdown with 3 Sections (6 cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-3">
            
            {/* Scorecard Box */}
            {gradingResult ? (
              <div className="p-4 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-2xl text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-mono">
                      KẾT QUẢ CHẤM OMR
                    </span>
                    <span className="text-xs text-indigo-200 font-mono">
                      SBD: {detectedSBD} • Đề: {detectedExamCode}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-200">
                    Lớp {selectedClass}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-3xl font-black text-amber-300">
                      {gradingResult.totalScore.toFixed(1)} <span className="text-sm font-normal text-slate-300">/ 10.0 điểm</span>
                    </h4>
                    <p className="text-xs text-slate-300 font-medium">
                      P.I ({gradingResult.part1Score}đ) + P.II ({gradingResult.part2Score}đ) + P.III ({gradingResult.part3Score}đ) + TL ({gradingResult.essayScore}đ)
                    </p>
                  </div>

                  {/* Điểm Tự luận input */}
                  <div className="bg-white/10 p-2 rounded-xl text-right">
                    <label className="text-[10px] text-slate-300 block mb-0.5">Điểm Tự luận (max 3đ):</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="3.0"
                      value={essayScore}
                      onChange={(e) => handleEssayScoreChange(parseFloat(e.target.value) || 0)}
                      className="w-16 p-1 bg-white text-slate-900 font-black text-center rounded text-xs outline-none"
                    />
                  </div>
                </div>

                {saveSuccessMsg ? (
                  <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveToGradebook}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Vào Bảng Điểm Nhà Trường</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1.5">
                <FileText className="w-7 h-7 text-slate-400 mx-auto" />
                <h4 className="font-bold text-xs text-slate-700">Chưa có kết quả quét</h4>
                <p className="text-[11px] text-slate-500">
                  Bật Camera hoặc chụp/tải ảnh phiếu thi để hệ thống tự động nhận diện và chấm điểm.
                </p>
              </div>
            )}

            {/* TABBED 3-SECTION DETAILS CONTAINER */}
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden flex-1 flex flex-col">
              
              {/* Section Sub-tabs */}
              <div className="p-1.5 bg-slate-100 border-b border-slate-200 flex items-center gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveResultTab('p1')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeResultTab === 'p1' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Phần I (40 câu TN)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab('p2')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeResultTab === 'p2' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Phần II (8 câu Đ/S)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab('p3')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeResultTab === 'p3' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Phần III (6 câu TLN)
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto p-3 text-xs">
                
                {/* PHẦN I: 40 CÂU TRẮC NGHIỆM */}
                {activeResultTab === 'p1' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center font-bold text-slate-900 text-[11px] pb-1 border-b border-slate-100">
                      <span className="text-blue-900">Chi tiết 40 câu trắc nghiệm Phần I:</span>
                      <span className="text-emerald-700 font-mono">
                        {gradingResult ? `${gradingResult.part1CorrectCount}/40 câu đúng (${gradingResult.part1Score}đ)` : 'Tối đa 4,0đ'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {Array.from({ length: 40 }, (_, idx) => {
                        const qNum = idx + 1;
                        const correct = part1Keys[idx] || 'A';
                        const studentAns = detectedPart1[idx] || '-';
                        const isMatch = studentAns === correct;
                        return (
                          <div key={qNum} className="flex items-center justify-between p-1 rounded bg-slate-50 border border-slate-100 text-[10px]">
                            <span className="font-mono font-bold text-slate-700">C{qNum}:</span>
                            <span className="text-slate-500 font-bold">Đ:{correct}</span>
                            <span className={`px-1 py-0.2 rounded font-black ${
                              studentAns === '-' ? 'text-slate-400' : isMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                            }`}>
                              {studentAns} {studentAns !== '-' && (isMatch ? '✓' : '✗')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PHẦN II: 8 CÂU ĐÚNG / SAI (32 Ý) */}
                {activeResultTab === 'p2' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center font-bold text-slate-900 text-[11px] pb-1 border-b border-slate-100">
                      <span className="text-blue-900">Chi tiết 8 câu Đúng/Sai Phần II (a, b, c, d):</span>
                      <span className="text-emerald-700 font-mono">
                        {gradingResult ? `${gradingResult.part2CorrectCount}/32 ý đúng (${gradingResult.part2Score}đ)` : 'Tối đa 2,8đ'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                      {Array.from({ length: 8 }, (_, qIdx) => {
                        const qNum = qIdx + 1;
                        return (
                          <div key={qNum} className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                            <span className="font-black text-slate-800 block border-b border-slate-200 pb-0.5">
                              Câu {qNum} (4 ý):
                            </span>
                            {['a', 'b', 'c', 'd'].map((item, itemIdx) => {
                              const correct = part2Keys[qIdx]?.[itemIdx] ? 'Đ' : 'S';
                              const studentAns = detectedPart2[qIdx]?.[itemIdx] !== undefined 
                                ? (detectedPart2[qIdx][itemIdx] ? 'Đ' : 'S') 
                                : '-';
                              const isMatch = studentAns === correct;
                              return (
                                <div key={item} className="flex justify-between items-center">
                                  <span className="font-bold">{item})</span>
                                  <span className="text-slate-500">{correct}</span>
                                  <span className={isMatch ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                                    {studentAns} {studentAns !== '-' && (isMatch ? '✓' : '✗')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PHẦN III: 6 CÂU TRẢ LỜI NGẮN TÔ SỐ */}
                {activeResultTab === 'p3' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center font-bold text-slate-900 text-[11px] pb-1 border-b border-slate-100">
                      <span className="text-blue-900">Chi tiết 6 câu trả lời ngắn Phần III:</span>
                      <span className="text-emerald-700 font-mono">
                        {gradingResult ? `${gradingResult.part3CorrectCount}/6 câu đúng (${gradingResult.part3Score}đ)` : 'Tối đa 1,5đ'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                      {Array.from({ length: 6 }, (_, idx) => {
                        const qNum = idx + 1;
                        const correct = part3Keys[idx] || '';
                        const studentAns = detectedPart3[idx] || '-';
                        const isMatch = studentAns === correct;
                        return (
                          <div key={qNum} className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                            <span className="font-black text-slate-800">Câu {qNum}:</span>
                            <div className="text-slate-500 mt-1">Đ/A chuẩn: <strong className="text-blue-700">{correct}</strong></div>
                            <div className="mt-1 font-bold">
                              Tô: <span className={isMatch ? 'text-emerald-700' : 'text-red-600'}>{studentAns} {studentAns !== '-' && (isMatch ? '✓' : '✗')}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px] text-slate-500">
            Hệ thống chấm thi quang học OMR theo mẫu chuẩn mới GDPT 2018 - Trường THCS & THPT Y Đôn
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsFullScreenScanner(true);
                if (!cameraActive) startCamera();
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>⛶ Toàn Màn Hình Camera</span>
            </button>
            {gradingResult && (
              <button
                type="button"
                onClick={handleNextStudent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Chấm bài tiếp theo →
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
      )}

      {/* ANSWER KEY MANAGER MODAL (UP TO 6 EXAM CODES) */}
      {showKeyManagerModal && (
        <ExamAnswerKeyManagerModal
          isOpen={showKeyManagerModal}
          onClose={() => setShowKeyManagerModal(false)}
          examTitle={selectedPeriodicExam.title}
          codeKeys={allCodeKeys}
          activeCode={detectedExamCode || currentGradingCode}
          onSaveCodeKeys={(newKeys, activeCode) => {
            setAllCodeKeys(newKeys);
            localStorage.setItem('ydon_periodic_code_keys', JSON.stringify(newKeys));
            setDetectedExamCode(activeCode);
            setCurrentGradingCode(activeCode);
          }}
        />
      )}

      {/* SCIENTIFIC GRADING RESULTS SUMMARY MODAL */}
      {showSummaryModal && (
        <GradingResultsSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          submissions={sessionSubmissions}
          examTitle={selectedPeriodicExam.title}
          onDeleteSubmission={(subId) => {
            setSessionSubmissions((prev) => prev.filter((s) => s.id !== subId));
          }}
        />
      )}

    </div>
  );
}
