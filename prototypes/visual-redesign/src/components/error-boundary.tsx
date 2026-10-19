import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="content-page">
          <section className="page-heading">
            <div className="page-heading-index">500</div>
            <h1 className="not-found">The study stopped here.</h1>
            <p className="page-deck">{this.state.error.message}</p>
          </section>
        </div>
      );
    }
    return this.props.children;
  }
}
