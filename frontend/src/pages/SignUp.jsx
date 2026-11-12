import { PageHeader } from "../components";

// Owner: Ellie — see docs/frontend.md
export default function SignUp() {
  return (
    <div className="app-shell">
      <main className="page">
        <PageHeader title="Sign up" subtitle="Use your Western email." showBack />
        <p className="todo">TODO: name, @uwo.ca email, password, confirm password (not in Figma yet)</p>
      </main>
    </div>
  );
}
