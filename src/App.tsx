import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { ParentDashboard } from './components/ParentDashboard';
import { ChildPage } from './components/ChildPage';
import { supabase } from './lib/supabase';

function App() {
  const [view, setView] = useState<'landing' | 'parent' | 'child'>('landing');
  const [parentId, setParentId] = useState<string | null>(null);
  const [parentAccessCode, setParentAccessCode] = useState<string | null>(null);
  const [childAccessCode, setChildAccessCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const childCode = params.get('child');

    if (childCode) {
      setChildAccessCode(childCode);
      setView('child');
      return;
    }

    const savedParentCode = localStorage.getItem('parentAccessCode');
    if (savedParentCode) {
      handleParentLogin(savedParentCode);
    }
  }, []);

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleParentCreate = async () => {
    const accessCode = generateAccessCode();

    const { data, error } = await supabase
      .from('parents')
      .insert({ access_code: accessCode })
      .select()
      .single();

    if (error) {
      console.error('Error creating parent:', error);
      return;
    }

    setParentId(data.id);
    setParentAccessCode(accessCode);
    localStorage.setItem('parentAccessCode', accessCode);
    setView('parent');
  };

  const handleParentLogin = async (accessCode: string) => {
    const { data, error } = await supabase
      .from('parents')
      .select('*')
      .eq('access_code', accessCode)
      .maybeSingle();

    if (error || !data) {
      alert('Неверный код доступа');
      return;
    }

    setParentId(data.id);
    setParentAccessCode(accessCode);
    localStorage.setItem('parentAccessCode', accessCode);
    setView('parent');
  };

  if (view === 'child' && childAccessCode) {
    return <ChildPage accessCode={childAccessCode} />;
  }

  if (view === 'parent' && parentId && parentAccessCode) {
    return <ParentDashboard parentId={parentId} accessCode={parentAccessCode} />;
  }

  return (
    <LandingPage
      onParentCreate={handleParentCreate}
      onParentLogin={handleParentLogin}
    />
  );
}

export default App;
