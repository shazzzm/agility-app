import type { Route } from "./+types/home";
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}


import { useRef, useEffect } from 'react';

export const useWithSound = (audioSource: string) => {
  const soundRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {    
    const audio = new Audio(audioSource);
    audio.preload = 'auto';
    soundRef.current = audio;
  }, []);

  return {
    play: () => soundRef.current?.play(),
    pause: () => soundRef.current?.pause(),
  };
}


export default function Home() {
  const leftSound = useWithSound('/left.mp3');
  const rightSound = useWithSound('/right.mp3');

  return (
    <main>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
        crossOrigin="anonymous"
      />
      <Button onClick={() => leftSound.play()}>Play Left</Button>
    </main>
  )
}
