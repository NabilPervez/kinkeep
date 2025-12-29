import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddContact } from './pages/AddContact';
import { ImportWizard } from './pages/ImportWizard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-contact" element={<AddContact />} />
          <Route path="/import" element={<ImportWizard />} />
          <Route path="/contacts" element={<div className="p-4">Contacts (Coming Soon)</div>} />
          <Route path="/templates" element={<div className="p-4">Templates (Coming Soon)</div>} />
          <Route path="/settings" element={<div className="p-4">Settings (Coming Soon)</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
