<div align="center">
<img width="1200" height="475" alt="ACCA Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🏗️ ACCA - Architectural Code Compliance Agent

**AI-Powered Architectural Compliance Made Simple**

[![React](https://img.shields.io/badge/React-19.2.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.181.2-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-1.32.0-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

[View Live Demo](https://ai.studio/apps/drive/1CBO3fT6xEnT8eAy5cYQu47rvcYysk79R) • [Report Bug](https://github.com/SpoorthyS1/acca/issues) • [Request Feature](https://github.com/SpoorthyS1/acca/issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [API Key Setup](#api-key-setup)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 About

**ACCA (Architectural Code Compliance Agent)** is an innovative AI-powered web application that revolutionizes architectural design compliance checking. Upload a floor plan or describe your architectural vision, and ACCA instantly generates:

- 📐 **Interactive 2D Blueprints** with before/after compliance corrections
- 🎨 **Stunning 3D Models** that bring your designs to life
- ✅ **Comprehensive IRC 2021 Compliance Audits** with detailed violation reports
- 🔧 **Automated Fix Recommendations** to meet building code standards

Whether you're an architect, builder, student, or homeowner, ACCA makes building code compliance accessible, visual, and effortless.

---

## ✨ Features

### 🤖 AI-Powered Analysis
- **Smart Text-to-Blueprint**: Describe your design in natural language and watch it come to life
- **Image Recognition**: Upload existing floor plans for instant analysis
- **Gemini AI Integration**: Powered by Google's advanced Gemini AI for accurate interpretations

### 📊 Compliance Checking
- **IRC 2021 Standards**: Comprehensive auditing against International Residential Code 2021
- **Multi-Category Analysis**: Spatial requirements, egress safety, structural compliance
- **Severity Ratings**: Violations categorized as High, Medium, or Low priority
- **Location-Specific**: Adapts to your jurisdiction's building codes

### 🎨 Visualization Tools
- **Interactive 2D Blueprints**: Side-by-side comparison of original vs. corrected designs
- **Real-Time 3D Models**: Explore your architectural design in immersive 3D
- **Room-by-Room Details**: Windows, doors, furniture, and fixtures rendered accurately
- **Violation Highlighting**: Visual markers showing exactly where issues occur

### 📱 Modern UI/UX
- **Sleek Dark Theme**: Professional, eye-friendly interface
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Smooth Animations**: Polished transitions and loading states
- **Intuitive Navigation**: Tab-based views for Audit, Blueprint, and 3D Model

---

## 🛠️ Technology Stack

### Frontend Framework
- **React 19.2.1** - Modern component-based UI library
- **TypeScript 5.8.2** - Type-safe development experience
- **Vite 6.2.0** - Lightning-fast build tool and dev server

### 3D Graphics
- **Three.js 0.181.2** - WebGL-powered 3D rendering engine
- **@react-three/fiber 9.4.2** - React renderer for Three.js
- **@react-three/drei 10.7.7** - Useful helpers for react-three-fiber

### AI & APIs
- **@google/genai 1.32.0** - Google Gemini AI SDK for intelligent analysis

### UI Components
- **lucide-react 0.556.0** - Beautiful, consistent icon set
- **Custom Components** - Hand-crafted UI elements for architectural data

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Google Gemini API Key** - [Get your free API key](https://ai.google.dev/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SpoorthyS1/acca.git
   cd acca
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### API Key Setup

ACCA requires a Google Gemini API key to function. Follow these steps:

1. **Get your API key**
   - Visit [Google AI Studio](https://ai.google.dev/)
   - Sign in with your Google account
   - Navigate to "Get API Key" and create a new key

2. **Create environment file**
   ```bash
   # Create a .env.local file in the project root
   touch .env.local
   ```

3. **Add your API key**
   
   Open `.env.local` and add:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   
   ⚠️ **Important**: Never commit your `.env.local` file to version control!

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000` to see ACCA in action! 🎉

---

## 💡 Usage

### Text-Based Design

1. **Enter Location**: Start by specifying your location (e.g., "Los Angeles, CA") for jurisdiction-specific code compliance
2. **Choose Text Mode**: Select "Describe Your Design"
3. **Describe Your Vision**: Write a natural language description like:
   ```
   A 2-bedroom, 1-bathroom house with an open kitchen and living room,
   approximately 1200 sq ft. Include a garage and large windows in the living area.
   ```
4. **Analyze**: Click "Analyze Design" and watch the magic happen!

### Image-Based Analysis

1. **Enter Location**: Specify your jurisdiction
2. **Choose Image Mode**: Select "Upload Blueprint"
3. **Upload File**: Choose a floor plan image (PNG, JPEG, or PDF)
4. **Analyze**: ACCA will process your blueprint and generate compliance reports

### Exploring Results

- **Audit Report Tab**: View detailed compliance violations, severity levels, and fix recommendations
- **Blueprint Comparison Tab**: See original vs. corrected floor plans side-by-side
  - Toggle between "Original" and "Corrected" views
- **3D Visualization Tab**: Explore an interactive 3D model
  - **Orbit**: Left-click + drag
  - **Pan**: Right-click + drag
  - **Zoom**: Mouse scroll

---

## 📁 Project Structure

```
acca/
├── components/           # React components
│   ├── Blueprint2D.tsx   # 2D floor plan renderer
│   ├── CompliancePanel.tsx # Violation report display
│   ├── InputPanel.tsx    # User input interface
│   └── Model3D.tsx       # 3D model viewer
├── services/
│   └── geminiService.ts  # AI integration logic
├── App.tsx               # Main application component
├── types.ts              # TypeScript type definitions
├── constants.ts          # App-wide constants
├── index.tsx             # Application entry point
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
└── README.md             # You are here!
```

---

## 🔍 How It Works

1. **Input Processing**: User provides location + text description or blueprint image
2. **AI Analysis**: Gemini AI processes the input and generates:
   - Structured room layouts with dimensions
   - Feature placement (windows, doors, furniture)
   - IRC 2021 compliance assessment
3. **Violation Detection**: Code checks against spatial requirements, egress rules, and structural standards
4. **Correction Generation**: AI proposes compliant alternatives
5. **Visualization**: Data rendered as 2D blueprints and 3D models using Three.js
6. **Report Display**: Comprehensive audit report with actionable recommendations

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create! Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write clear, descriptive commit messages
- Add comments for complex logic
- Test your changes thoroughly before submitting
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the powerful AI capabilities
- **Three.js Community** for excellent 3D rendering tools
- **React Team** for the amazing frontend framework
- **ICC (International Code Council)** for IRC 2021 standards
- All contributors and users who make this project better!

---

<div align="center">

**Built with ❤️ by [SpoorthyS1](https://github.com/SpoorthyS1)**

If you find this project helpful, please consider giving it a ⭐!

</div>
