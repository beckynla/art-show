import { getSetting } from '@/lib/settings'

export default async function PrivacyPage() {
  const privacyPolicy = await getSetting('privacy_policy')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-heading text-gray-900 mb-8">
        Privacy Policy
      </h1>

      {privacyPolicy ? (
        <div className="prose prose-lg text-gray-600 max-w-none">
          {privacyPolicy.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          No privacy policy has been added yet.
        </p>
      )}
    </div>
  )
}
