// components/profile/SkillsSection.tsx
import { useState, useRef, useEffect } from "react";

interface SkillsSectionProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

const popularSkills = [
  // Frontend
  "React",
  "Vue",
  "Angular",
  "TypeScript",
  "JavaScript",
  "HTML5",
  "CSS3",
  "Tailwind CSS",
  "SASS",
  "SCSS",
  "Bootstrap",
  "Webpack",
  "Vite",
  "Next.js",
  "Nuxt.js",
  "Gatsby",
  "Svelte",
  "jQuery",
  "Redux",
  "Zustand",
  "MobX",

  // Backend
  "Node.js",
  "Express",
  "NestJS",
  "Python",
  "Django",
  "Flask",
  "FastAPI",
  "Java",
  "Spring Boot",
  "Kotlin",
  "C#",
  ".NET",
  "ASP.NET",
  "PHP",
  "Laravel",
  "Symfony",
  "Ruby",
  "Ruby on Rails",
  "Go",
  "Rust",
  "Elixir",
  "Phoenix",

  // Mobile
  "React Native",
  "Flutter",
  "Swift",
  "SwiftUI",
  "Kotlin",
  "Android SDK",
  "iOS Development",
  "Xamarin",
  "Ionic",
  "Capacitor",

  // Databases
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "Oracle",
  "SQL Server",
  "Cassandra",
  "Elasticsearch",
  "Firebase",
  "Supabase",
  "DynamoDB",

  // DevOps & Cloud
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Google Cloud",
  "Terraform",
  "Ansible",
  "Jenkins",
  "GitLab CI",
  "GitHub Actions",
  "Nginx",
  "Apache",
  "Linux",
  "Bash",
  "Shell Scripting",

  // Tools & Other
  "Git",
  "WebSockets",
  "REST API",
  "GraphQL",
  "WebRTC",
  "Socket.io",
  "Jest",
  "Cypress",
  "Selenium",
  "Playwright",
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
  "Blender",
  "Three.js",
  "WebGL",

  // Languages
  "English",
  "German",
  "French",
  "Spanish",
  "Chinese",
  "Japanese",

  // Soft Skills
  "Team Leadership",
  "Project Management",
  "Agile",
  "Scrum",
  "Kanban",
  "Problem Solving",
  "Communication",
  "Mentoring",
  "Public Speaking",
  "Technical Writing",
  "UX/UI Design",
  "Product Management",
];

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  onAddSkill,
  onRemoveSkill,
}) => {
  const [newSkill, setNewSkill] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newSkill.trim().length > 1) {
      const filtered = popularSkills
        .filter(
          (skill) =>
            skill.toLowerCase().includes(newSkill.toLowerCase()) &&
            !skills.includes(skill)
        )
        .slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [newSkill, skills]);

  const handleAddSkill = (skill?: string) => {
    const skillToAdd = skill || newSkill.trim();
    if (skillToAdd && !skills.includes(skillToAdd)) {
      onAddSkill(skillToAdd);
      setNewSkill("");
      setShowSuggestions(false);
      inputRef.current?.focus();
    } else {
      setNewSkill("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newSkill.trim()) {
      handleAddSkill();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleAddSkill(suggestion);
  };

  const getRandomPopularSkills = () => {
    return popularSkills
      .filter((skill) => !skills.includes(skill))
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);
  };

  return (
    <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#333333] shadow-lg">
      <h2 className="text-xl font-semibold text-white font-mono mb-6 flex items-center space-x-2">
        <svg
          className="w-5 h-5 text-emerald-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
        <span>Навыки и технологии</span>
        <span className="text-gray-400 text-sm font-normal ml-2 bg-[#2d2d2d] px-2 py-1 rounded">
          {skills.length}
        </span>
      </h2>

      {/* Поле ввода с автодополнением */}
      <div className="relative mb-6">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() =>
                newSkill.trim().length > 1 && setShowSuggestions(true)
              }
              className="w-full px-4 py-3 bg-[#2d2d2d] border-2 border-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] focus:ring-2 focus:ring-[#e85353] font-mono transition-colors"
              placeholder="Начните вводить навык..."
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#2d2d2d] border border-[#333333] rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left text-white font-mono hover:bg-[#333333] transition-colors border-b border-[#333333] last:border-b-0 flex items-center justify-between"
                  >
                    <span>{suggestion}</span>
                    <span className="text-gray-400 text-sm">Enter</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleAddSkill()}
            disabled={!newSkill.trim()}
            className="bg-[#e85353] hover:bg-[#d64242] disabled:bg-[#333333] disabled:cursor-not-allowed text-white font-mono py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
          >
            Добавить
          </button>
        </div>

        {newSkill.trim().length > 0 && (
          <div className="text-gray-400 font-mono text-xs mt-2 flex justify-between">
            <span>Нажмите Enter для добавления</span>
            {suggestions.length > 0 && (
              <span>{suggestions.length} совпадений</span>
            )}
          </div>
        )}
      </div>

      {/* Быстрые предложения */}
      {skills.length < 15 && (
        <div className="mb-6">
          <div className="text-gray-300 font-mono text-sm mb-3 flex items-center space-x-2">
            <span>Популярные навыки:</span>
            <span className="text-gray-500 text-xs">
              (кликните чтобы добавить)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {getRandomPopularSkills().map((skill) => (
              <button
                key={skill}
                onClick={() => handleAddSkill(skill)}
                className="px-3 py-2 bg-[#2d2d2d] hover:bg-[#333333] text-gray-300 font-mono text-sm rounded-lg transition-colors border border-[#333333] hover:border-[#e85353] hover:text-white"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Список навыков */}
      {skills.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="group inline-flex items-center bg-emerald-600 text-white font-mono text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:bg-emerald-700 hover:scale-105 hover:shadow-lg border border-emerald-500"
              >
                <div className="flex items-center space-x-2">
                  <span>{skill}</span>
                  <button
                    onClick={() => onRemoveSkill(skill)}
                    className="text-white hover:text-red-200 transition-colors opacity-0 group-hover:opacity-100"
                    title="Удалить навык"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-[#333333] rounded-lg">
          <div className="text-gray-500 font-mono text-lg mb-2">
            Пока нет навыков
          </div>
          <div className="text-gray-400 font-mono text-sm max-w-md mx-auto">
            Начните вводить название навыка выше или выберите из популярных.
          </div>
        </div>
      )}
    </div>
  );
};
