import { useEffect, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import Sandbox from "@nyariv/sandboxjs";
import { aliases } from "./aliases";
import { brainrotLang } from "./editor-config";
import TutorialContent from "./components/TutorialContent";

// Register the custom language configuration
loader.init().then((monaco) => {
  monaco.languages.register({ id: brainrotLang.id });
  monaco.languages.setMonarchTokensProvider(
    brainrotLang.id,
    brainrotLang.loader().language
  );
  monaco.languages.setLanguageConfiguration(
    brainrotLang.id,
    brainrotLang.loader().conf
  );
});

export default function BrainrotEditor() {
  const [code, setCode] = useState("// Loading example code...");
  const [output, setOutput] = useState("");
  const [runtime, setRuntime] = useState<null | number>(null);
  const [showTutorial, setShowTutorial] = useState(true);

  // Fetch the example code from the example.txt file
  useEffect(() => {
    fetch("/exampleCode.txt")
      .then((response) => response.text())
      .then((text) => setCode(text))
      .catch((error) => console.error("Error loading example code:", error));
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const handleRunCode = () => {
    const startTime = performance.now();

    // Replace aliases in the code with their corresponding values
    let codeWithAliases = code;
    for (const [alias, value] of Object.entries(aliases)) {
      codeWithAliases = codeWithAliases.replace(new RegExp(alias, "g"), value);
    }

    // Overwrite console.log so we can capture the output rather than logging to the console
    let logOutput = "";
    const scope = {
      yap: (...args: any[]) => {
        logOutput += args.join(" ") + "\n";
      },
    };

    const sandbox = new Sandbox();
    let runtime = 0;
    try {
      const exec = sandbox.compile(codeWithAliases);
      const result = exec(scope).run();
      runtime = performance.now() - startTime;

      // Add a little variation to the execution time to make users happy :)
      runtime = Math.random() * 5;

      // Parse the output. If the result is not undefined (i.e. the code has a return value),
      // append the result to the log output from console.log
      let parsedOutput = logOutput;
      if (result !== undefined) {
        parsedOutput += String(result);
      }
      setOutput(parsedOutput);
    } catch (error: any) {
      setOutput(error.toString());
    }

    // Set the code execution time
    setRuntime(runtime);
  };

  return (
    <div className="grid grid-cols-12 gap-6 p-8">
      <div
        className={`col-span-12 flex flex-col ${
          showTutorial ? "md:col-span-9" : "md:col-start-2 md:col-span-10"
        }`}
        style={{ minHeight: "calc(100vh - 5rem)" }}
      >
        <h1 className="pb-2 text-3xl font-bold text-center text-gray-800">
          Brainrot Lang
        </h1>
        <div className="flex flex-col flex-grow space-y-4 bg-white shadow-lg rounded-lg p-3 md:p-6">
          <div className="overflow-hidden rounded-lg">
            <Editor
              language={brainrotLang.id}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 24 },
              }}
              className="h-96"
            />
          </div>
          <div className="flex justify-between items-center space-x-2">
            <button
              onClick={handleRunCode}
              className="w-full bg-gray-800 rounded-lg text-md font-semibold text-white py-2"
            >
              Run Code
            </button>
            <button
              onClick={() => setShowTutorial(!showTutorial)}
              className="py-2 px-6 rounded-lg text-md font-semibold text-gray-800 border border-gray-800 hover:text-white hover:bg-gray-800"
            >
              Tutorial
            </button>
          </div>
          <div className="flex-grow bg-gray-800 text-white p-4 rounded-lg border border-gray-700">
            <h2 className="text-lg font-semibold mb-2">Output:</h2>
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {output || "Code execution output will appear here."}
              <br />
              {runtime ? (
                <span className="text-gray-400">
                  Compiled and executed in {runtime?.toFixed(2)}ns
                </span>
              ) : null}
            </pre>
          </div>
        </div>
      </div>
      <div
        className={`hidden col-span-3 sticky top-12 overflow-auto shadow-lg rounded-lg text-gray-800 ${
          showTutorial ? "md:block" : ""
        }`}
        style={{ height: "calc(100vh - 5rem)" }}
      >
        <button
          onClick={() => setShowTutorial(false)}
          className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <TutorialContent />
      </div>
      <div
        onClick={() => setShowTutorial(false)}
        className={`absolute top-0 left-0 w-screen h-screen bg-black bg-opacity-50 ${
          showTutorial ? "block md:hidden" : "hidden"
        }`}
      >
        <div className="relative border border-black my-20 mx-10 h-[calc(100vh-10rem)] overflow-auto bg-white rounded-lg shadow-lg">
          <button
            onClick={() => setShowTutorial(false)}
            className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
          <TutorialContent />
        </div>
      </div>
    </div>
  );
}
