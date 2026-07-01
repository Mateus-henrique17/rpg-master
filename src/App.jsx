import RpgInterface from './components/RpgInterface.jsx';

export default function App() {
  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1 className="app-title">RPG com IA</h1>
        <p className="app-subtitle">
          Uma aventura medieval viva gerada em tempo real por inteligência artificial.
        </p>
      </header>

      <main className="app-main">
        <RpgInterface />
      </main>
    </div>
  );
}
