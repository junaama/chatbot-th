import React from 'react';

type Props = {
  setSelectedExample: React.Dispatch<React.SetStateAction<string>>
  mode: string
}

const ExamplesSection = ({ setSelectedExample, mode }:Props) => {

  const vacationExamples = [
    "What cool stuff can I do in Madeira?",
    "Help me plan the ultimate lazy beach day.",
    "Know any good spots to eat in Manhattan?"
  ];
  
  const workExamples = [
    "Help me set up meetings for next week.",
    "Throw together a quick update for the Blastpad project.",
    "What did I miss in today's meeting?"
  ];
  const handleExampleClick = (example: string) => {
    setSelectedExample(example);

  };
  const examples = mode === "vacation" ? vacationExamples : workExamples

  return (
    <div className="mt-4 mb-4 w-full">
      <h3 className="text-lg font-semibold mb-2">Choose from an example below:</h3>
      <div className="flex overflow-x-auto md:overflow-visible gap-2">
        {examples.map((example, index) => (
          <button
            key={index}
            className="snap-center p-2 	min-w-[50%] md:min-w-[33%] text-left border border-[#CEC288] shadow-md dark:bg-gray-700 rounded-lg hover:bg-[#CEC288] dark:hover:bg-gray-600 transition-colors "
            onClick={() => handleExampleClick(example)}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamplesSection;