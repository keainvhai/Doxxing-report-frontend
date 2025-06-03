#  Doxxing Incident Database

The Doxxing Incident Database is a public platform for documenting and analyzing real-world doxxing cases.  
It aims to improve public awareness, support academic and industry research, and provide a reporting and tracking channel for victims and bystanders.

Doxxing refers to the malicious act of publicly releasing someone’s private information online without consent. Over 43 million Americans have been affected, facing unemployment, workplace discrimination, and mental health issues. Despite the severity, doxxing often goes undocumented due to the lack of a centralized reporting infrastructure. This platform addresses that gap.

> 🌐 Live site: [https://doxxing-report.vercel.app](https://doxxing-report.vercel.app)  
> 📄 Cite our work: *Preventing Real-world Doxing by Cataloging Incidents: A Doxing Incident Database*

---


##  Goals & Motivation

- Establish a **centralized infrastructure** for reporting and accessing doxxing cases
- Assist researchers in **quantitative studies** on doxxing's impact
- Offer **anonymous and registered submission** options for real-world victims and bystanders
- Enable **automatic aggregation** of online doxxing news via algorithmic crawlers
- Integrate **generative AI** to enhance summarization and visualization of incidents

---

##  System Architecture

The platform follows a **three-tier architecture**:

### 1. Presentation Layer
- Built with `React.js` and Vite
- Responsive UI for browsing incidents, advanced search, and submission
- Visual display includes bookshelf view and entity-based filtering

### 2. Logic Layer
- Powered by `Node.js` and `Express.js`
- Handles incident search, submission, authentication, image generation, summarization, and data crawling

### 3. Data Layer
- `MySQL` stores user accounts, reports, summaries, images, and crawler results
- Cloudinary is used for image storage

---

##  Platform Functions
The following diagram illustrates a typical user flow on the platform — from registering an account to browsing, reporting incidents, and accessing summaries and data:
![User Flow Diagram](./assets/user-flow.png)

###  Reporting Doxxing Incidents
- Anonymous or registered submission
- Fields: URL, title, date, optional victim name, description, images
- Users can upload an image or use **DALL·E 3** to generate one via OpenAI API

###  Searching & Browsing
- Keyword and advanced filter search by:
  - Source
  - Publish date
  - Event date
- Entity-based quick filtering

###  Weekly Summary
- **ChatGPT** generates an automated summary of 50 recent incidents
- Summary is regenerated weekly and viewable on the homepage

###  User Accounts
- Register and verify by email
- Track submission history
- Modify username and delete reports

###  Leaderboard
- Visualizes most active contributors
- Rankings are based on submission counts

###  News Crawler
- Automatically scrapes new incidents from external news sources
- Integrated into backend; runs weekly

###  Download Data
- Researchers and practitioners can download CSV-formatted data
- Citation required when using the data (see below)

---
##  System Architecture

This project is built with a **three-tier architecture**:

1. **Presentation Layer**  
   - Built with `React.js` (Vite + JavaScript)
   - Responsive UI for both desktop and mobile

2. **Logic Layer**  
   - RESTful backend built with `Node.js + Express`
   - Handles submission, search, AI tasks, and API requests

3. **Data Layer**  
   - `MySQL` stores all user submissions, account data, and AI-generated content
   - Supports both user-submitted and algorithmically collected reports

---

##  Using the Data

You may download data directly from our platform for research or analysis.  
Please **cite our paper** when using the data:

> Shan, G., Riedl, C., & Fei, X. (2025). *Preventing Real-world Doxing by Cataloging Incidents: A Doxing Incident Database*. Available at SSRN 5196388. [https://ssrn.com/abstract=5196388](https://ssrn.com/abstract=5196388)


---

##  Tech Stack & Services

| Layer       | Tech / Service                   |
|-------------|----------------------------------|
| Frontend    | React.js, Vite, JavaScript       |
| Backend     | Node.js, Express.js              |
| Database    | MySQL                            |
| AI Services | OpenAI API (ChatGPT + DALL·E 3)  |
| Image CDN   | Cloudinary                       |
| Deployment  | Vercel (frontend), Railway (backend) |
| Automation  | GitHub Actions                   |

---

##  Contact

For questions or suggestions, feel free to:

-  Email the team:
  - Christoph Riedl: `c.riedl@northeastern.edu`
  - Guohou Shan: `g.shan@northeastern.edu`  
  - Fei Xue: `xue.f1@northeastern.edu`  

---

##  More

- [Paper on SSRN](https://ssrn.com/abstract=5196388)
- [Doxxing Report Website](https://doxxing-report.vercel.app)

Let’s work together to bring visibility to doxxing and reduce its harm.
