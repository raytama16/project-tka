'use client';

import { useState } from 'react';

const SubscribeForm = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribed:', email);
    alert('Terima kasih telah mendaftar!');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="email"
        placeholder="Email Anda"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md bg-slate-900 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-hover hover:bg-blue-700"
      >
        Subscribe
      </button>
    </form>
  );
};

export default SubscribeForm;