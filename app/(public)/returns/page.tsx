import { getSetting } from '@/lib/settings'

export default async function ReturnsPage() {
  const returnPolicy = await getSetting('return_policy')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-heading text-gray-900 mb-8">
        Return Policy
      </h1>

      {returnPolicy ? (
        <div className="prose prose-lg text-gray-600 max-w-none">
          {returnPolicy.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          No return policy has been added yet.
        </p>
      )}
    </div>
  )
}
