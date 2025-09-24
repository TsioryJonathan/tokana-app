import React from "react";
import AuthScreenWrapper from "@/components/Auth/AuthScreenWrapper";
import LoginPage from "@/components/Auth/LoginPage";

const login = () => {
  return (
    <AuthScreenWrapper currentScreen="login">
      <LoginPage />
    </AuthScreenWrapper>
  );
};

export default login;
