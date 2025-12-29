import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddContact } from './pages/AddContact';
import { ImportWizard } from './pages/ImportWizard';
import { Templates } from './pages/Templates';
// import { Contacts } from './pages/Contacts';
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-contact" element={<AddContact />} />
          <Route path="/import" element={<ImportWizard />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/contacts" element={<div className="p-4">Contacts (Coming Soon)</div>} />
          <Route path="/settings" element={<div className="p-4">Settings (Coming Soon)</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
