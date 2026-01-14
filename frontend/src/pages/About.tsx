import { Link } from "react-router-dom";
import {
  buttonClasses,
  containerClasses,
  cardClasses,
  textClasses,
} from "../theme";

export default function About() {
  return (
    <div className={containerClasses.secondary}>
      <div className={cardClasses.default}>
        <h1 className={textClasses.heading}>About</h1>
        <p className={textClasses.description}>
          This is a demo of a Rust + Rocket backend serving a React SPA with
          TypeScript, Vite, Tailwind CSS, and React Router.
        </p>
        <Link to="/" className={buttonClasses.secondary}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
