export type ProjectCategory = 'Systems' | 'Games' | 'Tools';

interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  discipline: string;
  summary: string;
  role: string;
  approach: string;
  contribution: string;
  status: string;
  tags: string[];
  color: string;
  marker: [number, number];
  repository?: string;
}

export const projects: Project[] = [
  {
    id: 'dotexe',
    title: 'DotEXE',
    category: 'Systems',
    discipline: 'Backend & optimization',
    summary: 'A thesis system for finding least-cost poultry feed formulations under real nutritional constraints.',
    role: 'Thesis team lead & backend developer',
    approach: 'The system uses a genetic algorithm to search ingredient combinations for three growth stages. The search weighs cost alongside nutrient and ingredient limits, using a price-forecasting pipeline as another input.',
    contribution: 'I led the four-person team, built most of the backend, and worked out how to implement the genetic algorithm for the formulation problem.',
    status: 'Successfully defended. Final revisions and department sign-off are pending.',
    tags: ['Genetic algorithms', 'Backend', 'Forecasting'],
    color: '#daed7d',
    marker: [0.56, 0.24],
  },
  {
    id: 'boop',
    title: 'boop',
    category: 'Games',
    discipline: 'Android game development',
    summary: 'A fast, tap-driven Android game with randomized spawns, escalating difficulty and timed power-ups.',
    role: 'Independent developer',
    approach: 'A frame-based game loop renders targets and handles touch input. Separate gameplay, spawning, audio, and effects logic keeps the different parts of the game easier to change.',
    contribution: 'I built the game end to end, from touch detection and spawn overlap checks to difficulty progression, shields, multipliers, and visual feedback.',
    status: 'Playable Android build shared with other players.',
    tags: ['Android', 'Game loop', 'Touch input'],
    color: '#c5a8f9',
    marker: [0.77, 0.46],
  },
  {
    id: 'schedule-optimizer',
    title: 'FEU Tech Schedule Optimizer',
    category: 'Tools',
    discipline: 'Scheduling & web development',
    summary: 'A scheduling tool for exploring class combinations and spotting timetable conflicts.',
    role: 'Independent developer',
    approach: 'The optimizer represents class options as scheduling constraints and checks for conflicts as it assembles viable timetables.',
    contribution: 'I translated the registration problem into a constraint-based workflow and used regression testing to protect the conflict checks as the tool evolved.',
    status: 'Source available on GitHub.',
    tags: ['Constraints', 'Conflict detection', 'Testing'],
    color: '#86c9f4',
    marker: [0.34, 0.55],
    repository: 'https://github.com/wander-code/FEUTECH-Scheduler',
  },
  {
    id: 'starrunesonders',
    title: 'StarRuneSonders',
    category: 'Games',
    discipline: 'Language design & storytelling',
    summary: 'An interactive storytelling project built around a custom scripting language.',
    role: 'Independent developer',
    approach: 'A tokenizer breaks scripts into language elements and a parser interprets their structure. The language expresses the logic behind the interactive story.',
    contribution: 'I designed the scripting language and implemented its tokenizer and parser alongside the storytelling experience.',
    status: 'Independent project.',
    tags: ['Tokenization', 'Parsing', 'Storytelling'],
    color: '#f0ae87',
    marker: [0.59, 0.67],
  },
];

export const projectPath = (project: Project) => `/projects/${project.id}`;
