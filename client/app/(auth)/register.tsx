import React, { useMemo, useState } from "react";
import RegisterPage from "@/components/Auth/RegisterPage";
import AuthScreenWrapper from "@/components/Auth/AuthScreenWrapper";

const Register = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const registerProps = useMemo(
    () => ({
      fullName,
      setFullName,
      email,
      setEmail,
      phone,
      setPhone,
      password,
      setPassword,
      confirm,
      setConfirm,
    }),
    [confirm, email, fullName, password, phone]
  );
  return (
    <AuthScreenWrapper currentScreen="register">
      <RegisterPage {...registerProps} />
    </AuthScreenWrapper>
  );
};

export default Register;
