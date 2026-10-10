import { Layout } from './components/Layout.tsx'
import { HomePage } from './features/home/HomePage.tsx'
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
  return (
    <Layout tab="study">
      <HomePage srs={srs} week={week} />
    </Layout>
  )
}
