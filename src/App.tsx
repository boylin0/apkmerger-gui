import { useEffect, useRef, useState } from "react";
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

  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleInvoke = async (path: string | null) => {
    console.log("Invoking run_apkeditor_merge");
    if (!path) {
      console.error("No file selected");
      return;
    }
    setResult(null);
    setProcessing(true);
    try {
      setResult(await invoke("run_apkeditor_merge", { pathIn: path }));
    } catch (error) {
      setResult("Unexpected error: " + error);
    } finally {
      setProcessing(false);
    }
  }

  const handleClick = async () => {
    setResult(null);
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
        console.log(event);
        if (processing) {
          setResult("Please wait for the current operation to complete");
          return;
        }
        const paths = event.payload.paths;
        if (paths.length > 1 || paths.length === 0) {
          setResult("Please select only one file");
          return
        }
        handleInvoke(paths[0]);
      });
    };

    setupListener();

    return () => {
      // workaround for the issue that the listener is not removed when the component is unmounted
      setTimeout(() => {
        unlisten?.();
      }, 100);
    }
  }, []);

  return (
    <div
      className="drag-drop-file-region"
      onClick={handleClick}
    >
      {
        result ? (
          <div className="result">
            <h5 className="title">Result</h5>
            <div className="text">{result}</div>
          </div>
        ) : processing ? (
            <div className="infinity-loop-progressbar"></div>
        ) : (
          <div className="drop-area-hint">
            <p>Drag and drop your APK files here</p>
            <small>(xapk, apkm, apks,... are supported)</small>
          </div>
        )
      }
    </div>
  );
}

function App() {

  // disable right click context menu
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    window.addEventListener("contextmenu", handleContextMenu);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

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
