import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import "@fontsource/roboto";
import "./App.scss";
import { open } from "@tauri-apps/plugin-dialog";

function WindowWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="window">
      <div data-tauri-drag-region className="title-bar">
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={() => invoke("close")}></button>
          <button aria-label="Minimize" onClick={() => invoke("minimize")}></button>
        </div>
        <div data-tauri-drag-region className="title-bar-text">ApkMerger-GUI</div>
      </div>

      {children}
    </div>
  );
}

function DragDropFileRegion() {

    //setGreetMsg(await invoke("greet", { name }));

  const handleClick = async () => {
    console.log("Opening file dialog");
    const selectedFiles = await open({
      multiple: true,
      filters: [
        {
          name: "APK Files",
          extensions: ["apk", "xapk", "apkm", "apks"],
        },
      ],
    });
    console.log(selectedFiles);
  };

  return (
    <div
      className="drag-drop-file-region"
      onClick={handleClick}
    >
      <p>Drag and drop your APK files here</p>
      <small>(xapk, apkm, apks,... are supported)</small>
    </div>
  );
}

function App() {

  return (
    <WindowWrapper>
      <main className="container">
        <img className="applogo" src="/appicon.png" alt="App icon" />
        <DragDropFileRegion />
      </main>
    </WindowWrapper>
  );
}

export default App;
