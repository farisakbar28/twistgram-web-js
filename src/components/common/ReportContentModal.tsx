import React from 'react';
import type { ReportReason, ReportPayload } from '../../types/social';
import Modal from './Modal';
import Button from './Button';

interface ReportContentModalProps {
  isOpen: boolean;
  title: string;
  targetLabel: string;
  selectedReason: ReportReason;
  isSubmitting?: boolean;
  onClose: () => void;
  onReasonChange: (reason: ReportReason) => void;
  onSubmit: () => void;
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Konten tidak pantas' },
  { value: 'harassment', label: 'Pelecehan / Intimidasi' },
  { value: 'fake_account', label: 'Akun palsu' },
  { value: 'other', label: 'Lainnya' },
];

export const buildReportPayload = (
  targetType: ReportPayload['target_type'],
  targetId: string,
  reason: ReportReason
): ReportPayload => ({
  target_type: targetType,
  target_id: targetId,
  reason,
});

const ReportContentModal: React.FC<ReportContentModalProps> = ({
  isOpen,
  title,
  targetLabel,
  selectedReason,
  isSubmitting = false,
  onClose,
  onReasonChange,
  onSubmit,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
  >
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-400">
        Pilih alasan laporan untuk {targetLabel.toLowerCase()}:
      </p>
      <div className="flex flex-col gap-1">
        {REPORT_REASONS.map((reason) => (
          <button
            key={reason.value}
            onClick={() => onReasonChange(reason.value)}
            className={[
              'flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-colors text-left',
              selectedReason === reason.value
                ? 'bg-brand-500/10 border border-brand-500/30 text-brand-300'
                : 'text-neutral-300 hover:bg-surface-800',
            ].join(' ')}
            type="button"
          >
            <span className={[
              'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
              selectedReason === reason.value ? 'border-brand-500' : 'border-surface-600',
            ].join(' ')}>
              {selectedReason === reason.value && (
                <span className="w-2 h-2 rounded-full bg-brand-500" />
              )}
            </span>
            {reason.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-2 border-t border-surface-800">
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={onClose}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          variant="primary"
          size="md"
          fullWidth
          loading={isSubmitting}
          onClick={onSubmit}
        >
          Kirim Laporan
        </Button>
      </div>
    </div>
  </Modal>
);

export default ReportContentModal;
