// 🚀 Step 13: App Component Implementation (GREEN Phase)
import React from 'react';
import { Chat } from './components/Chat';
import './App.css';

function App(): React.JSX.Element {
  return (
    <div className="App">
      <Chat />
    </div>
  );
}

export default App;