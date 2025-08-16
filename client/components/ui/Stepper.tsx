import { Text, View } from "react-native";
export const steps = [
  "Colis",
  "Expéditeur",
  "Destinataire",
  "Service",
  "Paiement",
] as const;
export type Step = 0 | 1 | 2 | 3 | 4;
function Stepper({ step }: { step: Step }) {
  return (
    <View className="flex-row items-center justify-center px-5 py-3 bg-white border-b border-slate-200">
      {steps.map((label, i) => {
        const active = i <= step;
        return (
          <View key={label} className="flex-row items-center">
            <View
              className={`w-7 h-7 rounded-full items-center justify-center ${
                active ? "bg-emerald-600" : "bg-slate-200"
              }`}
            >
              <Text
                className={`text-[12px] ${active ? "text-white" : "text-slate-600"} font-quicksand-bold`}
              >
                {i + 1}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View
                className={`w-8 h-[2px] mx-1 ${i < step ? "bg-emerald-600" : "bg-slate-200"}`}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

export default Stepper;
