import { getSetting } from '@/lib/settings'

export default async function TermsPage() {
  const termsOfService = await getSetting('terms_of_service')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-heading text-gray-900 mb-8">
        Terms of Service
      </h1>

      {termsOfService ? (
        <div className="prose prose-lg text-gray-600 max-w-none">
          {termsOfService.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          No terms of service has been added yet.
        </p>
      )}
    </div>
  )
}
