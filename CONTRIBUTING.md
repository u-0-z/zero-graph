# Contributing to ZeroGraph TypeScript

We welcome contributions to ZeroGraph TypeScript! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/zero-graph.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Building the Project

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Project Structure

```
@u0z/zero-graph/
├── src/           # Core framework source code
├── examples/      # Usage examples
├── docs/          # Documentation
├── tests/         # Test files
└── dist/          # Built files (generated)
```

## Code Style

- Use TypeScript for all code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Testing

- Write tests for new features
- Ensure all tests pass before submitting
- Aim for good test coverage
- Use descriptive test names

## Documentation

- Update documentation for new features
- Include examples in documentation
- Keep README.md up to date
- Add JSDoc comments for public APIs

## Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the code style
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Run tests** and ensure they pass
6. **Submit a pull request** with a clear description

### Pull Request Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
```

## Coding Guidelines

### TypeScript

- Use strict TypeScript settings
- Provide proper type annotations
- Avoid `any` type when possible
- Use interfaces for object types

### Node Design

- Follow the prep/exec/post pattern
- Keep nodes focused on single responsibility
- Implement proper error handling
- Use meaningful action names

### Flow Design

- Design clear flow graphs
- Handle all possible paths
- Use descriptive action names
- Avoid deep nesting

## Examples

When adding new examples:

1. Create a new directory under `examples/`
2. Include a comprehensive README.md
3. Add proper TypeScript types
4. Include error handling
5. Add to the examples overview

## Documentation

When updating documentation:

1. Keep it clear and concise
2. Include code examples
3. Update table of contents
4. Test all code examples

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add AsyncParallelBatchNode for concurrent processing
fix: resolve memory leak in Flow orchestration
docs: update README with installation instructions
test: add unit tests for BatchNode
```

## Issues

### Reporting Bugs

- Use the bug report template
- Include minimal reproduction case
- Provide environment details
- Include error messages/stack traces

### Feature Requests

- Use the feature request template
- Explain the use case
- Provide examples if possible
- Consider backward compatibility

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's code of conduct

## Questions?

- Check the [documentation](./docs/)
- Search existing [issues](https://github.com/u-0-z/zero-graph/issues)
- Create a new issue

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
