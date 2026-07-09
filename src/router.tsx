import { createBrowserRouter, Navigate } from 'react-router-dom';
import QrPage from './pages/QrPage';
import BookletPage from './pages/BookletPage';

export const router = createBrowserRouter([
  {
    // QR ведёт сюда — сразу буклет, без лишних страниц.
    path: '/',
    element: <BookletPage />,
  },
  {
    // Старые QR вели сюда — перенаправляем на корень (надёжнее на мобильном).
    path: '/booklet',
    element: <Navigate to="/" replace />,
  },
  {
    // Страница для скачивания QR-картинки (для печати на бумажный буклет).
    path: '/qr',
    element: <QrPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
