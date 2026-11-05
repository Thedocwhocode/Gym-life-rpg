/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

// E3: visual regression over the dev gallery (docs/redesign/PLANO.md §3.9). Runs with
// EXPO_PUBLIC_FREEZE_MOTION=1 in CI so animations hold their first frame. Each primitive and
// screen gets its reference in the phase that finishes it.

const REDESIGN_FONTS = [
  'PixelifySans_500Medium',
  'PixelifySans_600SemiBold',
  'SpaceMono_400Regular',
  'SpaceMono_700Bold',
]

describe('Dev gallery', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.completeWelcomeWizard()
    cy.navigate('Settings')
    cy.getByTestId('devGallery').click()
    cy.getByTestId('dev-gallery').should('be.visible')
  })

  it('loads the redesign fonts', () => {
    cy.document().then((doc) =>
      cy.wrap(doc.fonts.ready).then(() => {
        // fonts.check() also returns true for unknown families, so look at the FontFace itself.
        const loaded = [...doc.fonts].filter((f) => f.status === 'loaded').map((f) => f.family)
        for (const family of REDESIGN_FONTS) {
          expect(loaded, family).to.include(family)
        }
      }),
    )
  })

  it('matches the reference snapshots', () => {
    cy.matchSnapshot('gallery-fonts')
    cy.matchSnapshot('gallery-icons')
  })
})
