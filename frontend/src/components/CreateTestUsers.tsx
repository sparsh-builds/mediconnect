// src/components/CreateTestUsers.tsx (optional - for development)
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseconfig";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateTestUsers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createUser = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "User created",
        description: `${email} created successfully`,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createAllTestUsers = async () => {
    setLoading(true);
    await createUser("hospital@healthfinder.com", "hospital123");
    await createUser("bloodbank@healthfinder.com", "bloodbank123");
    await createUser("admin@healthfinder.com", "admin123");
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create Test Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={createAllTestUsers} disabled={loading} className="w-full">
          {loading ? "Creating users..." : "Create Test Users"}
        </Button>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>This will create:</p>
          <ul className="list-disc list-inside mt-2">
            <li>hospital@healthfinder.com / hospital123</li>
            <li>bloodbank@healthfinder.com / bloodbank123</li>
            <li>admin@healthfinder.com / admin123</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}