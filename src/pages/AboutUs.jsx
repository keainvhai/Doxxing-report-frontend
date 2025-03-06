import React from "react";
import "../styles/AboutUs.css";

function AboutUs() {
  return (
    <div className="about-us-container">
      <h1>About Doxxing Report</h1>

      <h2>Why "Doxxing Report"?</h2>
      <p>
        {/* Online privacy is under constant threat, with personal information often
        exposed maliciously in what is known as doxxing attacks. Doxxing Report
        is built to provide a public platform where incidents of doxxing can be
        reported, documented, and analyzed to help researchers, developers, and
        policymakers prevent similar harms in the future. */}
      </p>

      <h2>What is a Doxxing Incident?</h2>
      <p>
        {/* We define a doxxing incident as the intentional or unintentional
        exposure of sensitive personal information, leading to risks such as
        harassment, stalking, or identity theft. Example incidents may include: */}
      </p>
      <ul>
        {/* <li>Personal addresses leaked on social media</li>
        <li>Phone numbers shared without consent in online forums</li>
        <li>Private photographs exposed in public channels</li> */}
      </ul>
      <p>
        We encourage you to explore our database, review existing cases, and
        contribute new reports to support a safer internet.
      </p>

      <h2>Current and Future Users</h2>
      <p>
        {/* Our platform is used by researchers, privacy advocates, legal scholars,
        journalists, and developers aiming to understand and mitigate the
        real-world impacts of doxxing.
      </p>
      <p>
        Future development will expand through open-source contributions,
        including improved classifications and analysis of reported incidents. */}
      </p>

      <h2>When Should You Report an Incident?</h2>
      <p>
        If you are unsure whether an event qualifies as a doxxing incident,
        please submit it! Our community helps define the boundaries of online
        privacy threats through shared experience and case studies.
      </p>

      <h2>Our Team</h2>
      <ul>
        <li>
          <strong>
            <a
              href="https://damore-mckim.northeastern.edu/people/guohou-shan/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Guohou Shan
            </a>
          </strong>{" "}
          – Assistant Professor of Supply Chain & Information Management at
          Northeastern University.
        </li>
        <li>
          <strong>
            <a
              href="https://damore-mckim.northeastern.edu/people/christoph-riedl/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Christoph Riedl
            </a>
          </strong>{" "}
          – Professor of Supply Chain and Information Management and
          D'Amore-McKim Humanics Leader at Northeastern University.
        </li>
        <li>
          <strong>Fei Xue</strong> – Master student in Information Systems at
          Northeastern University.
        </li>
      </ul>

      <h2>Join Us</h2>
      <p>
        Doxxing Report is an open, collaborative project. If you are interested
        in contributing reports, research, or technical improvements, please
        contact us!
      </p>
    </div>
  );
}

export default AboutUs;
