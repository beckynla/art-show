'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/components/ui'

const steps = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'account', title: 'Create Account' },
  { id: 'shop', title: 'Shop Basics' },
  { id: 'appearance', title: 'Appearance' },
  { id: 'contact', title: 'Contact Info' },
  { id: 'complete', title: 'Complete' },
]

export default function SetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    // Account
    email: '',
    password: '',
    name: '',
    // Shop
    shopName: '',
    shopTagline: '',
    // Appearance
    primaryColor: '#0ea5e9',
    accentColor: '#d946ef',
    // Contact
    contactEmail: '',
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleNext = async () => {
    setError('')

    // Validate current step
    switch (steps[currentStep].id) {
      case 'account':
        if (!formData.email || !formData.password) {
          setError('Email and password are required')
          return
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters')
          return
        }
        break
      case 'shop':
        if (!formData.shopName) {
          setError('Shop name is required')
          return
        }
        break
    }

    if (currentStep < steps.length - 2) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === steps.length - 2) {
      // Submit setup
      await handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed')
      }

      setCurrentStep(steps.length - 1) // Go to complete step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to ArtBox
            </h2>
            <p className="text-gray-600 mb-8">
              Let&apos;s get your art shop set up. This will only take a few minutes.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">We&apos;ll help you:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create your admin account
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Set up your shop basics
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Choose your colors
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Add your contact info
                </li>
              </ul>
            </div>
          </div>
        )

      case 'account':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Admin Account
            </h2>
            <p className="text-gray-600 mb-6">
              This will be your login to manage your shop.
            </p>
            <div className="space-y-4">
              <Input
                label="Your Name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Jane Artist"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                placeholder="you@example.com"
              />
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                required
                placeholder="Minimum 8 characters"
                helpText="At least 8 characters"
              />
            </div>
          </div>
        )

      case 'shop':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Shop Basics
            </h2>
            <p className="text-gray-600 mb-6">
              What should we call your shop?
            </p>
            <div className="space-y-4">
              <Input
                label="Shop Name"
                value={formData.shopName}
                onChange={(e) => updateField('shopName', e.target.value)}
                required
                placeholder="My Art Gallery"
              />
              <Input
                label="Tagline"
                value={formData.shopTagline}
                onChange={(e) => updateField('shopTagline', e.target.value)}
                placeholder="Original artwork by..."
                helpText="A short description of your shop"
              />
            </div>
          </div>
        )

      case 'appearance':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Choose Your Colors
            </h2>
            <p className="text-gray-600 mb-6">
              Pick colors that represent your brand.
            </p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => updateField('primaryColor', e.target.value)}
                    className="h-12 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => updateField('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Used for buttons and links</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => updateField('accentColor', e.target.value)}
                    className="h-12 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={formData.accentColor}
                    onChange={(e) => updateField('accentColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Used for highlights and accents</p>
              </div>
            </div>
          </div>
        )

      case 'contact':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Contact Information
            </h2>
            <p className="text-gray-600 mb-6">
              How can customers reach you?
            </p>
            <div className="space-y-4">
              <Input
                label="Contact Email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                placeholder="hello@example.com"
                helpText="Displayed on your contact page"
              />
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              You&apos;re All Set!
            </h2>
            <p className="text-gray-600 mb-8">
              Your shop is ready to go. Head to the admin dashboard to add your first products.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/admin')}
                className="w-full"
                size="lg"
              >
                Go to Admin Dashboard
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                View Your Shop
              </Button>
            </div>
          </div>
        )
    }
  }

  const isLastStep = currentStep === steps.length - 1
  const showNavigation = !isLastStep

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress */}
      {!isLastStep && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length - 1}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {steps[currentStep].title}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentStep + 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            {renderStep()}

            {showNavigation && (
              <div className="mt-8 flex gap-4">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  loading={isSubmitting}
                  className="flex-1"
                >
                  {currentStep === steps.length - 2 ? 'Complete Setup' : 'Continue'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
