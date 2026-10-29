import React from 'react';
import {
  formatFullAadhaar,
  generateReporterIdCode,
  type ApprovalStatus,
} from '../utils/newsLogic';
import { EdiNijamLogo } from './EdiNijamLogo';
import { ReporterAvatar } from './EditorialIllustration';

interface PressIdCardPreviewProps {
  reporter: {
    id: string;
    name: string;
    username: string;
    mobile: string;
    state: string;
    district: string;
    mandal: string;
    photoDataUrl: string;
    status: ApprovalStatus;
  };
}

export const PressIdCardPreview: React.FC<PressIdCardPreviewProps> = ({ reporter }) => {
  const idCode = generateReporterIdCode(reporter);
  const isApproved = reporter.status === 'approved';

  return (
    <div
      data-testid="press-id-card-visual"
      className="rounded-2xl overflow-hidden border-2 border-amber-400 bg-[#FFFDF9] text-stone-900 shadow-sm"
    >
      {/* Top Official Press Header */}
      <div className="bg-gradient-to-r from-[#0B1D3A] via-[#1E3A8A] to-[#7C2D12] text-white p-3.5 border-b-2 border-amber-400 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <EdiNijamLogo size={38} />
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-amber-300 tracking-wide truncate">
              నేటిభారతం · NETI BHARATAM
            </div>
            <div className="text-[10px] text-amber-100 font-semibold truncate">
              అధికారిక ప్రెస్ అక్రిడిటేషన్ కార్డు · ఒక దేశం ఒకే చట్టం
            </div>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-red-800 border border-amber-300 text-center shrink-0">
          <div className="text-xs font-black text-white tracking-widest leading-none">PRESS</div>
          <div className="text-[9px] font-bold text-amber-300 mt-0.5">MANDAL DESK</div>
        </div>
      </div>

      {/* Middle Body: Reporter Photo + Details */}
      <div className="p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="p-1 rounded-xl bg-[#0B1D3A] border-2 border-amber-400">
            <ReporterAvatar
              photoDataUrl={reporter.photoDataUrl}
              name={reporter.name || 'NB'}
              size="lg"
            />
          </div>
          <span className="px-2 py-0.5 rounded bg-[#0B1D3A] text-amber-300 font-mono text-[10px] font-bold">
            {idCode}
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-2 text-xs w-full">
          <div>
            <span className="text-[10px] font-bold uppercase text-stone-500 block">
              రిపోర్టర్ పూర్తి పేరు / REPORTER NAME
            </span>
            <div className="text-sm font-extrabold text-stone-900 truncate">
              {reporter.name || 'రిపోర్టర్ పేరు (Reporter Name)'}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-amber-50/90 border border-amber-300">
            <span className="text-[10px] font-bold uppercase text-stone-500 block">
              కేటాయించిన మండలం / ASSIGNED MANDAL DESK
            </span>
            <div className="text-xs font-extrabold text-[#9A3412]">
              {reporter.mandal} మండలం ({reporter.district}, {reporter.state})
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div>
              <span className="text-[10px] font-bold text-stone-500 block">మొబైల్ / MOBILE</span>
              <span className="font-mono font-bold text-stone-900">
                +91 {reporter.mobile || '98XXXXXXXX'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-500 block">యూజర్ ఐడి / USER ID</span>
              <span className="font-mono font-bold text-stone-900 truncate block">
                @{reporter.username || 'reporter'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Approval Status Bar */}
      <div
        className={`px-4 py-2 text-center text-[11px] font-bold text-white ${
          isApproved ? 'bg-emerald-700' : 'bg-amber-700'
        }`}
      >
        {isApproved
          ? 'APPROVED · అడ్మిన్ ఆమోదించిన అధికారిక గుర్తింపు కార్డు (Official Press ID)'
          : 'PENDING · అడ్మిన్ పర్మిషన్ వచ్చిన వెంటనే డౌన్‌లోడ్ ఓపెన్ అవుతుంది'}
      </div>
    </div>
  );
};

interface AadhaarCardPreviewProps {
  reporter: {
    name: string;
    aadhaarNumber: string;
    aadhaarDocName?: string;
    aadhaarDocDataUrl?: string;
    mobile: string;
    mandal: string;
    district: string;
    state: string;
    photoDataUrl?: string;
  };
}

export const AadhaarCardPreview: React.FC<AadhaarCardPreviewProps> = ({ reporter }) => {
  const hasUploadedRasterImage =
    reporter.aadhaarDocDataUrl &&
    (reporter.aadhaarDocDataUrl.startsWith('data:image/png') ||
      reporter.aadhaarDocDataUrl.startsWith('data:image/jpeg') ||
      reporter.aadhaarDocDataUrl.startsWith('data:image/webp'));

  if (hasUploadedRasterImage) {
    return (
      <div className="rounded-2xl overflow-hidden border-2 border-stone-300 bg-white p-2">
        <img
          src={reporter.aadhaarDocDataUrl}
          alt={`${reporter.name} Uploaded Aadhaar Card`}
          className="w-full h-auto rounded-xl block max-h-64 object-contain mx-auto"
        />
      </div>
    );
  }

  return (
    <div
      data-testid="aadhaar-card-visual"
      className="rounded-2xl overflow-hidden border-2 border-stone-300 bg-white text-stone-900 shadow-sm"
    >
      {/* Tricolor Top Header */}
      <div className="bg-[#FF9933] text-[#0B1D3A] px-4 py-2 text-center font-extrabold text-xs">
        భారత విశిష్ట గుర్తింపు ప్రాధికార సంస్థ · UIDAI AADHAAR KYC VERIFICATION COPY
      </div>
      <div className="bg-[#138808] text-white px-4 py-1 text-center font-bold text-[10px] tracking-wider">
        నేటిభారతం (NETI BHARATAM) — REPORTER IDENTITY DOCUMENT
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="p-1 rounded-xl bg-stone-100 border border-stone-300 shrink-0">
          <ReporterAvatar
            photoDataUrl={reporter.photoDataUrl || ''}
            name={reporter.name}
            size="lg"
          />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5 text-xs w-full">
          <div>
            <span className="text-[10px] text-stone-500 font-bold block">
              పూర్తి పేరు / Name:
            </span>
            <strong className="text-sm font-extrabold text-stone-900">{reporter.name}</strong>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-stone-500 font-bold block">
                మొబైల్ నెంబర్ / Mobile:
              </span>
              <strong className="font-mono text-stone-900">+91 {reporter.mobile}</strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 font-bold block">
                మండలం &amp; జిల్లా / Mandal &amp; District:
              </span>
              <strong className="text-[#9A3412]">
                {reporter.mandal}, {reporter.district} ({reporter.state})
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Digit Aadhaar Footer */}
      <div className="border-t border-stone-200 px-4 py-2.5 bg-stone-50 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-emerald-800 uppercase">
          UIDAI 12-DIGIT AADHAAR NUMBER:
        </span>
        <span className="font-mono text-base font-black tracking-widest text-[#0B1D3A]">
          {formatFullAadhaar(reporter.aadhaarNumber)}
        </span>
      </div>
    </div>
  );
};
