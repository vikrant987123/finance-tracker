import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Dashboard } from './pages/dashboard';
import { SignedIn, UserButton } from '@clerk/clerk-react';
import { Auth } from './pages/auth';
import { FinancialRecordsProvider } from './contexts/financial-record-context';
import { Toaster } from "react-hot-toast";


function App() {
  return (
    <>
    <Toaster position="top-right" reverseOrder={false} />
    <Router>
       <div className="app-container">
        <div className='navbar'>
          <Link to="/"> Dashboard </Link>
          <SignedIn>
            <UserButton/>
          </SignedIn> 
        </div>
        <Routes>
          <Route path="/" element={<FinancialRecordsProvider>
            <Dashboard/>
          </FinancialRecordsProvider>} />
          <Route path="/auth" element={<Auth/>} />
        </Routes>
       </div> 
    </Router>
    </>
  )
}

export default App
