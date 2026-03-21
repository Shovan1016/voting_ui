export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 flex items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-md px-4 py-12">
        {children}
      </div>
    </div>
  );
}
