export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`font-display font-bold tracking-tight text-[#007BFF] lowercase ${className}`}>
      anora
    </div>
  );
}
