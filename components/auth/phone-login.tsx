"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, ConfirmationResult, PhoneAuthCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseError } from 'firebase/app';

const phoneSchema = z.object({
  phone: z.string().regex(/^\+91[0-9]{10}$/, "Enter valid Indian mobile number"),
  otp: z.string().optional(),
});

interface PhoneLoginProps {
  onSuccess?: () => void;
  onError?: (error: FirebaseError) => void;
  isLinking?: boolean;
}

export function PhoneLogin({ onSuccess, onError, isLinking = false }: PhoneLoginProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  const form = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "+91",
      otp: "",
    },
  });

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const sendOTP = async (phone: string) => {
    try {
      setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        (window as any).recaptchaVerifier
      );
      setConfirmation(confirmation);
      setStep("otp");
    } catch (error) {
      console.error("Error sending OTP:", error);
      form.setError("phone", { message: "Failed to send OTP" });
    }
  };

  const verifyOTP = async (otp: string) => {
    try {
      if (!confirmation) {
        throw new Error('No confirmation result');
      }
      
      const credential = PhoneAuthProvider.credential(
        confirmation.verificationId, 
        otp
      );
      
      if (isLinking) {
        await auth.currentUser?.linkWithCredential(credential);
      } else {
        await signInWithPhoneNumber(auth, credential);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error("Error verifying OTP:", error);
      form.setError("otp", { message: "Invalid OTP" });
      onError?.(error as FirebaseError);
    }
  };

  const onSubmit = async (data: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    try {
      if (step === "phone") {
        await sendOTP(data.phone);
      } else if (data.otp) {
        await verifyOTP(data.otp);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {step === "phone" ? (
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      placeholder="+91 Your mobile number"
                      type="tel"
                      disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Sending..." : "Send OTP"}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      placeholder="Enter OTP"
                      type="number"
                      disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div id="recaptcha-container" />
      </form>
    </Form>
  );
}
