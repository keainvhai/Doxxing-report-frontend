import React from "react";
import "../styles/AboutUs.css";

function AboutUs() {
  return (
    <div className="about-us-container">
      <h1>About Doxxing Report</h1>

      <h2>What is a Doxxing Incident?</h2>
      <p>
        Doxxing (also called "Doxing") is the practice of the malicious, public
        online posting of private information about others without their
        consent. A doxing incident is an incident involving doxing
      </p>

      <h2>Why Doxing Report?</h2>
      <p>
        Doxing has gradually become a serious cybersecurity threat, causing harm
        to over 43 million Americans (Bleih, 2023), where the doxed can be
        affected in finding a job (Roth et al., 2024), lose their job, and feel
        mentally stressed, be discriminated against in the workplace, and get
        stigmatized in cyberspace (Shan et al., 2024). Also, doxing can be a
        serious cybersecurity issue for companies. Doxing companies and their
        employees occupying key positions (e.g., CEO) can increase
        cybercriminals, such as business e-mail compromise attacks, email and
        phone phishing, and identity theft, causing harm to both employees and
        companies (Larkina & Dedenok, 2021). To mitigate the harms of doxing by
        increasing its awareness, we built a doxing incident reporting platform,
        which generates a doxing incident database as public research
        infrastructure. Through the platform, we will offer future doxing
        victims or bystanders a platform to report doxing incidents and a
        channel for people to search for doxing incidents. Also, our research
        provides doxing incident data and a proof-of-concept for future studies
        on doxing and its impact.
      </p>
      <h3>References</h3>
      <ol className="reference-list">
        <li>
          Bleih, A. (2023).{" "}
          <i>Executive doxing details are flooding the dark web</i>.
          Cybersixgill.
          <a
            href="https://cybersixgill.com/news/articles/doxing-details-are-flooding-the-dark-web"
            target="_blank"
            rel="noopener noreferrer"
          >
            [Link]
          </a>
        </li>
        <li>
          Larkina, A., & Dedenok, R. (2021).{" "}
          <i>Doxing in the corporate sector</i>. Securelist.
          <a
            href="https://securelist.com/corporate-doxing/101513/"
            target="_blank"
            rel="noopener noreferrer"
          >
            [Link]
          </a>
        </li>
        <li>
          Roth, P. L., Bobko, P., Shan, G., Roth, R. W., Ferrise, E., &
          Thatcher, J. B. (2024).
          <i>
            Doxing, political affiliation, and type of information: Effects on
            suspicion, perceived similarity, and hiring-related judgments
          </i>
          . Journal of Applied Psychology, 109(5), 730-754.
        </li>
        <li>
          Shan, G., Pu, W., Thatcher, J. B., & Roth, P. (2024).
          <i>
            How does doxing on social media lead to social stigma and perceived
            dignity?
          </i>
          Hawaii International Conference on System Sciences.
        </li>
      </ol>

      <h2>Current and Future Users</h2>
      <p>
        We encourage you to explore our database, review existing cases, and
        contribute new reports to support a safer internet. <br />
        For researchers, please feel free to use our data. If you use our data,
        please cite our paper.
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
        Doxing incident platform is an open, collaborative project. If you are
        interested in contributing reports, research, or technical improvements,
        please contact us!
      </p>
    </div>
  );
}

export default AboutUs;
