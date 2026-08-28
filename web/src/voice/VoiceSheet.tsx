import { useEffect, useRef, useState } from 'react';
import { APPOINTMENTS, CONTACTS, GAIL, MEDICATIONS } from 'shared/data';
import { useCare } from '../state/CareProvider';
import { useDoseInteraction } from '../dose/doseInteraction';
import { speak, stopSpeaking, todaysInspiration, type InspirationKind } from './speech';

type Stage = 'greeting' | 'idle' | 'listening' | 'thinking' | 'result';

const PROMPTS = [
  { id: 'note',     label: 'Log a note',             say: 'Log a note that I had a great lunch today.' },
  { id: 'meds',     label: 'Log my medicine',        say: 'I just took my medicine.' },
  { id: 'schedule', label: "Check today's schedule", say: "What's on my calendar?" },
  { id: 'call',     label: 'Call someone',           say: 'I need to call my doctor.' },
  { id: 'inspire',  label: "Today's inspiration",    say: 'Share something kind for today.' },
] as const;

type PromptId = typeof PROMPTS[number]['id'];

const MOODS = [
  { id: 'great',    label: 'Great' },
  { id: 'okay',     label: 'Okay' },
  { id: 'notgreat', label: 'Not great' },
] as const;

const MOOD_REPLY: Record<string, string> = {
  great: "That's wonderful to hear. I hope the good feeling stays with you today.",
  okay: "Okay days are still good days. I'm glad you're here.",
  notgreat: "I'm sorry today feels heavy. I've let your daughter know gently — you don't have to carry it by yourself.",
};

export function VoiceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { doses, addNote } = useCare();
  const { logNow } = useDoseInteraction();

  const [stage, setStage] = useState<Stage>('greeting');
  const [prompt, setPrompt] = useState<PromptId | null>(null);
  const [transcript, setTranscript] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [preference, setPreference] = useState<InspirationKind>('affirmation');
  const greeted = useRef(false);
  const typer = useRef<number | null>(null);

  const inspiration = todaysInspiration(preference);
  const nextDose = doses.find(d => d.status === 'due' || d.status === 'missed')
    ?? doses.find(d => d.status === 'upcoming');

  useEffect(() => {
    if (open && !greeted.current) {
      greeted.current = true;
      setStage('greeting');
      // Slight delay so the sheet has animated in before the voice starts.
      const t = window.setTimeout(() => speak(`Good morning, ${GAIL.name}. How are you feeling today?`), 300);
      return () => window.clearTimeout(t);
    }
    if (!open) {
      greeted.current = false;
      setStage('greeting');
      setPrompt(null);
      setTranscript('');
      setMood(null);
      stopSpeaking();
      if (typer.current) window.clearInterval(typer.current);
    }
  }, [open]);

  // Never leave a voice talking to an empty room.
  useEffect(() => () => stopSpeaking(), []);

  if (!open) return null;

  const pickMood = (id: string, label: string) => {
    setMood(id);
    // "Not great" is recorded confidentially: a bad day is the recipient's to
    // share with the primary caretaker, not with the whole circle.
    addNote(`${GAIL.name} said she's feeling ${label.toLowerCase()} today.`, 'mood', id === 'notgreat');
    window.setTimeout(() => {
      speak(MOOD_REPLY[id]);
      window.setTimeout(() => setStage('idle'), 2200);
    }, 250);
  };

  const answer = (id: PromptId) => {
    if (id === 'note') {
      addNote('I had a great lunch today.', 'general', false);
      speak("Got it — I've added that to your care log for the family to see.");
    } else if (id === 'meds') {
      if (nextDose) logNow(nextDose.id);
      speak(nextDose ? "Nice work — I've logged that dose." : "You're all caught up. Nothing is due right now.");
    } else if (id === 'schedule') {
      speak('Here is what is on your calendar today.');
    } else if (id === 'call') {
      speak('Here are your contacts. Tap one to call.');
    } else {
      speak(inspiration.ref
        ? `Here's today's verse. ${inspiration.ref}. ${inspiration.text}`
        : `Here's a little something for today. ${inspiration.text}`);
    }
  };

  const ask = (p: typeof PROMPTS[number]) => {
    setPrompt(p.id);
    setStage('listening');
    setTranscript('');
    let i = 0;
    // Typed out rather than appearing at once, so it reads as speech being
    // recognised rather than text being pasted.
    typer.current = window.setInterval(() => {
      i += 1;
      setTranscript(p.say.slice(0, i));
      if (i >= p.say.length) {
        if (typer.current) window.clearInterval(typer.current);
        setStage('thinking');
        window.setTimeout(() => { setStage('result'); answer(p.id); }, 700);
      }
    }, 22);
  };

  const heading = stage === 'greeting' ? `Good morning, ${GAIL.name}`
    : stage === 'listening' ? 'Listening…'
    : stage === 'thinking' ? 'One moment…'
    : stage === 'result' ? 'Done'
    : 'Talk to iCare';

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet voice-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber" />

        <div className="voice-head">
          <div className="voice-mic" data-listening={stage === 'listening'}>🎙</div>
          <div className="voice-heading">{heading}</div>
        </div>

        {stage === 'greeting' && (
          <div className="voice-block">
            <div className="voice-question">How are you feeling today?</div>
            <div className="chip-row">
              {MOODS.map(m => (
                <button key={m.id} className="time-chip" data-on={mood === m.id}
                  disabled={!!mood} onClick={() => pickMood(m.id, m.label)}>
                  <div className="time-chip-label">{m.label}</div>
                </button>
              ))}
            </div>
            {mood && <div className="voice-reply">{MOOD_REPLY[mood]}</div>}
          </div>
        )}

        {(stage === 'listening' || stage === 'thinking' || stage === 'result') && (
          <div className="voice-transcript">
            “{transcript}{stage === 'listening' ? '▌' : ''}”
          </div>
        )}

        {stage === 'thinking' && (
          <div className="voice-dots">
            {[0, 1, 2].map(i => <span key={i} className="voice-dot" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        )}

        {stage === 'result' && prompt && (
          <div className="voice-block">
            {prompt === 'meds' && (
              <div className="card voice-card">
                <div className="all-done-mark">✓</div>
                <div className="all-done-title">
                  {nextDose
                    ? `${MEDICATIONS.find(m => m.id === nextDose.medicationId)?.name} logged`
                    : 'Nothing due right now'}
                </div>
              </div>
            )}

            {prompt === 'note' && (
              <div className="card"><div className="log-text">I had a great lunch today.</div></div>
            )}

            {prompt === 'schedule' && (
              APPOINTMENTS.slice(0, 2).map(a => (
                <div key={a.id} className="card voice-appt">
                  <div className="appt-title">{a.title}</div>
                  <div className="appt-meta">{a.startTime} · {a.provider}</div>
                </div>
              ))
            )}

            {prompt === 'call' && CONTACTS.map(c => (
              <div key={c.id} className="card voice-contact">
                <div className="connector-icon">📞</div>
                <div className="connector-body">
                  <div className="connector-name">{c.name}</div>
                  <div className="connector-blurb">{c.specialty}</div>
                </div>
                <a className="voice-call" href={`tel:${c.phone.replace(/\D/g, '')}`}>Call</a>
              </div>
            ))}

            {prompt === 'inspire' && (
              <div className="card voice-inspiration">
                {inspiration.ref && <div className="story-kicker">{inspiration.ref}</div>}
                <div className="connector-verse">“{inspiration.text}”</div>
              </div>
            )}
          </div>
        )}

        {(stage === 'idle' || stage === 'result') && (
          <>
            <div className="seg" style={{ marginTop: 16 }}>
              {(['affirmation', 'verse'] as const).map(k => (
                <button key={k} className="seg-btn" data-on={preference === k} onClick={() => setPreference(k)}>
                  {k === 'affirmation' ? 'Affirmations' : 'Daily verse'}
                </button>
              ))}
            </div>

            <div className="voice-prompts">
              {PROMPTS.map(p => (
                <button key={p.id} className="voice-prompt" onClick={() => ask(p)}>
                  🎙 {p.label}
                </button>
              ))}
            </div>
          </>
        )}

        <button className="sheet-cancel voice-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
