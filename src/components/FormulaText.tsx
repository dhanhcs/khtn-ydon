import React from 'react';

/**
 * Danh sách ký hiệu nguyên tố hóa học chuẩn IUPAC (86 nguyên tố phổ biến)
 * Dùng để bóc tách chỉ số (subscript) trong công thức hóa học với độ chính xác 100%
 */
const CHEMICAL_ELEMENTS = 
  'H|He|Li|Be|B|C|N|O|F|Ne|Na|Mg|Al|Si|P|S|Cl|Ar|K|Ca|Sc|Ti|V|Cr|Mn|Fe|Co|Ni|Cu|Zn|Ga|Ge|As|Se|Br|Kr|Rb|Sr|Y|Zr|Nb|Mo|Tc|Ru|Rh|Pd|Ag|Cd|In|Sn|Sb|Te|I|Xe|Cs|Ba|La|Ce|Pr|Nd|Pm|Sm|Eu|Gd|Tb|Dy|Ho|Er|Tm|Yb|Lu|Hf|Ta|W|Re|Os|Ir|Pt|Au|Hg|Tl|Pb|Bi|Po|At|Rn';

const SUP_MAP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁺': '+', '⁻': '-', 'ⁿ': 'n'
};

const SUB_MAP: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  '₊': '+', '₋': '-'
};

/**
 * Chuẩn hóa chuỗi văn bản toán học & hóa học sang định dạng chứa thẻ <sub> và <sup>:
 * 1. Chỉ số trong công thức hóa học: ghi lệch dưới bên phải kí hiệu (subscript <sub>)
 * 2. Số mũ của lũy thừa: ghi lệch lên phía trên bên phải cơ số (superscript <sup>)
 * 3. Đơn vị đo khoa học & vật lí có lũy thừa (m², m³, cm³, N/m², kg/m³, m/s², v.v.)
 */
export function formatFormulaString(rawText: string | number | undefined | null): string {
  if (rawText === undefined || rawText === null) return '';
  let s = String(rawText);
  if (!s.trim()) return s;

  // 1. Chuyển đổi các ký tự Unicode số mũ có sẵn sang <sup>...</sup>
  s = s.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ]+)/g, (match) => {
    const converted = [...match].map(c => SUP_MAP[c] || c).join('');
    return `<sup>${converted}</sup>`;
  });

  // 2. Chuyển đổi các ký tự Unicode chỉ số dưới có sẵn sang <sub>...</sub>
  s = s.replace(/([₀₁₂₃₄₅₆₇₈₉₊₋]+)/g, (match) => {
    const converted = [...match].map(c => SUB_MAP[c] || c).join('');
    return `<sub>${converted}</sub>`;
  });

  // 3. Số mũ lũy thừa với dấu mũ ^ (Ví dụ: 10^23, 10^-6, x^2, (a+b)^2, v^2, r^2)
  s = s.replace(/([a-zA-Z0-9\)])\^([+-]?\d+|[a-zA-Z]+|\{[^}]+\})/g, (_match, base, exp) => {
    const cleanExp = exp.replace(/[{}]/g, '');
    return `${base}<sup>${cleanExp}</sup>`;
  });

  // 4. Trường hợp đặc biệt khi Word import bị mất số mũ (Ví dụ: 1023 hạt, 6,022 x 1023, 10-6)
  s = s.replace(/([×x*.]\s*10)(2[0-5])\b/g, '$1<sup>$2</sup>');
  s = s.replace(/(\b10)(2[0-5])\s*(?=hạt|nguyên tử|phân tử|ion)/gi, '$1<sup>$2</sup> ');

  // 5. Đơn vị vật lí & khoa học chứa số mũ:
  // Ví dụ: m2, m3, cm2, cm3, dm3, mm2, mm3, km2, km3, N/m2, N/m3, kg/m3, g/cm3, m/s2
  s = s.replace(/\b(N\/m|kg\/m|g\/cm|m\/s|cm|dm|mm|km|m)([23])\b/g, '$1<sup>$2</sup>');

  // 6. Chỉ số trong công thức hóa học:
  // Ký hiệu nguyên tố hóa học hoặc dấu đóng ngoặc ')' đi liền sau là các chữ số
  // Ví dụ: H2O -> H<sub>2</sub>O; CO2 -> CO<sub>2</sub>; Fe3O4 -> Fe<sub>3</sub>O<sub>4</sub>; Ca(OH)2 -> Ca(OH)<sub>2</sub>
  // Không áp dụng bên trong các thẻ HTML đã có
  const chemRegex = new RegExp('(' + CHEMICAL_ELEMENTS + '|\\))(\\d+)(?![^<]*>|[^<]*<\\/sub>)', 'g');
  s = s.replace(chemRegex, '$1<sub>$2</sub>');

  // 7. Điện tích ion phổ biến (Ví dụ: Cu2+, Fe3+, Al3+, H+, OH-, Cl-, SO4^2-)
  s = s.replace(/\b(Cu|Fe|Al|Ca|Ba|Mg|Zn|Pb)(2\+|3\+)\b/g, '$1<sup>$2</sup>');
  s = s.replace(/\b(Na|K|Ag|H)(\+)\b/g, '$1<sup>$2</sup>');
  s = s.replace(/\b(Cl|F|Br|I)(\-)\b/g, '$1<sup>$2</sup>');
  s = s.replace(/(SO|CO|PO)<sub>(\d+)<\/sub>\^?([1-3]?[+-])/g, '$1<sub>$2</sub><sup>$3</sup>');

  // 8. Mũi tên phản ứng hóa học: -> thành →
  s = s.replace(/\s*->\s*/g, ' → ');

  return s;
}

export interface FormulaTextProps {
  text?: string | number | null;
  className?: string;
  as?: 'span' | 'p' | 'div';
}

/**
 * Component React hiển thị công thức hóa học và số mũ lũy thừa theo quy ước chuẩn:
 * - Trong công thức hóa học: chỉ số ghi lệch dưới bên phải kí hiệu (<sub>)
 * - Số mũ của lũy thừa: ghi lệch lên phía trên bên phải cơ số (<sup>)
 * - Tự động xử lý an toàn Virtual DOM, không dùng dangerouslySetInnerHTML
 */
export const FormulaText: React.FC<FormulaTextProps> = ({
  text,
  className = '',
  as: Component = 'span'
}) => {
  if (text === undefined || text === null) return null;

  const formatted = formatFormulaString(text);

  // Tách chuỗi theo các thẻ <sub> và <sup> để render thành các phần tử React thuần túy
  const parts = formatted.split(/(<\/?(?:sub|sup)>)/gi);
  const elements: React.ReactNode[] = [];
  let currentMode: 'normal' | 'sub' | 'sup' = 'normal';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    const lower = part.toLowerCase();
    if (lower === '<sub>') {
      currentMode = 'sub';
    } else if (lower === '</sub>') {
      currentMode = 'normal';
    } else if (lower === '<sup>') {
      currentMode = 'sup';
    } else if (lower === '</sup>') {
      currentMode = 'normal';
    } else {
      if (currentMode === 'sub') {
        elements.push(
          <sub
            key={i}
            className="text-[0.72em] font-semibold align-sub leading-none relative -bottom-[0.22em] select-text"
          >
            {part}
          </sub>
        );
      } else if (currentMode === 'sup') {
        elements.push(
          <sup
            key={i}
            className="text-[0.72em] font-semibold align-super leading-none relative -top-[0.32em] select-text"
          >
            {part}
          </sup>
        );
      } else {
        elements.push(<React.Fragment key={i}>{part}</React.Fragment>);
      }
    }
  }

  return <Component className={className}>{elements}</Component>;
};

export default FormulaText;
