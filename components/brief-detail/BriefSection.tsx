import CopyButton from "@/components/ui/CopyButton";

interface BriefSectionProps {
  title: string;
  children: React.ReactNode;
  copyText?: string;
}

export default function BriefSection({ title, children, copyText }: BriefSectionProps) {
  return (
    <div className="border border-[#2d2d4e] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d1f] border-b border-[#2d2d4e]">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        {copyText && <CopyButton text={copyText} />}
      </div>
      <div className="px-4 py-4 text-sm text-slate-300 space-y-3 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
