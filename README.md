# Prompt Tester - AI Model Response Testing Platform

**Compare, evaluate, and optimize AI model responses across multiple providers with a unified testing interface.**

![Prompt Tester Dashboard](https://user-images.githubusercontent.com/YOUR_USERNAME/prompt-tester-dashboard.png)

## Table of Contents

- [About the Project](#about-the-project)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About the Project

![Test Results Comparison](https://github.com/user-attachments/assets/0a4ba47d-cb0e-44e3-aac8-80c3c3961402)

### What is Prompt Tester?

Prompt Tester is a powerful React-based application designed for developers, researchers, and AI enthusiasts who need to systematically test and compare responses from multiple language models. It provides a unified interface for creating test cases, executing them across different models, and evaluating the results with built-in grading capabilities.

### Problem It Solves

Working with multiple AI models presents several challenges:
- **Inconsistent Testing**: Manual testing across different model providers is time-consuming and error-prone
- **Lack of Comparison Tools**: Difficult to compare responses side-by-side from different models
- **No Systematic Evaluation**: No standardized way to grade and track model performance over time
- **API Fragmentation**: Each provider has different interfaces and requirements

Prompt Tester addresses these issues by providing a centralized platform for systematic AI model testing and evaluation.

### Core Features

- **📝 Test Case Management**: Create, organize, and reuse test cases with rich prompt configurations
- **🤖 Multi-Model Support**: Test against multiple AI models simultaneously through OpenRouter or self-hosted endpoints
- **📊 Results Dashboard**: Visualize and compare model responses with side-by-side comparisons
- **⭐ Grading System**: Evaluate and score model responses with customizable grading criteria
- **🔄 Round-Trip Testing**: Support for translation and back-translation workflows
- **💾 Persistent Storage**: All test cases, results, and grades stored locally using IndexedDB
- **🌍 Internationalization**: Multi-language support (English/Dutch)
- **🎨 Theme Support**: Dark and light mode for comfortable viewing

### Unique Selling Points

- **Privacy-First**: All data stored locally in your browser - no backend required
- **Self-Hosted Model Support**: Connect to your own LLM deployments
- **Export Capabilities**: Export results to various formats for further analysis
- **Real-Time Testing**: Execute tests and see results immediately
- **No Account Required**: Start testing immediately without sign-up

## Getting Started

### Prerequisites

Before running Prompt Tester, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

Optional:
- **OpenRouter API Key** - [Get one here](https://openrouter.ai/)
- **Local LLM server** - For self-hosted model testing

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/mat50013/prompt-tester.git
cd prompt-tester
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
# Create a .env file in the root directory
touch .env

# Add your OpenRouter API key (optional)
echo "VITE_OPENROUTER_API_KEY=your-api-key-here" >> .env
```

4. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Running the Application

**Development Mode:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm run preview
```

**Linting:**
```bash
npm run lint
```

**Code Formatting:**
```bash
npm run format
```

### Basic Workflow

1. **Create Test Cases**: Navigate to the Test Editor tab and create your test prompts
2. **Select Models**: Go to the Models tab and choose which AI models to test
3. **Run Tests**: Execute your test cases against selected models
4. **View Results**: Switch to the Results Dashboard to compare responses
5. **Grade Responses**: Use the grading dialog to evaluate and score model outputs
6. **Export Data**: Export your results for further analysis or reporting

### Key Features Usage

**Test Case Creation:**
- Support for system prompts and user messages
- Save and organize multiple test cases
- Include context and expected outcomes

**Model Configuration:**
- Configure multiple models from OpenRouter
- Set up connections to self-hosted models
- Adjust model parameters (temperature, max tokens, etc.)

**Round-Trip Testing:**
- Enable round-trip mode for translation testing
- Automatically translate and back-translate responses
- Compare original and round-trip results

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# OpenRouter Configuration
VITE_OPENROUTER_API_KEY=your-openrouter-api-key
VITE_OPENROUTER_API_URL=https://openrouter.ai/api/

# Development Mode
VITE_DEV=true

# Optional: Custom API endpoints
VITE_CUSTOM_API_ENDPOINT=http://localhost:5800
```

### Self-Hosted Model Configuration

For local LLM testing, the application proxies requests through:
- Development: `http://localhost:5800`
- Production: Configurable via Settings Panel

Configure your local LLM server to accept requests on port 5800 or update the proxy configuration in `vite.config.js`.

### Browser Storage

The application uses IndexedDB for data persistence. Data is stored in:
- Database name: `PromptTesterDB`
- Tables: `testCases`, `results`, `grades`, `settings`

To clear all data, use your browser's developer tools to clear IndexedDB storage.

## Roadmap

### Current Version (v1.0.0)
- ✅ Multi-model testing interface
- ✅ Results comparison dashboard
- ✅ Manual grading system
- ✅ Local data persistence
- ✅ Dark/Light theme support
- ✅ Round-trip translation testing

### Future Features

#### 1. **Automated Testing Pipelines**
- **Description**: Schedule and run test suites automatically at specified intervals, with webhook integration for CI/CD pipelines and automated reporting via email or Slack.
- **Impact**: Enables continuous model performance monitoring, helps catch model degradation early, and integrates AI testing into existing development workflows.

#### 2. **Advanced Analytics Dashboard**
- **Description**: Comprehensive analytics with performance trends over time, model comparison matrices, cost analysis per model/token, response time tracking, and custom metric definitions.
- **Impact**: Provides data-driven insights for model selection, helps optimize costs, and enables evidence-based decisions on model deployment.

#### 3. **Collaborative Testing Workspace**
- **Description**: Share test cases and results with team members, collaborative grading with multiple reviewers, comments and annotations on responses, and team management features.
- **Impact**: Facilitates team-based model evaluation, ensures consistent testing standards across organizations, and speeds up the evaluation process.

#### 4. **Prompt Optimization Assistant**
- **Description**: AI-powered suggestions for improving prompts, A/B testing framework for prompt variations, automatic prompt refinement based on results, and prompt template library.
- **Impact**: Improves prompt engineering efficiency, helps achieve better model outputs, and reduces the time needed to optimize prompts.

#### 5. **Custom Evaluation Metrics**
- **Description**: Define custom scoring rubrics, implement automated evaluation functions, support for domain-specific metrics (code quality, factual accuracy, etc.), and integration with external validation APIs.
- **Impact**: Enables specialized testing for specific use cases, provides more nuanced evaluation beyond basic scoring, and supports industry-specific requirements.

#### 6. **Model Fine-tuning Integration**
- **Description**: Export test cases as training data, track performance improvements after fine-tuning, integration with fine-tuning platforms, and automated dataset generation.
- **Impact**: Streamlines the model improvement workflow, provides clear ROI on fine-tuning efforts, and accelerates custom model development.

#### 7. **Cost Optimization Engine**
- **Description**: Real-time cost tracking per test run, model recommendation based on quality/cost ratio, budget alerts and limits, and historical cost analysis with forecasting.
- **Impact**: Reduces AI operational costs by 30-40%, prevents budget overruns, and enables informed decisions on model selection based on cost-effectiveness.

## Contributing

We welcome contributions to Prompt Tester! Here's how you can help:

### Reporting Issues

1. Check [existing issues](https://github.com/mat50013/prompt-tester/issues) first
2. Create a detailed bug report with:
    - Steps to reproduce
    - Expected vs actual behavior
    - Browser and OS information
    - Console errors if any

### Submitting Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (check `.eslintrc`)
- Write meaningful commit messages
- Update documentation as needed
- Ensure all tests pass before submitting
- Keep pull requests focused and atomic

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Project Repository**: [https://github.com/mat50013/prompt-tester](https://github.com/mat50013/prompt-tester)

**Issues & Feature Requests**: [GitHub Issues](https://github.com/mat50013/prompt-tester/issues)

**Discussions**: [GitHub Discussions](https://github.com/mat50013/prompt-tester/discussions)

---

<p align="center">
  Built with React, Redux, and Material-UI
</p>

<p align="center">
  <a href="https://github.com/mat50013/prompt-tester/stargazers">
    <img src="https://img.shields.io/github/stars/mat50013/prompt-tester?style=social" alt="GitHub stars">
  </a>
  <a href="https://github.com/mat50013/prompt-tester/network/members">
    <img src="https://img.shields.io/github/forks/mat50013/prompt-tester?style=social" alt="GitHub forks">
  </a>
  <a href="https://github.com/mat50013/prompt-tester/issues">
    <img src="https://img.shields.io/github/issues/mat50013/prompt-tester" alt="GitHub issues">
  </a>
</p>
