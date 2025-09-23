import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Easing, Text, View } from "react-native";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react-native";
export type ToastType = "info" | "success" | "error";

type Toast = { id: number; message: string; type: ToastType };

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const lastShownRef = useRef<Map<string, number>>(new Map());

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const now = Date.now();
      const key = `${type}|${message}`;
      const last = lastShownRef.current.get(key) || 0;
      if (now - last < 2500) return; // anti-dup in 2.5s window
      lastShownRef.current.set(key, now);

      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      // optional haptics (non-blocking, safe if module absent)
      try {
        // fire-and-forget dynamic import to avoid hard dependency

        import("expo-haptics")
          .then((H) => {
            if (!H?.notificationAsync) return;
            if (type === "success")
              return H.notificationAsync(H.NotificationFeedbackType.Success);
            if (type === "error")
              return H.notificationAsync(H.NotificationFeedbackType.Error);
            return H.impactAsync?.(H.ImpactFeedbackStyle.Light);
          })
          .catch(() => void 0);
      } catch {
        // ignore
      }
      // auto-dismiss after 3s
      setTimeout(() => remove(id), 3000);
    },
    [remove]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", left: 0, right: 0, top: 10 }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} message={t.message} type={t.type} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ message, type }: { message: string; type: ToastType }) {
  const opacity = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
    return () => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
    };
  }, [opacity]);

  const bg =
    type === "error" ? "#FEE2E2" : type === "success" ? "#DCFCE7" : "#E2E8F0";
  const border =
    type === "error" ? "#FCA5A5" : type === "success" ? "#86EFAC" : "#CBD5E1";
  const color =
    type === "error" ? "#7F1D1D" : type === "success" ? "#065F46" : "#0F172A";

  return (
    <Animated.View style={{ opacity }}>
      <View
        style={{
          marginHorizontal: 12,
          marginBottom: 8,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
          alignSelf: "center",
          maxWidth: "92%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        {type === "error" && <AlertTriangle color={"red"} size={20} />}
        {type === "success" && <CheckCircle2 color={"green"} size={20} />}
        {type === "info" && <Info color={"blue"} size={20} />}
        <Text
          style={{ color, fontWeight: "600" }}
          className="font-quicksand-medium"
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
