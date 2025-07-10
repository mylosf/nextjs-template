"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Amplify } from 'aws-amplify';
import { generateClient } from "aws-amplify/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle,
} from "@/components/ui/card";

import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Import specific Amplify Auth functions directly
import { signIn, signOut, signUp, confirmSignUp, resetPassword, confirmResetPassword, deleteUser, fetchAuthSession } from 'aws-amplify/auth';

const client = generateClient();

interface AuthClientPageProps {
  userPoolId: string;
  userPoolClientId: string;
  identityPoolId: string;
}

export default function AuthClientPage({ userPoolId, userPoolClientId, identityPoolId }: AuthClientPageProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState("signIn"); // signIn, signUp, forgotPassword, confirmSignUp, deleteAccount
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAttributes, setUserAttributes] = useState<Record<string, string> | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const checkAuthStatus = async () => {
    try {
      setIsCheckingAuth(true);
      // Force refresh to get the latest auth state
      const { tokens } = await fetchAuthSession({ forceRefresh: true });
      
      // Check if we have valid tokens and they're not expired
      if (tokens?.idToken && tokens?.accessToken) {
        const currentTime = Math.floor(Date.now() / 1000);
        const tokenExpiration = tokens.idToken.payload.exp as number;
        
        if (tokenExpiration > currentTime) {
          setIsLoggedIn(true);
          setUserAttributes(tokens.idToken.payload as Record<string, string>);
          console.log("User is logged in with valid tokens");
        } else {
          console.log("Tokens are expired");
          setIsLoggedIn(false);
          setUserAttributes(null);
        }
      } else {
        console.log("No valid tokens found");
        setIsLoggedIn(false);
        setUserAttributes(null);
      }
    } catch (error) {
      console.log("Auth check failed - user is not authenticated:", error);
      setIsLoggedIn(false);
      setUserAttributes(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    // Configure Amplify with your Cognito details received as props
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: userPoolId,
          userPoolClientId: userPoolClientId,
          identityPoolId: identityPoolId,
          loginWith: {
            email: true,
          },
        },
      },
    });
    console.log("Amplify configured successfully with props from SSM.");

    // Add a small delay to ensure Amplify is fully configured
    const timeoutId = setTimeout(checkAuthStatus, 100);

    const interval = setInterval(checkAuthStatus, 60000); // Check every minute
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [userPoolId, userPoolClientId, identityPoolId]); // Re-run effect if props change

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      console.log("Sign In Status:", isSignedIn, nextStep);
      if (isSignedIn) {
        toast.success("Signed in successfully!");
        setIsLoggedIn(true);
        router.push("/projects"); // Redirect to projects page on successful login
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        setCurrentView("confirmSignUp");
        toast.info("Please confirm your sign up with the code sent to your email.");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error((error as Error).message || "Sign in failed.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!displayName.trim()) {
      toast.error("Display name is required.");
      return;
    }
    try {
      // First, create the user in Cognito
      const { isSignUpComplete, nextStep } = await signUp({ 
        username: email, 
        password, 
        options: { 
          userAttributes: { 
            email,
            name: displayName.trim()
          } 
        } 
      });
      
      console.log("Sign Up Status:", isSignUpComplete, nextStep);
      
      // Then, call our signup API to create user in database
      try {
        const signupApiResponse = await fetch(`${process.env.NEXT_PUBLIC_SIGNUP_API_URL || ''}/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            display_name: displayName.trim(),
            cognito_user_id: '', // Will be populated later when user confirms
          }),
        });

        const signupData = await signupApiResponse.json();
        
        if (!signupApiResponse.ok) {
          console.error('Signup API error:', signupData);
          // Don't fail the signup process if database creation fails
          toast.warn("Account created but there was an issue saving profile data. Please contact support if you experience issues.");
        } else {
          console.log('User created in database:', signupData);
        }
      } catch (dbError) {
        console.error('Database signup error:', dbError);
        // Don't fail the signup process if database creation fails
        toast.warn("Account created but there was an issue saving profile data. Please contact support if you experience issues.");
      }
      
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setCurrentView("confirmSignUp");
        toast.info("Verification code sent to your email. Please confirm your account.");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error((error as Error).message || "Sign up failed.");
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      toast.success("Account confirmed successfully! You can now sign in.");
      setCurrentView("signIn");
    } catch (error) {
      console.error("Error confirming sign up:", error);
      toast.error((error as Error).message || "Confirmation failed.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword({ username: email });
      toast.info("Password reset code sent to your email.");
      setCurrentView("forgotPasswordSubmit");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error((error as Error).message || "Password reset failed.");
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword: password });
      toast.success("Password has been reset successfully! Please sign in with your new password.");
      setCurrentView("signIn");
    } catch (error) {
      console.error("Error confirming password reset:", error);
      toast.error((error as Error).message || "Password reset confirmation failed.");
    }
  };

  const handleDeleteAccount = async () => {
    console.log("Delete account button (logged in view) clicked. Setting view to deleteAccount.");
    setCurrentView("deleteAccount");
  };

  const handleConfirmDeleteAccount = async () => {
    try {
      await deleteUser();
      toast.success("Account deleted successfully!");
      setIsLoggedIn(false);
      setUserAttributes(null);
      setCurrentView("signIn");
      router.push("/auth");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error((error as Error).message || "Account deletion failed.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ global: true }); // Sign out from all devices
      toast.success("Signed out successfully!");
      setIsLoggedIn(false);
      setUserAttributes(null);
      setCurrentView("signIn"); // Reset to sign in view
      // Force a re-check of auth status after sign out
      setTimeout(checkAuthStatus, 100);
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error((error as Error).message || "Sign out failed.");
      // Even if sign out fails, clear local state
      setIsLoggedIn(false);
      setUserAttributes(null);
      setCurrentView("signIn");
    }
  };

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-black text-white">
      <Toaster />
      {isCheckingAuth ? (
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Checking authentication...</p>
            </div>
          </CardContent>
        </Card>
      ) : isLoggedIn ? (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome, {userAttributes?.email || 'User'}!</CardTitle>
            <CardDescription>You are successfully logged in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You can now access protected content.</p>
            <Button onClick={() => router.push("/projects")} className="w-full">Go to Projects</Button>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <Button onClick={handleSignOut} variant="outline" className="w-full">Sign Out</Button>
            <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">Delete Account</Button>
          </CardFooter>
        </Card>
      ) : ( // User is not logged in, show auth forms
        currentView === "deleteAccount" ? (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Confirm Account Deletion</CardTitle>
              <CardDescription>Are you sure you want to delete your account? This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardFooter className="flex-col space-y-2">
              <Button onClick={handleConfirmDeleteAccount} variant="destructive" className="w-full">Yes, Delete My Account</Button>
              <Button onClick={() => setCurrentView("signIn")} variant="outline" className="w-full">Cancel</Button>
            </CardFooter>
          </Card>
        ) : currentView === "signIn" ? (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Sign in to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <form onSubmit={handleSignIn}>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full mt-4">Sign In</Button>
              </form>
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <Button variant="link" onClick={() => setCurrentView("forgotPassword")}>Forgot Password?</Button>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button variant="link" onClick={() => setCurrentView("signUp")} className="p-0 h-auto text-sm">Sign Up</Button>
              </p>
            </CardFooter>
          </Card>
        ) : currentView === "signUp" ? (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Create a new account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <form onSubmit={handleSignUp}>
                <div className="space-y-1">
                  <Label htmlFor="signup-display-name">How should we call you?</Label>
                  <Input id="signup-display-name" type="text" placeholder="Your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full mt-4">Sign Up</Button>
              </form>
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button variant="link" onClick={() => setCurrentView("signIn")} className="p-0 h-auto text-sm">Sign In</Button>
              </p>
            </CardFooter>
          </Card>
        ) : currentView === "forgotPassword" ? (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Enter your email to receive a reset code.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <form onSubmit={handleResetPassword}>
                <div className="space-y-1">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input id="reset-email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full mt-4">Send Code</Button>
              </form>
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <Button variant="link" onClick={() => setCurrentView("signIn")}>← Back to Sign In</Button>
            </CardFooter>
          </Card>
        ) : currentView === "forgotPasswordSubmit" ? (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Password Reset</CardTitle>
              <CardDescription>Enter the code sent to your email and your new password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <form onSubmit={handleConfirmResetPassword}>
                <div className="space-y-1">
                  <Label htmlFor="reset-code">Verification Code</Label>
                  <Input id="reset-code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full mt-4">Reset Password</Button>
              </form>
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <Button variant="link" onClick={() => setCurrentView("signIn")}>← Back to Sign In</Button>
            </CardFooter>
          </Card>
        ) : currentView === "confirmSignUp" ? (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Sign Up</CardTitle>
              <CardDescription>Enter the verification code sent to your email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <form onSubmit={handleConfirmSignUp}>
                <div className="space-y-1">
                  <Label htmlFor="confirmation-code">Verification Code</Label>
                  <Input id="confirmation-code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full mt-4">Confirm Account</Button>
              </form>
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <Button variant="link" onClick={() => setCurrentView("signIn")}>← Back to Sign In</Button>
            </CardFooter>
          </Card>
        ) : null
      )}
    </div>
  );
} 