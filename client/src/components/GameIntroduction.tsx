import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export default function GameIntroduction() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Welcome to Conway's Game of Life</CardTitle>
        <CardDescription>
          A simulation that shows how complex patterns emerge from simple rules
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="mb-2">
          Conway's Game of Life isn't a traditional game - it's a fascinating 
          "zero-player game" where patterns evolve automatically based on a few simple rules.
        </p>
        
        {isExpanded && (
          <>
            <h3 className="mt-4 mb-2 font-semibold">How to use this simulation:</h3>
            <ol className="pl-5 mb-3 list-decimal">
              <li>Click and drag on the grid to draw living cells</li>
              <li>Press "Start" to watch the pattern evolve</li>
              <li>Adjust the speed with the slider</li>
              <li>Click "Random" to generate a random pattern</li>
              <li>Use "Clear" to reset the grid</li>
            </ol>
            
            <h3 className="mt-4 mb-2 font-semibold">The rules are simple:</h3>
            <ul className="pl-5 mb-3 list-disc">
              <li>A living cell with fewer than 2 neighbors dies (underpopulation)</li>
              <li>A living cell with 2 or 3 neighbors survives</li>
              <li>A living cell with more than 3 neighbors dies (overcrowding)</li>
              <li>A dead cell with exactly 3 neighbors becomes alive (reproduction)</li>
            </ul>
            
            <p className="mb-2">
              From these simple rules, amazing patterns emerge - some stay still, some oscillate, 
              and some even move across the grid!
            </p>
            
            <p className="mb-2">
              The game was invented by mathematician John Conway in 1970 and shows how 
              complexity can arise from simplicity - an important concept in mathematics, 
              computer science, and biology.
            </p>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Learn More
            </>
          )}
        </Button>
        
        <a 
          href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          Wikipedia Article
          <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </CardFooter>
    </Card>
  );
}