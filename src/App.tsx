import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddContact } from './pages/AddContact';
import { ImportWizard } from './pages/ImportWizard';
import { Templates } from './pages/Templates';
import { Contacts } from './pages/Contacts';
import { Planning } from './pages/Planning';
import { Settings } from './pages/Settings';
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-contact" element={<AddContact />} />
          <Route path="/add-contact/:id" element={<AddContact />} />
          <Route path="/import" element={<ImportWizard />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
