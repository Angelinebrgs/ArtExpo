import Reveal from './Reveal';

interface QuoteBreakProps {
  text: string;
  author?: string;
  size?: number;
}

/** Respiration éditoriale : une grande citation centrée entre deux sections. */
export default function QuoteBreak({ text, author, size = 44 }: QuoteBreakProps) {
  return (
    <Reveal>
      <div style={{ textAlign: 'center', padding: '140px 24px', maxWidth: 920, margin: '0 auto' }}>
        <div className="small-cap" style={{ color: 'var(--cyan-wash)', marginBottom: 36 }}>
          —
        </div>
        <blockquote
          style={{
            margin: 0,
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: size,
            lineHeight: 1.25,
            color: 'var(--cyan-deep)',
            textWrap: 'pretty',
          }}
        >
          {`« ${text} »`}
        </blockquote>
        {author && (
          <div className="small-cap" style={{ marginTop: 32, color: 'var(--terre)' }}>
            {author}
          </div>
        )}
      </div>
    </Reveal>
  );
}
