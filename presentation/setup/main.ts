import type { AppContext } from '@slidev/types'
import { cssUrl, imageUrl } from '../utils/images'

/* Backgrounds and decorative shapes consumed by the stylesheets.
   Injected at runtime (not hard-coded in CSS) so the URLs resolve
   correctly under any configured base path. */
const imageCssVariables: Record<string, string> = {
  '--aipp-cover-bg-image': 'aipp-cover-bg.png',
  '--aipp-marco-bg-image': 'aipp-marco-bg.png',
  '--aipp-whattadata-bg-image': 'whattadata-bg.png',
  '--aipp-socialita-bg-image': 'socialita-digitale-bg.png',
  '--aipp-ia-cosa-pensiamo-shape': 'ia-salute-mentale-cosa-pensiamo.png',
  '--aipp-ia-cosa-pensiamo-compact-shape': 'ia-cosa-pensiamo-compact.png',
  '--aipp-ml-psicologia-shape': 'ml-psicologia-psichiatria.png',
  '--aipp-sfide-future-shape': 'sfide-future-index.png',
  '--aipp-aspetti-normativi-shape': 'aspetti-normativi-index-oblong.png',
  '--aipp-tool-index-shape': 'tool-index.png',
  '--aipp-domande-discussione-shape': 'domande-discussione-index.png',
  '--aipp-tesi-finale-shape': 'tesi-finale-index-oblong.png',
  '--aipp-grazie-frame': 'grazie-corner.png',
  '--aipp-arianne-feedback-thread': 'arianne-feedback-yarn.png',
  '--aipp-parche-shape': 'parche-image-1-cropped.png',
  '--aipp-agenda-shape-01': 'agenda-shapes/agenda-shape-01-amber.png',
  '--aipp-agenda-shape-02': 'agenda-shapes/agenda-shape-02-emerald.png',
  '--aipp-agenda-shape-03': 'agenda-shapes/agenda-shape-03-cyan.png',
  '--aipp-agenda-shape-04': 'agenda-shapes/agenda-shape-04-blue.png',
  '--aipp-agenda-shape-05': 'agenda-shapes/agenda-shape-05-violet.png',
  '--aipp-agenda-shape-06': 'agenda-shapes/agenda-shape-06-rose.png',
}

function setImageCssVariables() {
  const root = document.documentElement.style
  for (const [name, path] of Object.entries(imageCssVariables))
    root.setProperty(name, cssUrl(path))
}

/* Shared links can carry the mount segment inside the hash (e.g. #/AIPP/5);
   strip it so the router lands on the right slide. */
async function normalizeHashRoute(router: AppContext['router']) {
  const mountSegment = location.pathname.split('/').filter(Boolean)[0]
  const hashPath = location.hash.startsWith('#/')
    ? location.hash.slice(2)
    : ''

  if (!mountSegment || !hashPath.startsWith(`${mountSegment}/`))
    return

  const normalizedPath = `/${hashPath.slice(mountSegment.length + 1) || '1'}`
  history.replaceState(null, '', `${location.pathname}${location.search}#${normalizedPath}`)
  await router.replace(normalizedPath)
}

export default async function setupAippDeck({ app, router }: AppContext) {
  app.config.globalProperties.$aippImage = imageUrl
  setImageCssVariables()
  await normalizeHashRoute(router)
}
