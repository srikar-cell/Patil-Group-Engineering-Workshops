import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { StateDemo, ShowMessage } from './video';
import HomePage from './Pages/Home'
import AboutPage from './Pages/About'
import ProjectPage from './Pages/Project'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <StateDemo />
    <ShowMessage />
    <Routes>
      <Route path="./home" element={<HomePage />} />
      <Route path="./about" element={<AboutPage />} />
      <Route path="./project" element={<ProjectPage />} />
      <Route path="./localhost:3000" element={<HomePage />} />
      <HomePage />
      <AboutPage />
      <ProjectPage />
    </Routes>

    importBrowserRouter

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
