import { useState } from 'react';

const targetCount = 6;
const cellCount = 9;

type Round = { target: number; hits: number; started: number; elapsed?: number };

export function BoopDemo() {
  const [round, setRound] = useState<Round>();

  function hit(cell: number) {
    if (!round || round.elapsed !== undefined || round.target !== cell) return;

    const hits = round.hits + 1;
    if (hits === targetCount) {
      setRound({ ...round, hits, elapsed: (performance.now() - round.started) / 1000 });
      return;
    }
    const next = (round.target + 1 + Math.floor(Math.random() * (cellCount - 1))) % cellCount;
    setRound({ ...round, hits, target: next });
  }

  return (
    <section className="boop-demo" aria-labelledby="boop-demo-title">
      <div>
        <h2 id="boop-demo-title">Try a tap challenge</h2>
        <p>This browser demo illustrates boop’s target-spawning mechanic. Hit six lit targets as quickly as you can.</p>
        <button type="button" className="primary-button" onClick={() => setRound({ target: Math.floor(Math.random() * cellCount), hits: 0, started: performance.now() })}>{round ? 'Restart challenge' : 'Start challenge'}</button>
        <p className="challenge-status" role="status">
          {round?.elapsed !== undefined ? `Finished in ${round.elapsed.toFixed(2)} seconds.` : round && `${round.hits} of ${targetCount} hits. Target ${round.target + 1} is lit.`}
        </p>
      </div>
      <div className="challenge-grid" role="group" aria-label="Tap challenge targets">
        {Array.from({ length: cellCount }, (_, index) => {
          const lit = round?.elapsed === undefined && round?.target === index;
          return <button key={index} type="button" aria-label={`Target ${index + 1}${lit ? ', lit' : ''}`} data-lit={lit} disabled={!round || round.elapsed !== undefined} onClick={() => hit(index)} />;
        })}
      </div>
    </section>
  );
}
