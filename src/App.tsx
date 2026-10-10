import { Layout } from './components/Layout.tsx'
import { HomePage } from './features/home/HomePage.tsx'
import { NoteDetail } from './features/notes/NoteDetail.tsx'
import { NotesList } from './features/notes/NotesList.tsx'
import { SessionPage } from './features/session/SessionPage.tsx'
import { useRoute } from './lib/router.ts'
import { useStudyStore } from './lib/useStudyStore.ts'

export default function App() {
  const route = useRoute()
  const { srs, week, record } = useStudyStore()

  if (route === '/session') {
    return (
      <Layout tab="study" hideNav>
        <SessionPage srs={srs} record={record} />
      </Layout>
    )
  }
  const note = route.match(/^\/notes\/(\d+)$/)
  if (note) {
    return (
      <Layout tab="notes">
        <NoteDetail n={Number(note[1])} />
      </Layout>
    )
  }
  if (route.startsWith('/notes')) {
    return (
      <Layout tab="notes">
        <NotesList />
      </Layout>
    )
  }
  return (
    <Layout tab="study">
      <HomePage srs={srs} week={week} />
    </Layout>
  )
}
