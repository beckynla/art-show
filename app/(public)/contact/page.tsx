import { getSettings } from '@/lib/settings'

export default async function ContactPage() {
  const contact = await getSettings('contact')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Heading is optional; keep an accessible page title for screen readers when it's hidden */}
      {contact.contact_heading ? (
        <h1 className="text-3xl font-bold font-heading text-gray-900 mb-6">
          {contact.contact_heading}
        </h1>
      ) : (
        <h1 className="sr-only">Contact</h1>
      )}

      {contact.contact_intro && (
        <div className="prose prose-lg text-gray-600 max-w-3xl mb-10">
          {contact.contact_intro
            .split('\n')
            .filter((p) => p.trim())
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      )}

      <div className="max-w-xl">
        {/* Contact Info */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Get in Touch
          </h2>

          <div className="space-y-4">
            {contact.contact_email && (
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a
                    href={`mailto:${contact.contact_email}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {contact.contact_email}
                  </a>
                </div>
              </div>
            )}

            {contact.contact_phone && (
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <a
                    href={`tel:${contact.contact_phone}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {contact.contact_phone}
                  </a>
                </div>
              </div>
            )}

            {contact.contact_address && (
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-gray-600 whitespace-pre-line">
                    {contact.contact_address}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          {(contact.social_instagram || contact.social_facebook || contact.social_twitter) && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Follow Along
              </h3>
              <div className="flex gap-4">
                {contact.social_instagram && (
                  <a
                    href={contact.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Instagram</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {contact.social_facebook && (
                  <a
                    href={contact.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {contact.social_twitter && (
                  <a
                    href={contact.social_twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Twitter</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
