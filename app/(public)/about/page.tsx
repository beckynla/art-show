import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getSettings } from '@/lib/settings'

export default async function AboutPage() {
  const homepage = await getSettings('homepage')

  if (homepage.show_about === 'false') {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-heading text-gray-900 mb-8">
        {homepage.about_title || 'About'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {homepage.about_image && (
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={homepage.about_image}
              alt="About"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className={homepage.about_image ? '' : 'md:col-span-2'}>
          {homepage.about_content ? (
            <div className="prose prose-lg text-gray-600">
              {homepage.about_content.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No about content has been added yet. Update this in the admin settings.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
