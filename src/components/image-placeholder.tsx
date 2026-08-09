export function ImagePlaceholder({ label = "Organizer-approved event image" }: { label?: string }) {
  return (
    <div className="image-placeholder" aria-label={label}>
      <div className="image-grid" />
      <div className="image-placeholder-copy">
        <span>IMAGE PLACEHOLDER</span>
        <strong>{label}</strong>
        <small>Replace when official materials are provided.</small>
      </div>
    </div>
  );
}
