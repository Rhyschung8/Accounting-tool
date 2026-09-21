import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { signIn } from '../auth/session'

export function SignIn({ client, onSignedIn }: { client: SupabaseClient; onSignedIn: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await signIn(client, email, password)
    setBusy(false)
    if (error) setError('로그인 정보가 올바르지 않아요 / That email or password isn\'t right')
    else onSignedIn()
  }

  return (
    <div className="app-shell signin">
      <h1><span className="lang-ko">로그인</span><span className="lang-en">Sign in</span></h1>
      <form onSubmit={submit} className="signin__form">
        <label>이메일 / Email
          <input aria-label="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" />
        </label>
        <label>비밀번호 / Password
          <input aria-label="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? '잠시만 / One moment…' : '로그인 / Sign in'}
        </button>
      </form>
      <p className="signin__note">인터넷 연결이 필요해요 / You need to be online to use this.</p>
    </div>
  )
}
