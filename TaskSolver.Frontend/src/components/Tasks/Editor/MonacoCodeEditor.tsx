import Editor, { OnMount } from '@monaco-editor/react';
import { ProgrammingLanguageDto } from '../../../api/programming-languages/types';
import { editor } from 'monaco-editor';
import { useState, useEffect, useMemo } from 'react';
import { programmingLanguagesApi } from '../../../api/programming-languages/programming-languages';

interface MonacoCodeEditorProps {
  task: { id: string } | null;
  height?: string;
  readOnly?: boolean;
  theme?: 'vs-dark' | 'light' | 'hc-black';
  onEditorReady?: (editor: editor.IStandaloneCodeEditor) => void;
  onSubmit?: (code: string, language: string) => Promise<void>;
  onCodeChanged?: (code: string) => void;
  onLanguageChanged?: (language: string) => void;
  showControls?: boolean;
  autoSave?: boolean;
}

// Маппинг языков для Monaco
const getMonacoLanguage = (
  languageId: string,
  languages: ProgrammingLanguageDto[],
): string => {
  let lang = languages.find((l) => l.id === languageId);
  if (!lang) {
    if (languages.length > 0) {
      lang = languages[0];
    } else {
      return 'javascript';
    }
  }

  const langName = lang.name.toLowerCase();

  if (langName.includes('javascript') || langName.includes('typescript')) {
    return 'javascript';
  } else if (langName.includes('python')) {
    return 'python';
  } else if (langName.includes('java')) {
    return 'java';
  } else if (langName.includes('c++') || langName.includes('cpp')) {
    return 'cpp';
  } else if (langName.includes('php')) {
    return 'php';
  } else if (langName.includes('ruby')) {
    return 'ruby';
  } else if (langName.includes('go')) {
    return 'go';
  } else if (langName.includes('rust')) {
    return 'rust';
  } else if (langName.includes('c#')) {
    return 'csharp';
  } else if (langName.includes('swift')) {
    return 'swift';
  } else if (langName.includes('kotlin')) {
    return 'kotlin';
  }

  return 'plaintext';
};

const getLanguageName = (
  languageId: string,
  languages: ProgrammingLanguageDto[],
) => {
  const lang = languages.find((l) => l.id === languageId);
  return lang ? `${lang.name} ${lang.version}` : languageId;
};

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  task,
  height = '500px',
  readOnly = false,
  onSubmit,
  onCodeChanged,
  onLanguageChanged,
  showControls = true,
  autoSave = true,
}) => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [languages, setLanguages] = useState<ProgrammingLanguageDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Мемоизация текущего языка для Monaco
  const monacoLanguage = useMemo(
    () => getMonacoLanguage(language, languages),
    [language, languages],
  );

  // Мемоизация опций редактора
  const editorOptions = useMemo(
    () => ({
      readOnly,
      fontSize: 14,
      fontFamily: "'Fira Code', 'Cascadia Code', 'Monaco', monospace",
      fontLigatures: true,
      lineNumbers: 'on' as const,
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
      wordBasedSuggestions: 'allDocuments' as const,
      formatOnType: true,
      formatOnPaste: true,
      autoIndent: 'full' as const,
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: true,
      roundedSelection: true,
      cursorBlinking: 'smooth' as const,
      cursorSmoothCaretAnimation: 'on' as const,
      smoothScrolling: true,
      padding: {
        top: 8,
        bottom: 8,
      },
    }),
    [readOnly],
  );

  useEffect(() => {
    if (onLanguageChanged) {
      onLanguageChanged(language);
    }
  }, [language]);

  useEffect(() => {
    if (onCodeChanged) {
      onCodeChanged(code);
    }
  }, [code]);

  // Load languages on mount
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await programmingLanguagesApi.getAll();

        // if (!task) {
        //   setLanguages(response.data);
        //   return;
        // }

        let taskLanguages = response.data;

        // if (task.languageExamples) {
        //   taskLanguages = response.data.filter((l) =>
        //     task.languageExamples?.map((e) => e.languageId).includes(l.id),
        //   );
        // }

        setLanguages(taskLanguages);

        // Load saved language from localStorage or use first available
        const savedLanguage = localStorage.getItem(`task:${task?.id ?? -1}`);
        if (
          savedLanguage &&
          taskLanguages.some((l) => l.id === savedLanguage)
        ) {
          setLanguage(savedLanguage);
        } else if (taskLanguages.length > 0) {
          setLanguage(taskLanguages[0].id);
        }
      } catch (err) {
        console.error('Error loading languages:', err);
        setError('Не удалось загрузить языки программирования');
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguages();
  }, [task]);

  // Load code from localStorage when language changes
  useEffect(() => {
    if (task && language && !isLoading) {
      const savedCode = localStorage.getItem(`task:${task.id}:${language}`);

      if (savedCode) {
        setCode(savedCode);
      } else {
        // Set starter code if no saved code exists
        const starterCode = getStarterCode(language);
        setCode(starterCode);
      }
    }
  }, [task, language, isLoading]);

  // Auto-save code to localStorage
  useEffect(() => {
    if (!autoSave || !language || !code || isLoading) return;

    const saveTimeout = setTimeout(() => {
      setIsSaving(true);
      localStorage.setItem(`task:${task?.id ?? -1}:${language}`, code);
      setLastSaved(new Date());
      setIsSaving(false);
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [code, task, language, autoSave, isLoading]);

  // Save selected language
  useEffect(() => {
    if (task && language) {
      localStorage.setItem(`task:${task.id}`, language);
    }
  }, [task, language]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      if (onCodeChanged) {
        onCodeChanged(value);
      }
    }
  };

  const getStarterCode = (languageId: string): string => {
    if (!task) return '';

    // const functionCode = task.languageExamples?.find(
    //   (e) => e.languageId === languageId,
    // )?.functionCode;

    // if (functionCode) return functionCode;

    const lang = languages.find((l) => l.id === languageId);
    const langName = lang?.name.toLowerCase() || '';

    if (langName.includes('python')) {
      return '# Напишите ваш код здесь\n\ndef solve():\n    data = input()\n    print(data)\n\nif __name__ == "__main__":\n    solve()';
    } else if (langName.includes('c#') || langName.includes('csharp')) {
      return `using System;\n\nclass Program\n{\n    static void Main()\n    {\n        string input = Console.ReadLine();\n        Console.WriteLine(input);\n    }\n}`;
    } else if (
      langName.includes('javascript') ||
      langName.includes('typescript')
    ) {
      return `// Напишите ваш код здесь\n\nconst readline = require('readline');\n\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.on('line', (input) => {\n    console.log(input);\n    rl.close();\n});`;
    } else if (langName.includes('java')) {
      return `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        String input = scanner.nextLine();\n        System.out.println(input);\n        scanner.close();\n    }\n}`;
    } else if (langName.includes('c++') || langName.includes('cpp')) {
      return `#include <iostream>\n#include <string>\n\nint main() {\n    std::string input;\n    std::getline(std::cin, input);\n    std::cout << input << std::endl;\n    return 0;\n}`;
    }

    return '// Напишите ваш код здесь';
  };

  const handleSubmit = async () => {
    if (!onSubmit || !language || !code) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(code, language);
    } catch (err) {
      setError('Ошибка при отправке решения');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Add comment shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      const selection = editor.getSelection();
      editor.executeEdits('', [
        {
          range: new monaco.Range(
            selection?.startLineNumber || 1,
            1,
            selection?.endLineNumber || 1,
            1,
          ),
          text: '// ',
        },
      ]);
    });

    // Define custom themes
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'e85353' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'operator', foreground: 'e85353' },
      ],
      colors: {
        'editor.background': '#252525',
        'editor.foreground': '#E0E0E0',
        'editor.lineHighlightBackground': '#2D2D2D',
        'editor.selectionBackground': '#e8535340',
        'editor.inactiveSelectionBackground': '#3A3A3A',
        'editor.selectionHighlightBackground': '#e8535320',
        'editor.lineHighlightBorder': '#2D2D2D',
        'editorCursor.foreground': '#e85353',
        'editorWhitespace.foreground': '#404040',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#606060',
        'editor.lineNumber.foreground': '#858585',
        'editor.lineNumber.activeForeground': '#e85353',
        'editorRuler.foreground': '#404040',
        'editorCodeLens.foreground': '#999999',
        'editorBracketMatch.background': '#1E1E1E',
        'editorBracketMatch.border': '#888888',
        'editorOverviewRuler.border': '#252525',
        'editorOverviewRuler.background': '#252525',
        'editorOverviewRuler.selectionHighlightForeground': '#e85353',
        'editorOverviewRuler.errorForeground': '#e85353',
        'editorOverviewRuler.warningForeground': '#e85353',
        'editorError.foreground': '#e85353',
        'editorWarning.foreground': '#e85353',
        'editorGutter.background': '#252525',
        'editorGutter.modifiedBackground': '#e85353',
        'editorGutter.addedBackground': '#e85353',
        'editorGutter.deletedBackground': '#e85353',
        'minimap.background': '#1E1E1E',
        'minimap.selectionHighlight': '#e8535340',
        'minimapSlider.background': '#e8535320',
        'minimapSlider.hoverBackground': '#e8535340',
        'minimapSlider.activeBackground': '#e8535360',
        'scrollbar.shadow': '#252525',
        'scrollbarSlider.background': '#404040',
        'scrollbarSlider.hoverBackground': '#4A4A4A',
        'scrollbarSlider.activeBackground': '#e85353',
        'widget.shadow': '#252525',
        'widget.background': '#2D2D2D',
        'dropdown.background': '#2D2D2D',
        'dropdown.border': '#404040',
        'input.background': '#2D2D2D',
        'input.border': '#404040',
        'input.foreground': '#E0E0E0',
        'input.placeholderForeground': '#858585',
        'inputOption.activeBorder': '#e85353',
        'badge.background': '#e85353',
        'badge.foreground': '#FFFFFF',
        'progressBar.background': '#e85353',
        'list.activeSelectionBackground': '#e8535320',
        'list.activeSelectionForeground': '#e85353',
        'list.hoverBackground': '#2D2D2D',
        'list.focusBackground': '#e8535310',
        'list.highlightForeground': '#e85353',
        'pickerGroup.foreground': '#e85353',
      },
    });

    monaco.editor.setTheme('custom-dark');
  };

  if (isLoading) {
    return (
      <div className='bg-[#2a2a2a] rounded-xl border border-[#333333] shadow-lg overflow-hidden'>
        {showControls && (
          <div className='bg-[#2d2d2d] px-6 py-4 border-b border-[#333333]'>
            <div className='h-8 w-48 bg-[#333333] animate-pulse rounded'></div>
          </div>
        )}
        <div className='h-[500px] bg-[#252525] flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#e85353] mx-auto'></div>
            <p className='mt-2 text-gray-400'>Загрузка редактора...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-[#2a2a2a] rounded-xl border border-[#333333] shadow-lg overflow-hidden'>
        <div className='p-6 text-center'>
          <div className='text-red-400 mb-4'>{error}</div>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-[#e85353] text-white rounded-lg hover:bg-[#d64242] transition-colors'
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[#2a2a2a] rounded-xl border border-[#333333] shadow-lg overflow-hidden'>
      {showControls && (
        <div className='bg-[#2d2d2d] px-6 py-4 border-b border-[#333333]'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div className='flex items-center space-x-4 flex-1'>
              <label className='text-sm font-medium text-gray-300 font-mono whitespace-nowrap'>
                Язык <span className='text-[#e85353]'>*</span>
              </label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className='bg-[#2d2d2d] border border-[#333333] rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-[#e85353] focus:ring-2 focus:ring-[#e85353] transition-colors flex-1 max-w-xs'
                disabled={languages.length === 0}
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name} {lang.version}
                  </option>
                ))}
              </select>

              {autoSave && (
                <div className='flex items-center space-x-2 text-xs text-gray-400 font-mono'>
                  {isSaving ? (
                    <>
                      <div className='w-3 h-3 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin'></div>
                      <span>Сохранение...</span>
                    </>
                  ) : lastSaved ? (
                    <>
                      <svg
                        className='w-3 h-3 text-green-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                      <span>Сохранено {lastSaved.toLocaleTimeString()}</span>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {onSubmit && (
              <button
                onClick={handleSubmit}
                disabled={!language || isSubmitting || !code}
                className='px-6 py-2 bg-[#e85353] text-white rounded-lg hover:bg-[#d64242] disabled:bg-[#333333] disabled:cursor-not-allowed transition-colors font-mono border border-[#e85353] disabled:border-[#333333] whitespace-nowrap flex items-center space-x-2'
              >
                {isSubmitting ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    <span>Отправка...</span>
                  </>
                ) : (
                  <>
                    <span>Отправить</span>
                    <span className='text-xs text-gray-300 ml-2'>⌘⏎</span>
                  </>
                )}
              </button>
            )}
          </div>

          {language && (
            <div className='mt-2 flex items-center justify-between'>
              <div className='text-xs text-gray-500 font-mono'>
                {code.length} символов
              </div>
            </div>
          )}
        </div>
      )}

      <div className='relative border-t border-[#333333]'>
        <Editor
          key={language}
          height={height}
          language={monacoLanguage}
          defaultValue={code}
          theme='custom-dark'
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={editorOptions}
        />
      </div>
    </div>
  );
};
