import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

import "@fontsource/roboto";
import "./App.scss";
import { open } from "@tauri-apps/plugin-dialog";
import type { event } from "@tauri-apps/api";

function WindowWrapper({ children }: { children: React.ReactNode }) {

  const titlebarControlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const handleMouseEnter = () => {
      titlebarControlsRef.current?.classList.add("hover");
    }

    const handleMouseLeave = () => {
      titlebarControlsRef.current?.classList.remove("hover");
    }

    titlebarControlsRef.current?.addEventListener("mouseenter", handleMouseEnter);
    titlebarControlsRef.current?.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      titlebarControlsRef.current?.removeEventListener("mouseenter", handleMouseEnter);
      titlebarControlsRef.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="window">
      <div data-tauri-drag-region className="title-bar">
        <div ref={titlebarControlsRef} className="title-bar-controls">
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

  const handleInvoke = async (path: string| null) => {
    console.log("Invoking run_apkeditor_merge");
    console.log(await invoke("run_apkeditor_merge", { path: path }));
  }

  const handleClick = async () => {
    console.log("Opening file dialog");
    const selectedPath = await open({
      //directory: true,
      multiple: false,
      filters: [
        {
          name: "APK Files",
          extensions: ["xapk", "apkm", "apks"],
        },
      ],
    });
    handleInvoke(selectedPath);
  };

  useEffect(() => {
    let unlisten: UnlistenFn;

    const setupListener = async () => {
      unlisten = await listen("tauri://drag-drop", (event: event.Event<{ paths: string[] }>) => {
        const paths = event.payload.paths;
        if (paths.length > 1 || paths.length === 0) {
          console.error("Only one file is supported at a time");
          return
        }
        handleInvoke(paths[0]);
      });
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

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
