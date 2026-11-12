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

const GALLERY_PIECES = [
  'fonts',
  'icons',
  'palette',
  'pixelbox',
  'ascii',
  'bars',
  'tags',
  'buttons',
  'icons-sizes',
  'controls',
  'toast',
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

  // T6: one reference per piece. gallery-fx stays out: its canvas is covered by the C6 test.
  for (const piece of GALLERY_PIECES) {
    it(`matches the ${piece} reference`, () => {
      // Only this piece is shown, so it starts on screen: below the fold of the inner ScrollView
      // element screenshots came out 1px tall. Hidden scrollbars keep the width at 366px.
      // Pieces taller than the screen (icons, controls): the tab bar covered their end and the
      // inner ScrollView cut them, so it goes away and the ancestors grow until the page scrolls.
      cy.document().then((doc) => {
        const style = doc.createElement('style')
        style.textContent =
          `[data-testid^="gallery-"]:not([data-testid="gallery-${piece}"]){display:none!important}` +
          '*::-webkit-scrollbar{display:none}*{scrollbar-width:none}' +
          '[data-testid="nav"]{display:none!important}'
        doc.head.appendChild(style)
      })
      cy.getByTestId(`gallery-${piece}`).then(($el) => {
        for (let n = $el[0].parentElement; n && n.tagName !== 'HTML'; n = n.parentElement) {
          for (const [k, v] of [['overflow', 'visible'], ['height', 'auto'], ['max-height', 'none'], ['position', 'relative']]) {
            n.style.setProperty(k, v, 'important')
          }
        }
      })
      cy.matchSnapshot(`gallery-${piece}`)
    })
  }

  // PLANO C6: an effect that throws disappears and the screen around it keeps working.
  it('survives a broken pixelfx effect', () => {
    cy.getByTestId('gallery-fx').scrollIntoView()
    cy.getByTestId('fx-break').click()
    cy.getByTestId('fx-stage-broken').should('not.exist')
    cy.getByTestId('fx-stage').find('canvas').should('exist')
    cy.getByTestId('fx-ui/confetti').click()
    cy.getByTestId('fx-stage').should('have.attr', 'aria-label', 'ui/confetti')
  })
})
