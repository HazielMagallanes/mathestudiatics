import { lazy } from 'react'
import { createHashRouter, type RouteObject } from 'react-router'

import { AppLayout } from '@/app/layout/AppLayout'

const HomePage = lazy(() => import('@/features/home/pages/HomePage'))
const StudyPage = lazy(() => import('@/features/study/pages/StudyPage'))
const PracticePage = lazy(() => import('@/features/practice/pages/PracticePage'))
const ToolsPage = lazy(() => import('@/features/tools/pages/ToolsPage'))
const WhiteboardPage = lazy(() => import('@/features/whiteboard/pages/WhiteboardPage'))
const AboutPage = lazy(() => import('@/features/about/pages/AboutPage'))
const NotFoundPage = lazy(() => import('@/features/not-found/pages/NotFoundPage'))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'study', element: <StudyPage /> },
      { path: 'practice', element: <PracticePage /> },
      { path: 'tools', element: <ToolsPage /> },
      { path: 'board', element: <WhiteboardPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export function createAppRouter() {
  return createHashRouter(routes)
}
