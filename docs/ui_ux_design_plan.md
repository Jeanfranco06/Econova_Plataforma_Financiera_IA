# UI/UX Design Plan for Econova

## Objectives
- Enhance the design visual, structure, and user experience of the Econova platform.
- Maintain the existing technical stack and design constraints.

## Design Constraints
- No gradient colors or exaggerated animations.
- Use Tailwind CSS exclusively.
- Professional, clean, and serious style suitable for financial/enterprise contexts.
- Flat, sober colors with typography variations for visual hierarchy.
- Prioritize legibility and data comprehension.
- Design for non-technical users.

## Proposed Layouts
### 1. Página Principal
- **Header**: Logo, navigation menu (Home, Dashboard, Simulations, Storytelling, Results, Profile).
- **Hero Section**: Brief description of Econova, call-to-action button (e.g., "Start Now").
- **Features Section**: Grid layout showcasing platform features (e.g., Chatbot, Simulations, Gamification).
- **Footer**: Links to Terms, Privacy, Contact.

### 2. Dashboard
- **Sidebar**: Persistent navigation for quick access to simulations, results, and storytelling.
- **Main Content**: Overview cards (e.g., "Your Progress", "Recent Simulations").
- **Chatbot Integration**: Fixed position on the bottom-right corner.

### 3. Página de Simulación Financiera
- **Header**: Title and brief instructions.
- **Form Section**: Input fields for financial parameters (e.g., investment amount, interest rate).
- **Visualization Section**: Placeholder for Plotly graphs.
- **Chatbot Integration**: Contextual assistance for filling forms.

### 4. Página de Resultados
- **Header**: Title and summary of results.
- **Results Section**: Tabs for VAN, TIR, WACC, etc., with graphs and tables.
- **Insights Section**: Key takeaways or recommendations.
- **Chatbot Integration**: Explanation of results.

### 5. Página de Storytelling Financiero
- **Header**: Title and introduction.
- **Interactive Story Section**: Step-by-step storytelling with visual aids.
- **Progress Tracker**: Sidebar or top bar showing progress.
- **Chatbot Integration**: Interactive storytelling guide.

## Typography Recommendations
- **Titles**: Sans-serif font (e.g., Tailwind's `font-sans`) with bold weight for emphasis.
- **Content**: Serif font (e.g., Tailwind's `font-serif`) for readability.
- **Data**: Monospace font (e.g., Tailwind's `font-mono`) for tables and graphs.

## Visual Hierarchy
1. **Primary Attention**: Titles and key actions (e.g., buttons like "Start Simulation").
2. **Secondary Attention**: Graphs and data visualizations.
3. **Tertiary Attention**: Supporting text and instructions.

## Enhancements for Forms, Tables, and Graphs
- **Forms**: Use Tailwind's `form-control` classes for consistent styling. Add tooltips for clarity.
- **Tables**: Use alternating row colors (`even:bg-gray-100`) for readability.
- **Graphs**: Ensure high contrast between data points and background.

## Chatbot Integration
- Fixed position on all pages for accessibility.
- Context-aware responses based on the current page.
- Minimalist design with a focus on functionality.

## Next Steps
1. Review the proposed layouts and typography recommendations.
2. Implement the changes incrementally, starting with the main layout.
3. Test the design with sample users for feedback.
