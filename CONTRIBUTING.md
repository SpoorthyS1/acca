# Contributing to ACCA 🤝

First off, thank you for considering contributing to ACCA! It's people like you that make ACCA such a great tool for the architectural community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by respect, professionalism, and inclusivity. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Collaborative**: Work together and help each other
- **Be Professional**: Keep discussions focused and constructive
- **Be Inclusive**: Welcome people of all backgrounds and experiences

## 🎯 How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Node Version: [e.g., 18.0.0]
- ACCA Version: [e.g., 0.0.0]
```

### Suggesting Enhancements 💡

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the proposed functionality
- **Explain why this enhancement would be useful**
- **Include mockups or examples** if applicable

### Contributing Code 💻

1. **Find an Issue**: Look for issues labeled `good first issue` or `help wanted`
2. **Comment on the Issue**: Let others know you're working on it
3. **Fork and Branch**: Create your feature branch
4. **Make Changes**: Implement your feature or fix
5. **Test Thoroughly**: Ensure everything works
6. **Submit PR**: Create a pull request

## 🛠️ Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git
- Google Gemini API Key

### Setup Steps

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/acca.git
   cd acca
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/SpoorthyS1/acca.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open browser** at `http://localhost:3000`

### Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] Changes have been tested locally
- [ ] No console errors or warnings
- [ ] All existing functionality still works
- [ ] New features include appropriate comments
- [ ] Commit messages follow guidelines

### Submitting a PR

1. **Update your branch** with latest upstream changes
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Reference to related issues (e.g., "Fixes #123")
   - Screenshots if UI changes are involved

4. **Address Review Comments**: Be responsive to feedback

5. **Merge**: Once approved, your PR will be merged!

### PR Title Format

```
<type>: <short description>

Examples:
feat: Add support for multiple floor analysis
fix: Correct 3D model rotation calculations
docs: Update installation instructions
style: Improve button hover animations
refactor: Simplify compliance checking logic
```

## 📝 Coding Guidelines

### TypeScript Standards

- **Use TypeScript** for all new code
- **Define types** for all function parameters and return values
- **Use interfaces** for object shapes
- **Avoid `any` type** unless absolutely necessary

### React Best Practices

- **Functional Components**: Use functional components with hooks
- **Component Size**: Keep components focused and under 300 lines
- **Props Typing**: Always type your component props
- **State Management**: Use appropriate hooks (useState, useEffect, etc.)

### Code Style

- **Indentation**: 2 spaces
- **Semicolons**: Optional (project uses no semicolons)
- **Quotes**: Single quotes for strings
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for components and types
  - `UPPER_SNAKE_CASE` for constants

### File Organization

```typescript
// 1. Imports (React, then third-party, then local)
import React, { useState } from 'react';
import { SomeLibrary } from 'some-library';
import { LocalComponent } from './LocalComponent';

// 2. Types/Interfaces
interface MyComponentProps {
  // ...
}

// 3. Constants
const DEFAULT_VALUE = 42;

// 4. Component
const MyComponent: React.FC<MyComponentProps> = ({ prop1 }) => {
  // Hooks first
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = () => {
    // ...
  };
  
  // Render
  return (
    // JSX
  );
};

// 5. Export
export default MyComponent;
```

### Comments

- **Use comments** to explain "why", not "what"
- **Document complex logic** with clear explanations
- **Avoid obvious comments** like `// Set x to 5`
- **Keep comments up-to-date** with code changes

### Testing

While ACCA doesn't currently have a comprehensive test suite, when adding tests:

- Test user-facing functionality
- Test edge cases and error conditions
- Use descriptive test names
- Keep tests focused and independent

## 💬 Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Good commits
feat: add support for metric measurements
fix: resolve 3D model clipping issue
docs: update API key setup instructions
style: improve compliance panel layout

# Bad commits
update stuff
fix bug
changes
```

## 🎨 UI/UX Contributions

When contributing UI/UX changes:

- **Follow the existing design system** (dark theme, color palette)
- **Maintain consistency** with existing components
- **Test on multiple screen sizes**
- **Include screenshots** in your PR
- **Ensure accessibility** (keyboard navigation, screen readers)

## 🌟 Recognition

Contributors will be recognized in:
- README.md acknowledgments section
- GitHub contributors page
- Release notes when applicable

## 📞 Questions?

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and general discussion

---

Thank you for contributing to ACCA! Every contribution, no matter how small, helps make architectural compliance more accessible to everyone. 🏗️✨
