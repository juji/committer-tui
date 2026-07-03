import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override render() {
    if (this.state.error) {
      return (
        <box flexDirection="column" flexGrow={1} alignItems="center" justifyContent="center">
          <text fg="red" attributes={1}>Something went wrong</text>
          <box height={1} />
          <text fg="gray">{this.state.error.message}</text>
          <box height={1} />
          <text fg="gray">Press ctrl+c to exit</text>
        </box>
      );
    }
    return this.props.children;
  }
}
