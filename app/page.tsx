import Link from 'next/link';

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-36">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Get Paid Without the Awkwardness
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-100 leading-relaxed">
              ChaseWise helps small businesses send professional, multi-round
              collection emails. Whether a polite reminder, a firm nudge, or a
              final notice — we pick the right tone so you don&apos;t have to.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-white text-primary-700 px-8 py-3.5 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg shadow-primary-900/30"
              >
                Start Free
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center border-2 border-white/30 text-white px-8 py-3.5 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
          How ChaseWise Works
        </h2>
        <p className="mt-4 text-center text-gray-500 max-w-2xl mx-auto">
          Three simple steps to turn your unpaid invoices into paid ones.
        </p>
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto text-2xl font-bold">1</div>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">Create a Case</h3>
            <p className="mt-3 text-gray-500 leading-relaxed">
              Enter your customer&apos;s name, the amount owed, and how many days it&apos;s overdue. We&apos;ll take it from there.
            </p>
          </div>
          <div className="card text-center">
            <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto text-2xl font-bold">2</div>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">AI Writes the Email</h3>
            <p className="mt-3 text-gray-500 leading-relaxed">
              Our AI generates a professional collection email in the right tone — polite, firm, or final notice.
            </p>
          </div>
          <div className="card text-center">
            <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto text-2xl font-bold">3</div>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">Follow Up Smartly</h3>
            <p className="mt-3 text-gray-500 leading-relaxed">
              Your customer replies? Come back to ChaseWise, log their response, and get the next email ready.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="md:flex items-center gap-16">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">One Case, Multiple Rounds</h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                Every case builds a timeline of communication. Start with a polite reminder, escalate to a firm notice, and if needed, send a final warning.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="badge-r1 mt-0.5">R1</span>
                  <span className="text-gray-600"><strong>Polite Reminder</strong> — 1-7 days overdue. A friendly nudge.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="badge-r2 mt-0.5">R2</span>
                  <span className="text-gray-600"><strong>Firm &amp; Cooperative</strong> — 8-30 days overdue. Pressure with a path forward.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="badge-r3 mt-0.5">R3</span>
                  <span className="text-gray-600"><strong>Final Notice</strong> — 30+ days overdue. Last warning before legal action.</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="card border-2 border-gray-100">
                <div className="space-y-6">
                  {[{round:1,tier:'R1',label:'Polite Reminder',badge:'badge-r1'},{round:2,tier:'R2',label:'Firm & Cooperative',badge:'badge-r2'},{round:3,tier:'R3',label:'Final Notice',badge:'badge-r3'}].map(item=>(
                    <div key={item.round} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">{item.round}</div>
                      <div><div className="flex items-center gap-2"><span className={item.badge}>{item.tier}</span><span className="text-sm font-medium text-gray-700">{item.label}</span></div><p className="mt-1 text-sm text-gray-400">Auto-generated email ready to send</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Simple, Affordable Pricing</h2>
        <p className="mt-4 text-gray-500 max-w-xl mx-auto">Start free with 2 cases per month. Need more? Go Pro for unlimited everything.</p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/pricing" className="btn-primary text-lg px-10 py-3.5">See Plans</Link>
        </div>
      </section>
    </div>
  );
}