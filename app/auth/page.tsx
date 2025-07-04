import AuthClientPage from '@/components/auth/AuthClientPage';
import { getSSMParameterValue } from '@/lib/amplifyServerUtils';

export default async function AuthPage() {
  const userPoolId = await getSSMParameterValue('/schiffer/auth/userPoolId');
  const userPoolClientId = await getSSMParameterValue('/schiffer/auth/userPoolClientId');
  const identityPoolId = await getSSMParameterValue('/schiffer/auth/identityPoolId');

  if (!userPoolId || !userPoolClientId || !identityPoolId) {
    console.error("AuthPage: Could not retrieve all Cognito parameters from SSM Parameter Store.");
    return <div>Error: Could not retrieve all Cognito parameters from SSM Parameter Store. Please ensure they are set up correctly.</div>;
  }

  return (
    <AuthClientPage
      userPoolId={userPoolId}
      userPoolClientId={userPoolClientId}
      identityPoolId={identityPoolId}
    />
  );
} 