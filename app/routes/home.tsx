import type { Route } from "./+types/home";
import { Button, Card, Form, FormLabel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRef, useEffect, useState } from "react";

interface SoundEntry {
  label: string;
  location: string;
}
enum State {
  PAUSED,
  GO,
  REST,
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Agility Training" }, { name: "description", content: "" }];
}

const BASE_URL = import.meta.env.BASE_URL;

export const useWithSounds = (sources: Array<SoundEntry>) => {
  const refs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    sources.forEach(({ label, location }) => {
      const audio = new Audio(location);
      audio.preload = "auto";
      refs.current[label] = audio;
    });
  }, []);

  const play = (name: string) => {
    const audio = refs.current[name];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  const unlock = () => {
    Object.values(refs.current).forEach((audio) => {
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {});
    });
  };

  return { play, unlock };
};

const sounds: Array<SoundEntry> = [
  { label: "Left", location: `${BASE_URL}left.mp3` },
  { label: "Right", location: `${BASE_URL}right.mp3` },
];

const beep = [{ label: "Beep", location: `${BASE_URL}beep.mp3` }];

export default function Home() {
  const { play, unlock } = useWithSounds(sounds);
  const { play: playBeep, unlock: unlockBeep } = useWithSounds(beep);
  const [config, setConfig] = useState({
    selected: [] as string[],
    minTime: 1,
    maxTime: 10,
    restTime: 30,
  });

  const [running, setRunning] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [restTime, setRestTime] = useState(0);
  const restTimeRef = useRef(0);
  const [state, setState] = useState(State.PAUSED);
  const configRef = useRef(config);

  const setRange = (key: string, value: number) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const startRest = () => {
    restTimeRef.current = config.restTime * 1000;
    setRestTime(restTimeRef.current);
    setState(State.REST);
    timeoutRef.current = setTimeout(runRest, 1000);
  };

  const runRest = () => {
    if (restTimeRef.current > 0) {
      restTimeRef.current -= 1000;
      setRestTime(restTimeRef.current);
      timeoutRef.current = setTimeout(runRest, 1000);
    } else {
      playBeep("Beep");
      scheduleRun();
    }
  };

  const scheduleRun = () => {
    setState(State.GO);
    const delay =
      Math.random() * (configRef.current.maxTime - configRef.current.minTime) +
      configRef.current.minTime;
    return setTimeout(() => {
      const available = sounds.filter((x) =>
        configRef.current.selected.includes(x.label),
      );
      if (available.length > 0) {
        const pick = available[Math.floor(Math.random() * available.length)];
        play(pick.label);
      }
      startRest();
    }, delay * 1000);
  };

  useEffect(() => {
    if (running) {
      timeoutRef.current = scheduleRun();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setRestTime(0);
      setState(State.PAUSED);
    };
  }, [running]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  return (
    <main>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
        crossOrigin="anonymous"
      />
      <div className="row p-3">
        <div className="col" style={{ maxWidth: 400 }}>
          <Form.Label>Sounds To Use</Form.Label>
          {sounds.map((x) => (
            <Form.Check
              key={x.label}
              type="checkbox"
              label={x.label}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  selected: e.target.checked
                    ? [...prev.selected, x.label]
                    : prev.selected.filter((s) => s !== x.label),
                }))
              }
            />
          ))}
          <div className="d-flex align-items-center gap-2">
            <Form.Label>Min Time</Form.Label>
            <Form.Range
              value={config.minTime}
              onChange={(e) => setRange("minTime", Number(e.target.value))}
              max={10}
              disabled={running}
            />
            <FormLabel>{config.minTime} seconds</FormLabel>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Form.Label>Max Time</Form.Label>
            <Form.Range
              value={config.maxTime}
              onChange={(e) => setRange("maxTime", Number(e.target.value))}
              max={10}
              disabled={running}
            />
            <FormLabel>{config.maxTime} seconds</FormLabel>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Form.Label>Rest Time</Form.Label>
            <Form.Range
              value={config.restTime}
              onChange={(e) => setRange("restTime", Number(e.target.value))}
              max={120}
              disabled={running}
            />
            <FormLabel>{config.restTime} seconds</FormLabel>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              variant={running ? "danger" : "success"}
              onClick={() => {
                if (!running) {
                  // Unlock all audio synchronously on this tap, before any async work
                  unlock();
                  unlockBeep();
                }
                setRunning((prev) => !prev);
              }}
            >
              {running ? "Stop" : "Start"}
            </Button>
          </div>
          <div className="d-flex justify-content-center gap-2 p-2">
            <Card style={{ width: "18rem" }}>
              {state === State.PAUSED ? (
                <Card.Body>
                  <Card.Title>Paused</Card.Title>
                  <Card.Text></Card.Text>
                </Card.Body>
              ) : state === State.GO ? (
                <Card.Body>
                  <Card.Title>Go!</Card.Title>
                  <Card.Text></Card.Text>
                </Card.Body>
              ) : (
                <Card.Body>
                  <Card.Title>Rest</Card.Title>
                  <Card.Text>{restTime / 1000} s</Card.Text>
                </Card.Body>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
