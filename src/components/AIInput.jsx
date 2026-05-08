import { Sparkles, Send } from 'lucide-react';
import { useState } from 'react';

const AIInput = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    // Dummy delay for future Gemini integration
    setTimeout(() => {
      setLoading(false);
      setPrompt('');
      alert('AI Integration Placeholder: Would parse "' + prompt + '" and log macros/workouts automatically.');
    }, 1000);
  };

  return (
    <div className="glass-card animate-slide-up delay-1" style={{ marginTop: '16px', background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Sparkles size={18} color="var(--primary-color)" />
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>Log with AI</h3>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="e.g., 'I ate 2 eggs and a banana' or 'Ran 5k'" 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)}
          style={{ flex: 1, padding: '10px 16px', background: 'rgba(0,0,0,0.2)' }}
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: 'auto', padding: '10px 16px', background: loading ? 'var(--surface-border)' : 'var(--primary-color)' }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default AIInput;
