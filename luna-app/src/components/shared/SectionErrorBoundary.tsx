"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Props = {
  children: ReactNode;
  title?: string;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

/** Catches render errors in a subtree so the rest of the dashboard can keep working. */
export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("[SectionErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <Alert variant="destructive" role="alert">
          <AlertTitle>{this.props.title ?? "This section could not be displayed"}</AlertTitle>
          <AlertDescription className="text-sm">
            {this.state.error.message || "Something went wrong. Try refreshing the page."}
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <div className="contents" data-luna-error-boundary="ready">
        {this.props.children}
      </div>
    );
  }
}
