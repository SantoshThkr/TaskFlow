export default function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <p className="state-message" role="status">
      {label}
    </p>
  );
}
