import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.scss";

function WindowWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="window">
      <div data-tauri-drag-region className="title-bar">
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={() => invoke("close")}></button>
          <button aria-label="Maximize" onClick={() => invoke("maximize")}></button>
          <button aria-label="Minimize" onClick={() => invoke("minimize")}></button>
        </div>
        <div data-tauri-drag-region className="title-bar-text">ApkMerger-GUI</div>
      </div>

      {children}
    </div>
  );
}

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <WindowWrapper>
      <main className="container">

        <h1>Welcome to Tauri + React</h1>

        <div className="row">
          <a href="https://vitejs.dev" target="_blank">
            <img src="/vite.svg" className="logo vite" alt="Vite logo" />
          </a>
          <a href="https://tauri.app" target="_blank">
            <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
          </a>
          <a href="https://reactjs.org" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <p>Click on the Tauri, Vite, and React logos to learn more.</p>

        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <input
            id="greet-input"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button type="submit">Greet</button>
        </form>
        <p>{greetMsg}</p>
      </main>
    </WindowWrapper>
  );
}

export default App;
