import React from 'react';
import tw from 'twin.macro';

interface State {
    error: Error | null;
    extraMessage: string | null;
}

export default class FrontendErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
    state: State = {
        error: null,
        extraMessage: null,
    };

    componentDidMount() {
        window.addEventListener('error', this.handleWindowError);
        window.addEventListener('unhandledrejection', this.handleRejection);
    }

    componentWillUnmount() {
        window.removeEventListener('error', this.handleWindowError);
        window.removeEventListener('unhandledrejection', this.handleRejection);
    }

    componentDidCatch(error: Error) {
        console.error('Frontend render crashed:', error);
        this.setState({ error });
    }

    private handleWindowError = (event: ErrorEvent) => {
        if (this.state.error) {
            return;
        }

        const message = event.error?.message || event.message || 'Unknown runtime error.';
        this.setState({ error: new Error(message) });
    };

    private handleRejection = (event: PromiseRejectionEvent) => {
        if (this.state.error) {
            return;
        }

        const reason =
            event.reason instanceof Error
                ? event.reason.message
                : typeof event.reason === 'string'
                ? event.reason
                : 'Unhandled promise rejection.';

        this.setState({
            error: new Error('Unhandled async error.'),
            extraMessage: reason,
        });
    };

    render() {
        if (!this.state.error) {
            return this.props.children;
        }

        return (
            <div css={tw`min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center px-6`}>
                <div css={tw`w-full max-w-2xl bg-neutral-800 border border-neutral-700 rounded-lg p-6`}>
                    <h1 css={tw`text-xl font-bold mb-3`}>Frontend Crash Detected</h1>
                    <p css={tw`text-sm text-neutral-300 mb-4`}>
                        A JavaScript error stopped the panel UI from rendering. Open browser DevTools console for full
                        stack trace.
                    </p>
                    <div css={tw`bg-neutral-900 rounded p-3 text-sm font-mono break-words mb-3`}>
                        {this.state.error.message}
                    </div>
                    {this.state.extraMessage && (
                        <div css={tw`bg-neutral-900 rounded p-3 text-xs font-mono break-words mb-3`}>
                            {this.state.extraMessage}
                        </div>
                    )}
                    <button
                        type={'button'}
                        css={tw`px-4 py-2 bg-primary-500 hover:bg-primary-400 rounded text-sm`}
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }
}
