'use client';

interface ScoreIndicatorProps {
  score: number;
}

export function ScoreIndicator({ score }: ScoreIndicatorProps) {
  const getColor = () => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div
      className={`inline-flex items-center justify-center h-12 w-12 rounded-full font-bold ${getColor()}`}
    >
      {score}
    </div>
  );
}
