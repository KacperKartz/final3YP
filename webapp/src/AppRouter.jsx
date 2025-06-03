import { Routes, Route } from 'react-router-dom';
import { MainPage, NodesPage } from './pages/index';


const AppRouter = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/nodes" element={<NodesPage />} />
      </Routes>
    </div>
  )
}

export default AppRouter