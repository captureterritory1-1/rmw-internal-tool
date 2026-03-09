import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center mb-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="RMW Logo" className="h-20 w-auto mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-brand-green mb-2">
          Rajasthan Marble World
        </h1>
        <p className="text-gray-500 text-lg">
          Dealers of Exclusive Marbles &amp; Granites
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <Link
          href="/create"
          className="flex items-center justify-center gap-3 px-10 py-6 bg-brand-green text-white text-xl font-semibold rounded-xl hover:bg-brand-green-dark transition-colors shadow-lg hover:shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Invoice
        </Link>

        <Link
          href="/invoices"
          className="flex items-center justify-center gap-3 px-10 py-6 bg-white text-brand-green text-xl font-semibold rounded-xl border-2 border-brand-green hover:bg-brand-green-light transition-colors shadow-lg hover:shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View Invoices
        </Link>
      </div>
    </div>
  )
}
