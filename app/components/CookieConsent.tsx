'use client'

import { useEffect } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'
import 'vanilla-cookieconsent/dist/cookieconsent.css'

export default function CookieConsentBanner() {
  useEffect(() => {
    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: 'bar',
          position: 'bottom center',
          flipButtons: false,
        },
        preferencesModal: {
          layout: 'box',
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: false,
        },
      },
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: '',
              description:
                'We use cookies to understand how our site is used and to improve your experience. <a href="/privacy-policy" class="cc__link">Privacy Policy</a>',
              acceptAllBtn: 'Accept All',
              acceptNecessaryBtn: 'Necessary Only',
              showPreferencesBtn: 'Manage',
            },
            preferencesModal: {
              title: 'Cookie Preferences',
              acceptAllBtn: 'Accept All',
              acceptNecessaryBtn: 'Necessary Only',
              savePreferencesBtn: 'Save Preferences',
              closeIconLabel: 'Close',
              sections: [
                {
                  title: 'Necessary Cookies',
                  description:
                    'These cookies are required for the site to function and cannot be disabled. They include session management and security.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Analytics',
                  description:
                    'First-party analytics only. Page views and session counts logged to our own systems — not shared with advertising networks.',
                  linkedCategory: 'analytics',
                },
              ],
            },
          },
        },
      },
    })
  }, [])

  return null
}
