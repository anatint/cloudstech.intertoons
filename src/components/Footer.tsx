/** Minimal footer (scaffold). Replace with the ported itwebsite Footer. */
export function Footer() {
  return (
    <footer className="bg-[#050B2A] text-slate-400 py-10 border-t border-white/10">
      <div className="container max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <p>© {new Date().getFullYear()} Intertoons Internet Services Pvt. Ltd.</p>
        <p className="text-slate-500">Powered by Wix Headless · Cloudflare Workers</p>
      </div>
    </footer>
  )
}
