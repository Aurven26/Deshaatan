"use client";

import { useState, type FormEvent } from "react";
import styles from "./auth-popup.module.css";

const benefits = [["Honest advice", "No pushy upselling"], ["Clear pricing", "No hidden charges"], ["Upfront policies", "Refund terms before you pay"], ["Real specialists", "Who know the places they plan"]];
const countryCodes = [
  ["IN", "91", "India"], ["US", "1", "United States"], ["CA", "1", "Canada"],
  ["GB", "44", "United Kingdom"], ["AU", "61", "Australia"], ["NZ", "64", "New Zealand"],
  ["AE", "971", "United Arab Emirates"], ["SA", "966", "Saudi Arabia"], ["QA", "974", "Qatar"],
  ["KW", "965", "Kuwait"], ["OM", "968", "Oman"], ["BH", "973", "Bahrain"],
  ["SG", "65", "Singapore"], ["MY", "60", "Malaysia"], ["TH", "66", "Thailand"],
  ["ID", "62", "Indonesia"], ["PH", "63", "Philippines"], ["VN", "84", "Vietnam"],
  ["NP", "977", "Nepal"], ["BT", "975", "Bhutan"], ["LK", "94", "Sri Lanka"],
  ["BD", "880", "Bangladesh"], ["PK", "92", "Pakistan"], ["MV", "960", "Maldives"],
  ["CN", "86", "China"], ["JP", "81", "Japan"], ["KR", "82", "South Korea"],
  ["HK", "852", "Hong Kong"], ["TW", "886", "Taiwan"], ["DE", "49", "Germany"],
  ["FR", "33", "France"], ["IT", "39", "Italy"], ["ES", "34", "Spain"],
  ["PT", "351", "Portugal"], ["NL", "31", "Netherlands"], ["BE", "32", "Belgium"],
  ["CH", "41", "Switzerland"], ["AT", "43", "Austria"], ["SE", "46", "Sweden"],
  ["NO", "47", "Norway"], ["DK", "45", "Denmark"], ["FI", "358", "Finland"],
  ["IE", "353", "Ireland"], ["GR", "30", "Greece"], ["PL", "48", "Poland"],
  ["TR", "90", "Turkey"], ["ZA", "27", "South Africa"], ["EG", "20", "Egypt"],
  ["KE", "254", "Kenya"], ["NG", "234", "Nigeria"], ["BR", "55", "Brazil"],
  ["MX", "52", "Mexico"], ["AR", "54", "Argentina"], ["CL", "56", "Chile"],
];

export default function AuthPopup() {
  const [signup, setSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [country, setCountry] = useState("IN");
  const mode = signup ? "signup" : "login";
  const asset = (name: string, extension = "svg") => `/figma/auth/${mode}-${name}.${extension}`;
  const switchMode = (next: boolean) => { setSignup(next); setShowPassword(false); setMessage(""); };
  const unavailable = (feature: string) => setMessage(`${feature} is not available yet. Please contact care@deshaatan.com for help with your trip.`);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    unavailable(signup ? "Account registration" : "Account login");
  }

  return <div className={styles.card}>
    <div className={styles.visual}>
      <img className={styles.photo} src="/figma/auth/login-imgImage.png" alt="Kedarnath temple surrounded by snow-covered Himalayan mountains" />
      <div className={styles.gradient} />
      <div className={styles.copy}>
        <span className={styles.chip}>DISCOVER&nbsp; · &nbsp;PLAN&nbsp; · &nbsp;BOOK</span>
        <p className={styles.headline}>Discover better.<br />Plan smarter.<br /><span>Travel confidently.</span></p>
        <p className={styles.description}>Save trips, get realistic itineraries and talk to a destination specialist, all in one place.</p>
        <div className={styles.highlights}>{["Honest advice", "Clear pricing", "Real specialists"].map(text => <span key={text}>{text}</span>)}</div>
      </div>
    </div>
    <form key={mode} className={styles.panel} onSubmit={submit}>
      <div className={styles.tabs} aria-label="Account access">
        <button type="button" aria-pressed={!signup} onClick={() => switchMode(false)}>Log in</button>
        <button type="button" aria-pressed={signup} onClick={() => switchMode(true)}>Sign up</button>
      </div>
      <div className={styles.heading}><h2 id="auth-popup-heading">{signup ? "Create your account" : "Welcome back"}</h2><p>{signup ? "Plan smarter with saved trips, price estimates and specialist help." : "Log in to see your trips, saved itineraries and bookings."}</p></div>
      <div className={styles.fields}>
        {signup ? <>
          <input aria-label="Full name" name="name" autoComplete="name" placeholder="Full name" required maxLength={100} />
          <input aria-label="Email address" name="email" type="email" autoComplete="email" placeholder="Email address" required />
          <div className={styles.phone}><span className={styles.country}><select aria-label="Country calling code" name="country" value={country} onChange={event => setCountry(event.target.value)}>{countryCodes.map(([iso, code, name]) => <option key={iso} value={iso} label={`${iso} +${code}`}>{name} (+{code})</option>)}</select><img src={asset("imgChevron")} alt="" /><input type="hidden" name="callingCode" value={`+${countryCodes.find(([iso]) => iso === country)?.[1]}`} /></span><input aria-label="Mobile number" name="phone" type="tel" autoComplete="tel-national" inputMode="numeric" pattern={country === "IN" ? "[0-9]{10}" : "[0-9]{4,14}"} title={country === "IN" ? "Enter a 10-digit Indian mobile number" : "Enter your mobile number without the country code"} placeholder="Mobile number" required /></div>
        </> : <input aria-label="Email or mobile number" name="identifier" autoComplete="username" placeholder="Email or mobile number" required />}
        <div className={styles.password}><input aria-label={signup ? "Create password" : "Password"} name="password" type={showPassword ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} placeholder={signup ? "Create password" : "Password"} required minLength={signup ? 8 : undefined} pattern={signup ? "(?=.*[0-9]).{8,}" : undefined} aria-describedby={signup ? "auth-password-hint" : undefined} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></div>
        {signup ? <p className={styles.hint} id="auth-password-hint">Use at least 8 characters, including a number.</p> : <div className={styles.options}><label><input type="checkbox" name="remember" /><span>Remember me</span></label><button type="button" onClick={() => unavailable("Password recovery")}>Forgot password?</button></div>}
      </div>
      {signup && <div className={styles.consent}><label><input className={styles.agreement} type="checkbox" name="terms" defaultChecked required /><span>I agree to the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a> and <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></span></label><label><input type="checkbox" name="offers" /><span>Send me travel guides and offers on email and WhatsApp (optional)</span></label></div>}
      <button className={styles.primary} type="submit">{signup ? "Create account" : "Log in"}</button>
      <div className={styles.divider}><span />{signup ? "or sign up with" : "or continue with"}<span /></div>
      <div className={styles.social}><button type="button" onClick={() => unavailable("Google sign-in")}><img src={asset("imgIcon")} alt="" />{signup ? "Continue with Google" : "Google"}</button>{!signup && <button type="button" onClick={() => unavailable("OTP login")}>Log in with OTP</button>}</div>
      <p className={styles.switch}>{signup ? "Already have an account? " : "New to Deshaatan? "}<button type="button" onClick={() => switchMode(!signup)}>{signup ? "Log in" : "Create an account"}</button></p>
      {!signup && <div className={styles.benefits}><h3>Why travellers choose Deshaatan</h3><div>{benefits.map(([title, subtitle]) => <div className={styles.benefit} key={title}><img src="/figma/auth/login-imgTickBadge.svg" alt="" /><div><strong>{title}</strong><span>{subtitle}</span></div></div>)}</div></div>}
      {message && <p className={styles.status} role="status">{message}</p>}
    </form>
  </div>;
}
