import Editor, { OnMount } from "@monaco-editor/react";
import { ProgrammingLanguageDto } from "../../../api/programming-languages/types";
import { editor } from "monaco-editor";

interface MonacoCodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
  languages: ProgrammingLanguageDto[];
  theme?: "vs-dark" | "light" | "hc-black";
  onEditorReady?: (editor: editor.IStandaloneCodeEditor) => void;
}

// Маппинг языков для Monaco
const getMonacoLanguage = (
  languageId: string,
  languages: ProgrammingLanguageDto[]
): string => {
  const lang = languages.find((l) => l.id === languageId);
  if (!lang) return "javascript";

  const langName = lang.name.toLowerCase();

  if (langName.includes("javascript") || langName.includes("typescript")) {
    return "javascript";
  } else if (langName.includes("python")) {
    return "python";
  } else if (langName.includes("java")) {
    return "java";
  } else if (langName.includes("c++") || langName.includes("cpp")) {
    return "cpp";
  } else if (langName.includes("php")) {
    return "php";
  } else if (langName.includes("ruby")) {
    return "ruby";
  } else if (langName.includes("go")) {
    return "go";
  } else if (langName.includes("rust")) {
    return "rust";
  } else if (langName.includes("c#")) {
    return "csharp";
  } else if (langName.includes("swift")) {
    return "swift";
  } else if (langName.includes("kotlin")) {
    return "kotlin";
  }

  return "plaintext";
};

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  code,
  onChange,
  language,
  height = "500px",
  readOnly = false,
  languages,
  onEditorReady,
}) => {
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Настройка горячих клавиш
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const event = new CustomEvent("quickRun");
      window.dispatchEvent(event);
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, (e) => {
      e.preventDefault();
      const event = new CustomEvent("saveCode");
      window.dispatchEvent(event);
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      const selection = editor.getSelection();
      editor.executeEdits("", [
        {
          range: new monaco.Range(
            selection?.startLineNumber,
            1,
            selection?.endLineNumber,
            1
          ),
          text: "// ",
        },
      ]);
    });

    editor.addCommand(monaco.KeyCode.F1, () => {
      const event = new CustomEvent("showHotkeys");
      window.dispatchEvent(event);
    });

    // Кастомная темная тема с #252525 и #e85353
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "e85353" }, // Красный акцент
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
        { token: "variable", foreground: "9CDCFE" },
        { token: "operator", foreground: "e85353" }, // Красный акцент
      ],
      colors: {
        "editor.background": "#252525",
        "editor.foreground": "#E0E0E0",
        "editor.lineHighlightBackground": "#2D2D2D",
        "editor.selectionBackground": "#e8535340",
        "editor.inactiveSelectionBackground": "#3A3A3A",
        "editor.selectionHighlightBackground": "#e8535320",
        "editor.lineHighlightBorder": "#2D2D2D",
        "editorCursor.foreground": "#e85353",
        "editorWhitespace.foreground": "#404040",
        "editorIndentGuide.background": "#404040",
        "editorIndentGuide.activeBackground": "#606060",
        "editor.lineNumber.foreground": "#858585",
        "editor.lineNumber.activeForeground": "#e85353",
        "editorRuler.foreground": "#404040",
        "editorCodeLens.foreground": "#999999",
        "editorBracketMatch.background": "#1E1E1E",
        "editorBracketMatch.border": "#888888",
        "editorOverviewRuler.border": "#252525",
        "editorOverviewRuler.background": "#252525",
        "editorOverviewRuler.selectionHighlightForeground": "#e85353",
        "editorOverviewRuler.errorForeground": "#e85353",
        "editorOverviewRuler.warningForeground": "#e85353",
        "editorError.foreground": "#e85353",
        "editorWarning.foreground": "#e85353",
        "editorGutter.background": "#252525",
        "editorGutter.modifiedBackground": "#e85353",
        "editorGutter.addedBackground": "#e85353",
        "editorGutter.deletedBackground": "#e85353",
        "editorBracketHighlight.foreground1": "#e85353",
        "editorBracketHighlight.foreground2": "#e85353",
        "editorBracketHighlight.foreground3": "#e85353",
        "editorBracketHighlight.foreground4": "#e85353",
        "editorBracketHighlight.foreground5": "#e85353",
        "editorBracketHighlight.foreground6": "#e85353",
        "minimap.background": "#1E1E1E",
        "minimap.selectionHighlight": "#e8535340",
        "minimapSlider.background": "#e8535320",
        "minimapSlider.hoverBackground": "#e8535340",
        "minimapSlider.activeBackground": "#e8535360",
        "scrollbar.shadow": "#252525",
        "scrollbarSlider.background": "#404040",
        "scrollbarSlider.hoverBackground": "#4A4A4A",
        "scrollbarSlider.activeBackground": "#e85353",
        "widget.shadow": "#252525",
        "widget.background": "#2D2D2D",
        "dropdown.background": "#2D2D2D",
        "dropdown.border": "#404040",
        "input.background": "#2D2D2D",
        "input.border": "#404040",
        "input.foreground": "#E0E0E0",
        "input.placeholderForeground": "#858585",
        "inputOption.activeBorder": "#e85353",
        "inputValidation.errorBackground": "#e8535320",
        "inputValidation.errorBorder": "#e85353",
        "inputValidation.warningBackground": "#e8535320",
        "inputValidation.warningBorder": "#e85353",
        "badge.background": "#e85353",
        "badge.foreground": "#FFFFFF",
        "progressBar.background": "#e85353",
        "list.activeSelectionBackground": "#e8535320",
        "list.activeSelectionForeground": "#e85353",
        "list.hoverBackground": "#2D2D2D",
        "list.focusBackground": "#e8535310",
        "list.highlightForeground": "#e85353",
        "pickerGroup.foreground": "#e85353",
      },
    });

    monaco.editor.defineTheme("custom-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "008000", fontStyle: "italic" },
        { token: "keyword", foreground: "e85353" },
        { token: "string", foreground: "A31515" },
      ],
      colors: {
        "editor.background": "#F9FAFB",
        "editor.lineHighlightBackground": "#E5E7EB",
      },
    });

    monaco.editor.setTheme("custom-dark");

    if (onEditorReady) {
      onEditorReady(editor);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  const getStarterCode = (lang: string): string => {
    switch (lang.toLowerCase()) {
      case "python":
        return "data = input()\n\nprint(data)";
      case "c#":
      case "csharp":
        return `#nullable disable\n\nvar input = Console.ReadLine();\n\nConsole.WriteLine(input);`;
      case "javascript":
        return `import fs from 'fs';

const input = fs.readFileSync(0, "utf8").trim();

console.log(input);`;
      default:
        return "";
    }
  };

  const monacoLanguage = getMonacoLanguage(language, languages);

  if (!code) {
    handleEditorChange(getStarterCode(monacoLanguage));
  }

  return (
    <div className="relative border border-[#333333] rounded-lg overflow-hidden bg-[#252525]">
      <Editor
        height={height}
        language={monacoLanguage}
        value={code || getStarterCode(monacoLanguage)}
        theme="custom-dark"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', 'Monaco', monospace",
          fontLigatures: true,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          minimap: {
            enabled: true,
            scale: 1,
            maxColumn: 100,
          },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          bracketPairColorization: {
            enabled: true,
          },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          parameterHints: {
            enabled: true,
          },
          wordBasedSuggestions: "allDocuments",
          formatOnType: true,
          formatOnPaste: true,
          autoIndent: "full",
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          roundedSelection: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          padding: {
            top: 8,
            bottom: 8,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-[#252525]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e85353] mx-auto"></div>
              <p className="mt-2 text-gray-400">Загрузка редактора...</p>
            </div>
          </div>
        }
      />

      {/* Статус бар */}
      <div className="bg-[#2a2a2a] px-4 py-2 border-t border-[#333333] flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>
            Язык:{" "}
            {languages.find((l) => l.id === language)?.name || monacoLanguage}
          </span>
          <span>Строки: {code.split("\n").length}</span>
          <span>Символы: {code.length}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span className="text-[#333333]">⏐</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};
