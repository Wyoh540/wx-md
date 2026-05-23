import React from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import './styles/app.css'

// 懒加载页面组件
const MarkdownEditor = React.lazy(() => import('./pages/MarkdownEditor'))

function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-background">
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-screen text-muted-foreground">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="text-sm font-medium">加载中...</span>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<MarkdownEditor />} />
          </Routes>
        </React.Suspense>
      </div>
    </BrowserRouter>
  )
}

export default App
