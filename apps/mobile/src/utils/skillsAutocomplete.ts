/**
 * Skills Autocomplete Utility
 * Provides skill suggestions based on user input
 */

export interface SkillSuggestion {
  id: string;
  name: string;
  category: string;
}

export const skillsDatabase: SkillSuggestion[] = [
  // Programming Languages
  { id: "1", name: "Java", category: "Programming Language" },
  { id: "2", name: "JavaScript", category: "Programming Language" },
  { id: "3", name: "Python", category: "Programming Language" },
  { id: "4", name: "C++", category: "Programming Language" },
  { id: "5", name: "C#", category: "Programming Language" },
  { id: "6", name: "PHP", category: "Programming Language" },
  { id: "7", name: "Ruby", category: "Programming Language" },
  { id: "8", name: "Go", category: "Programming Language" },
  { id: "9", name: "Rust", category: "Programming Language" },
  { id: "10", name: "TypeScript", category: "Programming Language" },
  { id: "11", name: "Kotlin", category: "Programming Language" },
  { id: "12", name: "Swift", category: "Programming Language" },
  { id: "13", name: "Scala", category: "Programming Language" },
  { id: "14", name: "R", category: "Programming Language" },
  { id: "15", name: "MATLAB", category: "Programming Language" },

  // Web Development
  { id: "16", name: "React", category: "Web Framework" },
  { id: "17", name: "Angular", category: "Web Framework" },
  { id: "18", name: "Vue.js", category: "Web Framework" },
  { id: "19", name: "Node.js", category: "Web Framework" },
  { id: "20", name: "Express.js", category: "Web Framework" },
  { id: "21", name: "Django", category: "Web Framework" },
  { id: "22", name: "Flask", category: "Web Framework" },
  { id: "23", name: "Spring Boot", category: "Web Framework" },
  { id: "24", name: "Laravel", category: "Web Framework" },
  { id: "25", name: "ASP.NET", category: "Web Framework" },
  { id: "26", name: "HTML", category: "Web Technology" },
  { id: "27", name: "CSS", category: "Web Technology" },
  { id: "28", name: "SASS/SCSS", category: "Web Technology" },
  { id: "29", name: "Tailwind CSS", category: "Web Technology" },
  { id: "30", name: "Bootstrap", category: "Web Technology" },

  // Mobile Development
  { id: "31", name: "React Native", category: "Mobile Framework" },
  { id: "32", name: "Flutter", category: "Mobile Framework" },
  { id: "33", name: "Android Development", category: "Mobile Development" },
  { id: "34", name: "iOS Development", category: "Mobile Development" },
  { id: "35", name: "Xamarin", category: "Mobile Framework" },

  // Database
  { id: "36", name: "MySQL", category: "Database" },
  { id: "37", name: "PostgreSQL", category: "Database" },
  { id: "38", name: "MongoDB", category: "Database" },
  { id: "39", name: "Firebase", category: "Database" },
  { id: "40", name: "Redis", category: "Database" },
  { id: "41", name: "Oracle", category: "Database" },
  { id: "42", name: "SQL Server", category: "Database" },
  { id: "43", name: "Elasticsearch", category: "Database" },
  { id: "44", name: "Cassandra", category: "Database" },
  { id: "45", name: "DynamoDB", category: "Database" },

  // Tools & Technologies
  { id: "46", name: "Git", category: "Version Control" },
  { id: "47", name: "Docker", category: "DevOps" },
  { id: "48", name: "Kubernetes", category: "DevOps" },
  { id: "49", name: "Jenkins", category: "CI/CD" },
  { id: "50", name: "AWS", category: "Cloud" },
  { id: "51", name: "Azure", category: "Cloud" },
  { id: "52", name: "Google Cloud", category: "Cloud" },
  { id: "53", name: "Terraform", category: "DevOps" },
  { id: "54", name: "Linux", category: "Operating System" },
  { id: "55", name: "Windows Server", category: "Operating System" },

  // Data & AI
  { id: "56", name: "Machine Learning", category: "Data Science" },
  { id: "57", name: "Data Science", category: "Data Science" },
  { id: "58", name: "Artificial Intelligence", category: "Data Science" },
  { id: "59", name: "TensorFlow", category: "ML Library" },
  { id: "60", name: "PyTorch", category: "ML Library" },
  { id: "61", name: "Scikit-learn", category: "ML Library" },
  { id: "62", name: "Pandas", category: "Data Library" },
  { id: "63", name: "NumPy", category: "Data Library" },
  { id: "64", name: "Data Analysis", category: "Data Science" },
  { id: "65", name: "Big Data", category: "Data Science" },
  { id: "66", name: "Spark", category: "Big Data" },
  { id: "67", name: "Hadoop", category: "Big Data" },

  // Software Development & Practices
  { id: "68", name: "REST API", category: "Architecture" },
  { id: "69", name: "GraphQL", category: "Architecture" },
  { id: "70", name: "Microservices", category: "Architecture" },
  { id: "71", name: "SOLID Principles", category: "Best Practices" },
  { id: "72", name: "Design Patterns", category: "Best Practices" },
  { id: "73", name: "Agile", category: "Methodology" },
  { id: "74", name: "Scrum", category: "Methodology" },
  { id: "75", name: "Test-Driven Development", category: "Methodology" },
  { id: "76", name: "Unit Testing", category: "Testing" },
  { id: "77", name: "Integration Testing", category: "Testing" },
  { id: "78", name: "Jest", category: "Testing Framework" },
  { id: "79", name: "Mocha", category: "Testing Framework" },
  { id: "80", name: "Selenium", category: "Testing Framework" },
  { id: "81", name: "JUnit", category: "Testing Framework" },

  // Soft Skills
  { id: "82", name: "Communication", category: "Soft Skill" },
  { id: "83", name: "Leadership", category: "Soft Skill" },
  { id: "84", name: "Problem Solving", category: "Soft Skill" },
  { id: "85", name: "Project Management", category: "Soft Skill" },
  { id: "86", name: "Team Collaboration", category: "Soft Skill" },
  { id: "87", name: "Time Management", category: "Soft Skill" },
  { id: "88", name: "Critical Thinking", category: "Soft Skill" },
  { id: "89", name: "Adaptability", category: "Soft Skill" },
  { id: "90", name: "Creativity", category: "Soft Skill" },

  // Business & Productivity
  { id: "91", name: "Excel", category: "Productivity" },
  { id: "92", name: "PowerPoint", category: "Productivity" },
  { id: "93", name: "Jira", category: "Project Management" },
  { id: "94", name: "Confluence", category: "Documentation" },
  { id: "95", name: "Figma", category: "Design" },
  { id: "96", name: "Adobe XD", category: "Design" },
  { id: "97", name: "Photoshop", category: "Design" },
  { id: "98", name: "UI Design", category: "Design" },
  { id: "99", name: "UX Design", category: "Design" },
  { id: "100", name: "SEO", category: "Marketing" },
];

/**
 * Get skill suggestions based on user input
 * @param input - User input text
 * @returns Array of matching skill suggestions
 */
export const getSkillSuggestions = (input: string): SkillSuggestion[] => {
  if (!input || input.length < 1) return [];

  const query = input.toLowerCase().trim();
  const suggestions = skillsDatabase.filter((skill) => skill.name.toLowerCase().includes(query));

  // Sort by relevance - exact matches first, then starts with, then contains
  return suggestions
    .sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // Exact match
      if (aName === query) return -1;
      if (bName === query) return 1;

      // Starts with
      if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
      if (bName.startsWith(query) && !aName.startsWith(query)) return 1;

      // By name length (shorter = more relevant)
      return aName.length - bName.length;
    })
    .slice(0, 8); // Return top 8 suggestions
};

/**
 * Check if skill already exists in list
 */
export const skillExists = (skillName: string, existingSkills: any[]): boolean => {
  return existingSkills.some((s) => s.name.toLowerCase() === skillName.toLowerCase());
};
