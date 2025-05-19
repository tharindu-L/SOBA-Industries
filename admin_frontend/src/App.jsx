// (Or wherever your router setup is located)

// ...existing imports...
import Reports from './pages/Reports';

function App() {
  return (
    <Routes>
      // ...existing code...
      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
      // ...existing code...
    </Routes>
  );
}

export default App;