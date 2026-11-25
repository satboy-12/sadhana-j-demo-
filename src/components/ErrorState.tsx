import React from 'react';
import { ApiIntegrationBanner } from './ApiIntegrationBanner';
import { ApiError } from '../api/client';

interface ErrorStateProps {
  error: ApiError | string | null;
  expectedEndpoint: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export function ErrorState(props: ErrorStateProps) {
  return <ApiIntegrationBanner {...props} />;
}
