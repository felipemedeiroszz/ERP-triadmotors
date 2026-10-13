'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const loginImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/login-desktop-WA175aTKdYe5zVq8WhZu8FfYMmDTH6.png'
const logoImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icon-384-OekmO3R70XidB2MrfDm9cnlP823Sxj.png'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setSubmitted(false)
    setErrorMessage('')

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMessage('E-mail ou senha inválidos. Verifique seus dados e tente novamente.')
    } else {
      // Check if user is active
      const { data: profile } = await supabase
        .from('profiles')
        .select('active')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (!profile?.active) {
        await supabase.auth.signOut()
        setErrorMessage('Sua conta está desativada. Entre em contato com o administrador.')
      } else {
        setSubmitted(true)
        router.push('/')
      }
    }
    setIsLoading(false)
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }
        html, body { margin: 0; min-height: 100%; font-family: Inter, Arial, sans-serif; color: #171717; }
        button, input { font: inherit; }

        .login-shell { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(420px, .88fr); background: #fff; }
        .login-visual { position: relative; min-height: 100vh; overflow: hidden; background: #101010 url('${loginImage}') center/cover no-repeat; }
        .visual-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,.18) 72%, rgba(0,0,0,.1)); }
        .visual-content { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; padding: 48px 7%; color: #fff; }
        .visual-logo { width: 120px; height: 120px; object-fit: contain; background: #fff; border-radius: 50%; padding: 7px; }
        .visual-copy { max-width: 540px; margin-top: auto; margin-bottom: 18vh; }
        .eyebrow, .form-kicker, .dashboard-kicker { color: #ed1c24; font-size: 10px; font-weight: 900; letter-spacing: .2em; }
        .visual-copy h1 { margin: 16px 0; font-family: 'Barlow Condensed', Impact, sans-serif; font-size: clamp(54px, 5.2vw, 88px); line-height: .88; letter-spacing: -.035em; text-transform: uppercase; }
        .visual-copy h1 em { color: #ed1c24; font-style: normal; }
        .visual-copy p { max-width: 440px; margin: 0; color: rgba(255,255,255,.72); font-size: 14px; line-height: 1.65; }
        .visual-footer { color: rgba(255,255,255,.65); font-size: 11px; letter-spacing: .03em; }
        .status-dot { display: inline-block; width: 7px; height: 7px; margin-right: 7px; border-radius: 50%; background: #39c978; }
        .footer-separator { margin: 0 10px; color: #ed1c24; }
        .login-panel { display: grid; place-items: center; padding: 40px 7%; background: #fff; }
        .panel-inner { width: min(100%, 420px); }
        .mobile-logo { display: none; }
        .form-heading { margin-bottom: 34px; }
        .form-heading h2 { margin: 11px 0 7px; font-size: 32px; letter-spacing: -.05em; }
        .form-heading p { margin: 0; color: #888; font-size: 13px; }
        .login-form { display: flex; flex-direction: column; gap: 10px; }
        .login-form label { color: #3d3d3d; font-size: 12px; font-weight: 700; }
        .input-wrap { display: flex; align-items: center; gap: 10px; height: 48px; margin-bottom: 13px; padding: 0 14px; border: 1px solid #dedede; border-radius: 5px; background: #fff; transition: border-color .2s, box-shadow .2s; }
        .input-wrap:focus-within { border-color: #ed1c24; box-shadow: 0 0 0 3px rgba(237,28,36,.1); }
        .input-wrap svg { width: 17px; color: #999; }
        .input-wrap input { width: 100%; border: 0; outline: 0; color: #222; font-size: 13px; }
        .input-wrap input::placeholder { color: #aaa; }
        .label-row { display: flex; justify-content: space-between; align-items: center; }
        .forgot-button { border: 0; color: #d71920; background: transparent; font-size: 11px; cursor: pointer; }
        .icon-button { display: grid; place-items: center; border: 0; color: #888; background: transparent; cursor: pointer; }
        .icon-button svg { width: 17px; }
        .remember-row { display: flex; align-items: center; gap: 8px; margin: 2px 0 18px; color: #777 !important; font-size: 11px !important; font-weight: 500 !important; cursor: pointer; }
        .remember-row input { accent-color: #e51b23; }
        .submit-button { height: 49px; border: 0; border-radius: 5px; color: #fff; background: #e51b23; font-size: 12px; font-weight: 800; letter-spacing: .02em; cursor: pointer; transition: background .2s, transform .2s; }
        .submit-button:hover { background: #c91017; transform: translateY(-1px); }
        .submit-button:disabled { opacity: .7; cursor: wait; transform: none; }
        .submit-button span { margin-left: 8px; font-size: 18px; }
        .form-feedback { padding: 11px; border-radius: 4px; color: #167443; background: #edf9f2; font-size: 12px; text-align: center; }
        .form-error { color: #a3171d; background: #fff0f0; }
        .security-note { display: flex; gap: 8px; margin-top: 42px; color: #999; font-size: 10px; line-height: 1.5; }
        .security-note svg { flex: none; width: 16px; color: #e51b23; }
        .copyright { margin: 42px 0 0; color: #bbb; font-size: 9px; }

        @media (max-width: 900px) {
          .login-shell { grid-template-columns: 1fr; }
          .login-visual { display: none; }
          .login-panel { min-height: 100vh; padding: 36px 24px; }
          .mobile-logo { display: block; width: 110px; height: 110px; margin: 0 auto 34px; object-fit: contain; }
          .form-heading h2 { font-size: 29px; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; }
        }
        body { overflow-x: hidden; }
        body:has(.login-shell) { background: #fff; }
        @media (max-width: 380px) { .login-panel { padding-inline: 18px; } }
      `}</style>

      <main className="login-shell">
        <section className="login-visual" aria-label="Triad Moto Parts">
          <div className="visual-overlay" />
          <div className="visual-content">
            <img src={logoImage} alt="Triad Moto Parts" className="visual-logo" />
            <div className="visual-copy">
              <span className="eyebrow">ERP &middot; PDV &middot; GESTÃO</span>
              <h1>Potência para<br /><em>o seu negócio.</em></h1>
              <p>Controle sua operação com precisão, velocidade e a confiança de quem entende de duas rodas.</p>
            </div>
            <div className="visual-footer"><span className="status-dot" /> Sistema operacional <span className="footer-separator">|</span> Ambiente seguro</div>
          </div>
        </section>

        <section className="login-panel">
          <div className="panel-inner">
            <img src={logoImage} alt="Triad Moto Parts" className="mobile-logo" />
            <div className="form-heading">
              <span className="form-kicker">BEM-VINDO DE VOLTA</span>
              <h2>Acesse sua conta</h2>
              <p>Entre para gerenciar sua operação.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <label htmlFor="email">E-mail corporativo</label>
              <div className="input-wrap">
                <Mail aria-hidden="true" />
                <input id="email" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
              </div>
              <div className="label-row">
                <label htmlFor="password">Senha</label>
                <button type="button" className="forgot-button" onClick={() => router.push('/auth/reset-password')}>Esqueci minha senha</button>
              </div>
              <div className="input-wrap">
                <LockKeyhole aria-hidden="true" />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Digite sua senha" autoComplete="current-password" required />
                <button type="button" className="icon-button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
              <label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span className="checkmark" />Manter conectado</label>
              <button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? 'Validando acesso...' : <>Entrar no sistema <span aria-hidden="true">&rarr;</span></>}</button>
              {submitted && <div className="form-feedback" role="status">Acesso confirmado. Ambiente Triad carregado.</div>}
              {errorMessage && <div className="form-feedback form-error" role="alert">{errorMessage}</div>}
            </form>

            <div className="security-note"><ShieldCheck aria-hidden="true" /><span>Seus dados estão protegidos com criptografia de ponta a ponta.</span></div>
            <p className="copyright">&copy; 2025 Triad Moto Parts. Todos os direitos reservados.</p>
          </div>
        </section>
      </main>
    </>
  )
}
