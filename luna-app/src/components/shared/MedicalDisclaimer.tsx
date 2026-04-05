export function MedicalDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={className}
      role="note"
    >
      This is a wellness tool, not a medical device. Consult a healthcare
      provider for medical decisions.
    </p>
  );
}
