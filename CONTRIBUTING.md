# Contributing to RSG Platform

First off, thank you for considering contributing to RSG Platform! 🎤

## Code of Conduct

This project and everyone participating in it is governed by respect and professionalism. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**
- **Include your environment details** (OS, Node version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code lints
5. Issue that pull request!

## Development Process

### Setting Up Development Environment

```bash
# Clone your fork
git clone https://github.com/your-username/azure-rsg.git
cd azure-rsg

# Install dependencies
npm install
cd app && npm install

# Set up environment
cp .env.template .env
# Edit .env with your values

# Start development server
npm run dev
```

### Coding Style

- Use 2 spaces for indentation
- Use semicolons
- Follow the existing code style
- Run `npm run lint` before committing
- Write meaningful commit messages

### Commit Messages

Format: `type(scope): subject`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add Google OAuth login
fix(beats): resolve upload error for large files
docs(readme): update installation instructions
```

### Running Tests

```bash
cd app
npm test
```

### Running Linter

```bash
cd app
npm run lint
npm run lint:fix  # Auto-fix issues
```

## Project Structure

```
azure-rsg/
├── app/              # Main application
├── infra/            # Terraform infrastructure
├── .github/          # GitHub Actions workflows
└── docs/             # Documentation
```

## Additional Notes

### Issue and Pull Request Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

---

Thank you for contributing to RSG Platform! 🎤
