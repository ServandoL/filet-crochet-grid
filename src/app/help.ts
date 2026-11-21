import { HelpContent } from '@home/ui';

/** What the Help page (/help) says about filet crochet. */
export const FILET_CROCHET_HELP: HelpContent = {
  summary:
    'Design filet crochet patterns on a grid of filled and open squares, then follow them stitch by stitch, marking your progress as you go.',
  topics: [
    {
      title: 'Start a pattern',
      text: 'On Patterns, tap New pattern, give it a name and how many rows and columns it has. It opens in the editor.',
      link: { label: 'Open Patterns', url: '/patterns' },
    },
    {
      title: 'Draw it',
      text: 'In the editor, tap a square to fill it, and tap it again to leave it open. Row and column numbers stay in view as you scroll. Changes save on their own a couple of seconds after you stop, and Save saves straight away.',
    },
    {
      title: 'Use a section grid',
      text: 'Turn on the section grid to draw a heavier line every so many rows and columns, such as every 10, so the pattern is easier to count.',
    },
    {
      title: 'Track your progress',
      text: 'On a pattern’s card, tap Progress. Tap the squares you’ve worked to outline them; the pattern itself doesn’t change. Your place is saved, so you can pick up where you stopped on any device.',
      link: { label: 'Open Patterns', url: '/patterns' },
    },
  ],
  questions: [
    {
      question: 'What’s the difference between Edit, View and Progress?',
      answer: 'Edit changes the pattern. View shows it without letting you change it. Progress marks what you’ve crocheted without changing the pattern.',
    },
    {
      question: 'It says the pattern was edited after my progress was saved.',
      answer: 'Someone changed the pattern after you last marked your progress, so rows or squares may have moved. Check your marks against the pattern, then carry on.',
    },
    {
      question: 'Who can see my patterns?',
      answer: 'Everyone in your household, and no one else. Changes show up on their devices without a reload. Members are managed in Home.',
    },
  ],
};
