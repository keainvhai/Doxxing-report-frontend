import { Link } from "react-router-dom";
import "../styles/Footer.css"; // 样式文件可选

function Footer() {
  return (
    <footer className="footer">
      <div className="scrolling-text">
        © 2025 Doxxing Report | <Link to="/about">About Us</Link>
      </div>
    </footer>
  );
}

export default Footer;
