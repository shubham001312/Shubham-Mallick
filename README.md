# Shubham Mallick - Personal Portfolio Website

A premium, modern, and highly interactive developer portfolio featuring a customizable glassmorphic design, light/dark mode support, responsive layouts, filterable project categories, and an interactive contact form.

## 🚀 Live Demo & Deployment

This project is configured to be immediately deployable via **GitHub Pages**. 

### Quick Deployment Steps:
1. **Create a GitHub Repository**:
   - Go to [GitHub](https://github.com) and create a new repository (e.g., `portfolio` or `shubham-mallick`).
2. **Push the Files to GitHub**:
   - Initialize git in your project folder, commit your files, and push them to your repository:
     ```bash
     git init
     git add .
     git commit -m "Initialize portfolio site"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
     git push -u origin main
     ```
3. **Enable GitHub Pages**:
   - Go to your repository **Settings** tab on GitHub.
   - Click on **Pages** in the left sidebar.
   - Under **Build and deployment**, select **Deploy from a branch**.
   - Under **Branch**, choose `main` (or `master`) and folder `/ (root)`.
   - Click **Save**.
   - After a minute, your website will be live at `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`!

---

## 🛠️ Customization Details

### 1. Contact Form Backend Setup
The contact form comes with an interactive user interface ready to connect to a free backend form handler. To make the form send emails directly to `shubham.mallick1440@gmail.com`:

*   **Option A: Formspree (easiest)**:
    1. Sign up for a free account at [Formspree](https://formspree.io).
    2. Create a new form and copy the endpoint URL (e.g. `https://formspree.io/f/xoqyzabc`).
    3. Open `index.html`, find the `<form id="contact-form" ...>` tag (near line 440) and update it:
       ```html
       <form id="contact-form" action="https://formspree.io/f/YOUR_ENDPOINT_ID" method="POST">
       ```
    4. Ensure the input fields have a `name="..."` attribute (e.g. `name="name"`, `name="email"`, `name="package"`, `name="message"`).

*   **Option B: EmailJS (client-side JS)**:
    1. Sign up at [EmailJS](https://www.emailjs.com/).
    2. Replace the `handleFormSubmit` function in the `<script>` block with the EmailJS initialization code to send messages directly from the client.

### 2. Changing Projects
You can add or update projects in the `<div class="projects-grid" id="projects-grid">` section (around line 348). Add the appropriate `data-category` attribute to cards for filtering to work:
*   `data-category="ai-ml"` (AI & Machine Learning)
*   `data-category="fullstack"` (Full Stack)
*   `data-category="systems"` (Systems / C / Embedded)

---

## 💅 Features Built-in

*   **Modern Slate/Violet Glow Palette**: Using HSL CSS custom properties to maintain theme harmony.
*   **Dual Mode support**: Seamless light-theme and dark-theme toggle with state memory saved in user `localStorage`.
*   **Aesthetic Background Glows**: Blurry animated ambient backdrops that look great on premium displays.
*   **Micro-interactions**: Hover effects, ripple badges, smooth filters, select-package sync, and sliding navigation underlines.
