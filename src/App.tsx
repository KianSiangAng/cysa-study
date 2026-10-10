import { Layout } from './components/Layout.tsx'
import { useRoute } from './lib/router.ts'

export default function App() {
  const route = useRoute()
  const tab = route.startsWith('/notes') ? 'notes' : 'study'
  return (
    <Layout tab={tab}>
      <h1 className="text-2xl font-bold">CySA+ Study</h1>
      <p className="text-muted">Route: {route}</p>
    </Layout>
  )
}
