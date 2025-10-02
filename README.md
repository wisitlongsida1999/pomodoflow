# 🍅 PomodoFlow - Focus & Flow

A beautiful and modern Pomodoro timer Progressive Web App (PWA) designed to boost your productivity through focused work sessions and intelligent task management.

## ✨ Features

- **⏱️ Pomodoro Timer** - Classic 25/5/15 minute work/break cycles
- **📝 Task Management** - Add, organize, and track tasks with Pomodoro estimates
- **📊 Statistics** - Track your daily and weekly productivity metrics
- **🎨 Modern UI** - Clean, responsive design with dark/light theme support
- **🔔 Smart Notifications** - Browser notifications and customizable sound alerts
- **📱 PWA Support** - Install on mobile devices and desktop for offline use
- **⚙️ Customizable Settings** - Adjust timer durations, notifications, and preferences
- **📈 Progress Tracking** - Visual charts and completion statistics
- **🌐 Cross-Platform** - Works on all modern browsers and devices

## 🚀 Quick Start

### Live Demo
Visit the live application: [PomodoFlow Demo]([https://your-username.github.io/pomodoflow](https://wisitlongsida1999.github.io/pomodoflow/))

### Basic Usage
1. Open the app in your browser
2. Add a task with estimated Pomodoros needed
3. Select the task and click "Start" to begin a 25-minute focus session
4. Take breaks when prompted
5. Track your progress and statistics

## 📱 Installation

### Browser Usage
Simply visit the web app URL in any modern browser.

### Install as PWA
1. **Chrome/Edge**: Click the install icon in the address bar
2. **Safari**: Share → Add to Home Screen
3. **Mobile**: Use "Add to Home Screen" option in browser menu

The app works offline once installed!

## 🎯 Usage Guide

### Timer Modes
- **🍅 Focus (25 min)** - Deep work sessions
- **☕ Short Break (5 min)** - Quick rest between Pomodoros
- **🧘 Long Break (15 min)** - Extended break every 4 Pomodoros

### Task Management
1. **Add Tasks**: Enter task description and estimate Pomodoros needed
2. **Select Task**: Click on a task to make it active
3. **Track Progress**: Monitor completed vs. estimated Pomodoros
4. **Complete Tasks**: Check off finished tasks

### Settings & Customization
- Adjust timer durations (1-60 minutes)
- Configure break intervals
- Enable/disable notifications and sounds
- Customize volume levels
- Set auto-start preferences

### Statistics
- View daily and weekly Pomodoro counts
- Track total focus time
- Monitor task completion rates
- Analyze productivity trends with charts

## ⚙️ Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PWA**: Service Worker, Web App Manifest
- **Storage**: Local Storage for data persistence
- **Charts**: Canvas-based visualization
- **Responsive**: CSS Grid & Flexbox
- **Icons**: Emoji-based iconography

## 🌐 Deployment

### 🤖 Fully Automated GitHub Pages Deployment (Recommended)

This project includes **100% automated GitHub Actions** deployment. Just push your code and everything happens automatically - no manual configuration needed!

#### ⚡ One-Step Setup:

```bash
git add .
git commit -m "Deploy with full automation"
git push origin main
```

**That's it!** The workflow automatically:
- ✅ **Enables GitHub Pages** if not already enabled
- ✅ **Configures Pages source** to use GitHub Actions
- ✅ **Sets up all permissions** automatically
- ✅ **Builds and deploys** your site
- ✅ **Provides live URL** in the Actions logs

#### 🎯 Zero Configuration Features:
- 🚀 **Auto-enablement**: GitHub Pages gets enabled automatically
- ⚙️ **Auto-configuration**: All settings configured via API
- 🔧 **Auto-permissions**: Workflow permissions set automatically
- 📱 **Auto-PWA**: Manifest and service worker deployed correctly
- 🌐 **Auto-HTTPS**: Secure deployment with automatic certificates

#### 🎉 What Happens When You Push:
1. **Setup Job** - Checks and enables GitHub Pages automatically
2. **Build Job** - Optimizes and prepares your PomodoFlow app
3. **Deploy Job** - Publishes to `https://[username].github.io/pomodoflow`
4. **Success** - Your app is live in 1-2 minutes!

#### 📊 Monitoring:
- Go to **Actions** tab to watch real-time deployment
- Green checkmarks = successful deployment
- Live URL displayed in deployment logs
- Automatic error handling and retries

#### 🔄 Continuous Deployment:
Every future push to main branch automatically updates your live site!

### Manual GitHub Pages Deployment (Alternative)

If you prefer manual deployment:

1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **"Deploy from a branch"**
   - Choose **"main"** branch and **"/ (root)"** folder
   - Click **Save**

3. **Manual Updates**
   - Push code to main branch
   - Wait 5-10 minutes for GitHub to rebuild
   - Check your live site for updates

### Custom Domain Setup

1. **Add CNAME file**
   ```bash
   echo "yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push origin main
   ```

2. **Configure DNS**
   - Add CNAME record pointing to `[username].github.io`
   - Or add A records for apex domain:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

3. **Enable HTTPS**
   - Go to **Settings** → **Pages**
   - Check **"Enforce HTTPS"**

### Other Hosting Options
- **Netlify**: Drag & drop deployment or Git integration
- **Vercel**: Connect GitHub repo for automatic deployments
- **Firebase Hosting**: Google's hosting platform with CLI tools

## 🛠️ Development

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pomodoflow.git
   cd pomodoflow
   ```

2. Open with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. Open `http://localhost:8000` in your browser

### File Structure
```
pomodoflow/
├── index.html          # Main HTML file
├── style.css           # Styles and responsive design
├── script.js           # Application logic
├── manifest.json       # PWA manifest
├── LICENSE             # Apache 2.0 License
└── README.md           # This file
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contributions
- New timer themes and color schemes
- Additional productivity features
- Improved statistics and analytics
- Better mobile responsiveness
- Accessibility improvements
- Internationalization (i18n)

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the Pomodoro Technique® by Francesco Cirillo
- Built with modern web technologies
- Icons and emojis for enhanced user experience

---

**Start your productive journey today! 🚀**

*Focus. Flow. Achieve.*
