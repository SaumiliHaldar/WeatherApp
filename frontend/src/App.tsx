import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <div className="h-screen w-screen bg-white overflow-hidden flex flex-col md:flex-row">
      <Sidebar />
      <Dashboard />
    </div>
  );
}

export default App;
