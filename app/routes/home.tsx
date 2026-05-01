import type { Route } from "./+types/home";
import { Button, Form, FormLabel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface SoundEntry {
  label: string;
  location: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}


import { useRef, useEffect, useState } from 'react';

export const useWithSounds = (sources: Array<SoundEntry>) => {
  const refs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    sources.forEach(({ label, location }) => {
      const audio = new Audio(location);
      audio.preload = 'auto';
      refs.current[label] = audio;
    });
  }, []);

  const play = (name: string) => {
    const audio = refs.current[name];
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  return { play };
};

const sounds : Array<SoundEntry> = [
  { "label": "Left",
    "location": "/left.mp3"
  },
  { "label": "Right",
    "location": "/right.mp3"
  }
]

export default function Home() {

  const { play } = useWithSounds(sounds);
  const [config, setConfig] = useState({
    selected: [] as string[],
    minTime: 1,
    maxTime: 10,
    restTime: 30,
  });

  const [running, setRunning] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setRange = (key: string, value: number) =>
    setConfig(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    console.log("useEffect")
    if (running) {
      console.log("running");

      const scheduleNext = () => {
        const delay = Math.random() * (config.maxTime - config.minTime) + config.minTime;
        return setTimeout(() => {
          console.log("timeout")
          const available = sounds.filter(x => config.selected.includes(x.label));
          if (available.length > 0) {
            const pick = available[Math.floor(Math.random() * available.length)];
            play(pick.label);
          }
          timeoutRef.current = scheduleNext();
        }, delay * 1000);
      };

      timeoutRef.current = scheduleNext();
    }

    console.log("not running")

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

  }, [running, config]);

  return (
    <main>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
        crossOrigin="anonymous"
      />
      <div className="p-3" style={{maxWidth: 400}}>
        <Form.Label>Sounds To Use</Form.Label>        
        {
          sounds.map((x) => (<Form.Check
            key={x.label}
            type="checkbox"
            label={x.label}
            onChange={ e =>
              setConfig(prev => ({
                  ...prev,
                  selected: e.target.checked
                    ? [...prev.selected, x.label]
                    : prev.selected.filter(s => s !== x.label),
              }))}
          />))
        }
        <div className="d-flex align-items-center gap-2">
          <Form.Label>Min Time</Form.Label><Form.Range value={config.minTime}
            onChange={e => setRange('minTime', Number(e.target.value))} />
          <FormLabel>{config.minTime} seconds</FormLabel>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Form.Label>Max Time</Form.Label><Form.Range value={config.maxTime}
            onChange={e => setRange('maxTime', Number(e.target.value))} />
          <FormLabel>{config.maxTime} seconds</FormLabel>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Form.Label>Rest Time</Form.Label><Form.Range value={config.restTime}
            onChange={e => setRange('restTime', Number(e.target.value))} />
          <FormLabel>{config.restTime} seconds</FormLabel>
        </div>
        <div className="d-flex align-items-center gap-2"> 
          <Button variant={running ? "danger" : "success"} onClick={() => setRunning(prev => !prev)}>
            {running ? 'Stop' : 'Start'}
          </Button>
        </div>
      </div>
    </main>
  )
}
