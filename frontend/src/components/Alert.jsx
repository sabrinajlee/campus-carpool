// <Alert type="error">Couldn't post your ride. Try again.</Alert>
// <Alert type="success">Your email is verified. You can log in now.</Alert>
// <Alert>A new link is on its way.</Alert>            (type="info" is the default)
// type: "info" | "success" | "error"
export default function Alert({ type = "info", children }) {
  return (
    <div className={`alert alert--${type}`} role={type === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
